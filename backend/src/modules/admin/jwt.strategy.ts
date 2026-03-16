import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
    sub: string;
    login: string;
    role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'adolatai-super-secret-key-2026',
        });
    }

    async validate(payload: JwtPayload) {
        if (!payload.sub) {
            throw new UnauthorizedException('Token yaroqsiz');
        }
        return { sub: payload.sub, login: payload.login, role: payload.role };
    }
}
