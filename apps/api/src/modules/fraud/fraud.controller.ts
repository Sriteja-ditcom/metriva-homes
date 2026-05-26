import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FraudService, CreateFraudReportDto } from './fraud.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('fraud')
@Controller('fraud')
@UseGuards(JwtAuthGuard)
export class FraudController {
  constructor(private fraudService: FraudService) {}

  @Post('report')
  @ApiOperation({ summary: 'Report a fraudulent listing' })
  reportFraud(@Body() dto: CreateFraudReportDto, @CurrentUser('id') userId: string) {
    return this.fraudService.create(dto, userId);
  }

  @Get('my-reports')
  @ApiOperation({ summary: 'Get my fraud reports' })
  getMyReports(@CurrentUser('id') userId: string) {
    return this.fraudService.getUserReports(userId);
  }
}
