import { Module } from '@nestjs/common';
import { RejectedController } from './rejected.controller';
import { RejectedService } from './rejected.service';
import { AiModule } from '../../ai/ai.module';

@Module({
    imports: [AiModule],
    controllers: [RejectedController],
    providers: [RejectedService],
    exports: [RejectedService],
})
export class RejectedModule { }
