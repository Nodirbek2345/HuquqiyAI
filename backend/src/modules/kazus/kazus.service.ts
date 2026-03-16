import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateKazusDto } from './dto/create-kazus.dto';

@Injectable()
export class KazusService {
    constructor(private prisma: PrismaService) { }

    async solve(dto: CreateKazusDto) {
        // TODO: AI Orchestrator bilan integratsiya
        const result = await this.prisma.analysis.create({
            data: {
                documentType: 'Kazus yechimi',
                documentText: dto.situation,
                mode: 'kazus',
                summary: 'Kazus tahlili bajarilmoqda...',
                overallRisk: 'MEDIUM',
                riskScore: 50,
                issues: [],
                recommendations: [],
            },
        });

        return {
            id: result.id,
            message: 'Kazus qabul qilindi',
            status: 'processing',
        };
    }

    async findAll() {
        return this.prisma.analysis.findMany({
            where: { mode: 'kazus' },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }

    async findOne(id: string) {
        const kazus = await this.prisma.analysis.findFirst({
            where: { id, mode: 'kazus' },
        });

        if (!kazus) {
            throw new NotFoundException(`Kazus topilmadi: ${id}`);
        }

        return kazus;
    }
}
