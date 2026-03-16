// AdolatAI - Hujjat tahlili asosiy funksiyasi

import { AnalysisResult, AnalysisMode, RiskLevel, Issue } from '../../types';
import { detectRisks } from './detectRisks';
import { calculateScore } from './scoreCalculator';
import { applyRules } from './rules';
import { generateId } from '../../utils/helpers';
import logger from '../../core/logger';

interface AnalyzeOptions {
    mode: AnalysisMode;
    includeRecommendations?: boolean;
    includeLegalBasis?: boolean;
}

/**
 * Hujjatni tahlil qilish
 * Bu funksiya AI javobini qayta ishlaydi va strukturalashtirilgan natija qaytaradi
 */
export const analyzeDocument = async (
    text: string,
    aiResponse: Partial<AnalysisResult>,
    options: AnalyzeOptions
): Promise<AnalysisResult> => {
    logger.info('Document analysis started', { mode: options.mode });

    try {
        // 1. Risks aniqlash
        const risks = detectRisks(text, aiResponse.issues || []);

        // 2. Ball hisoblash
        const score = calculateScore(risks.issues, options.mode);

        // 3. Qoidalarni qo'llash
        const rulesResult = applyRules(text, options.mode);

        // 4. Natijani shakllantirish
        const result: AnalysisResult = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            documentType: aiResponse.documentType || 'Noma\'lum',
            summary: aiResponse.summary || '',
            overallRisk: score.overallRisk,
            riskScore: score.riskScore,
            topRisks: risks.topRisks,
            issues: risks.issues,
            recommendations: aiResponse.recommendations || [],
            notaryConsiderations: aiResponse.notaryConsiderations || [],
            missingInformation: aiResponse.missingInformation || [],
            totalIssuesCount: risks.issues.length,
            analysisConfidence: aiResponse.analysisConfidence || 'O\'rta',
            confidenceReason: aiResponse.confidenceReason || '',

            // Kengaytirilgan maydonlar
            isJustified: aiResponse.isJustified,
            justificationReason: aiResponse.justificationReason,
            rejectionProbability: aiResponse.rejectionProbability,
            alternativeSolutions: aiResponse.alternativeSolutions,
            logicalChain: aiResponse.logicalChain,
            detailedConclusion: aiResponse.detailedConclusion,
            fixInstructions: aiResponse.fixInstructions,
            riskDistribution: score.riskDistribution,
            potentialScenarios: aiResponse.potentialScenarios,
            generatedTemplate: aiResponse.generatedTemplate
        };

        logger.info('Document analysis completed', {
            id: result.id,
            riskScore: result.riskScore,
            issuesCount: result.totalIssuesCount
        });

        return result;
    } catch (error) {
        logger.error('Document analysis failed', { error });
        throw error;
    }
};

/**
 * Hujjat turini aniqlash
 */
export const detectDocumentType = (text: string): string => {
    const lowerText = text.toLowerCase();

    const typePatterns: [string, RegExp[]][] = [
        ['Shartnoma', [/shartnoma/i, /contract/i, /kelishuv/i]],
        ['Ariza', [/ariza/i, /murojaat/i, /so\'rov/i]],
        ['Da\'vo', [/da\'vo/i, /ish bo\'yicha/i, /sud/i]],
        ['Qaror', [/qaror/i, /buyruq/i, /farmon/i]],
        ['Ishonchnoma', [/ishonchnoma/i, /vakolatnoma/i]],
        ['Akt', [/akt/i, /protokol/i, /dalolatnoma/i]],
        ['Bayonnoma', [/bayonnoma/i, /tushuntirish/i]]
    ];

    for (const [type, patterns] of typePatterns) {
        if (patterns.some(p => p.test(lowerText))) {
            return type;
        }
    }

    return 'Boshqa hujjat';
};

/**
 * Hujjat tilini aniqlash
 */
export const detectLanguage = (text: string): 'uz' | 'ru' | 'en' | 'mixed' => {
    const uzChars = text.match(/[ўқғҳ]/gi)?.length || 0;
    const ruChars = text.match(/[ёэъы]/gi)?.length || 0;
    const enChars = text.match(/[a-zA-Z]/g)?.length || 0;

    const total = uzChars + ruChars + enChars;
    if (total === 0) return 'uz';

    const uzRatio = uzChars / total;
    const ruRatio = ruChars / total;
    const enRatio = enChars / total;

    if (uzRatio > 0.1) return 'uz';
    if (ruRatio > enRatio) return 'ru';
    if (enRatio > 0.7) return 'en';

    return 'mixed';
};

export default analyzeDocument;
