import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { PrismaService } from '../prisma/prisma.service';

interface TrustScoreResult {
  trustScore: number;
  fraudRiskScore: number;
  contentQuality: number;
  signals: {
    hasImages: boolean;
    imageCount: number;
    descriptionLength: number;
    hasDocuments: boolean;
    isOwnerVerified: boolean;
    priceDeviation: number;
    contentQualityScore: number;
    flags: string[];
  };
  isDuplicate: boolean;
  duplicateOf?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;
  private groq: Groq;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({ apiKey: configService.get('openai.apiKey') });
    this.groq = new Groq({ apiKey: configService.get('groq.apiKey') });
  }

  async scoreProperty(propertyId: string, force = false): Promise<void> {
    const existing = await this.prisma.aiScore.findUnique({ where: { propertyId } });
    if (existing && !force) return;

    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        images: { select: { url: true } },
        owner: { select: { id: true, createdAt: true, status: true } },
        aiScore: true,
      },
    });

    if (!property) return;

    try {
      const signals = await this.analyzePropertySignals(property);
      const trustScore = this.calculateTrustScore(signals);
      const fraudRiskScore = this.calculateFraudRiskScore(signals);

      const isDuplicate = await this.checkDuplicate(propertyId, property.city, Number(property.price));

      const scoreData = {
        propertyId,
        trustScore,
        fraudRiskScore,
        contentQuality: signals.contentQualityScore,
        signals: signals as unknown as Prisma.InputJsonValue,
        isDuplicate: isDuplicate.isDuplicate,
        duplicateOf: isDuplicate.duplicateOf,
        model: 'heuristic-v1',
      };

      await this.prisma.aiScore.upsert({
        where: { propertyId },
        create: scoreData,
        update: scoreData,
      });

      await this.prisma.property.update({
        where: { id: propertyId },
        data: {
          aiTrustScore: trustScore,
          isDuplicateFlag: isDuplicate.isDuplicate,
          isFraudFlag: fraudRiskScore > 70,
          status: fraudRiskScore > 80 ? 'SUSPENDED' : undefined,
        },
      });

      // Generate AI summary with Groq (async)
      this.generatePropertySummary(propertyId, property).catch(() => {});

    } catch (error) {
      this.logger.error(`AI scoring failed for ${propertyId}:`, error);
    }
  }

  async generatePropertySummary(
    propertyId: string,
    property: Record<string, unknown>,
  ): Promise<void> {
    const existing = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { aiSummary: true, aiSummaryAt: true },
    });

    // Regenerate summary only if older than 7 days
    if (existing?.aiSummaryAt) {
      const ageMs = Date.now() - new Date(existing.aiSummaryAt).getTime();
      if (ageMs < 7 * 24 * 60 * 60 * 1000) return;
    }

    const prompt = `You are a real estate expert. Write a compelling, factual property summary in 100-120 words.
Property details:
- Type: ${property.type} for ${property.listingType}
- Location: ${property.locality}, ${property.city}
- Bedrooms: ${property.bedrooms ?? 'N/A'}, Bathrooms: ${property.bathrooms ?? 'N/A'}
- Area: ${property.builtUpArea ?? property.carpetArea ?? 'N/A'} sq.ft
- Furnishing: ${property.furnishing ?? 'N/A'}
- Amenities: ${Array.isArray(property.amenities) ? (property.amenities as string[]).slice(0, 8).join(', ') : 'N/A'}
- Price: ₹${Number(property.price as bigint) / 100}

Focus on lifestyle benefits and key features. Keep it factual and engaging. No markdown.`;

    try {
      const completion = await this.groq.chat.completions.create({
        model: this.configService.get('groq.model', 'llama-3.1-8b-instant'),
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      });

      const summary = completion.choices[0]?.message?.content?.trim();
      if (summary) {
        await this.prisma.property.update({
          where: { id: propertyId },
          data: { aiSummary: summary, aiSummaryAt: new Date() },
        });
      }
    } catch (error) {
      this.logger.warn(`Groq summary failed for ${propertyId}: ${(error as Error).message}`);
    }
  }

  async generateLocalityInsights(localityId: string): Promise<string> {
    const locality = await this.prisma.locality.findUnique({ where: { id: localityId } });
    if (!locality) throw new Error('Locality not found');

    // Return cached if fresh (24h)
    if (locality.aiInsights && locality.aiInsightsAt) {
      const ageMs = Date.now() - new Date(locality.aiInsightsAt).getTime();
      if (ageMs < 24 * 60 * 60 * 1000) return locality.aiInsights;
    }

    const propertyStats = await this.prisma.property.aggregate({
      where: { localityId, status: 'ACTIVE' },
      _avg: { price: true, builtUpArea: true },
      _count: true,
    });

    const prompt = `You are an Indian real estate analyst. Write a detailed locality insight for ${locality.name}, ${locality.city} in 200-250 words covering:
1. Neighbourhood character and demographics
2. Connectivity (metro, highways, public transport)
3. Social infrastructure (schools, hospitals, malls)
4. Real estate market (avg price: ₹${propertyStats._avg.price ? Number(propertyStats._avg.price) / 100 : 'N/A'}, ${propertyStats._count} active listings)
5. Growth potential and upcoming developments
Keep it informative and balanced. No markdown headers.`;

    const completion = await this.groq.chat.completions.create({
      model: this.configService.get('groq.model', 'llama-3.1-8b-instant'),
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.6,
    });

    const insights = completion.choices[0]?.message?.content?.trim() ?? '';

    await this.prisma.locality.update({
      where: { id: localityId },
      data: { aiInsights: insights, aiInsightsAt: new Date() },
    });

    return insights;
  }

  async analyzeForFraud(propertyId: string): Promise<{ riskScore: number; flags: string[] }> {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { images: true, owner: true },
    });

    if (!property) throw new Error('Property not found');

    const flags: string[] = [];
    let riskScore = 0;

    // Price anomaly check
    const localityAvg = await this.prisma.property.aggregate({
      where: {
        city: property.city,
        locality: property.locality,
        listingType: property.listingType,
        status: 'ACTIVE',
        id: { not: propertyId },
      },
      _avg: { price: true },
    });

    if (localityAvg._avg.price) {
      const deviation = Math.abs(
        (Number(property.price) - Number(localityAvg._avg.price)) / Number(localityAvg._avg.price),
      );
      if (deviation > 0.5) {
        flags.push('PRICE_ANOMALY');
        riskScore += 25;
      }
    }

    // Low image count
    if (property.images.length < 3) {
      flags.push('FEW_IMAGES');
      riskScore += 10;
    }

    // New account posting property
    const accountAgeDays =
      (Date.now() - new Date(property.owner.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (accountAgeDays < 7) {
      flags.push('NEW_ACCOUNT');
      riskScore += 15;
    }

    // No documents
    if (!property.documents) {
      flags.push('NO_DOCUMENTS');
      riskScore += 10;
    }

    return { riskScore: Math.min(riskScore, 100), flags };
  }

  private async analyzePropertySignals(property: Record<string, unknown> & {
    images: { url: string }[];
    owner: { createdAt: Date; status: string };
  }) {
    const images = property.images as { url: string }[];
    const flags: string[] = [];
    let contentQualityScore = 50;

    // Content quality
    const descLength = (property.description as string)?.length ?? 0;
    if (descLength > 200) contentQualityScore += 20;
    if (descLength > 500) contentQualityScore += 10;
    if (images.length >= 5) contentQualityScore += 15;
    if (images.length >= 10) contentQualityScore += 5;
    if ((property.amenities as string[])?.length > 3) contentQualityScore += 10;

    // Fraud signals
    if (images.length === 0) flags.push('NO_IMAGES');
    if (descLength < 100) flags.push('THIN_DESCRIPTION');

    const accountAgeDays =
      (Date.now() - new Date(property.owner.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (accountAgeDays < 3) flags.push('VERY_NEW_ACCOUNT');

    return {
      hasImages: images.length > 0,
      imageCount: images.length,
      descriptionLength: descLength,
      hasDocuments: !!property.documents,
      isOwnerVerified: property.owner.status === 'ACTIVE',
      priceDeviation: 0,
      contentQualityScore: Math.min(contentQualityScore, 100),
      flags,
    };
  }

  private calculateTrustScore(signals: TrustScoreResult['signals']): number {
    let score = 40; // base

    if (signals.hasImages) score += 15;
    if (signals.imageCount >= 5) score += 10;
    if (signals.imageCount >= 10) score += 5;
    if (signals.descriptionLength > 300) score += 10;
    if (signals.hasDocuments) score += 15;
    if (signals.isOwnerVerified) score += 10;
    if (signals.flags.includes('PRICE_ANOMALY')) score -= 15;
    if (signals.flags.includes('NEW_ACCOUNT')) score -= 10;
    if (signals.flags.includes('NO_IMAGES')) score -= 20;

    return Math.max(0, Math.min(100, score));
  }

  private calculateFraudRiskScore(signals: TrustScoreResult['signals']): number {
    let risk = 10;
    if (signals.flags.includes('PRICE_ANOMALY')) risk += 25;
    if (signals.flags.includes('VERY_NEW_ACCOUNT')) risk += 20;
    if (signals.flags.includes('NO_IMAGES')) risk += 20;
    if (signals.flags.includes('THIN_DESCRIPTION')) risk += 10;
    return Math.min(100, risk);
  }

  private async checkDuplicate(
    propertyId: string,
    city: string,
    price: number,
  ): Promise<{ isDuplicate: boolean; duplicateOf?: string }> {
    const priceRange = price * 0.1;
    const similar = await this.prisma.property.findFirst({
      where: {
        id: { not: propertyId },
        city,
        price: { gte: BigInt(price - priceRange), lte: BigInt(price + priceRange) },
        status: 'ACTIVE',
      },
      select: { id: true },
    });

    return similar
      ? { isDuplicate: true, duplicateOf: similar.id }
      : { isDuplicate: false };
  }
}
