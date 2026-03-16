// AdolatAI - Risk aniqlash moduli

import { Issue, TopRisk, RiskLevel } from '../../types';
import logger from '../../core/logger';

interface RiskDetectionResult {
    issues: Issue[];
    topRisks: TopRisk[];
}

/**
 * Risklarni aniqlash va tahlil qilish
 */
export const detectRisks = (
    text: string,
    aiIssues: Issue[]
): RiskDetectionResult => {
    logger.debug('Detecting risks', { issuesCount: aiIssues.length });

    // AI tomonidan aniqlangan muammolarni validatsiya qilish
    const validatedIssues = validateIssues(aiIssues);

    // Qo'shimcha xavflarni aniqlash
    const additionalRisks = detectAdditionalRisks(text);

    // Barcha xavflarni birlashtirish
    const allIssues = [...validatedIssues, ...additionalRisks];

    // Top xavflarni ajratib olish
    const topRisks = extractTopRisks(allIssues);

    return {
        issues: allIssues,
        topRisks
    };
};

/**
 * AI dan kelgan muammolarni tekshirish
 */
const validateIssues = (issues: Issue[]): Issue[] => {
    return issues.filter(issue => {
        // Bo'sh muammolarni filtrlash
        if (!issue.clauseText || !issue.explanation) {
            logger.warn('Invalid issue filtered', { issue });
            return false;
        }
        return true;
    }).map(issue => ({
        ...issue,
        riskLevel: issue.riskLevel || RiskLevel.MEDIUM
    }));
};

/**
 * Matnda qo'shimcha xavflarni aniqlash (AI dan tashqari)
 */
const detectAdditionalRisks = (text: string): Issue[] => {
    const additionalIssues: Issue[] = [];
    const lowerText = text.toLowerCase();

    // 1. Muddatsiz shartnomalar
    if (lowerText.includes('muddatsiz') || lowerText.includes('cheksiz')) {
        additionalIssues.push({
            title: 'Shartnoma muddati belgilanmagan',
            clauseText: 'Muddatsiz/cheksiz',
            detailedDescription: 'Hujjatda amal qilish muddati aniq ko\'rsatilmagan. Bu kelajakda tomonlar o\'rtasida tushunmovchiliklarga sabab bo\'lishi mumkin.',
            riskLevel: RiskLevel.MEDIUM,
            potentialConsequences: [
                'Shartnomani bekor qilish qiyinlashishi',
                'Majburiyatlar muddati bo\'yicha nizolar',
                'Moliyaviy rejalashtirishdagi qiyinchiliklar'
            ],
            recommendation: 'Aniq boshlanish va tugash sanasini belgilang'
        });
    }

    // 2. Bir tomonlama bekor qilish
    if (lowerText.includes('bir tomonlama bekor')) {
        additionalIssues.push({
            title: 'Bir tomonlama bekor qilish xavfi',
            clauseText: 'Bir tomonlama bekor qilish',
            detailedDescription: 'Shartnoma bir tomonning xohishi bilan bekor qilinishi mumkinligi belgilangan. Bu ikkinchi tomon uchun xavf tug\'diradi.',
            riskLevel: RiskLevel.HIGH,
            potentialConsequences: [
                'Kutilmagan moliyaviy yo\'qotishlar',
                'Loyihaning to\'xtab qolishi',
                'Barqarorlikning yo\'qolishi'
            ],
            recommendation: 'Bekor qilish shartlarini va kompensatsiyani aniq belgilang'
        });
    }

    // 3. Javobgarlik chegarasi yo'q
    if (!lowerText.includes('javobgarlik') && text.length > 500) {
        additionalIssues.push({
            title: 'Tomonlarning javobgarligi belgilanmagan',
            clauseText: 'Javobgarlik bo\'limi yo\'q',
            detailedDescription: 'Tomonlardan biri majburiyatni buzsa, qanday javobgarlik (jarima, penya) qo\'llanilishi aniq emas. Bu intizomni pasaytiradi.',
            riskLevel: RiskLevel.MEDIUM,
            potentialConsequences: [
                'Zararni qoplash qiyinligi',
                'Majburiyatlarning bajarilmasligi',
                'Sud jarayonining murakkablashuvi'
            ],
            recommendation: 'Javobgarlik (jarima, penya) bo\'limini alohida qo\'shing'
        });
    }

    // 4. Force-majeure yo'q
    if (!lowerText.includes('fors-major') && !lowerText.includes('force majeure')) {
        additionalIssues.push({
            title: 'Favqulodda holatlar (Fors-major) belgilanmagan',
            clauseText: 'Fors-major holatlari ko\'rsatilmagan',
            detailedDescription: 'Tabiiy ofatlar yoki boshqa kutilmagan vaziyatlarda tomonlarning harakatlari tartibga solinmagan.',
            riskLevel: RiskLevel.LOW,
            potentialConsequences: [
                'Majburiyatni bajarmaslik uchun asossiz bahonalar',
                'Kutilmagan vaziyatlarda huquqiy himoyasizlik'
            ],
            recommendation: 'Fors-major holatlari ro\'yxatini kiriting'
        });
    }

    return additionalIssues;
};

/**
 * Eng muhim xavflarni ajratish
 */
const extractTopRisks = (issues: Issue[]): TopRisk[] => {
    // Yuqori va o'rta xavflarni ajratish
    const importantIssues = issues
        .filter(i => i.riskLevel === RiskLevel.HIGH || i.riskLevel === RiskLevel.MEDIUM)
        .sort((a, b) => {
            const priority = { [RiskLevel.HIGH]: 3, [RiskLevel.MEDIUM]: 2, [RiskLevel.LOW]: 1, [RiskLevel.SAFE]: 0 };
            return priority[b.riskLevel] - priority[a.riskLevel];
        })
        .slice(0, 3);

    return importantIssues.map(issue => ({
        description: issue.title || issue.clauseText,
        whyImportant: issue.detailedDescription || 'Xavfli bo\'lishi mumkin'
    }));
};

/**
 * Xavf darajasini matndan aniqlash
 */
export const determineRiskLevel = (text: string): RiskLevel => {
    const lowerText = text.toLowerCase();

    const highRiskKeywords = ['jazo', 'jarima', 'bekor qilish', 'yo\'qotish', 'javobgarlik'];
    const mediumRiskKeywords = ['o\'zgartirish', 'qo\'shimcha', 'shart'];

    if (highRiskKeywords.some(kw => lowerText.includes(kw))) {
        return RiskLevel.HIGH;
    }

    if (mediumRiskKeywords.some(kw => lowerText.includes(kw))) {
        return RiskLevel.MEDIUM;
    }

    return RiskLevel.LOW;
};

export default detectRisks;
