import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { assetsProviders } from './assets.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AssetsController],
  providers: [
    ...assetsProviders,
    AssetsService,
  ],
  exports: [
    AssetsService,
    ...assetsProviders,
  ],
})
export class AssetsModule {}