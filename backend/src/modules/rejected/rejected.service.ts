import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRejectedDto } from './dto/create-rejected.dto';

@Injectable()
export class RejectedService {
    constructor(private prisma: PrismaService) { }

    async analyze(dto: CreateRejectedDto) {
        // TODO: AI Orchestrator bilan integratsiya
        const result = await this.prisma.analysis.create({
            data: {
                documentType: 'Rad etilgan hujjat tahlili',
                documentText: dto.documentText,
                mode: 'rejected',
                summary: dto.rejectionReason || 'Rad sababi aniqlanmoqda...',
                overallRisk: 'HIGH',
                riskScore: 75,
                issues: [],
                recommendations: [],
            },
        });

        return {
            id: result.id,
            message: 'Rad etilgan hujjat qabul qilindi',
            status: 'processing',
        };
    }

    async findAll() {
        return this.prisma.analysis.findMany({
            where: { mode: 'rejected' },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }

    async findOne(id: string) {
        const doc = await this.prisma.analysis.findFirst({
            where: { id, mode: 'rejected' },
        });

        if (!doc) {
            throw new NotFoundException(`Hujjat topilmadi: ${id}`);
        }

        return doc;
    }
}
