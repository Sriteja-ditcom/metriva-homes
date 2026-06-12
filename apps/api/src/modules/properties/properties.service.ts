import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Prisma, PropertyStatus, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto, PropertyQueryDto, UpdatePropertyDto } from './dto/property.dto';
import { StorageService } from '../storage/storage.service';

const PROPERTY_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  type: true,
  listingType: true,
  status: true,
  address: true,
  locality: true,
  city: true,
  state: true,
  pincode: true,
  lat: true,
  lng: true,
  bedrooms: true,
  bathrooms: true,
  builtUpArea: true,
  carpetArea: true,
  price: true,
  pricePerSqft: true,
  furnishing: true,
  parking: true,
  amenities: true,
  isVerified: true,
  isOwnerVerified: true,
  aiTrustScore: true,
  aiSummary: true,
  isDuplicateFlag: true,
  isFraudFlag: true,
  isFeatured: true,
  views: true,
  enquiries: true,
  saves: true,
  postedAt: true,
  images: {
    select: { id: true, url: true, isPrimary: true, order: true, caption: true },
    orderBy: [{ isPrimary: 'desc' as const }, { order: 'asc' as const }],
    take: 10,
  },
  owner: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
  broker: { select: { id: true, agencyName: true, rating: true, isVerified: true } },
  aiScore: {
    select: { trustScore: true, fraudRiskScore: true, signals: true, isDuplicate: true },
  },
} satisfies Prisma.PropertySelect;

@Injectable()
export class PropertiesService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    @InjectQueue('ai-scoring') private aiQueue: Queue,
  ) {}

  async create(dto: CreatePropertyDto, owner: User) {
    const slug = await this.generateSlug(dto.title, dto.city);

    const property = await this.prisma.property.create({
      data: {
        ...dto,
        slug,
        price: BigInt(dto.price),
        pricePerSqft: dto.pricePerSqft ? BigInt(dto.pricePerSqft) : undefined,
        maintenanceCharge: dto.maintenanceCharge ? BigInt(dto.maintenanceCharge) : undefined,
        ownerId: owner.id,
        status: 'PENDING_REVIEW',
      },
      select: PROPERTY_SELECT,
    });

    // Queue AI scoring (async, non-blocking)
    await this.aiQueue.add('score-property', { propertyId: property.id }, {
      delay: 2000,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });

    return property;
  }

  async findAll(query: PropertyQueryDto) {
    const {
      city, locality, type, listingType, minPrice, maxPrice,
      bedrooms, furnishing, minArea, maxArea, isVerified,
      lat, lng, radiusKm, sortBy, page = 1, limit = 20,
    } = query;

    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    const where: Prisma.PropertyWhereInput = {
      status: 'ACTIVE',
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(locality && { locality: { contains: locality, mode: 'insensitive' } }),
      ...(type && { type }),
      ...(listingType && { listingType }),
      ...(bedrooms && { bedrooms }),
      ...(furnishing && { furnishing }),
      ...(isVerified !== undefined && { isVerified }),
      ...(minPrice || maxPrice
        ? { price: { gte: minPrice ? BigInt(minPrice) : undefined, lte: maxPrice ? BigInt(maxPrice) : undefined } }
        : {}),
      ...(minArea || maxArea
        ? { builtUpArea: { gte: minArea, lte: maxArea } }
        : {}),
    };

    const orderBy = this.buildOrderBy(sortBy);

    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        select: PROPERTY_SELECT,
        orderBy,
        skip,
        take,
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      items: items.map(this.serializeProperty),
      meta: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async findById(id: string, currentUserId?: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      select: {
        ...PROPERTY_SELECT,
        description: true,
        address: true,
        balconies: true,
        floorNumber: true,
        totalFloors: true,
        plotArea: true,
        facing: true,
        age: true,
        maintenanceCharge: true,
        isNegotiable: true,
        nearbyPlaces: true,
        documents: true,
        expiresAt: true,
        fraudReports: currentUserId
          ? { where: { reporterId: currentUserId }, select: { id: true } }
          : false,
      },
    });

    if (!property) throw new NotFoundException('Property not found');
    if (property.status === 'DRAFT' || property.status === 'REJECTED') {
      throw new NotFoundException('Property not found');
    }

    // Async view count increment
    this.prisma.property.update({
      where: { id },
      data: { views: { increment: 1 } },
    }).catch(() => {});

    return this.serializeProperty(property);
  }

  async findFeatured() {
    const items = await this.prisma.property.findMany({
      where: {
        status: 'ACTIVE',
        isFeatured: true,
        OR: [{ featuredTill: null }, { featuredTill: { gt: new Date() } }],
      },
      select: PROPERTY_SELECT,
      orderBy: { aiTrustScore: 'desc' },
      take: 12,
    });
    return items.map(this.serializeProperty);
  }

  async update(id: string, dto: UpdatePropertyDto, user: User) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException('Property not found');

    if (property.ownerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own listings');
    }

    const updated = await this.prisma.property.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.price && { price: BigInt(dto.price) }),
        ...(dto.pricePerSqft && { pricePerSqft: BigInt(dto.pricePerSqft) }),
        // Re-queue for AI re-scoring on significant updates
        status: property.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING_REVIEW',
      },
      select: PROPERTY_SELECT,
    });

    await this.aiQueue.add('score-property', { propertyId: id, force: true }, { delay: 1000 });

    return this.serializeProperty(updated);
  }

  async remove(id: string, user: User) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException('Property not found');

    if (property.ownerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own listings');
    }

    // Soft delete — set to EXPIRED
    await this.prisma.property.update({
      where: { id },
      data: { status: 'EXPIRED' },
    });

    return { message: 'Listing removed successfully' };
  }

  async uploadImages(id: string, files: Express.Multer.File[], user: User) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException('Property not found');
    if (property.ownerId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('Not authorized');
    }

    const uploadPromises = files.map(async (file, index) => {
      const key = `properties/${id}/${Date.now()}-${index}.webp`;
      const url = await this.storage.upload(file.buffer, key, 'image/webp');
      return this.prisma.propertyImage.create({
        data: {
          propertyId: id,
          url,
          isPrimary: index === 0,
          order: index,
        },
      });
    });

    return Promise.all(uploadPromises);
  }

  async getMyProperties(userId: string, status?: PropertyStatus) {
    return this.prisma.property.findMany({
      where: { ownerId: userId, ...(status && { status }) },
      select: PROPERTY_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleSave(propertyId: string, userId: string) {
    const existing = await this.prisma.savedProperty.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });

    if (existing) {
      await this.prisma.savedProperty.delete({
        where: { userId_propertyId: { userId, propertyId } },
      });
      await this.prisma.property.update({
        where: { id: propertyId },
        data: { saves: { decrement: 1 } },
      });
      return { saved: false };
    }

    await this.prisma.savedProperty.create({ data: { userId, propertyId } });
    await this.prisma.property.update({
      where: { id: propertyId },
      data: { saves: { increment: 1 } },
    });
    return { saved: true };
  }

  async getSavedProperties(userId: string) {
    const saved = await this.prisma.savedProperty.findMany({
      where: { userId },
      include: { property: { select: PROPERTY_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
    return saved.map((s) => s.property);
  }

  private buildOrderBy(sortBy?: string): Prisma.PropertyOrderByWithRelationInput[] {
    const map: Record<string, Prisma.PropertyOrderByWithRelationInput[]> = {
      price_asc: [{ price: 'asc' }],
      price_desc: [{ price: 'desc' }],
      newest: [{ postedAt: 'desc' }],
      area_asc: [{ builtUpArea: 'asc' }],
      trust_score: [{ aiTrustScore: 'desc' }],
    };
    return (sortBy ? map[sortBy] : undefined) ?? [{ isFeatured: 'desc' }, { postedAt: 'desc' }];
  }

  private serializeProperty(property: Record<string, unknown>) {
    return {
      ...property,
      price: property.price ? Number(property.price) : 0,
      pricePerSqft: property.pricePerSqft ? Number(property.pricePerSqft) : undefined,
      maintenanceCharge: property.maintenanceCharge
        ? Number(property.maintenanceCharge)
        : undefined,
    };
  }

  private async generateSlug(title: string, city: string): Promise<string> {
    const base = `${title}-${city}`
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60);

    let slug = base;
    let counter = 0;

    while (await this.prisma.property.findUnique({ where: { slug } })) {
      counter++;
      slug = `${base}-${counter}`;
    }

    return slug;
  }
}
