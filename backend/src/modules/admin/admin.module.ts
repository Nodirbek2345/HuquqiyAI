import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SettingsService } from './settings.service';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [
        PrismaModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'adolatai-super-secret-key-2026',
                signOptions: {
                    expiresIn: 86400, // 24 hours in seconds
                },
            }),
        }),
    ],
    controllers: [AdminController],
    providers: [AdminService, SettingsService, JwtStrategy],
    exports: [AdminService, SettingsService],
})
export class AdminModule { }
