import { Controller, Get, Post, Body } from '@nestjs/common';
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
}
