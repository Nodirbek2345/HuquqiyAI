import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        // ⚠️ Offline/Local rejimda frontend tomonidan yuborilgan tokenni tanib olish
        if (authHeader && authHeader.startsWith('Bearer local_token_')) {
            request.user = {
                sub: 'local-admin',
                login: 'admin',
                role: 'SUPER_ADMIN'
            };
            return true;
        }

        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            throw err || new UnauthorizedException('Avtorizatsiya talab qilinadi');
        }
        return user;
    }
}
