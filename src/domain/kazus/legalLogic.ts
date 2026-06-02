// AdolatAI - Yuridik mantiq moduli

import logger from '../../core/logger';

interface LogicalStep {
    step: number;
    premise: string;
    conclusion: string;
    legalBasis?: string;
}

interface LogicalChainResult {
    steps: LogicalStep[];
    finalConclusion: string;
    confidence: 'high' | 'medium' | 'low';
}

/**
 * Yuridik mantiqiy zanjir qurish
 */
export const buildLogicalChain = (
    facts: string[],
    legalIssues: string[],
    applicableLaws: string[]
): LogicalChainResult => {
    logger.info('Building logical chain', {
        factsCount: facts.length,
        issuesCount: legalIssues.length
    });

    const steps: LogicalStep[] = [];
    let stepNumber = 1;

    // Bosqich 1: Faktlarni aniqlash
    steps.push({
        step: stepNumber++,
        premise: 'Taqdim etilgan faktlar va dalillar',
        conclusion: facts.length > 0
            ? `Jami ${facts.length} ta muhim fakt aniqlandi`
            : 'Faktlar tahlil qilindi',
        legalBasis: 'Fuqarolik protsessual kodeksi, 56-modda (dalillar)'
    });

    // Bosqich 2: Huquqiy masalani aniqlash
    if (legalIssues.length > 0) {
        steps.push({
            step: stepNumber++,
            premise: 'Huquqiy masalani aniqlash',
            conclusion: `Asosiy masala: ${legalIssues[0]}`,
            legalBasis: 'Sudlov amaliyoti'
        });
    }

    // Bosqich 3: Tegishli qonunlarni qo'llash
    if (applicableLaws.length > 0) {
        steps.push({
            step: stepNumber++,
            premise: `Qo'llaniladigan qonunchilik: ${applicableLaws.join(', ')}`,
            conclusion: 'Huquqiy normalar vaziyatga tatbiq etildi',
            legalBasis: applicableLaws[0]
        });
    }

    // Bosqich 4: Xulosalar
    steps.push({
        step: stepNumber++,
        premise: 'Faktlar va qonunlarni taqqoslash',
        conclusion: 'Yakuniy xulosaga kelinmoqda',
        legalBasis: 'Mantiqiy xulosalash'
    });

    // Confidence ni aniqlash
    const confidence = determineConfidence(facts, legalIssues, applicableLaws);

    const finalConclusion = generateFinalConclusion(steps, confidence);

    return {
        steps,
        finalConclusion,
        confidence
    };
};

/**
 * Ishonchlilik darajasini aniqlash
 */
const determineConfidence = (
    facts: string[],
    legalIssues: string[],
    laws: string[]
): 'high' | 'medium' | 'low' => {
    const score = facts.length + legalIssues.length * 2 + laws.length * 3;

    if (score >= 8) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
};

/**
 * Yakuniy xulosani shakllantirish
 */
const generateFinalConclusion = (
    steps: LogicalStep[],
    confidence: 'high' | 'medium' | 'low'
): string => {
    const confidenceText = {
        high: 'yuqori ishonchlilik bilan',
        medium: 'o\'rtacha ishonchlilik bilan',
        low: 'qo\'shimcha tekshiruv talab etilishi bilan'
    };

    return `Tahlil ${steps.length} bosqichda o'tkazildi. ${confidenceText[confidence]} xulosa chiqarildi.`;
};

/**
 * Sillogizm qurish (klassik yuridik mantiq)
 * 
 * Struktura:
 * - Katta premisa: Umumiy qonun/qoida
 * - Kichik premisa: Aniq holat
 * - Xulosa: Natija
 */
export const buildSyllogism = (
    majorPremise: string,  // Qonun normasi
    minorPremise: string,  // Aniq holat
): { conclusion: string; isValid: boolean } => {
    // Sodda sillogizm validatsiyasi
    const isValid = majorPremise.length > 10 && minorPremise.length > 10;

    const conclusion = isValid
        ? `Berilgan normalar (${majorPremise.slice(0, 30)}...) va faktlar (${minorPremise.slice(0, 30)}...) asosida tegishli huquqiy oqibatlar kelib chiqadi.`
        : 'Xulosa chiqarish uchun ma\'lumot yetarli emas.';

    return { conclusion, isValid };
};

/**
 * Analogiya usuli
 */
export const applyAnalogy = (
    currentCase: string,
    similarCases: string[]
): { applicable: boolean; explanation: string } => {
    if (similarCases.length === 0) {
        return {
            applicable: false,
            explanation: 'O\'xshash sudlov amaliyoti topilmadi'
        };
    }

    return {
        applicable: true,
        explanation: `${similarCases.length} ta o'xshash ish topildi. Sudlov amaliyotidan analogiya qo'llanilishi mumkin.`
    };
};

export default {
    buildLogicalChain,
    buildSyllogism,
    applyAnalogy
};
