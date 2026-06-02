import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type AuditAction = 'ANALYZE' | 'KAZUS' | 'REJECTED' | 'TEMPLATE' | 'LOGIN' | 'ERROR';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async log(
        action: AuditAction,
        entityId?: string,
        userId?: string,
        ipAddress?: string,
        metadata?: Record<string, any>,
    ) {
        return this.prisma.auditLog.create({
            data: {
                action,
                entityId,
                userId,
                ipAddress,
                metadata: metadata || {},
            },
        });
    }

    async findAll(limit = 100) {
        return this.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async findByAction(action: AuditAction, limit = 50) {
        return this.prisma.auditLog.findMany({
            where: { action },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
}
