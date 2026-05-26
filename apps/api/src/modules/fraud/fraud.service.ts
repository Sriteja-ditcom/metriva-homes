import { Injectable, NotFoundException } from '@nestjs/common';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class CreateFraudReportDto {
  @IsString() propertyId: string;
  @IsString() reason: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() evidence?: string[];
}

@Injectable()
export class FraudService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFraudReportDto, reporterId: string) {
    const property = await this.prisma.property.findUnique({ where: { id: dto.propertyId } });
    if (!property) throw new NotFoundException('Property not found');

    return this.prisma.fraudReport.create({
      data: {
        reporterId,
        propertyId: dto.propertyId,
        reason: dto.reason,
        description: dto.description,
        evidence: dto.evidence ?? [],
      },
    });
  }

  async getUserReports(userId: string) {
    return this.prisma.fraudReport.findMany({
      where: { reporterId: userId },
      include: { property: { select: { id: true, title: true, city: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
