import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class TemplatesService {
    constructor(private prisma: PrismaService) { }

    async generate(dto: CreateTemplateDto) {
        // TODO: AI Orchestrator bilan integratsiya
        const template = await this.prisma.template.create({
            data: {
                documentType: dto.templateType,
                header: 'Kimga: _______\nKimdan: _______',
                title: dto.templateType.toUpperCase(),
                body: 'Hujjat matni generatsiya qilinmoqda...',
                footer: 'Sana: ___.___.____\nImzo: _______',
            },
        });

        return {
            id: template.id,
            message: 'Shablon yaratildi',
            template,
        };
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
