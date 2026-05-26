import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async getDashboardStats() {
    const [totalUsers, totalProperties, activeProperties, pendingReview, fraudReports, totalRevenue] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.property.count(),
        this.prisma.property.count({ where: { status: 'ACTIVE' } }),
        this.prisma.property.count({ where: { status: 'PENDING_REVIEW' } }),
        this.prisma.fraudReport.count({ where: { status: 'PENDING' } }),
        this.prisma.payment.aggregate({
          where: { status: 'CAPTURED' },
          _sum: { amount: true },
        }),
      ]);

    const recentListings = await this.prisma.property.findMany({
      where: { status: 'PENDING_REVIEW' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, city: true, type: true, createdAt: true },
    });

    return {
      totalUsers,
      totalProperties,
      activeProperties,
      pendingReview,
      pendingFraudReports: fraudReports,
      totalRevenuePaise: Number(totalRevenue._sum.amount ?? 0),
      recentListings,
    };
  }

  async getPendingProperties(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where: { status: 'PENDING_REVIEW' },
        include: {
          owner: { select: { id: true, firstName: true, lastName: true, email: true } },
          aiScore: { select: { trustScore: true, fraudRiskScore: true, signals: true } },
          images: { take: 1 },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.property.count({ where: { status: 'PENDING_REVIEW' } }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async moderateProperty(
    propertyId: string,
    action: 'APPROVE' | 'REJECT',
    adminId: string,
    reason?: string,
  ) {
    const property = await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: action === 'APPROVE' ? 'ACTIVE' : 'REJECTED' },
      include: { owner: { select: { id: true, email: true, firstName: true } } },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: `PROPERTY_${action}`,
        entity: 'Property',
        entityId: propertyId,
        newValue: { status: action === 'APPROVE' ? 'ACTIVE' : 'REJECTED', reason },
      },
    });

    if (action === 'APPROVE') {
      await this.notifications.sendListingApproved(
        property.owner.email!,
        property.title,
        property.id,
      ).catch(() => {});

      await this.notifications.createInApp(
        property.owner.id,
        'Listing Approved! ✅',
        `Your listing "${property.title}" is now live.`,
        'LISTING_APPROVED',
        { propertyId },
      );
    } else {
      await this.notifications.createInApp(
        property.owner.id,
        'Listing Rejected',
        `Your listing "${property.title}" was rejected. Reason: ${reason ?? 'Policy violation'}`,
        'LISTING_REJECTED',
        { propertyId },
      );
    }

    return { message: `Property ${action.toLowerCase()}ed successfully` };
  }

  async getUsers(page: number, limit: number, role?: string) {
    const skip = (page - 1) * limit;
    const where = role ? { role: role as never } : {};

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, status: true, isEmailVerified: true,
          createdAt: true, lastLoginAt: true,
          _count: { select: { properties: true, fraudReports: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async suspendUser(userId: string, reason: string, adminId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'SUSPENDED', refreshTokenHash: null },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'USER_SUSPENDED',
        entity: 'User',
        entityId: userId,
        newValue: { reason },
      },
    });

    return { message: 'User suspended' };
  }

  async activateUser(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
    });
    return { message: 'User activated' };
  }

  async getFraudReports(status: string | undefined, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as never } : {};

    const [items, total] = await Promise.all([
      this.prisma.fraudReport.findMany({
        where,
        include: {
          reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
          property: { select: { id: true, title: true, city: true, aiTrustScore: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.fraudReport.count({ where }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async resolveFraudReport(id: string, action: 'RESOLVE' | 'DISMISS', adminId: string, resolution?: string) {
    await this.prisma.fraudReport.update({
      where: { id },
      data: {
        status: action === 'RESOLVE' ? 'RESOLVED' : 'DISMISSED',
        resolvedAt: new Date(),
        resolvedBy: adminId,
        resolution,
      },
    });

    return { message: `Report ${action.toLowerCase()}d` };
  }

  async getPendingBrokers() {
    return this.prisma.broker.findMany({
      where: { isVerified: false },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async verifyBroker(brokerId: string) {
    await this.prisma.broker.update({
      where: { id: brokerId },
      data: { isVerified: true, verifiedAt: new Date() },
    });
    return { message: 'Broker verified' };
  }
}
