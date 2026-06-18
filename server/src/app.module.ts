import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Modules
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { RoomsModule } from './rooms/rooms.module';
import { InvoicesModule } from './invoices/invoices.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    // 1. Load các biến môi trường từ file .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'), // Nạp .env ở thư mục server/
    }),

    // 2. Phục vụ tài liệu tĩnh (Giao diện HTML/CSS/JS) từ thư mục public/ nếu có
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/(.*)'],
    }),

    // 3. Sử dụng Custom DatabaseModule cung cấp DATA_SOURCE TypeORM tự định nghĩa
    DatabaseModule,

    // 4. Các module nghiệp vụ của hệ thống
    AuthModule,
    RoomsModule,
    InvoicesModule,
    DashboardModule,
  ],
})
export class AppModule {}
