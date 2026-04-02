// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AdolatAI Frontend — AI Service
// FAQAT BACKEND ORQALI ishlaydi
// API kalitlar frontendda ISHLATILMAYDI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { AnalysisResult, ChatSession, AnalysisMode } from "../../types"
import { LocalRulesProvider } from "./providers/localRules";
import { GeminiProvider } from "./providers/gemini";
import { callOpenAI } from "./providers/openai";

const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_URL = isProd ? 'https://huquqiyai-1.onrender.com' : (import.meta.env.VITE_API_URL || '');

// ━━━━━━━━━━━━━━━━━━━━━━
// ADOLATAI CORE AI ARCHITECTURE
// ━━━━━━━━━━━━━━━━━━━━━━
// Frontend → Backend API → OpenAI/Gemini/Fallback
// API kalitlar FAQAT backendda saqlanadi

export async function analyzeDocument(
    text: string,
    mode: AnalysisMode
): Promise<AnalysisResult> {
    console.log("[AdolatAI] ━━━ Analysis Started ━━━", { mode, textLength: text.length });

    try {
        console.log("[AdolatAI] Sending to Backend API...");
        const response = await fetch(`${API_URL}/api/analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, mode }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const message = errorData?.data?.message || errorData?.message || `Backend xatolik: ${response.status}`;
            throw new Error(message);
        }

        const result = await response.json();
        // TransformInterceptor wraps in { success, data }
        const data = result.data || result;

        // Normalize for frontend
        const parsed = normalizeResult(data);
        console.log(`[AdolatAI] ━━━ Analysis Complete ━━━ Issues: ${parsed.totalIssuesCount}, Risk: ${parsed.riskScore}`);
        return parsed;

    } catch (e: any) {
        console.error("[AdolatAI] ❌ Backend failed:", e.message);

        // Maxsus xatolarni tekshirish (faqat 429 limiti)
        if (e.message?.includes('429') || e.message?.includes('Quota') || e.message?.includes('quota')) {
            throw new Error("AI Xizmatlari Limiti Tugadi: Iltimos, 1 daqiqa kuting yoki hisobingizni tekshiring.");
        }

        // Backend ishlamasa (fetch error), mahalliy tahlilga o'tish
        console.warn("[AdolatAI] ⚠️ Backend ishlamayapti. Muqobil (Gemini/Groq/Local) variantlar ishga tushirildi.");

        // Admin sozlamalarini yuklash (agar imkon bo'lsa)
        let providerSettings = { geminiEnabled: true, groqEnabled: true, openaiEnabled: false };
        try {
            const { getSystemSettings } = await import('../adminApi');
            providerSettings = await getSystemSettings();
            console.log("[AdolatAI] 📋 Admin sozlamalari yuklandi:", providerSettings);
        } catch {
            console.warn("[AdolatAI] ⚠️ Admin sozlamalarini yuklab bo'lmadi, barcha provayderlar ishlatiladi.");
        }

        // 1. Gemini orqali urinib ko'rish (FAQAT yoqilgan bo'lsa)
        if (providerSettings.geminiEnabled !== false) {
            try {
                console.log("[AdolatAI] 🔄 Gemini orqali tahlil qilinmoqda...");
                const geminiProvider = new GeminiProvider();
                const geminiResult = await geminiProvider.analyzeDocument(text, mode);
                return geminiResult;
            } catch (geminiError: any) {
                console.error("[AdolatAI] ❌ Gemini ham ishlamadi:", geminiError.message);
            }
        } else {
            console.log("[AdolatAI] ⏭️ Gemini o'chirilgan (admin sozlamalari)");
        }

        // 2. Groq/OpenAI orqali urinib ko'rish (FAQAT yoqilgan bo'lsa)
        if (providerSettings.groqEnabled !== false || providerSettings.openaiEnabled !== false) {
            try {
                console.log("[AdolatAI] 🔄 Groq/OpenAI orqali tahlil qilinmoqda...");
                const rawJson = await callOpenAI(text, mode);
                const parsed = JSON.parse(rawJson);
                const normalized = normalizeResult(parsed);
                normalized.analysisLevel = "AI";
                normalized.confidenceReason = "Groq/OpenAI orqali tahlil qilindi";
                console.log(`[AdolatAI] ✅ Groq/OpenAI muvaffaqiyatli! Issues: ${normalized.totalIssuesCount}`);
                return normalized;
            } catch (groqError: any) {
                console.error("[AdolatAI] ❌ Groq/OpenAI ham ishlamadi:", groqError.message);
            }
        } else {
            console.log("[AdolatAI] ⏭️ Groq/OpenAI o'chirilgan (admin sozlamalari)");
        }

        // 3. Local fallback (agar hammasi ishlamasa)
        try {
            console.log("[AdolatAI] 🔄 Mahalliy qoidalar orqali tahlil qilinmoqda...");
            const localProvider = new LocalRulesProvider();
            const localResult = await localProvider.analyzeDocument(text, mode);

            // Mahalliy ekanligini bildirish uchun
            localResult.analysisLevel = "LOCAL";
            localResult.confidenceReason = "Backend serverga ulanib bo'lmadi (Offline Mode)";

            return localResult;
        } catch (localError: any) {
            console.error("[AdolatAI] ❌ Local analysis failed:", localError);
            throw new Error("Tizimda jiddiy xatolik: Backend ham, mahalliy tahlil ham ishlamadi.");
        }
    }
}

function normalizeResult(data: any): AnalysisResult {
    const issues = (data.issues || []).map((issue: any) => ({
        title: issue.title || issue.description || "Noma'lum muammo",
        clauseText: issue.band || issue.clauseText || issue.document_part || "Aniqlanmadi",
        explanation: issue.detailedDescription || issue.explanation || issue.description || issue.legal_risk || "Izoh yo'q",
        riskLevel: (issue.risk || issue.riskLevel || issue.severity || "MEDIUM").toUpperCase(),
        recommendation: issue.recommendation || "Tavsiya yo'q",
        consequence: issue.consequence || issue.potentialConsequences?.[0] || "",
        improvedText: issue.improvedText || "",
        legalBasis: {
            codeName: issue.legalImpact || issue.legalBasis?.codeName || "Qonunchilik",
            articleNumber: issue.legalBasis?.articleNumber || "",
            comment: issue.legalBasis?.comment || ""
        },
        potentialConsequences: issue.potentialConsequences || []
    }));

    return {
        id: data.id || crypto.randomUUID(),
        timestamp: data.timestamp || new Date().toISOString(),
        documentType: data.documentType || data.document_type?.value || "Noma'lum hujjat",
        analysisLevel: data.analysis_mode === 'fallback' ? "LOCAL" : "AI",
        riskScore: data.riskScore || data.risk_score?.score || 0,
        overallRisk: data.riskLevel || data.overallRisk || data.risk_score?.level || "MEDIUM",
        summary: data.summary?.text || data.summary || "Xulosa yo'q",
        issues: issues,
        recommendations: data.recommendations || [],
        logicalChain: data.logicalChain,
        alternativeSolutions: data.alternativeSolutions,
        detailedConclusion: data.detailedConclusion,
        fixInstructions: data.fixInstructions,
        potentialScenarios: data.potentialScenarios,
        riskDistribution: data.riskDistribution,
        analysisConfidence: data.analysisConfidence || data.technical_notes?.confidence_level || "high",
        confidenceReason: data.confidenceReason || data.analysis_mode || "Backend orqali tahlil qilindi",
        rejectionProbability: data.rejectionProbability,
        generatedTemplate: data.generatedTemplate,
        missingInformation: data.missingInformation,
        notaryConsiderations: data.notaryConsiderations,
        totalIssuesCount: issues.length
    };
}

// Chat Functionality — Backend API orqali (Fallback: Gemini)
export async function createDocumentChat(context: string): Promise<ChatSession> {
    let geminiSession: ChatSession | null = null;

    return {
        async *sendMessageStream(message: string) {
            try {
                const response = await fetch(`${API_URL}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, context: context.slice(0, 15000) }),
                });

                if (!response.ok) {
                    throw new Error(`Backend xatolik: ${response.status}`);
                }

                const result = await response.json();
                const data = result.data || result;
                yield { text: data.response || "Javob yo'q" };

            } catch (e: any) {
                console.error("[AdolatAI] Backend Chat Error:", e.message);
                console.warn("[AdolatAI] ⚠️ Backend Chat ishlamadi. Gemini orqali urinib ko'ramiz...");

                try {
                    if (!geminiSession) {
                        const geminiProvider = new GeminiProvider();
                        geminiSession = await geminiProvider.createChat(context);
                    }

                    const stream = geminiSession.sendMessageStream(message);
                    for await (const chunk of stream) {
                        yield chunk;
                    }

                } catch (geminiError: any) {
                    console.error("[AdolatAI] ❌ Gemini Chat ham ishlamadi:", geminiError);
                    yield { text: "Tizimda xatolik: Backend va AI xizmatlari ishlamayapti.", isError: true };
                }
            }
        }
    };
}
