// AdolatAI - Yuridik qoidalar moduli

import { AnalysisMode } from '../../types';
import logger from '../../core/logger';

interface RuleCheckResult {
    passed: boolean;
    message: string;
    suggestion?: string;
}

interface RulesResult {
    checks: RuleCheckResult[];
    passedCount: number;
    failedCount: number;
}

/**
 * Yuridik qoidalarni qo'llash
 */
export const applyRules = (
    text: string,
    mode: AnalysisMode
): RulesResult => {
    logger.debug('Applying legal rules', { mode });

    const checks: RuleCheckResult[] = [];
    const lowerText = text.toLowerCase();

    // =============================
    // SHARTNOMA QOIDALARI
    // =============================

    if (mode === 'quick' || mode === 'professional') {
        // 1. Tomonlar ko'rsatilganmi
        checks.push(checkParties(lowerText));

        // 2. Muddat belgilanganmi
        checks.push(checkDuration(lowerText));

        // 3. Narx/haq ko'rsatilganmi
        checks.push(checkPrice(lowerText));

        // 4. Imzo joyi bormi
        checks.push(checkSignature(lowerText));

        // 5. Sana ko'rsatilganmi
        checks.push(checkDate(lowerText));
    }

    // =============================
    // KAZUS QOIDALARI
    // =============================

    if (mode === 'kazus') {
        // 1. Faktlar ko'rsatilganmi
        checks.push(checkFacts(lowerText));

        // 2. Huquqiy masala aniqmi
        checks.push(checkLegalIssue(lowerText));
    }

    // =============================
    // RAD ETILGAN HUJJAT QOIDALARI
    // =============================

    if (mode === 'rejected') {
        // 1. Rad sababi ko'rsatilganmi
        checks.push(checkRejectionReason(lowerText));
    }

    const passedCount = checks.filter(c => c.passed).length;
    const failedCount = checks.filter(c => !c.passed).length;

    return {
        checks,
        passedCount,
        failedCount
    };
};

// =============================
// TEKSHIRUV FUNKSIYALARI
// =============================

const checkParties = (text: string): RuleCheckResult => {
    const hasParties =
        text.includes('tomon') ||
        text.includes('ijrochi') ||
        text.includes('buyurtmachi') ||
        text.includes('sotuvchi') ||
        text.includes('xaridor');

    return {
        passed: hasParties,
        message: hasParties
            ? 'Tomonlar ko\'rsatilgan'
            : 'Tomonlar aniq belgilanmagan',
        suggestion: hasParties
            ? undefined
            : 'Shartnoma tomonlarini aniq ko\'rsating'
    };
};

const checkDuration = (text: string): RuleCheckResult => {
    const hasDuration =
        text.includes('muddat') ||
        text.includes('dan boshlab') ||
        text.includes('gacha') ||
        /\d{1,2}\.\d{1,2}\.\d{4}/.test(text);

    return {
        passed: hasDuration,
        message: hasDuration
            ? 'Muddat belgilangan'
            : 'Shartnoma muddati ko\'rsatilmagan',
        suggestion: hasDuration
            ? undefined
            : 'Shartnoma boshlanish va tugash sanalarini belgilang'
    };
};

const checkPrice = (text: string): RuleCheckResult => {
    const hasPrice =
        text.includes('narx') ||
        text.includes('haq') ||
        text.includes('summa') ||
        text.includes('so\'m') ||
        text.includes('usd') ||
        /\d+[\s,.]?\d*\s*(so'm|sum|usd|\$)/.test(text);

    return {
        passed: hasPrice,
        message: hasPrice
            ? 'Narx/summa ko\'rsatilgan'
            : 'Moliyaviy shartlar aniq emas',
        suggestion: hasPrice
            ? undefined
            : 'To\'lov summasi va shartlarini aniq belgilang'
    };
};

const checkSignature = (text: string): RuleCheckResult => {
    const hasSignature =
        text.includes('imzo') ||
        text.includes('m.o\'') ||
        text.includes('m.o') ||
        text.includes('muhr');

    return {
        passed: hasSignature,
        message: hasSignature
            ? 'Imzo joyi mavjud'
            : 'Imzo joyi ko\'rsatilmagan',
        suggestion: hasSignature
            ? undefined
            : 'Tomonlar imzolari uchun joy qo\'shing'
    };
};

const checkDate = (text: string): RuleCheckResult => {
    const hasDate = /\d{1,2}[\.\/-]\d{1,2}[\.\/-]\d{2,4}/.test(text);

    return {
        passed: hasDate,
        message: hasDate
            ? 'Sana ko\'rsatilgan'
            : 'Hujjat sanasi ko\'rsatilmagan',
        suggestion: hasDate
            ? undefined
            : 'Hujjat tuzilgan sanani ko\'rsating'
    };
};

const checkFacts = (text: string): RuleCheckResult => {
    const hasFacts =
        text.includes('voqea') ||
        text.includes('holat') ||
        text.includes('sodir bo\'ldi') ||
        text.length > 200;

    return {
        passed: hasFacts,
        message: hasFacts
            ? 'Faktlar tavsifi mavjud'
            : 'Faktlar yetarli emas',
        suggestion: hasFacts
            ? undefined
            : 'Vaziyatni batafsil tavsiflab bering'
    };
};

const checkLegalIssue = (text: string): RuleCheckResult => {
    const hasIssue =
        text.includes('qonun') ||
        text.includes('huquq') ||
        text.includes('modda') ||
        text.includes('sud');

    return {
        passed: hasIssue,
        message: hasIssue
            ? 'Huquqiy masala aniqlangan'
            : 'Huquqiy masala aniq emas',
        suggestion: hasIssue
            ? undefined
            : 'Qaysi huquqiy masala hal qilinishi kerakligini ko\'rsating'
    };
};

const checkRejectionReason = (text: string): RuleCheckResult => {
    const hasReason =
        text.includes('rad') ||
        text.includes('qaytarildi') ||
        text.includes('sabab') ||
        text.includes('xato');

    return {
        passed: hasReason,
        message: hasReason
            ? 'Rad sababi ko\'rsatilgan'
            : 'Rad sababi aniq emas',
        suggestion: hasReason
            ? undefined
            : 'Hujjat nima uchun rad etilganini ko\'rsating'
    };
};

export default applyRules;
