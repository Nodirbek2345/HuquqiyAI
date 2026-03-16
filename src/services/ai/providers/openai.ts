import OpenAI from "openai"
import { ChatSession, AnalysisMode, RiskLevel } from "../../../types"

// Lazy initialization to prevent app crash if env vars are missing
let openaiInstance: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (openaiInstance) return openaiInstance;

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    openaiInstance = new OpenAI({
        apiKey: apiKey || "dummy-key-to-prevent-crash",
        baseURL: "https://api.groq.com/openai/v1",
        dangerouslyAllowBrowser: true
    });

    return openaiInstance;
}

// New getOpenAIClient for analysis, allowing specific key to be passed
const getOpenAIClientWithKey = (key: string) => {
    return new OpenAI({
        apiKey: key,
        baseURL: "https://api.groq.com/openai/v1",
        dangerouslyAllowBrowser: true
    });
};

export async function callOpenAI(text: string, mode: AnalysisMode): Promise<string> {
    const keys = [
        import.meta.env.VITE_OPENAI_API_KEY,
        import.meta.env.VITE_OPENAI_API_KEY_2,
        import.meta.env.VITE_OPENAI_API_KEY_3
    ].filter(Boolean); // Filter out any undefined/null keys

    if (keys.length === 0) throw new Error("OpenAI API kalitlari topilmadi");

    let lastError: any = null;

    for (const key of keys) {
        try {
            console.log(`DEBUG: Trying OpenAI with key: ${key.slice(0, 8)}...`);
            const prompt = buildPrompt(text, mode);
            // Agar key gsk_ bilan boshlansa bu Groq kaliti
            const isGroq = key.startsWith('gsk_');
            const client = getOpenAIClientWithKey(key);

            const response = await client.chat.completions.create({
                model: isGroq ? "llama-3.3-70b-versatile" : "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Siz ADOLATAI Core AI tizimisiz — 50 kishilik yuridik, audit va compliance jamoasi nomidan fikr yurituvchi professional sun'iy intellektsiz. Faqat hujjatda BOR narsani aytasiz. Hech qachon uydirma yozmaysiz. FAQAT JSON formatda javob berasiz." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.1, // Updated temperature
            });

            const content = response.choices[0]?.message?.content;
            if (content) return content;
            throw new Error("OpenAI javobi bo'sh");
        } catch (e: any) {
            console.warn(`OpenAI Key (${key.slice(0, 8)}...) failed:`, e.message);
            lastError = e;
            // Continue to the next key if it's an invalid key or quota issue
            if (e.status === 401 || e.status === 429) {
                continue;
            }
            // For other errors, we might still want to try the next key,
            // but if it's a fundamental issue with the request, it might fail for all.
            // For now, we continue to try all keys.
        }
    }

    // If the loop finishes, all keys have failed
    throw lastError || new Error("Barcha OpenAI kalitlari ishlamadi");
}

// CHAT SESSION IMPLEMENTATION
export async function createOpenAIChat(context: string): Promise<ChatSession> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    const messages: any[] = [
        { role: "system", content: "Siz professional yurist maslahatchisiz. Foydalanuvchi sizga hujjat matnini yubordi. Ushbu hujjat asosida uning savollariga aniq, lo'nda va huquqiy asoslangan (O'zbekiston qonunchiligi bo'yicia) javob berishingiz kerak.\n\nFoydalanuvchi taqdim etgan hujjat:\n" + context.slice(0, 15000) }
    ];

    return {
        async *sendMessageStream(userMsg: string) {
            if (!apiKey) {
                yield { text: "API Kalit topilmadi (OpenAI).", isError: true };
                return;
            }

            messages.push({ role: "user", content: userMsg });
            const client = getOpenAIClient();

            try {
                const isGroq = apiKey.startsWith('gsk_');
                // getOpenAIClient() allaqachon baseURL ni to'g'ri o'rnatgan
                const stream = await client.chat.completions.create({
                    model: isGroq ? "llama-3.3-70b-versatile" : "gpt-4o-mini",
                    messages: messages,
                    stream: true,
                });

                let fullResponse = "";

                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        fullResponse += content;
                        yield { text: content };
                    }
                }

                messages.push({ role: "assistant", content: fullResponse });

            } catch (e) {
                console.error("Chat Stream Error:", e);
                yield { text: "", isError: true };
            }
        }
    };
}

function buildPrompt(text: string, mode: AnalysisMode) {
    let role = "";
    let goal = "";
    let specificFields = "";

    switch (mode) {
        case 'kazus':
            role = "Siz O'zbekiston Oliy Sudining Katta Sudyasi va 50 nafar tajribali yuristdan iborat Ekspertlar Kengashisiz.";
            goal = "Berilgan vaziyatni (kazusni) chuqur tahlil qiling. Mantiqiy zanjir va aniq huquqiy yechim bering.";
            specificFields = `"logicalChain": ["Fakt 1", "Norma 1", "Xulosa 1"], "alternativeSolutions": ["Yechim A", "Yechim B"], "detailedConclusion": "Yakuniy sud qarori formati"`;
            break;

        case 'rejected':
            role = "Siz Davlat Xizmatlari Agentligining 'Rad Etish Sabablarini Tahlil Qilish' bo'limi boshlig'isiz.";
            goal = "Hujjat nima uchun rad etilganini aniqlang. Sababini oddiy va lo'nda tushuntiring. Xatoni to'g'irlash uchun aniq instruktsiya bering.";
            specificFields = `"rejectionProbability": "YUQORI", "fixInstructions": ["1-qadam...", "2-qadam..."], "justificationReason": "Rad etishning huquqiy asosi"`;
            break;

        case 'template':
            role = "Siz O'zbekiston Adliya Vazirligining 'Davlat Andozalari va Standartlari' departamentisiz.";
            goal = "Foydalanuvchi so'rovi asosida MUKAMMAL, yuridik jihatdan 100% to'g'ri hujjat shablonini yarating.";
            specificFields = `"generatedTemplate": { "header": "...", "title": "...", "body": "...", "footer": "..." }`;
            break;

        case 'audit':
            role = "Siz 'Katta To'rtlik' (Big 4) darajasidagi auditor va compliance ofitserisiz.";
            goal = "Hujjatni har bir harfigacha tekshiring. Xavflarni toping va ularni bartaraf etish yo'llarini ko'rsating.";
            specificFields = `"riskScore": 85, "notaryConsiderations": ["..."]`;
            break;

        default: // 'quick'
            role = "Siz 20 yillik tajribaga ega advokatsiz.";
            goal = "Hujjatni tezkor ko'rib chiqib, asosiy xavflarni ayting.";
            specificFields = `"summary": "Qisqa xulosa"`;
    }

    return `
SYSTEM ROLE: ${role}
TASK: ${goal}

QOIDALAR:
1.  Faqat O'zbekiston Respublikasi qonunchiligiga asoslaning.
2.  Javobingiz aniq, lo'nda va professional bo'lsin.
3.  Mantiqiy izchillik (Logical Rigor) juda muhim.
4.  **YASHIRIN XAVFLARNI QIDIRING**:
    - Ikki xil talqin qilinishi mumkin bo'lgan so'zlar.
    - Hujjatda yozilmagan, lekin bo'lishi shart bo'lgan himoya bandlari.
    - Tomonlarning tengsizligi.
5.  **HAR BIR XATO UCHUN BATAFSIL MA'LUMOT BERING**:
    - "potentialConsequences": Shu xato tufayli kelajakda qanday huquqiy va moliyaviy muammolar (sud, jarima) kelib chiqishini aniq sanab o'ting (kamida 2 ta).
    - "improvedText": Xatoli band o'rniga qanday huquqiy to'g'ri va xavfsiz matn yozilishi kerakligini NAMUNA sifatida to'liq yozib bering.
6.  Javob faqat quyidagi JSON formatida bo'lishi SHART. Ortib ketgan gap yozmang.

REQUIRED JSON STRUCTURE:
{
  "documentType": "Hujjat turi",
  "riskScore": 0-100,
  "riskLevel": "LOW | MEDIUM | HIGH",
  "summary": "Umumiy xulosa",
  "logicalChain": ["Mantiqiy qadam 1 (Fakt)", "Mantiqiy qadam 2 (Norma)", "Mantiqiy qadam 3 (Xulosa)"],
  "issues": [
    {
      "title": "Muammo nomi",
      "clauseText": "Hujjatdagi joyi",
      "explanation": "Batafsil tushuntirish",
      "riskLevel": "LOW | MEDIUM | HIGH",
      "recommendation": "Tavsiya",
      "potentialConsequences": ["Oqibat 1 (masalan: Jarima xavfi)", "Oqibat 2 (masalan: Sudda yutqazish)"],
      "improvedText": "Ushbu bandning yuridik jihatdan to'liq va xavfsiz yozilgan namunasi",
      "legalBasis": { "codeName": "Kodeks/Qonun nomi", "articleNumber": "Modda raqami", "comment": "Qisqacha sharh" }
    }
  ],
  "recommendations": ["Umumiy tavsiya 1", "Umumiy tavsiya 2"],
  ${specificFields}
}

ANALYSIS TEXT:
"""
${text}
"""
`;
}
