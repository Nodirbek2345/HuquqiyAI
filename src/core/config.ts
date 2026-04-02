// AdolatAI - Konfiguratsiya

const config = {
    // ====================
    // AI SOZLAMALARI
    // ====================
    ai: {
        primaryProvider: (import.meta.env.VITE_AI_PROVIDER || 'gemini') as 'gemini' | 'openai',
        // "Smart Config": Barcha ehtimoliy kalitlarni yig'ish (user adashgan bo'lsa ham ishlashi uchun)
        geminiApiKeys: [
            import.meta.env.VITE_GEMINI_API_KEY,
            import.meta.env.VITE_GEMINI_API_KEY_2,
            import.meta.env.VITE_GEMINI_API_KEY_3,
            import.meta.env.VITE_GEMINI_API_KEY_4,
            import.meta.env.VITE_GEMINI_API_KEY_5,
            // Adashib OpenAI deb yozilgan bo'lsa ham tekshirib ko'ramiz (ba'zida userlar shunday qiladi)
            import.meta.env.VITE_OPENAI_API_KEY,
            import.meta.env.VITE_OPENAI_API_KEY_2,
            import.meta.env.VITE_OPENAI_API_KEY_3,
            // Umumiy nomlar
            import.meta.env.VITE_AI_KEY,
            import.meta.env.VITE_AI_API_KEY
        ].filter(key => key && !key.includes('PLACEHOLDER') && key.length > 20) as string[], // Kalit uzunligi tekshiruvi (Gemini odatda uzun)
        openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
        maxTokens: 4096,
        temperature: 0.7
    },

    // ====================
    // API SOZLAMALARI
    // ====================
    api: {
        baseUrl: import.meta.env.VITE_API_URL || '',
        timeout: 30000
    },

    // ====================
    // APP SOZLAMALARI
    // ====================
    app: {
        name: 'AdolatAI',
        version: '2.0.0',
        debug: import.meta.env.DEV
    }
};

// API kalitlari mavjudligini tekshirish
export const hasGeminiKey = () => {
    return config.ai.geminiApiKeys.length > 0;
};

export const hasOpenAIKey = () => {
    const key = config.ai.openaiApiKey;
    return key && !key.includes('PLACEHOLDER') && key.length > 10;
};

export const hasAnyAIProvider = () => hasGeminiKey() || hasOpenAIKey();

export default config;
