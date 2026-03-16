// AdolatAI - Moslik tekshiruvi moduli

import logger from '../../core/logger';

interface ComplianceCheck {
    requirement: string;
    status: 'passed' | 'failed' | 'warning';
    details: string;
}

interface ComplianceResult {
    checks: ComplianceCheck[];
    overallStatus: 'compliant' | 'non-compliant' | 'partial';
    passedCount: number;
    failedCount: number;
    suggestions: string[];
}

/**
 * Hujjat mosligini tekshirish
 */
export const checkCompliance = (
    text: string,
    documentType?: string
): ComplianceResult => {
    logger.info('Checking document compliance', { documentType });

    const checks: ComplianceCheck[] = [];
    const lower = text.toLowerCase();

    // ============================
    // UMUMIY TALABLAR
    // ============================

    // 1. Rekvizitlar
    checks.push({
        requirement: 'Hujjat rekvizitlari',
        status: hasRequisites(lower) ? 'passed' : 'failed',
        details: hasRequisites(lower)
            ? 'Asosiy rekvizitlar mavjud'
            : 'Ba\'zi rekvizitlar yetishmaydi'
    });

    // 2. Imzo
    checks.push({
        requirement: 'Imzo mavjudligi',
        status: lower.includes('imzo') || lower.includes('m.o') ? 'passed' : 'warning',
        details: lower.includes('imzo')
            ? 'Imzo joyi ko\'rsatilgan'
            : 'Imzo joyi aniqlanmadi'
    });

    // 3. Sana
    const hasDate = /\d{1,2}[\.\-\/]\d{1,2}[\.\-\/]\d{2,4}/.test(text);
    checks.push({
        requirement: 'Sana ko\'rsatilganligi',
        status: hasDate ? 'passed' : 'failed',
        details: hasDate
            ? 'Sana mavjud'
            : 'Sana ko\'rsatilmagan'
    });

    // 4. Muhr (rasmiy hujjatlar uchun)
    checks.push({
        requirement: 'Muhr mavjudligi',
        status: lower.includes('muhr') || lower.includes('m.o') ? 'passed' : 'warning',
        details: lower.includes('muhr')
            ? 'Muhr joyi ko\'rsatilgan'
            : 'Muhr joyi aniqlanmadi (rasmiy hujjatlar uchun zarur)'
    });

    // 5. O'zbek tili
    const isUzbek = /[ўқғҳ]/i.test(text) || lower.includes("o'z") || lower.includes("o'z");
    checks.push({
        requirement: 'O\'zbek tilida tuzilganligi',
        status: isUzbek ? 'passed' : 'warning',
        details: isUzbek
            ? 'O\'zbek tilida yozilgan'
            : 'Til aniqlanmadi, tarjima kerak bo\'lishi mumkin'
    });

    // ============================
    // STATISTIKA
    // ============================

    const passedCount = checks.filter(c => c.status === 'passed').length;
    const failedCount = checks.filter(c => c.status === 'failed').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;

    // Umumiy holat
    let overallStatus: 'compliant' | 'non-compliant' | 'partial';
    if (failedCount === 0 && warningCount === 0) {
        overallStatus = 'compliant';
    } else if (failedCount >= 2) {
        overallStatus = 'non-compliant';
    } else {
        overallStatus = 'partial';
    }

    // Tavsiyalar
    const suggestions = generateSuggestions(checks);

    return {
        checks,
        overallStatus,
        passedCount,
        failedCount,
        suggestions
    };
};

/**
 * Rekvizitlar mavjudligini tekshirish
 */
const hasRequisites = (text: string): boolean => {
    const requisites = [
        text.includes('manzil') || text.includes('address'),
        text.includes('telefon') || text.includes('tel'),
        /\d{9}/.test(text), // INN yoki telefon
        text.includes('bank') || text.includes('hisob')
    ];

    return requisites.filter(Boolean).length >= 2;
};

/**
 * Tavsiyalar yaratish
 */
const generateSuggestions = (checks: ComplianceCheck[]): string[] => {
    const suggestions: string[] = [];

    for (const check of checks) {
        if (check.status === 'failed') {
            suggestions.push(`❌ ${check.requirement}: ${check.details}`);
        } else if (check.status === 'warning') {
            suggestions.push(`⚠️ ${check.requirement}: ${check.details}`);
        }
    }

    if (suggestions.length === 0) {
        suggestions.push('✅ Hujjat barcha asosiy talablarga javob beradi');
    }

    return suggestions;
};

export default checkCompliance;
