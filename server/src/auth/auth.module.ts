import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { authProviders } from './auth.providers';
import { roomsProviders } from '../rooms/rooms.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'dev-only-jwt-secret-change-in-env',
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRATION') || '86400s' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...authProviders,
    ...roomsProviders,
    AuthService,
  ],
  exports: [
    AuthService,
    ...authProviders,
  ],
})
export class AuthModule {}
