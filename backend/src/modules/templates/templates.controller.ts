import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';

@Controller('api/templates')
export class TemplatesController {
    constructor(private readonly templatesService: TemplatesService) { }

    @Post()
    async generate(@Body() dto: CreateTemplateDto) {
        return this.templatesService.generate(dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll() {
        return this.templatesService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('id') id: string) {
        return this.templatesService.findOne(id);
    }
}
