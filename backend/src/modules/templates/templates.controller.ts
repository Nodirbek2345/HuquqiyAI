import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Controller('api/templates')
export class TemplatesController {
    constructor(private readonly templatesService: TemplatesService) { }

    @Post()
    async generate(@Body() dto: CreateTemplateDto) {
        return this.templatesService.generate(dto);
    }

    @Get()
    async findAll() {
        return this.templatesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.templatesService.findOne(id);
    }
}
