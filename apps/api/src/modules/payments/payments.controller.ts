import { Body, Controller, Get, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

class CreateFeaturedOrderDto {
  @IsString() propertyId: string;
  @IsEnum(['7', '30']) duration: '7' | '30';
}

class CreateSubscriptionOrderDto {
  @IsEnum(['BASIC', 'PROFESSIONAL', 'ENTERPRISE']) plan: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
}

class VerifyPaymentDto {
  @IsString() razorpayOrderId: string;
  @IsString() razorpayPaymentId: string;
  @IsString() razorpaySignature: string;
}

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('featured/create-order')
  @ApiOperation({ summary: 'Create Razorpay order for featuring a listing' })
  createFeaturedOrder(
    @Body() dto: CreateFeaturedOrderDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.createFeaturedListingOrder(dto.propertyId, userId, dto.duration);
  }

  @Post('subscription/create-order')
  @ApiOperation({ summary: 'Create Razorpay order for subscription' })
  createSubscriptionOrder(
    @Body() dto: CreateSubscriptionOrderDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.createSubscriptionOrder(userId, dto.plan);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify Razorpay payment signature' })
  verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(dto);
  }

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Razorpay webhook receiver' })
  handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['x-razorpay-signature'] as string;
    return this.paymentsService.handleWebhook(req.rawBody!, signature);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get payment history' })
  getHistory(@CurrentUser('id') userId: string) {
    return this.paymentsService.getPaymentHistory(userId);
  }
}
