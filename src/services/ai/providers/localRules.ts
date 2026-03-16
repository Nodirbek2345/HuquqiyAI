// AdolatAI - Mahalliy qoidalar asosidagi AI provayderi

import { AIProvider, AnalysisResult, AnalysisMode, ChatSession, RiskLevel } from '../../../types';
import { applyRules } from '../../../domain/document/rules';
import { detectRisks } from '../../../domain/document/detectRisks';
import { calculateScore } from '../../../domain/document/scoreCalculator';
import logger from '../../../core/logger';

export class LocalRulesProvider implements AIProvider {
    name = 'local-rules';

    async analyzeDocument(text: string, mode: AnalysisMode): Promise<AnalysisResult> {
        logger.info('Using Local Rules Provider');

        const lowerText = text.toLowerCase();
        let docType = 'Hujjat';
        if (lowerText.includes('shartnoma')) docType = 'Shartnoma';
        else if (lowerText.includes('ariza')) docType = 'Ariza';
        else if (lowerText.includes('buyruq')) docType = 'Buyruq';
        else if (lowerText.includes('bildirgi')) docType = 'Bildirgi';

        // 1. Qoidalarni tekshirish
        const rulesResult = applyRules(text, mode);

        // 2. Risklarni aniqlash
        const risks = detectRisks(text, []);

        // 3. Ball hisoblash
        const score = calculateScore(risks.issues, mode);

        // 4. Natijani shakllantirish

        // 5. Mantiqiy zanjir va xulosalarni shakllantirish
        const logicalChain: string[] = [
            "1. Hujjat matni leksik tahlil qilindi",
            `2. Hujjat turi "${docType}" deb aniqlandi`,
            "3. Asosiy yuridik rekvizitlar tekshirildi",
            ...rulesResult.checks.map(c => `${c.passed ? '✅' : '❌'} ${c.message}`)
        ];

        let detailedConclusion = `Huquqiy tahlil natijasiga ko'ra, kiritilgan ${docType} amaldagi ish yuritish standartlariga asosan ${score.riskScore}% xavfsiz deb topildi.`;
        if (mode === 'kazus') {
            detailedConclusion = "Ushbu vaziyat (kazus) bo'yicha huquqiy tahlil o'tkazildi. Tizim faktlar va huquqiy asoslarni tekshirdi.";
            if (rulesResult.failedCount > 0) {
                detailedConclusion += " Biroq, to'liq huquqiy baho berish uchun ba'zi ma'lumotlar yetishmayapti.";
            } else {
                detailedConclusion += " Vaziyat bo'yicha birlamchi huquqiy mantiq to'g'ri shakllantirilgan.";
            }
        }

        const alternativeSolutions: string[] = [];
        if (score.riskScore < 50) {
            alternativeSolutions.push("Hujjatni malakali yurist ko'rigidan o'tkazing");
            alternativeSolutions.push("Yetishmayotgan rekvizitlarni to'ldiring");
        }
        if (mode === 'kazus') {
            alternativeSolutions.push("Sud amaliyotini o'rganib chiqing");
            alternativeSolutions.push("Mediatsiya tartibida hal qilishni ko'rib chiqing");
        }

        const result: AnalysisResult = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            documentType: docType,
            analysisLevel: "LOCAL",
            summary: `Ushbu ${docType} matni tizim qoidalari asosida tekshirildi. ${rulesResult.failedCount} ta kamchilik aniqlandi.`,
            overallRisk: score.overallRisk,
            riskScore: score.riskScore,
            topRisks: risks.topRisks,
            issues: risks.issues,
            recommendations: [
                "Hujjatning barcha rekvizitlari mavjudligini qayta tekshiring",
                "Tomonlarning javobgarligi va muddatlariga alohida e'tibor bering",
                ...rulesResult.checks.filter(c => !c.passed).map(c => c.suggestion || c.message)
            ],
            notaryConsiderations: ["Notarial tasdiqlash talab qilinishi mumkin (hujjat turiga qarab)"],
            missingInformation: rulesResult.checks.filter(c => !c.passed).map(c => c.message),
            totalIssuesCount: risks.issues.length,
            analysisConfidence: 'Medium',
            confidenceReason: 'Offline: Qoidalar asosida tahlil',
            detailedConclusion: detailedConclusion,
            logicalChain: logicalChain,
            alternativeSolutions: alternativeSolutions,
            legalCompliance: {
                checkedDocs: ["O'zR Fuqarolik Kodeksi", "Ish yuritish standartlari"],
                complianceStatus: score.riskScore > 50 ? "Muvofiq" : "Qisman muvofiq",
                complianceReason: "Standart talablar va qoidalar tekshirildi"
            },
            riskDistribution: score.riskDistribution
        };

        return result;
    }

    async createChat(context: string): Promise<ChatSession> {
        // Mahalliy chat imkoniyati cheklangan
        return {
            sendMessageStream: async function* (message: string) {
                yield { text: "Kechirasiz, men hozir faqat offline rejimdaman va savollarga javob bera olmayman. Faqat hujjatni tahlil qila olaman." };
            }
        };
    }
}
