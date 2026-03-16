import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiOrchestratorService } from '../../ai/orchestrator.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';

@Injectable()
export class AnalysisService {
    constructor(
        private prisma: PrismaService,
        private aiOrchestrator: AiOrchestratorService,
    ) { }

    async analyze(dto: CreateAnalysisDto) {
        // AI tahlil qilish (Orchestrator ichida mock fallback bor)
        let result;
        try {
            result = await this.aiOrchestrator.analyzeDocument(dto.text, dto.mode || 'quick');
        } catch (e: any) {
            console.error('⚠️ AI Orchestrator xatosi:', e.message);
            // Orchestrator o'zi mock fallback qaytarishi kerak edi,
            // lekin agar u ham xato bersa — umumiy xato qaytaramiz
            throw new HttpException(
                `AI tahlilida xatolik: ${e.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        // Bazaga saqlash (Optional - xato bo'lsa ham tahlilni qaytarish kerak)
        try {
            const analysis = await this.prisma.analysis.create({
                data: {
                    documentType: result.documentType,
                    documentText: dto.text,
                    mode: dto.mode || 'quick',
                    summary: result.summary,
                    overallRisk: result.overallRisk,
                    riskScore: result.riskScore,
                    issues: result.issues,
                    recommendations: result.recommendations,
                    topRisks: result.topRisks || [],
                    legalCompliance: result.legalCompliance || {},
                    detailedConclusion: result.detailedConclusion,
                    ipAddress: dto.ipAddress,
                },
            });

            return {
                ...result,
                id: analysis.id,
            };
        } catch (dbError) {
            console.error('⚠️ DB Save Failed:', dbError.message);
            // Agar bazaga saqlash o'xshamasa ham foydalanuvchiga javobni qaytaramiz
            return {
                ...result,
                id: `temp-${crypto.randomUUID()}`,
            };
        }
    }

    async findAll(limit: number) {
        return this.prisma.analysis.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                documentType: true,
                mode: true,
                overallRisk: true,
                riskScore: true,
                summary: true,
                createdAt: true,
            },
        });
    }

    async findOne(id: string) {
        const analysis = await this.prisma.analysis.findUnique({
            where: { id },
        });

        if (!analysis) {
            throw new NotFoundException(`Tahlil topilmadi: ${id}`);
        }

        return analysis;
    }
}
