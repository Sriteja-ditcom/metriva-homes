import { Module } from '@nestjs/common';
import { BuildersController } from './builders.controller';
import { BuildersService } from './builders.service';

@Module({ controllers: [BuildersController], providers: [BuildersService], exports: [BuildersService] })
export class BuildersModule {}
