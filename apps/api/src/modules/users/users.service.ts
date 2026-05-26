import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(50) firstName?: string;
  @IsOptional() @IsString() @MaxLength(50) lastName?: string;
  @IsOptional() @IsString() avatar?: string;
  @IsOptional() @IsString() phone?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, phone: true, firstName: true, lastName: true,
        avatar: true, role: true, status: true, isEmailVerified: true,
        isPhoneVerified: true, createdAt: true, lastLoginAt: true,
        subscription: { select: { plan: true, status: true, endDate: true } },
        broker: { select: { id: true, agencyName: true, isVerified: true, rating: true } },
        builder: { select: { id: true, companyName: true, isVerified: true } },
        _count: { select: { properties: true, savedProperties: true } },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        avatar: true, role: true, updatedAt: true,
      },
    });
  }

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, firstName: true, lastName: true, avatar: true,
        role: true, createdAt: true,
        broker: {
          select: {
            agencyName: true, experience: true, localities: true,
            rating: true, totalReviews: true, isVerified: true,
          },
        },
        _count: { select: { properties: true } },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
