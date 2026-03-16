import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { KazusService } from './kazus.service';
import { CreateKazusDto } from './dto/create-kazus.dto';

@Controller('api/kazus')
export class KazusController {
    constructor(private readonly kazusService: KazusService) { }

    @Post()
    async solve(@Body() dto: CreateKazusDto) {
        return this.kazusService.solve(dto);
    }

    @Get()
    async findAll() {
        return this.kazusService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.kazusService.findOne(id);
    }
}
