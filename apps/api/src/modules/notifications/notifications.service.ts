import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend | null = null;
  private readonly fromEmail: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const resendKey = configService.get<string>('resend.apiKey');
    if (resendKey) {
      this.resend = new Resend(resendKey);
    }
    this.fromEmail = configService.get<string>('resend.from', 'noreply@metrivahomes.com');

    // Initialize Firebase Admin (once, idempotent) — skip gracefully if credentials are missing/invalid
    if (!admin.apps.length) {
      const firebaseConfig = {
        projectId: configService.get<string>('firebase.projectId'),
        privateKey: configService.get<string>('firebase.privateKey'),
        clientEmail: configService.get<string>('firebase.clientEmail'),
      };

      if (firebaseConfig.projectId && firebaseConfig.privateKey && firebaseConfig.clientEmail) {
        try {
          admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
          });
        } catch (e) {
          this.logger.warn('Firebase Admin init failed — push notifications disabled. Check FIREBASE_* env vars.');
        }
      }
    }
  }

  // ---- Email Notifications ----

  async sendEmailVerification(email: string, token: string): Promise<void> {
    const webUrl = this.configService.get<string>('app.webUrl');
    const link = `${webUrl}/auth/verify-email?token=${token}`;

    if (!this.resend) { this.logger.log(`[DEV] Email skipped (no RESEND_API_KEY) — to: ${email}`); return; }
    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: 'Verify your Metriva Homes account',
      html: this.emailTemplate('Verify Your Email', `
        <p>Welcome to Metriva Homes! Please verify your email address to get started.</p>
        <a href="${link}" style="background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Verify Email</a>
        <p style="color:#6b7280;font-size:14px;margin-top:16px;">Link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      `),
    });
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const webUrl = this.configService.get<string>('app.webUrl');
    const link = `${webUrl}/auth/reset-password?token=${token}`;

    if (!this.resend) { this.logger.log(`[DEV] Email skipped (no RESEND_API_KEY) — to: ${email}`); return; }
    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: 'Reset your Metriva Homes password',
      html: this.emailTemplate('Reset Your Password', `
        <p>You requested a password reset for your Metriva Homes account.</p>
        <a href="${link}" style="background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Reset Password</a>
        <p style="color:#6b7280;font-size:14px;margin-top:16px;">This link expires in 1 hour. If you didn't request this, please ignore.</p>
      `),
    });
  }

  async sendListingApproved(email: string, propertyTitle: string, propertyId: string): Promise<void> {
    const webUrl = this.configService.get<string>('app.webUrl');

    if (!this.resend) { this.logger.log(`[DEV] Email skipped (no RESEND_API_KEY) — to: ${email}`); return; }
    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: `Your listing is live — ${propertyTitle}`,
      html: this.emailTemplate('Listing Approved! 🎉', `
        <p>Your property listing "<strong>${propertyTitle}</strong>" has been reviewed and is now live.</p>
        <a href="${webUrl}/properties/${propertyId}" style="background:#16a34a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">View Listing</a>
        <p style="color:#6b7280;font-size:14px;margin-top:16px;">Boost visibility by featuring your listing.</p>
      `),
    });
  }

  // ---- Push Notifications ----

  async sendPushToUser(userId: string, title: string, body: string, data?: Record<string, string>): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmTokens: true },
    });

    if (!user || user.fcmTokens.length === 0) return;

    try {
      await admin.messaging().sendEachForMulticast({
        tokens: user.fcmTokens,
        notification: { title, body },
        data: data ?? {},
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
      });
    } catch (error) {
      this.logger.warn(`Push notification failed for user ${userId}: ${(error as Error).message}`);
    }
  }

  // ---- In-App Notifications ----

  async createInApp(
    userId: string,
    title: string,
    body: string,
    type: string,
    data?: Record<string, string>,
  ): Promise<void> {
    await this.prisma.notification.create({
      data: { userId, title, body, type: type as never, data },
    });
  }

  async registerFcmToken(userId: string, token: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmTokens: true },
    });

    if (!user) return;

    const tokens = [...new Set([...user.fcmTokens, token])].slice(-5); // max 5 devices

    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmTokens: tokens },
    });
  }

  private emailTemplate(heading: string, content: string): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#f9fafb;">
  <div style="background:white;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="margin-bottom:24px;">
      <span style="font-size:24px;font-weight:700;color:#1e40af;">🏠 Metriva Homes</span>
    </div>
    <h1 style="font-size:22px;font-weight:600;color:#111827;margin-bottom:16px;">${heading}</h1>
    ${content}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
    <p style="color:#9ca3af;font-size:12px;">Metriva Technologies Pvt. Ltd. | India</p>
  </div>
</body>
</html>`;
  }
}
