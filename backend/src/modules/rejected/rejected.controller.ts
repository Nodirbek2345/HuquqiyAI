import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RejectedService } from './rejected.service';
import { CreateRejectedDto } from './dto/create-rejected.dto';

@Controller('api/rejected')
export class RejectedController {
    constructor(private readonly rejectedService: RejectedService) { }

    @Post()
    async analyze(@Body() dto: CreateRejectedDto) {
        return this.rejectedService.analyze(dto);
    }

    @Get()
    async findAll() {
        return this.rejectedService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.rejectedService.findOne(id);
    }
}
