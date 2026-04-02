import { Module } from '@nestjs/common';
import { KazusController } from './kazus.controller';
import { KazusService } from './kazus.service';
import { AiModule } from '../../ai/ai.module';

@Module({
    imports: [AiModule],
    controllers: [KazusController],
    providers: [KazusService],
    exports: [KazusService],
})
export class KazusModule { }