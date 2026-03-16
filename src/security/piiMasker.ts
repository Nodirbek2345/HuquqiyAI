// AdolatAI - Shaxsiy ma'lumotlarni yashirish (PII Masker)

import logger from '../core/logger';

interface PiiMatch {
    type: string;
    original: string;
    masked: string;
    position: number;
}

/**
 * O'zbekiston telefon raqamlarini aniqlash va yashirish
 */
const maskPhoneNumbers = (text: string): { text: string; matches: PiiMatch[] } => {
    const matches: PiiMatch[] = [];

    // O'zbekiston formatdagi raqamlar
    const patterns = [
        /\+998[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g,
        /998\d{9}/g,
        /\(?\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g
    ];

    let result = text;

    for (const pattern of patterns) {
        result = result.replace(pattern, (match, offset) => {
            const masked = match.slice(0, 4) + '***' + match.slice(-4);
            matches.push({
                type: 'phone',
                original: match,
                masked,
                position: offset
            });
            return masked;
        });
    }

    return { text: result, matches };
};

/**
 * Elektron pochta manzillarini yashirish
 */
const maskEmails = (text: string): { text: string; matches: PiiMatch[] } => {
    const matches: PiiMatch[] = [];
    const pattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    const result = text.replace(pattern, (match, offset) => {
        const atIndex = match.indexOf('@');
        const masked = match[0] + '***@' + match.slice(atIndex + 1);
        matches.push({
            type: 'email',
            original: match,
            masked,
            position: offset
        });
        return masked;
    });

    return { text: result, matches };
};

/**
 * Passport/ID raqamlarini yashirish
 */
const maskIdNumbers = (text: string): { text: string; matches: PiiMatch[] } => {
    const matches: PiiMatch[] = [];

    // O'zbekiston passport: AA1234567
    const passportPattern = /[A-Z]{2}\d{7}/g;

    // PINFL: 14 raqam
    const pinflPattern = /\b\d{14}\b/g;

    let result = text;

    result = result.replace(passportPattern, (match, offset) => {
        const masked = match.slice(0, 2) + '*****' + match.slice(-2);
        matches.push({
            type: 'passport',
            original: match,
            masked,
            position: offset
        });
        return masked;
    });

    result = result.replace(pinflPattern, (match, offset) => {
        const masked = match.slice(0, 4) + '******' + match.slice(-4);
        matches.push({
            type: 'pinfl',
            original: match,
            masked,
            position: offset
        });
        return masked;
    });

    return { text: result, matches };
};

/**
 * Bank karta raqamlarini yashirish
 */
const maskCardNumbers = (text: string): { text: string; matches: PiiMatch[] } => {
    const matches: PiiMatch[] = [];

    // 16 raqamli karta (Humo, Uzcard, Visa, etc.)
    const pattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;

    const result = text.replace(pattern, (match, offset) => {
        const digits = match.replace(/[\s-]/g, '');
        const masked = digits.slice(0, 4) + ' **** **** ' + digits.slice(-4);
        matches.push({
            type: 'card',
            original: match,
            masked,
            position: offset
        });
        return masked;
    });

    return { text: result, matches };
};

/**
 * Barcha shaxsiy ma'lumotlarni yashirish
 */
export const maskPii = (
    text: string,
    options: {
        maskPhone?: boolean;
        maskEmail?: boolean;
        maskId?: boolean;
        maskCard?: boolean;
        logMatches?: boolean;
    } = {
            maskPhone: true,
            maskEmail: true,
            maskId: true,
            maskCard: true,
            logMatches: true
        }
): { text: string; maskedCount: number } => {
    let result = text;
    let allMatches: PiiMatch[] = [];

    if (options.maskPhone !== false) {
        const { text: masked, matches } = maskPhoneNumbers(result);
        result = masked;
        allMatches = [...allMatches, ...matches];
    }

    if (options.maskEmail !== false) {
        const { text: masked, matches } = maskEmails(result);
        result = masked;
        allMatches = [...allMatches, ...matches];
    }

    if (options.maskId !== false) {
        const { text: masked, matches } = maskIdNumbers(result);
        result = masked;
        allMatches = [...allMatches, ...matches];
    }

    if (options.maskCard !== false) {
        const { text: masked, matches } = maskCardNumbers(result);
        result = masked;
        allMatches = [...allMatches, ...matches];
    }

    if (options.logMatches && allMatches.length > 0) {
        logger.info('PII masked', {
            count: allMatches.length,
            types: [...new Set(allMatches.map(m => m.type))]
        });
    }

    return {
        text: result,
        maskedCount: allMatches.length
    };
};

export default {
    maskPii,
    maskPhoneNumbers,
    maskEmails,
    maskIdNumbers,
    maskCardNumbers
};
