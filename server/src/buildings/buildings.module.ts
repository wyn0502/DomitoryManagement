import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BuildingsService } from './buildings.service';
import { BuildingsController } from './buildings.controller';
import { Building } from './entities/building.entity';
import { DatabaseModule } from '../database/database.module'; // 1. Import DatabaseModule của dự án

@Module({
  imports: [DatabaseModule], // 2. Đưa DatabaseModule vào đây thay cho TypeOrmModule
  controllers: [BuildingsController],
  providers: [
    BuildingsService,
    // 3. Tự định nghĩa Provider để lấy Repository giống như các module khác (ví dụ RoomsModule) đang làm
    {
      provide: 'BUILDING_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Building),
      inject: ['DATA_SOURCE'], // Dùng token mà DatabaseModule cung cấp
    },
  ],
  exports: ['BUILDING_REPOSITORY'], // Export nếu các module khác cần dùng đến
})
export class BuildingsModule {}