import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { KazusService } from './kazus.service';
import { CreateKazusDto } from './dto/create-kazus.dto';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';

@Controller('api/kazus')
export class KazusController {
    constructor(private readonly kazusService: KazusService) { }

    @Post()
    async solve(@Body() dto: CreateKazusDto) {
        return this.kazusService.solve(dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll() {
        return this.kazusService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('id') id: string) {
        return this.kazusService.findOne(id);
    }
}
