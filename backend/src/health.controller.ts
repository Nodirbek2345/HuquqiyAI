import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class HealthController {
    @Get('health')
    health() {
        return {
            status: 'ok',
            service: 'AdolatAI Backend',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            endpoints: {
                analysis: '/api/analysis',
                kazus: '/api/kazus',
                rejected: '/api/rejected',
                templates: '/api/templates',
            },
        };
    }

    @Get()
    root() {
        return {
            message: '🛡️ AdolatAI Backend API',
            docs: '/api/health',
        };
    }
}
