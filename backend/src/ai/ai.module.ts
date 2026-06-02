import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiOrchestratorService } from './orchestrator.service';
import { AiController } from './ai.controller';
import { AdminModule } from '../modules/admin/admin.module';

@Module({
    imports: [ConfigModule, AdminModule],
    controllers: [AiController],
    providers: [AiOrchestratorService],
    exports: [AiOrchestratorService],
})
export class AiModule { }
