// AdolatAI - Xavf balli hisoblash moduli

import { Issue, RiskLevel, AnalysisMode } from '../../types';
import { RISK_THRESHOLDS } from '../../core/constants';

interface ScoreResult {
    riskScore: number;
    overallRisk: RiskLevel;
    riskDistribution: string;
}

/**
 * Xavf ballini hisoblash
 */
export const calculateScore = (
    issues: Issue[],
    mode: AnalysisMode
): ScoreResult => {
    if (issues.length === 0) {
        return {
            riskScore: 0,
            overallRisk: RiskLevel.SAFE,
            riskDistribution: 'Hech qanday xavf aniqlanmadi'
        };
    }

    // Xavf darajasi bo'yicha og'irliklar
    const weights: Record<RiskLevel, number> = {
        [RiskLevel.HIGH]: 30,
        [RiskLevel.MEDIUM]: 15,
        [RiskLevel.LOW]: 5,
        [RiskLevel.SAFE]: 0
    };

    // Mode bo'yicha koeffitsient
    const modeMultiplier: Record<AnalysisMode, number> = {
        quick: 1.0,
        professional: 1.2,
        simple: 0.8,
        kazus: 1.1,
        rejected: 1.3,
        template: 0.5
    };

    // Ballni hisoblash
    let totalScore = 0;
    const distribution: Record<RiskLevel, number> = {
        [RiskLevel.HIGH]: 0,
        [RiskLevel.MEDIUM]: 0,
        [RiskLevel.LOW]: 0,
        [RiskLevel.SAFE]: 0
    };

    for (const issue of issues) {
        totalScore += weights[issue.riskLevel];
        distribution[issue.riskLevel]++;
    }

    // Mode koeffitsientini qo'llash
    totalScore = Math.round(totalScore * (modeMultiplier[mode] || 1));

    // 100 dan oshmasligi kerak
    const normalizedScore = Math.min(100, totalScore);

    // Umumiy xavf darajasini aniqlash
    const overallRisk = determineOverallRisk(normalizedScore, distribution);

    // Taqsimot izohi
    const riskDistribution = formatDistribution(distribution, issues.length);

    return {
        riskScore: normalizedScore,
        overallRisk,
        riskDistribution
    };
};

/**
 * Umumiy xavf darajasini aniqlash
 */
const determineOverallRisk = (
    score: number,
    distribution: Record<RiskLevel, number>
): RiskLevel => {
    // Agar bitta ham yuqori xavf bo'lsa
    if (distribution[RiskLevel.HIGH] >= 1) {
        return RiskLevel.HIGH;
    }

    // Ball bo'yicha
    if (score >= RISK_THRESHOLDS.HIGH.min) {
        return RiskLevel.HIGH;
    }

    if (score >= RISK_THRESHOLDS.MEDIUM.min) {
        return RiskLevel.MEDIUM;
    }

    if (score > 0) {
        return RiskLevel.LOW;
    }

    return RiskLevel.SAFE;
};

/**
 * Taqsimot izohini shakllantirish
 */
const formatDistribution = (
    distribution: Record<RiskLevel, number>,
    total: number
): string => {
    const parts: string[] = [];

    if (distribution[RiskLevel.HIGH] > 0) {
        parts.push(`${distribution[RiskLevel.HIGH]} ta yuqori xavf`);
    }

    if (distribution[RiskLevel.MEDIUM] > 0) {
        parts.push(`${distribution[RiskLevel.MEDIUM]} ta o'rta xavf`);
    }

    if (distribution[RiskLevel.LOW] > 0) {
        parts.push(`${distribution[RiskLevel.LOW]} ta past xavf`);
    }

    if (parts.length === 0) {
        return 'Xavf aniqlanmadi';
    }

    return `Jami ${total} ta muammo: ${parts.join(', ')}`;
};

/**
 * Xavf ballini foizga aylantirish
 */
export const scoreToPercentage = (score: number): string => {
    return `${Math.round(score)}%`;
};

/**
 * Ballni yulduzlarga aylantirish (5 lik shkala)
 */
export const scoreToStars = (score: number): number => {
    if (score >= 80) return 1;
    if (score >= 60) return 2;
    if (score >= 40) return 3;
    if (score >= 20) return 4;
    return 5;
};

export default calculateScore;
