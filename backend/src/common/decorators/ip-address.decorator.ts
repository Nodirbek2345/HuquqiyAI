import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Request dan IP manzilini olish
 */
export const IpAddress = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        return request.ip || request.connection?.remoteAddress || 'unknown';
    },
);
