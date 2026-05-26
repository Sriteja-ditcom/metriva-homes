import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BuildersService } from './builders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('builders')
@Controller('builders')
@UseGuards(JwtAuthGuard)
export class BuildersController {
  constructor(private buildersService: BuildersService) {}

  @Get() @Public() findAll() { return this.buildersService.findAll(); }
  @Get(':id') @Public() findById(@Param('id') id: string) { return this.buildersService.findById(id); }
}
