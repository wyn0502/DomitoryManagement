import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. Cấu hình Cookie Parser
  app.use(cookieParser('dormitory-cookie-secret-key'));

  // 2. Cấu hình Express Session
  app.use(
    session({
      secret: 'dormitory-session-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000, // 1 giờ
        httpOnly: true,
        secure: false, // Để false khi chạy dev local HTTP
      },
    }),
  );

  // Kích hoạt CORS để React Frontend (cổng 5173) có thể gọi APIs (cổng 3000)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validation dữ liệu đầu vào toàn cục
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Ứng dụng Backend đang chạy tại: http://localhost:${port}`);
}
bootstrap();
