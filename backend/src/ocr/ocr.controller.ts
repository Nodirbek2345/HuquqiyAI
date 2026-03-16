import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';
import { memoryStorage } from 'multer';

@Controller('api/ocr')
export class OcrController {
    constructor(private readonly ocrService: OcrService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(), // Faylni xotirada ushlab turish (serverga saqlamaslik uchun - maxfiylik)
        limits: {
            fileSize: 10 * 1024 * 1024, // 10 MB limit
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
                cb(null, true);
            } else {
                cb(new BadRequestException('Faqat PDF va rasm fayllari ruxsat etilgan!'), false);
            }
        },
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Fayl yuklanmadi');
        }

        const text = await this.ocrService.extractText(file);

        return {
            success: true,
            originalName: file.originalname,
            extractedText: text,
            length: text.length,
        };
    }
}
