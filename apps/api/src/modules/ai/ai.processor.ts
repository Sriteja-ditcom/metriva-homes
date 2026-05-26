import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AiService } from './ai.service';

@Processor('ai-scoring')
export class AiProcessor {
  private readonly logger = new Logger(AiProcessor.name);

  constructor(private aiService: AiService) {}

  @Process('score-property')
  async handleScoreProperty(job: Job<{ propertyId: string; force?: boolean }>) {
    this.logger.log(`Scoring property: ${job.data.propertyId}`);
    await this.aiService.scoreProperty(job.data.propertyId, job.data.force);
    this.logger.log(`Scored property: ${job.data.propertyId}`);
  }
}
