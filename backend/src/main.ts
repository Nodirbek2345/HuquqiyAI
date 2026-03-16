import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers
  app.use(helmet());

  const port = process.env.PORT || 5000;

  // CORS - Frontend bilan integratsiya uchun
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global Error Handling
  app.useGlobalFilters(new HttpExceptionFilter());

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));

  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║   🛡️  AdolatAI Backend Server                                 ║
  ║   ────────────────────────────────────────────────────────    ║
  ║   📍 Port: ${port}                                             ║
  ║   🌐 API: http://localhost:${port}/api                         ║
  ║   📊 Health: http://localhost:${port}/api/health               ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
