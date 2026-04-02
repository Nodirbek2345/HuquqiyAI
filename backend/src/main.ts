import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🛡️ Security Headers (kengaytirilgan)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "https://api.groq.com", "https://api.openai.com", "https://generativelanguage.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    noSniff: true,
    xssFilter: true,
  }));

  const port = process.env.PORT || 5000;

  // CORS — Faqat ruxsat etilgan manbalar
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://huquqiyai-2.onrender.com', // RENDER FRONTEND URL (Hardcoded)
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24 soat preflight cache
  });

  // Global Error Handling
  app.useGlobalFilters(new HttpExceptionFilter());

  // 🛡️ Validation — nomalum va ortiqcha maydonlarni rad etish
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    disableErrorMessages: process.env.NODE_ENV === 'production',
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
