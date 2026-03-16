import { Module } from '@nestjs/common';
import { KazusController } from './kazus.controller';
import { KazusService } from './kazus.service';

@Module({
    controllers: [KazusController],
    providers: [KazusService],
    exports: [KazusService],
})
export class KazusModule { }
