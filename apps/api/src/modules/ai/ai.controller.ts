import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Get('trust-score/:propertyId')
  @Public()
  @ApiOperation({ summary: 'Get AI trust score for a property' })
  async getTrustScore(@Param('propertyId') propertyId: string) {
    await this.aiService.scoreProperty(propertyId);
    return { propertyId, message: 'Score refreshed' };
  }

  @Get('locality-insights/:localityId')
  @Public()
  @Throttle({ global: { limit: 20, ttl: 60 * 60 * 1000 } })
  @ApiOperation({ summary: 'Get AI locality insights' })
  async getLocalityInsights(@Param('localityId') localityId: string) {
    const insights = await this.aiService.generateLocalityInsights(localityId);
    return { insights };
  }

  @Post('analyze/:propertyId')
  @Throttle({ global: { limit: 5, ttl: 60 * 60 * 1000 } })
  @ApiOperation({ summary: 'Run full fraud analysis on a property' })
  async analyzeProperty(@Param('propertyId') propertyId: string) {
    const result = await this.aiService.analyzeForFraud(propertyId);
    return result;
  }
}
