import { Injectable, BadRequestException } from '@nestjs/common';
import * as tesseract from 'tesseract.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf = require('pdf-parse');

@Injectable()
export class OcrService {
    /**
     * PDF dan matn ajratib olish
     */
    async parsePdf(buffer: Buffer): Promise<string> {
        try {
            const data = await pdf(buffer);

            if (!data.text || data.text.trim().length === 0) {
                // Agar PDF matni bo'sh bo'lsa, ehtimol bu skaner qilingan PDF (rasm).
                // Bunday holda Tesseract ishlatish kerak bo'ladi (advanced), 
                // lekin hozircha ogohlantirish qaytaramiz.
                throw new Error('PDF da matn qatlami topilmadi (bu skaner qilingan hujjat bo\'lishi mumkin)');
            }

            return data.text;
        } catch (error) {
            console.error('PDF Parse Error:', error);
            throw new BadRequestException('PDF faylni o\'qib bo\'lmadi: ' + error.message);
        }
    }

    /**
     * Rasmdan matn ajratib olish (OCR)
     */
    async parseImage(buffer: Buffer): Promise<string> {
        try {
            // Tesseract.js using worker
            const { data: { text } } = await tesseract.recognize(buffer, 'uzb+eng', {
                logger: m => console.log(`[OCR] ${m.status}: ${Math.round(m.progress * 100)}%`),
            });

            return text;
        } catch (error) {
            console.error('OCR Error:', error);
            throw new BadRequestException('Rasmni o\'qib bo\'lmadi: ' + error.message);
        }
    }

    /**
     * Asosiy tahlil funksiyasi (Controller chaqiradi)
     */
    async extractText(file: Express.Multer.File): Promise<string> {
        if (!file) {
            throw new BadRequestException('Fayl yuklanmadi');
        }

        const mimeType = file.mimetype;

        if (mimeType === 'application/pdf') {
            return this.parsePdf(file.buffer);
        } else if (mimeType.startsWith('image/')) {
            return this.parseImage(file.buffer);
        } else {
            throw new BadRequestException('Faqat PDF va rasmlar (JPG, PNG) qo\'llab-quvvatlanadi');
        }
    }
}
