// AdolatAI - Rad sababini aniqlash moduli

import { RiskLevel } from '../../types';
import logger from '../../core/logger';

interface RejectionReason {
    category: string;
    description: string;
    severity: 'critical' | 'major' | 'minor';
    fixable: boolean;
}

interface RejectionAnalysis {
    reasons: RejectionReason[];
    primaryReason: RejectionReason | null;
    rejectionProbability: 'PAST' | 'O\'RTA' | 'YUQORI';
}

/**
 * Rad etish sababini aniqlash
 */
export const detectRejectionReason = (
    text: string,
    aiAnalysis?: Partial<RejectionAnalysis>
): RejectionAnalysis => {
    logger.info('Detecting rejection reason');

    const reasons: RejectionReason[] = [];
    const lower = text.toLowerCase();

    // ============================
    // SHAKL XATOLARI
    // ============================

    if (lower.includes('muhr yo\'q') || lower.includes('muhrsiz')) {
        reasons.push({
            category: 'Shakl xatosi',
            description: 'Muhr mavjud emas yoki noto\'g\'ri',
            severity: 'critical',
            fixable: true
        });
    }

    if (lower.includes('imzo yo\'q') || lower.includes('imzolanmagan')) {
        reasons.push({
            category: 'Shakl xatosi',
            description: 'Imzo mavjud emas',
            severity: 'critical',
            fixable: true
        });
    }

    if (lower.includes('sana yo\'q') || lower.includes('sanasiz')) {
        reasons.push({
            category: 'Shakl xatosi',
            description: 'Sana ko\'rsatilmagan',
            severity: 'major',
            fixable: true
        });
    }

    // ============================
    // MAZMUN XATOLARI
    // ============================

    if (lower.includes('noto\'g\'ri ma\'lumot') || lower.includes('xato ma\'lumot')) {
        reasons.push({
            category: 'Mazmun xatosi',
            description: 'Noto\'g\'ri ma\'lumotlar kiritilgan',
            severity: 'major',
            fixable: true
        });
    }

    if (lower.includes('to\'liq emas') || lower.includes('yetarli emas')) {
        reasons.push({
            category: 'Mazmun xatosi',
            description: 'Hujjat to\'liq emas',
            severity: 'major',
            fixable: true
        });
    }

    // ============================
    // MUDDATLAR
    // ============================

    if (lower.includes('muddat o\'tgan') || lower.includes('kechikkan')) {
        reasons.push({
            category: 'Muddat muammosi',
            description: 'Topshirish muddati o\'tgan',
            severity: 'critical',
            fixable: false
        });
    }

    // ============================
    // VAKOLAT
    // ============================

    if (lower.includes('vakolat yo\'q') || lower.includes('huquqi yo\'q')) {
        reasons.push({
            category: 'Vakolat muammosi',
            description: 'Murojaat qilish vakolati yo\'q',
            severity: 'critical',
            fixable: false
        });
    }

    // ============================
    // HUJJATLAR YETISHMASLIGI
    // ============================

    if (lower.includes('biriktir') && lower.includes('yo\'q')) {
        reasons.push({
            category: 'Hujjat yetishmasligi',
            description: 'Zarur biriktirmalar mavjud emas',
            severity: 'major',
            fixable: true
        });
    }

    // AI tahlilidan qo'shish
    if (aiAnalysis?.reasons) {
        reasons.push(...aiAnalysis.reasons);
    }

    // Asosiy sababni aniqlash
    const primaryReason = reasons.find(r => r.severity === 'critical')
        || reasons[0]
        || null;

    // Rad ehtimolini hisoblash
    const rejectionProbability = calculateRejectionProbability(reasons);

    return {
        reasons,
        primaryReason,
        rejectionProbability
    };
};

/**
 * Rad ehtimolini hisoblash
 */
const calculateRejectionProbability = (
    reasons: RejectionReason[]
): 'PAST' | 'O\'RTA' | 'YUQORI' => {
    const criticalCount = reasons.filter(r => r.severity === 'critical').length;
    const majorCount = reasons.filter(r => r.severity === 'major').length;
    const unfixableCount = reasons.filter(r => !r.fixable).length;

    if (unfixableCount > 0 || criticalCount >= 2) {
        return 'YUQORI';
    }

    if (criticalCount >= 1 || majorCount >= 2) {
        return 'O\'RTA';
    }

    return 'PAST';
};

export default detectRejectionReason;
