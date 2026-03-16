import { Module } from '@nestjs/common';
import { RejectedController } from './rejected.controller';
import { RejectedService } from './rejected.service';

@Module({
    controllers: [RejectedController],
    providers: [RejectedService],
    exports: [RejectedService],
})
export class RejectedModule { }
