import { Injectable } from '@nestjs/common';

@Injectable()
export class SanitizerService {
    /**
     * XSS va injection hujumlaridan himoya (kengaytirilgan)
     */
    sanitizeText(text: string): string {
        if (!text) return '';

        return text
            // HTML teglarini olib tashlash
            .replace(/<[^>]*>/g, '')
            // Script teglarini olib tashlash
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            // Event handler attributelarini olib tashlash
            .replace(/on\w+\s*=\s*(['"])[^'"]*\1/gi, '')
            // javascript: va data: URL sxemalarini bloklash
            .replace(/(javascript|data|vbscript)\s*:/gi, '$1_blocked:')
            // SQL injection so'zlarini filtrlash
            .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE|TRUNCATE|GRANT|REVOKE)\b)/gi, '[$1]')
            // SQL comment hujumlarini bloklash
            .replace(/(--|\/\*|\*\/|;(?=\s*(SELECT|INSERT|UPDATE|DELETE|DROP)))/gi, '')
            // NoSQL injection ($gt, $ne, $regex va h.k.) bloklash
            .replace(/\$\b(gt|gte|lt|lte|ne|eq|in|nin|regex|where|exists|type|expr|jsonSchema|mod|text|all|size|slice|meta|elemMatch|or|and|not|nor)\b/gi, '_blocked_$1')
            // Command injection bloklash (|, &&, ||, `, $())
            .replace(/[|`]|&&|\|\||\$\(/g, '')
            // Null byte injection
            .replace(/\0/g, '')
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
            .replace(/\.{2,}/g, '.') // Path traversal (../) himoya
            .substring(0, 100);
    }

    /**
     * Matn uzunligini cheklash
     */
    truncate(text: string, maxLength: number = 50000): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '... [truncated]';
    }

    /**
     * Email validatsiya
     */
    isValidEmail(email: string): boolean {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email) && email.length <= 254;
    }

    /**
     * JSON injection himoyasi
     */
    sanitizeForJson(text: string): string {
        return text
            .replace(/[\x00-\x1f\x7f]/g, '') // Control belgilar
            .replace(/[\\]/g, '\\\\')
            .replace(/["]/g, '\\"');
    }
}
