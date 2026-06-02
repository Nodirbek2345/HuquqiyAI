import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';

@Controller('api/analysis')
export class AnalysisController {
    constructor(private readonly analysisService: AnalysisService) { }

    @Post()
    async create(@Body() dto: CreateAnalysisDto) {
        return this.analysisService.analyze(dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(@Query('limit') limit?: number) {
        return this.analysisService.findAll(limit || 20);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('id') id: string) {
        return this.analysisService.findOne(id);
    }
}
