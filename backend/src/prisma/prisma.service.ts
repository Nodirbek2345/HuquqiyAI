import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
    private _isConnected = false;

    get isConnected(): boolean {
        return this._isConnected;
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this._isConnected = true;
            this.logger.log('✅ Database connected successfully');
        } catch (error: any) {
            this._isConnected = false;
            this.logger.warn(`⚠️ Database connection failed: ${error.message}. Application will continue without database.`);
        }
    }

    async onModuleDestroy() {
        if (this._isConnected) {
            await this.$disconnect();
        }
    }
}

