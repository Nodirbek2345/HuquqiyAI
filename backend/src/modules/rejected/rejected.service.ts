import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiOrchestratorService } from '../../ai/orchestrator.service';
import { CreateRejectedDto } from './dto/create-rejected.dto';

@Injectable()
export class RejectedService {
    constructor(
        private prisma: PrismaService,
        private aiOrchestrator: AiOrchestratorService,
    ) { }

    async analyze(dto: CreateRejectedDto) {
        let result;
        try {
            result = await this.aiOrchestrator.analyzeDocument(dto.documentText, 'rejected');
        } catch (e: any) {
            console.error('⚠️ AI Orchestrator rejected xatosi:', e.message);
            throw new HttpException(
                `AI rejected tahlilida xatolik: ${e.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        try {
            const doc = await this.prisma.analysis.create({
                data: {
                    documentType: result.documentType || 'Rad etilgan hujjat tahlili',
                    documentText: dto.documentText,
                    mode: 'rejected',
                    summary: result.summary,
                    overallRisk: result.overallRisk || 'HIGH',
                    riskScore: result.riskScore || 75,
                    issues: result.issues || [],
                    recommendations: result.recommendations || [],
                    topRisks: result.topRisks || [],
                    legalCompliance: result.legalCompliance || {},
                    detailedConclusion: result.detailedConclusion,
                },
            });

            return {
                ...result,
                id: doc.id,
            };
        } catch (dbError) {
            console.error('⚠️ DB Save Failed for rejected:', dbError.message);
            return {
                ...result,
                id: `temp-${crypto.randomUUID()}`,
            };
        }
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
