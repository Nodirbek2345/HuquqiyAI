import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('register')
  async registerUser(@Body() body: any) {
    if (!body || !body.fullName || !body.email || !body.phone) {
      return { success: false, message: 'Invalid data' };
    }
    const user = await this.prisma.platformUser.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        profession: body.profession || 'yurist',
        status: 'pending',
      }
    });
    return { success: true, user };
  }

  @Get('users/check')
  async checkUserStatus(@Query('email') email: string) {
    if (!email) return { success: false, message: 'Email arg missing' };
    const user = await this.prisma.platformUser.findUnique({
      where: { email }
    });
    return { success: true, user };
  }
}
