import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BrokersService } from './brokers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('brokers')
@Controller('brokers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BrokersController {
  constructor(private brokersService: BrokersService) {}

  @Get() @Public()
  findAll(@Query('city') city?: string) {
    return this.brokersService.findAll(city);
  }

  @Get(':id') @Public()
  findById(@Param('id') id: string) {
    return this.brokersService.findById(id);
  }

  @Patch('profile')
  @Roles('BROKER')
  updateProfile(@CurrentUser('id') userId: string, @Body() data: Record<string, unknown>) {
    return this.brokersService.updateProfile(userId, data);
  }
}
