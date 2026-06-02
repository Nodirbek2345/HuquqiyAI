import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiOrchestratorService } from '../../ai/orchestrator.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class TemplatesService {
    constructor(
        private prisma: PrismaService,
        private aiOrchestrator: AiOrchestratorService,
    ) { }

    async generate(dto: CreateTemplateDto) {
        let result;
        try {
            result = await this.aiOrchestrator.analyzeDocument(`Iltimos, ushbu mavzuda hujjat shablonini tayyorlang: ${dto.templateType}`, 'template');
        } catch (e: any) {
            console.error('⚠️ AI Orchestrator template xatosi:', e.message);
            throw new HttpException(
                `AI shablon generatsiyasida xatolik: ${e.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        try {
            const templateData = result.generatedTemplate || {};
            const template = await this.prisma.template.create({
                data: {
                    documentType: dto.templateType,
                    header: templateData.header || 'Kimga: _______\nKimdan: _______',
                    title: templateData.title || dto.templateType.toUpperCase(),
                    body: templateData.body || 'Hujjat matni (Tahlilda muammo yuz berdi)',
                    footer: templateData.footer || 'Sana: ___.___.____\nImzo: _______',
                },
            });

            return {
                id: template.id,
                message: 'Shablon muvaffaqiyatli yaratildi',
                template: template,
                issues: result.issues || [],
            };
        } catch (dbError) {
            console.error('⚠️ DB Save Failed for template:', dbError.message);
            const fallbackTemplate = result.generatedTemplate || {};
            return {
                id: `temp-${crypto.randomUUID()}`,
                message: 'Shablon yaratildi (Vaqtinchalik)',
                template: {
                    documentType: dto.templateType,
                    header: fallbackTemplate.header || '',
                    title: fallbackTemplate.title || dto.templateType,
                    body: fallbackTemplate.body || '',
                    footer: fallbackTemplate.footer || '',
                },
                issues: result.issues || [],
            };
        }
    }

    async findAll() {
        return this.prisma.template.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }

    async findOne(id: string) {
        const template = await this.prisma.template.findUnique({
            where: { id },
        });

        if (!template) {
            throw new NotFoundException(`Shablon topilmadi: ${id}`);
        }

        return template;
    }
}
