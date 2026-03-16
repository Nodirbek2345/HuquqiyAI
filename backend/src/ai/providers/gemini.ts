// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AdolatAI Backend — Gemini Provider
// Uses @google/generative-ai (AI Studio Standard SDK)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { GoogleGenerativeAI } from '@google/generative-ai';

// Modellar ketma-ketligi muhim: tezroq va zamonaviylari birinchi
const GEMINI_MODELS = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-001',
    'gemini-1.5-flash-002',
    'gemini-1.5-pro',
    'gemini-1.5-pro-001',
    'gemini-pro',
    'gemini-1.0-pro',
];

function getGeminiKeys(): string[] {
    const keys: string[] = [];

    // Dynamically find all GEMINI keys
    Object.keys(process.env).forEach(key => {
        if (key.startsWith('GEMINI_API_KEY') || key.startsWith('VITE_GEMINI_API_KEY')) {
            const val = process.env[key];
            if (val && val.length > 20) keys.push(val);
        }
    });

    return [...new Set(keys)];
}

function extractText(response: any): string {
    if (typeof response.text === 'function') return response.text();
    if (response.response?.text) return response.response.text();
    if (response.candidates?.[0]?.content?.parts?.[0]?.text) return response.candidates[0].content.parts[0].text;
    return '';
}

export async function analyzeWithGemini(text: string, systemPrompt: string) {
    const keys = getGeminiKeys();
    if (keys.length === 0) throw new Error('GEMINI_API_KEY not found');

    console.log(`[Backend] Gemini (Studio SDK): ${keys.length} kalit topildi`);

    let lastError: any = null;

    // Strategiya: Har bir model uchun barcha kalitlarni sinab ko'rish
    for (const model of GEMINI_MODELS) {
        for (const key of keys) {
            try {
                console.log(`[Backend] Gemini [${model}] key:${key.slice(0, 10)}... (SDK: @google/generative-ai)`);
                const genAI = new GoogleGenerativeAI(key);
                const modelInstance = genAI.getGenerativeModel({ model: model });

                const result = await modelInstance.generateContent([
                    systemPrompt,
                    "\n\nDOC_TEXT:\n" + text
                ]);

                const response = result.response;
                const content = response.text();

                if (!content) throw new Error(`Gemini [${model}] empty response`);

                const jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();
                console.log(`[Backend] ✅ Gemini [${model}] SUCCESS`);
                return JSON.parse(jsonString);

            } catch (e: any) {
                const errMsg = typeof e.message === 'string' ? e.message.substring(0, 200) : String(e);
                console.warn(`[Backend] ❌ Gemini [${model}] key:${key.slice(0, 10)}: ${errMsg}`);
                lastError = e;

                // 404 Model Not Found
                if (e.message?.includes('404') || e.message?.includes('not found')) {
                    break; // Bu model uchun boshqa kalitlarni sinash foydasiz, keyingi modelga o't
                }

                // 429 Quota
                if (e.status === 429 || e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED')) {
                    continue; // Keyingi kalit bilan shu modelni sinab ko'rsat
                }

                continue;
            }
        }
    }

    throw lastError || new Error('Barcha Gemini kalitlari va modellari ishlamadi (SDK: @google/generative-ai)');
}

export async function chatWithGemini(messages: any[]) {
    const keys = getGeminiKeys();
    if (keys.length === 0) throw new Error('GEMINI_API_KEY not found');

    let lastError: any = null;
    const chatModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];

    for (const model of chatModels) {
        for (const key of keys) {
            try {
                const genAI = new GoogleGenerativeAI(key);
                const modelInstance = genAI.getGenerativeModel({ model: model });

                const lastMessage = messages[messages.length - 1].content;
                const history = messages.slice(0, -1).map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }]
                }));

                const chat = modelInstance.startChat({
                    history: history,
                    generationConfig: {
                        maxOutputTokens: 2000,
                    },
                });

                const result = await chat.sendMessage(lastMessage);
                const response = result.response;
                const content = response.text();

                if (content) {
                    console.log(`[Backend] ✅ Gemini Chat [${model}] SUCCESS`);
                    return content;
                }
                throw new Error('Gemini Chat empty response');

            } catch (e: any) {
                console.warn(`[Backend] ❌ Gemini Chat [${model}]:`, e.message?.substring(0, 150));
                lastError = e;
                if (e.message?.includes('404') || e.message?.includes('not found')) break;
                continue;
            }
        }
    }

    throw lastError || new Error('Gemini Chat: barcha kalitlar ishlamadi');
}
