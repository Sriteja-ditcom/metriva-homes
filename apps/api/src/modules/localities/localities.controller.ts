import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LocalitiesService } from './localities.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('localities')
@Controller('localities')
@UseGuards(JwtAuthGuard)
export class LocalitiesController {
  constructor(private localitiesService: LocalitiesService) {}

  @Get() @Public() findAll(@Query('city') city?: string) { return this.localitiesService.findAll(city); }
  @Get(':id') @Public() findById(@Param('id') id: string) { return this.localitiesService.findById(id); }
}
