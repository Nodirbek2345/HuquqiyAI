// AdolatAI - Kiruvchi ma'lumotlarni tozalash (Input Sanitizer)

import logger from '../core/logger';

/**
 * HTML teglarini olib tashlash
 */
export const stripHtml = (input: string): string => {
    return input.replace(/<[^>]*>/g, '');
};

/**
 * JavaScript injeksiyadan himoya
 */
export const escapeJs = (input: string): string => {
    return input
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
};

/**
 * XSS hujumdan himoya
 */
export const sanitizeXss = (input: string): string => {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };

    return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
};

/**
 * SQL injeksiyadan himoya (frontend uchun basic)
 */
export const sanitizeSql = (input: string): string => {
    return input
        .replace(/'/g, "''")
        .replace(/;/g, '')
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '');
};

/**
 * Prompt injeksiyadan himoya (AI uchun)
 */
export const sanitizePrompt = (input: string): string => {
    const dangerousPatterns = [
        /ignore (all )?(previous|above|prior) instructions?/gi,
        /forget (all )?(previous|above|prior)/gi,
        /disregard (all )?(previous|above|prior)/gi,
        /new (system )?instructions?:/gi,
        /override (system )?prompt/gi,
        /you are now/gi,
        /act as if/gi,
        /pretend (to be|you are)/gi
    ];

    let sanitized = input;

    for (const pattern of dangerousPatterns) {
        if (pattern.test(sanitized)) {
            logger.warn('Prompt injection attempt detected', { pattern: pattern.source });
            sanitized = sanitized.replace(pattern, '[FILTERED]');
        }
    }

    return sanitized;
};

/**
 * Umumiy tozalash funksiyasi
 */
export const sanitizeInput = (
    input: string,
    options: {
        stripHtml?: boolean;
        escapeXss?: boolean;
        sanitizeSql?: boolean;
        sanitizePrompt?: boolean;
        maxLength?: number;
    } = {}
): string => {
    let result = input.trim();

    if (options.stripHtml) {
        result = stripHtml(result);
    }

    if (options.escapeXss) {
        result = sanitizeXss(result);
    }

    if (options.sanitizeSql) {
        result = sanitizeSql(result);
    }

    if (options.sanitizePrompt) {
        result = sanitizePrompt(result);
    }

    if (options.maxLength && result.length > options.maxLength) {
        result = result.slice(0, options.maxLength);
        logger.info('Input truncated', { maxLength: options.maxLength });
    }

    return result;
};

/**
 * Hujjat matnini tozalash (AI tahlili uchun)
 */
export const sanitizeDocumentText = (text: string): string => {
    return sanitizeInput(text, {
        stripHtml: true,
        sanitizePrompt: true,
        maxLength: 100000
    });
};

export default {
    stripHtml,
    escapeJs,
    sanitizeXss,
    sanitizeSql,
    sanitizePrompt,
    sanitizeInput,
    sanitizeDocumentText
};
