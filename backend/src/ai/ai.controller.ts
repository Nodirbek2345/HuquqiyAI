import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiOrchestratorService } from './orchestrator.service';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('api/chat')
@UseGuards(ThrottlerGuard)
export class AiController {
    constructor(private readonly aiService: AiOrchestratorService) { }

    @Post()
    async chat(@Body() body: { message: string, context?: string }) {
        if (!body.message) {
            throw new Error("Message is required");
        }

        const response = await this.aiService.chat(body.message, body.context);

        return {
            response: response
        };
    }
}
