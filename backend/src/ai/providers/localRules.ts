import { AnalysisMode } from '../prompt-registry';

export function fallbackAnalyze(text: string, mode: AnalysisMode = 'quick') {
    console.log("[Backend] Using Regex-based Local Analysis");

    const upperText = text.toUpperCase();
    let docType = "Hujjat";
    let summaryText = "AI xizmatlari band. Tizim matnni kalit so'zlar asosida tahlil qildi.";

    // 1. Detect Type
    if (upperText.includes("SHARTNOMA")) docType = "Shartnoma";
    else if (upperText.includes("ARIZA")) docType = "Ariza";
    else if (upperText.includes("BILDIRGI")) docType = "Bildirgi";
    else if (upperText.includes("BUYRUQ")) docType = "Buyruq";

    // 2. Scan for specific issues (Regex)
    const issues = [];

    // Check for missing date
    if (!upperText.match(/\d{2}[\.\/]\d{2}[\.\/]\d{4}/)) {
        issues.push({
            title: "Sana ko'rsatilmagan",
            clauseText: "Hujjat sanasi",
            explanation: "Hujjatda aniq sana aniqlanmadi. Yuridik kuchga ega bo'lish uchun sana muhim.",
            riskLevel: "MEDIUM",
            recommendation: "Hujjat sanasini (kun.oy.yil) aniq yozing.",
            legalBasis: { codeName: "Ish yuritish", articleNumber: "-", comment: "Rekvizitlar talabi" }
        });
    }

    // Check for "Summa" or digits in Contract
    if (docType === "Shartnoma" && !upperText.includes("SO'M") && !upperText.match(/\d{3,}/)) {
        issues.push({
            title: "Shartnoma summasi aniqlanmadi",
            clauseText: "To'lov qismi",
            explanation: "Shartnomada aniq summa yoki baho ko'rsatilmagan bo'lishi mumkin.",
            riskLevel: "HIGH",
            recommendation: "Shartnoma narxini aniq raqam va so'z bilan yozing.",
            legalBasis: { codeName: "Fuqarolik Kodeksi", articleNumber: "356", comment: "Baho sharti" }
        });
    }

    // Check for "Imzo" place
    if (!upperText.includes("IMZO") && !upperText.includes("DIREKTOR") && !upperText.includes("RAHBAR")) {
        issues.push({
            title: "Imzo o'rni yoki Mas'ul shaxs yo'q",
            clauseText: "Rekvizitlar",
            explanation: "Hujjat oxirida imzo qo'yuvchi shaxs lavozimi va F.I.O. ko'rinmadi.",
            riskLevel: "MEDIUM",
            recommendation: "Imzo qismini qo'shing.",
            legalBasis: null
        });
    }

    // If no issues found by regex
    if (issues.length === 0) {
        summaryText = `Ushbu ${docType} "Regex" tekshiruvidan o'tdi. Jiddiy kamchiliklar matn yuzasidan aniqlanmadi (AI chuqur tahlili emas).`;
    } else {
        summaryText = `Ushbu ${docType}da ${issues.length} ta texnik kamchilik aniqlandi (mahalliy tekshiruv).`;
    }

    return {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        documentType: docType,
        summary: summaryText,
        riskScore: issues.length * 20, // Simple math
        overallRisk: issues.length > 2 ? "HIGH" : issues.length > 0 ? "MEDIUM" : "LOW",
        issues: issues,
        recommendations: [
            "Hujjatni to'liq rekvizitlar bilan to'ldiring",
            "AI to'liq ishlaganda qayta tekshiring"
        ],
        analysisConfidence: "low",
        confidenceReason: "AI tarmoq xatosi tufayli Regex-asosli tahlil ishlatildi",
        technical_notes: {
            used_provider: "fallback_regex",
            text_length: text.length
        }
    };
}
