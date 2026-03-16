import { Injectable } from '@nestjs/common';

@Injectable()
export class SanitizerService {
    /**
     * XSS va injection hujumlaridan himoya
     */
    sanitizeText(text: string): string {
        if (!text) return '';

        return text
            // HTML teglarini olib tashlash
            .replace(/<[^>]*>/g, '')
            // Script teglarini olib tashlash
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            // SQL injection so'zlarini filtrlash (asosiy)
            .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/gi, '[$1]')
            // Ortiqcha bo'shliqlarni tozalash
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Faqat ruxsat etilgan belgilarni qoldirish
     */
    sanitizeForFilename(text: string): string {
        return text
            .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
            .substring(0, 100);
    }

    /**
     * Matn uzunligini cheklash
     */
    truncate(text: string, maxLength: number = 50000): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '... [truncated]';
    }
}
