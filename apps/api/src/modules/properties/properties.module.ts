import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'ai-scoring' }),
    StorageModule,
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
