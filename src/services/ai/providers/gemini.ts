
import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import { AnalysisResult, AnalysisMode, AIProvider, ChatSession } from "../../../types";
import logger from "../../../core/logger";

const getAnalysisSchema = (mode: AnalysisMode) => {
    const baseProperties: any = {
        documentType: { type: Type.STRING, description: "Hujjat turi, masalan: Mehnat shartnomasi, Ijara shartnomasi, Oldi-sotdi shartnomasi va h.k." },
        summary: { type: Type.STRING, description: "Hujjatning umumiy tahlil xulosasi. Kamida 2-3 gapda yozing. Asosiy xavflar, ijobiy va salbiy tomonlarni qisqacha tushuntiring." },
        riskScore: { type: Type.INTEGER, description: "Umumiy xavf balli 0 dan 100 gacha. 0 = xavfsiz, 100 = juda xavfli" },
        overallRisk: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "SAFE"] },
        metrics: {
            type: Type.OBJECT,
            properties: {
                compliance: { type: Type.NUMBER, description: "Qonunchilikka muvofiqlik darajasi 0-100" },
                readability: { type: Type.NUMBER, description: "O'qilish qulayligi darajasi 0-100" },
                clarity: { type: Type.NUMBER, description: "Aniqlik darajasi 0-100" },
                protection: { type: Type.NUMBER, description: "Tomonlar himoyasi darajasi 0-100" },
                financialRisk: { type: Type.NUMBER, description: "Moliyaviy xavf darajasi 0-100" }
            },
            required: ["compliance", "readability", "clarity", "protection", "financialRisk"]
        },
        notaryAdvice: { type: Type.ARRAY, items: { type: Type.STRING, description: "Notarial maslahat — har biri kamida 1 gapdan iborat bo'lsin" } },
        issues: {
            type: Type.ARRAY,
            description: "Hujjatda topilgan barcha muammo va xavflar ro'yxati. Har bir muammo uchun BATAFSIL yozing.",
            items: {
                type: Type.OBJECT,
                properties: {
                    clauseText: { type: Type.STRING, description: "Hujjatdagi muammoli band matni — aynan hujjatdan ko'chirib yozing" },
                    riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "SAFE"] },
                    explanation: { type: Type.STRING, description: "Muammoning BATAFSIL tushuntirishi. Kamida 2-3 gapda yozing. Nima uchun bu xavfli ekanligini, qanday zarar yetkazishi mumkinligini tushuntiring. Hech qachon '...' yoki qisqa javob yozmang!" },
                    potentialConsequences: { type: Type.ARRAY, items: { type: Type.STRING, description: "Bu muammo sababli yuzaga kelishi mumkin bo'lgan ANIQ oqibatlar. Masalan: sud jarayoni, moliyaviy zarar, huquqiy javobgarlik. Kamida 1-2 gap yozing." } },
                    recommendation: { type: Type.STRING, description: "Muammoni bartaraf etish uchun ANIQ tavsiya. Qanday so'z yoki band qo'shish/o'zgartirish kerakligini yozing. Kamida 1-2 gap." },
                    improvedText: { type: Type.STRING, description: "Hujjatning ushbu bandining TO'G'RILANGAN, xavfsiz va qonuniy varianti. To'liq matn sifatida yozing." },
                    legalBasis: {
                        type: Type.OBJECT,
                        properties: {
                            codeName: { type: Type.STRING, description: "Qonun nomi, masalan: Fuqarolik kodeksi, Mehnat kodeksi" },
                            articleNumber: { type: Type.STRING, description: "Modda raqami, masalan: 354-modda" },
                            comment: { type: Type.STRING, description: "Qonun moddasi haqida qisqa izoh" },
                            lexUrl: { type: Type.STRING, description: "Lex.uz saytidagi havola (ixtiyoriy)" }
                        }
                    }
                },
                required: ["clauseText", "riskLevel", "explanation", "potentialConsequences", "recommendation", "improvedText"]
            }
        },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING, description: "Umumiy tavsiya — har biri kamida 1 to'liq gapdan iborat bo'lsin" } }
    };

    if (mode === 'kazus') {
        baseProperties.logicalChain = { type: Type.ARRAY, items: { type: Type.STRING } };
        baseProperties.alternativeSolutions = { type: Type.ARRAY, items: { type: Type.STRING } };
    }

    if (mode === 'rejected') {
        baseProperties.justificationReason = { type: Type.STRING };
        baseProperties.fixInstructions = { type: Type.ARRAY, items: { type: Type.STRING } };
    }

    if (mode === 'template') {
        baseProperties.generatedTemplate = {
            type: Type.OBJECT,
            properties: {
                header: { type: Type.STRING },
                title: { type: Type.STRING },
                body: { type: Type.STRING },
                footer: { type: Type.STRING }
            },
            required: ["header", "title", "body", "footer"]
        };
    }

    return {
        type: Type.OBJECT,
        properties: baseProperties,
        required: ["documentType", "summary", "riskScore", "overallRisk", "issues", "recommendations", "metrics"]
    };
};

export class GeminiProvider implements AIProvider {
    name = 'gemini';
    private apiKeys: string[];

    constructor() {
        this.apiKeys = [
            import.meta.env.VITE_GEMINI_API_KEY,
            import.meta.env.VITE_GEMINI_API_KEY_2,
            import.meta.env.VITE_GEMINI_API_KEY_3,
            import.meta.env.VITE_GEMINI_API_KEY_4,
            import.meta.env.VITE_GEMINI_API_KEY_5,
        ].filter(key => key && key.length > 10) as string[];

        if (this.apiKeys.length === 0) {
            logger.warn("Gemini API kalitlari topilmadi!");
        } else {
            logger.info(`Gemini: ${this.apiKeys.length} ta API kalit topildi`);
        }
    }

    private getClient(apiKey: string) {
        return new GoogleGenAI({ apiKey });
    }

    async analyzeDocument(text: string, mode: AnalysisMode = 'quick'): Promise<AnalysisResult> {
        if (this.apiKeys.length === 0) throw new Error("Gemini API kalitlari topilmadi");

        logger.info(`Analyzing with Gemini (Mode: ${mode}, Keys: ${this.apiKeys.length})`);

        let systemInstruction = `Siz O'zbekiston Respublikasining Fuqarolik, Mehnat, Uy-joy kodekslari va boshqa normativ-huquqiy hujjatlari bo'yicha professional yurist-ekspertsiz. 
        Hozirgi vaqtda AdolatAI platformasi tarkibida ishlaysiz. `;

        switch (mode) {
            case 'kazus':
                systemInstruction += "Berilgan huquqiy holatni (kazusni) mantiqiy tahlil qiling, O'zbekiston qonunchiligiga tayangan holda qonuniy yechim va mantiqiy zanjirni ko'rsating.";
                break;
            case 'rejected':
                systemInstruction += "Hujjat nima sababdan davlat organlari yoki banklar tomonidan rad etilganini tahlil qiling va uni tuzatish uchun qonuniy asoslangan aniq ko'rsatmalar bering.";
                break;
            case 'template':
                systemInstruction += "Foydalanuvchi so'rovi asosida O'zbekiston qonunlariga 100% mos keladigan professional shartnoma yoki huquqiy hujjat shablonini yarating.";
                break;
            default:
                systemInstruction += "Hujjatdagi yashirin xavflarni, korrupsion faktorlarni, noaniqliklarni va qonunchilikka zid joylarni aniqlang. Har bir muammo uchun hujjat bandini qanday qilib tuzatish kerakligini (improvedText) ko'rsating.";
        }

        systemInstruction += ` 
        MUHIM QOIDALAR:
        1. Javobni faqat JSON formatida, O'zbek tilida qaytaring.
        2. Har bir maydon uchun BATAFSIL yozing — kamida 2-3 gap.
        3. Hech qachon "..." yoki bo'sh qoldirmang. Har bir maydon to'liq bo'lishi SHART.
        4. 'explanation' maydoni kamida 2 gapdan iborat bo'lsin — muammoni tushuntiring.
        5. 'consequence' maydoni — aniq oqibatlarni yozing.
        6. 'recommendation' maydoni — aniq tavsiya bering.
        7. 'improvedText' maydoni — hujjat bandining to'g'rilangan versiyasini to'liq yozing.`;

        let lastError: any = null;

        for (const apiKey of this.apiKeys) {
            try {
                logger.info(`Gemini: Kalit ${apiKey.slice(0, 8)}... bilan urinilmoqda`);
                const ai = this.getClient(apiKey);

                const response = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: [{ role: 'user', parts: [{ text: text.slice(0, 30000) }] }],
                    config: {
                        systemInstruction: { parts: [{ text: systemInstruction }] },
                        responseMimeType: "application/json",
                        responseSchema: getAnalysisSchema(mode) as any,
                        temperature: 0.2
                    },
                });

                const responseText = response.text;
                const data = JSON.parse(responseText || "{}");

                logger.info(`Gemini: Muvaffaqiyatli! (Kalit: ${apiKey.slice(0, 8)}...)`);

                return {
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    analysisLevel: "AI",
                    confidenceReason: "Gemini AI Analysis",
                    ...data
                };
            } catch (error: any) {
                logger.warn(`Gemini kalit ${apiKey.slice(0, 8)}... ishlamadi: ${error.message}`);
                lastError = error;
                // Keyingi kalitga o'tish
                continue;
            }
        }

        logger.error("Gemini: Barcha kalitlar ishlamadi", lastError);
        throw lastError || new Error("Gemini: Barcha API kalitlar ishlamadi");
    }

    async createChat(context: string): Promise<ChatSession> {
        if (this.apiKeys.length === 0) throw new Error("Gemini API kalitlari topilmadi");

        // Chat uchun birinchi ishlaydigan kalitni topish
        let workingChat: any = null;
        let lastError: any = null;

        for (const apiKey of this.apiKeys) {
            try {
                const ai = this.getClient(apiKey);
                workingChat = ai.chats.create({
                    model: "gemini-2.0-flash",
                    config: {
                        systemInstruction: {
                            parts: [{
                                text: `Siz AdolatAI professional yuridik yordamchisiz. O'zbekiston qonunchiligi bo'yicha mukammal bilimga egasiz. 
                Quyidagi hujjat matni bo'yicha foydalanuvchining har qanday savoliga aniq, qonuniy asoslangan va tushunarli tilda javob bering. 
                Hujjat matni: ${context.slice(0, 15000)}`
                            }]
                        }
                    }
                });
                logger.info(`Gemini Chat: Kalit ${apiKey.slice(0, 8)}... bilan yaratildi`);
                break;
            } catch (e: any) {
                logger.warn(`Gemini Chat kalit ${apiKey.slice(0, 8)}... ishlamadi: ${e.message}`);
                lastError = e;
                continue;
            }
        }

        if (!workingChat) {
            throw lastError || new Error("Gemini Chat: Barcha kalitlar ishlamadi");
        }

        const chat = workingChat;

        return {
            sendMessageStream: async function* (message: string) {
                try {
                    // @ts-ignore - Bypass type check for message string
                    const result = await chat.sendMessageStream(message);
                    for await (const chunk of result) {
                        const chunkText = chunk.text;
                        if (chunkText) {
                            yield { text: chunkText };
                        }
                    }
                } catch (e: any) {
                    logger.error("Gemini Chat Error:", e);
                    yield { text: "Kechirasiz, xatolik: " + e.message, isError: true };
                }
            }
        };
    }
}
