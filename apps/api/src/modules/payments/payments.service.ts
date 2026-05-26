import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require('razorpay');
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const FEATURED_PRICES = {
  FEATURED_7: 49900n,     // ₹499 in paise
  FEATURED_30: 149900n,   // ₹1,499 in paise
};

const SUBSCRIPTION_PRICES = {
  BASIC: 99900n,
  PROFESSIONAL: 299900n,
  ENTERPRISE: 999900n,
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private razorpay: any = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private notifications: NotificationsService,
  ) {
    const keyId = configService.get<string>('razorpay.keyId');
    const keySecret = configService.get<string>('razorpay.keySecret');
    if (keyId && keySecret) {
      this.razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    }
  }

  async createFeaturedListingOrder(propertyId: string, userId: string, duration: '7' | '30') {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');
    if (property.ownerId !== userId) throw new BadRequestException('Not your property');

    const amount = duration === '7' ? FEATURED_PRICES.FEATURED_7 : FEATURED_PRICES.FEATURED_30;

    const order = await this.razorpay.orders.create({
      amount: Number(amount),
      currency: 'INR',
      receipt: `feat_${propertyId}_${Date.now()}`,
      notes: { propertyId, userId, duration, purpose: 'FEATURED_LISTING' },
    });

    await this.prisma.payment.create({
      data: {
        userId,
        propertyId,
        amount,
        purpose: 'FEATURED_LISTING',
        providerId: order.id,
        metadata: { duration, orderId: order.id },
      },
    });

    return {
      orderId: order.id,
      amount: Number(amount),
      currency: 'INR',
      key: this.configService.get<string>('razorpay.keyId'),
    };
  }

  async createSubscriptionOrder(userId: string, plan: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE') {
    const amount = SUBSCRIPTION_PRICES[plan];

    const order = await this.razorpay.orders.create({
      amount: Number(amount),
      currency: 'INR',
      receipt: `sub_${userId}_${Date.now()}`,
      notes: { userId, plan, purpose: 'SUBSCRIPTION' },
    });

    const subscription = await this.prisma.subscription.findUnique({ where: { userId } });

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        subscriptionId: subscription?.id,
        amount,
        purpose: 'SUBSCRIPTION',
        providerId: order.id,
        metadata: { plan, orderId: order.id },
      },
    });

    return {
      orderId: order.id,
      paymentId: payment.id,
      amount: Number(amount),
      currency: 'INR',
      key: this.configService.get<string>('razorpay.keyId'),
    };
  }

  async verifyPayment(dto: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = dto;

    // Verify HMAC signature
    const expectedSig = crypto
      .createHmac('sha256', this.configService.get<string>('razorpay.keySecret', ''))
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSig !== razorpaySignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    const payment = await this.prisma.payment.findFirst({
      where: { providerId: razorpayOrderId },
    });

    if (!payment) throw new NotFoundException('Payment record not found');

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'CAPTURED', providerPaymentId: razorpayPaymentId },
    });

    // Activate the purchased feature
    await this.activateFeature(payment);

    return { success: true, message: 'Payment verified and feature activated' };
  }

  async handleWebhook(body: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>('razorpay.webhookSecret', '');
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSig !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = JSON.parse(body.toString());

    if (event.event === 'payment.captured') {
      const { order_id, id: paymentId } = event.payload.payment.entity;
      const payment = await this.prisma.payment.findFirst({ where: { providerId: order_id } });
      if (payment && payment.status !== 'CAPTURED') {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'CAPTURED', providerPaymentId: paymentId },
        });
        await this.activateFeature(payment);
      }
    }

    return { received: true };
  }

  async getPaymentHistory(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        status: true,
        purpose: true,
        createdAt: true,
        property: { select: { id: true, title: true } },
      },
    });
  }

  private async activateFeature(payment: {
    purpose: string;
    propertyId?: string | null;
    userId: string;
    metadata?: unknown;
  }) {
    if (payment.purpose === 'FEATURED_LISTING' && payment.propertyId) {
      const meta = payment.metadata as { duration?: string };
      const days = parseInt(meta?.duration ?? '7', 10);
      const featuredTill = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      await this.prisma.property.update({
        where: { id: payment.propertyId },
        data: { isFeatured: true, featuredTill },
      });

      await this.notifications.createInApp(
        payment.userId,
        'Listing Featured! 🎉',
        `Your listing is now featured for ${days} days.`,
        'PAYMENT',
      );
    }

    if (payment.purpose === 'SUBSCRIPTION') {
      const meta = payment.metadata as { plan?: string };
      const plan = (meta?.plan ?? 'BASIC') as 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';

      await this.prisma.subscription.update({
        where: { userId: payment.userId },
        data: {
          plan,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
}
