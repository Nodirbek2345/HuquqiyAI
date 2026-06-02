// AdolatAI - Tuzatish tavsiyalari moduli

import logger from '../../core/logger';

interface FixInstruction {
    step: number;
    action: string;
    priority: 'high' | 'medium' | 'low';
    timeEstimate: string;
    legalBasis?: string;
}

interface FixRecommendation {
    title: string;
    instructions: FixInstruction[];
    successProbability: number;
    warnings: string[];
}

/**
 * Tuzatish yo'riqnomasini yaratish
 */
export const generateFixRecommendations = (
    reasons: Array<{ category: string; description: string; severity: string; fixable: boolean }>,
    documentType?: string
): FixRecommendation => {
    logger.info('Generating fix recommendations', { reasonsCount: reasons.length });

    const instructions: FixInstruction[] = [];
    const warnings: string[] = [];
    let stepNumber = 1;

    // Har bir sabab uchun tuzatish
    for (const reason of reasons) {
        if (!reason.fixable) {
            warnings.push(`⚠️ "${reason.description}" - Bu muammo hal qilinmasligi mumkin`);
            continue;
        }

        const fix = getFixForReason(reason.category, reason.description, stepNumber);
        if (fix) {
            instructions.push(fix);
            stepNumber++;
        }
    }

    // Umumiy tavsiyalar
    if (instructions.length === 0) {
        instructions.push({
            step: 1,
            action: 'Hujjatni mas\'ul xodimga ko\'rsating va aniq talablarni oydinlashtiring',
            priority: 'high',
            timeEstimate: '1-2 kun'
        });
    }

    // Qayta topshirish tavsiyasi
    instructions.push({
        step: stepNumber,
        action: 'Barcha tuzatishlarni tekshirib, hujjatni qayta topshiring',
        priority: 'high',
        timeEstimate: '1 kun'
    });

    // Muvaffaqiyat ehtimoli
    const successProbability = calculateSuccessProbability(reasons, instructions);

    return {
        title: 'Hujjatni qayta topshirish yo\'riqnomasi',
        instructions,
        successProbability,
        warnings
    };
};

/**
 * Sabab uchun tuzatish olish
 */
const getFixForReason = (
    category: string,
    description: string,
    step: number
): FixInstruction | null => {
    const fixes: Record<string, FixInstruction> = {
        'Shakl xatosi': {
            step,
            action: `${description} - Hujjatni belgilangan shaklda qayta rasmiylashtiring`,
            priority: 'high',
            timeEstimate: '1 kun',
            legalBasis: 'Ma\'muriy tartib-qoidalar to\'g\'risidagi qonun'
        },
        'Mazmun xatosi': {
            step,
            action: `${description} - To'g'ri ma'lumotlarni yig'ib, hujjatni qayta tayyorlang`,
            priority: 'high',
            timeEstimate: '2-3 kun',
            legalBasis: 'Fuqarolik kodeksi'
        },
        'Muddat muammosi': {
            step,
            action: 'Muddatni uzaytirish uchun alohida ariza yozing (imkoniyat bo\'lsa)',
            priority: 'high',
            timeEstimate: '1 hafta',
            legalBasis: 'Protsessual kodeks, muddat tiklash'
        },
        'Vakolat muammosi': {
            step,
            action: 'Tegishli vakolat beruvchi hujjat (ishonchnoma) oling',
            priority: 'high',
            timeEstimate: '1-3 kun',
            legalBasis: 'Fuqarolik kodeksi, 134-modda'
        },
        'Hujjat yetishmasligi': {
            step,
            action: 'Talab qilingan qo\'shimcha hujjatlarni to\'plang va biriktiring',
            priority: 'medium',
            timeEstimate: '3-5 kun'
        }
    };

    return fixes[category] || {
        step,
        action: `${description} - Muammoni bartaraf eting`,
        priority: 'medium',
        timeEstimate: '2-3 kun'
    };
};

/**
 * Muvaffaqiyat ehtimolini hisoblash
 */
const calculateSuccessProbability = (
    reasons: Array<{ fixable: boolean; severity: string }>,
    instructions: FixInstruction[]
): number => {
    const unfixableCount = reasons.filter(r => !r.fixable).length;
    const criticalCount = reasons.filter(r => r.severity === 'critical' && r.fixable).length;

    if (unfixableCount > 0) {
        return Math.max(10, 40 - unfixableCount * 20);
    }

    if (criticalCount >= 2) {
        return 60;
    }

    if (criticalCount === 1) {
        return 75;
    }

    return 90;
};

/**
 * Checklist formatida tuzatishlar
 */
export const formatAsChecklist = (instructions: FixInstruction[]): string[] => {
    return instructions.map(inst =>
        `☐ ${inst.step}. ${inst.action} (${inst.timeEstimate})`
    );
};

export default {
    generateFixRecommendations,
    formatAsChecklist
};
