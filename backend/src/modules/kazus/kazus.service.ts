import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiOrchestratorService } from '../../ai/orchestrator.service';
import { CreateKazusDto } from './dto/create-kazus.dto';

@Injectable()
export class KazusService {
    constructor(
        private prisma: PrismaService,
        private aiOrchestrator: AiOrchestratorService,
    ) { }

    async solve(dto: CreateKazusDto) {
        let result;
        try {
            result = await this.aiOrchestrator.analyzeDocument(dto.situation, 'kazus');
        } catch (e: any) {
            console.error('⚠️ AI Orchestrator kazus xatosi:', e.message);
            throw new HttpException(
                `AI kazus tahlilida xatolik: ${e.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        try {
            const kazus = await this.prisma.analysis.create({
                data: {
                    documentType: result.documentType || 'Kazus tahlili',
                    documentText: dto.situation,
                    mode: 'kazus',
                    summary: result.summary,
                    overallRisk: result.overallRisk || 'MEDIUM',
                    riskScore: result.riskScore || 50,
                    issues: result.issues || [],
                    recommendations: result.recommendations || [],
                    topRisks: result.topRisks || [],
                    legalCompliance: result.legalCompliance || {},
                    detailedConclusion: result.detailedConclusion,
                },
            });

            return {
                ...result,
                id: kazus.id,
            };
        } catch (dbError) {
            console.error('⚠️ DB Save Failed for kazus:', dbError.message);
            return {
                ...result,
                id: `temp-${crypto.randomUUID()}`,
            };
        }
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
