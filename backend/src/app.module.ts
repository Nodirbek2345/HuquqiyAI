import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Core modules
import { PrismaModule } from './prisma/prisma.module';
import { AiModule } from './ai/ai.module';
import { SecurityModule } from './security/security.module';
import { AuditModule } from './audit/audit.module';

// Feature modules
import { AnalysisModule } from './modules/analysis/analysis.module';
import { KazusModule } from './modules/kazus/kazus.module';
import { RejectedModule } from './modules/rejected/rejected.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { AdminModule } from './modules/admin/admin.module';
import { OcrModule } from './ocr/ocr.module';

// Controllers
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting (DDoS himoyasi — kuchaytirilgan)
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 daqiqa
      limit: 30,  // 30 so'rov / daqiqa (avval 60 edi)
    }]),

    // Core modules
    PrismaModule,
    SecurityModule,
    AuditModule,
    AiModule,

    // Feature modules - 5 ta asosiy bo'lim
    AnalysisModule,    // 1️⃣ Hujjat tahlili
    KazusModule,       // 2️⃣ Kazus yechish
    RejectedModule,    // 3️⃣ Rad etilgan hujjat
    TemplatesModule,   // 4️⃣ Shablon generatsiya
    AdminModule,       // 5️⃣ Admin panel autentifikatsiya
    OcrModule,         // 6️⃣ OCR moduli
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }

