import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : (exception as any).message || 'Internal server error';

        const errorResponse = {
            success: false,
            statusCode: status,
            path: request.url,
            message: typeof message === 'object' && (message as any).message ? (message as any).message : message,
            timestamp: new Date().toISOString(),
        };

        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(`${request.method} ${request.url}`, (exception as any).stack);
        } else {
            this.logger.warn(`${request.method} ${request.url} - ${status} - ${JSON.stringify(message)}`);
        }

        response.status(status).json(errorResponse);
    }
}
