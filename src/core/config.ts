// AdolatAI - Konfiguratsiya

const config = {
    // ====================
    // AI SOZLAMALARI
    // ====================
    ai: {
        primaryProvider: (import.meta.env.VITE_AI_PROVIDER || 'gemini') as 'gemini' | 'openai',
        // "Smart Config": Barcha ehtimoliy kalitlarni yig'ish (user adashgan bo'lsa ham ishlashi uchun)
        geminiApiKeys: [] as string[],
        openaiApiKey: '',
        maxTokens: 4096,
        temperature: 0.7
    },

    // ====================
    // API SOZLAMALARI
    // ====================
    api: {
        // Asosiy backend ulanishi (agar env bo'lmasa, to'g'ri Render manzilidan oladi)
        baseUrl: import.meta.env.VITE_API_URL || 'https://huquqiyai.onrender.com',
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
