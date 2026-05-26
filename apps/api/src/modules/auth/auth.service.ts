import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  SendOtpDto,
  VerifyEmailDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import { GoogleProfile } from './strategies/google.strategy';
import { User } from '@prisma/client';

const BCRYPT_ROUNDS = 12;
const OTP_TTL = 5 * 60; // 5 minutes in seconds
const RESET_TOKEN_TTL = 60 * 60; // 1 hour

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notifications: NotificationsService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    if (dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
      if (existingPhone) throw new ConflictException('Phone number already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const emailVerifyToken = uuidv4();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role ?? 'BUYER',
        emailVerifyToken,
        subscription: {
          create: { plan: 'FREE' },
        },
      },
    });

    // Send verification email (fire-and-forget)
    this.notifications.sendEmailVerification(user.email!, emailVerifyToken).catch(() => {});

    return { message: 'Account created. Please check your email to verify.' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account suspended. Contact support.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.issueTokens(user);
  }

  async googleLogin(profile: GoogleProfile) {
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: profile.googleId }, { email: profile.email }] },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatar: profile.avatar,
          googleId: profile.googleId,
          isEmailVerified: true,
          status: 'ACTIVE',
          subscription: { create: { plan: 'FREE' } },
        },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.googleId, isEmailVerified: true, status: 'ACTIVE' },
      });
    }

    return this.issueTokens(user);
  }

  async sendOtp(dto: SendOtpDto) {
    const otpKey = `otp:${dto.phone}`;
    const rateLimitKey = `otp_rate:${dto.phone}`;

    const attempts = await this.cache.get<number>(rateLimitKey);
    if (attempts && attempts >= 3) {
      throw new BadRequestException('Too many OTP requests. Try again in an hour.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    await this.cache.set(otpKey, otpHash, OTP_TTL * 1000);
    await this.cache.set(rateLimitKey, (attempts ?? 0) + 1, 3600 * 1000);

    // TODO: Send via MSG91
    // await this.sendSmsOtp(dto.phone, otp);
    if (this.configService.get('app.nodeEnv') === 'development') {
      console.log(`[DEV] OTP for ${dto.phone}: ${otp}`);
    }

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const otpKey = `otp:${dto.phone}`;
    const storedHash = await this.cache.get<string>(otpKey);

    if (!storedHash) throw new BadRequestException('OTP expired. Request a new one.');

    const isValid = await bcrypt.compare(dto.otp, storedHash);
    if (!isValid) throw new BadRequestException('Invalid OTP');

    await this.cache.del(otpKey);

    let user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: dto.phone,
          firstName: 'User',
          lastName: '',
          isPhoneVerified: true,
          status: 'ACTIVE',
          subscription: { create: { plan: 'FREE' } },
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { isPhoneVerified: true, lastLoginAt: new Date() },
      });
    }

    return this.issueTokens(user);
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerifyToken: dto.token },
    });

    if (!user) throw new BadRequestException('Invalid or expired verification link');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, status: 'ACTIVE', emailVerifyToken: null },
    });

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    // Always respond the same (prevent email enumeration)
    if (!user) return { message: 'If this email is registered, a reset link was sent.' };

    const resetToken = uuidv4();
    const expiry = new Date(Date.now() + RESET_TOKEN_TTL * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: resetToken, resetPasswordExpiry: expiry },
    });

    await this.notifications.sendPasswordReset(user.email!, resetToken).catch(() => {});

    return { message: 'If this email is registered, a reset link was sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: dto.token,
        resetPasswordExpiry: { gt: new Date() },
      },
    });

    if (!user) throw new BadRequestException('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
        refreshTokenHash: null, // invalidate all sessions
      },
    });

    return { message: 'Password reset successfully. Please login.' };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException('Session expired');

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      // Possible token reuse attack — revoke all sessions
      await this.prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: null } });
      throw new UnauthorizedException('Refresh token reuse detected. Please login again.');
    }

    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
    return { message: 'Logged out successfully' };
  }

  private async issueTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '7d'),
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
      tokens: {
        accessToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
      },
      refreshToken, // client stores in httpOnly cookie or secure storage
    };
  }
}
