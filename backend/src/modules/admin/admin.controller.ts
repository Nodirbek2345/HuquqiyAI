import { Controller, Post, Get, Put, Delete, Param, Body, Req, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminService } from './admin.service';
import { SettingsService } from './settings.service';
import { LoginDto } from './admin.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Request } from 'express';

@Controller('api/admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly settingsService: SettingsService
    ) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto, @Req() req: Request) {
        const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
        const result = await this.adminService.validateAdmin(loginDto, ipAddress);

        return {
            success: true,
            token: result.token,
            admin: result.admin,
        };
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: Request) {
        const user = req.user as { sub: string };
        const admin = await this.adminService.getAdminById(user.sub);

        return {
            success: true,
            admin,
        };
    }

    @Get('stats')
    @UseGuards(JwtAuthGuard)
    async getStats() {
        const stats = await this.adminService.getStats();
        return {
            success: true,
            stats,
        };
    }

    @Get('alerts')
    @UseGuards(JwtAuthGuard)
    async getAlerts() {
        const alerts = await this.adminService.getRecentAlerts();
        return {
            success: true,
            alerts,
        };
    }

    @Get('system-health')
    @UseGuards(JwtAuthGuard)
    async getSystemHealth() {
        const health = await this.adminService.getSystemHealth();
        return {
            success: true,
            health,
        };
    }

    @Get('audit-logs')
    @UseGuards(JwtAuthGuard)
    async getAuditLogs(@Query('page') page = 1, @Query('limit') limit = 50, @Query('search') search = '') {
        const result = await this.adminService.getAuditLogs(Number(page), Number(limit), search);
        return {
            success: true,
            logs: result.logs,
            total: result.total
        };
    }

    @Get('settings')
    @UseGuards(JwtAuthGuard)
    getSettings() {
        return {
            success: true,
            settings: this.settingsService.getSettings()
        };
    }

    @Put('settings')
    @UseGuards(JwtAuthGuard)
    async updateSettings(@Body() settings: any, @Req() req: Request) {
        const updated = this.settingsService.updateSettings(settings);

        // Log audit event (Try-catch to prevent failure if DB is down)
        try {
            const user = req.user as { sub: string; login: string };
            await this.adminService.logAuditEvent(
                'SETTINGS_UPDATE',
                null,
                user?.login || 'admin',
                req.ip || 'unknown',
                { settings: Object.keys(settings) }
            );
        } catch (e) {
            console.warn('Audit Log failed (DB might be offline):', e.message);
        }

        return {
            success: true,
            settings: updated
        };
    }

    @Get('users')
    @UseGuards(JwtAuthGuard)
    async getUsers() {
        const users = await this.adminService.getUsers();
        return {
            success: true,
            users,
        };
    }

    @Post('users')
    @UseGuards(JwtAuthGuard)
    async createUser(@Body() createDto: any) {
        const user = await this.adminService.createUser(createDto);
        return {
            success: true,
            user,
        };
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout() {
        return {
            success: true,
            message: 'Tizimdan muvaffaqiyatli chiqdingiz',
        };
    }
}
