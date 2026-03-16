// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AdolatAI Backend — Groq Provider
// Multi-Key + Llama 3.3 Fallback
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const GROQ_MODELS = [
    'llama-3.3-70b-versatile',
    'mixtral-8x7b-32768'
];

function getGroqKeys(): string[] {
    const keys: string[] = [];

    // Dynamically find all GROQ keys
    Object.keys(process.env).forEach(key => {
        if (key.startsWith('GROQ_API_KEY') || key.startsWith('VITE_GROQ_API_KEY')) {
            const val = process.env[key];
            if (val && val.length > 20) keys.push(val);
        }
    });

    return [...new Set(keys)];
}

export async function analyzeWithGroq(text: string, systemPrompt: string) {
    const keys = getGroqKeys();
    if (keys.length === 0) throw new Error('GROQ_API_KEY not found');

    let lastError: any = null;

    for (const key of keys) {
        for (const model of GROQ_MODELS) {
            try {
                console.log(`[Backend] Groq [${model}] key:${key.slice(0, 8)}...`);

                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${key}`,
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { role: 'system', content: systemPrompt || 'You are a legal document analyzer. Return JSON only.' },
                            { role: 'user', content: text },
                        ],
                        response_format: { type: 'json_object' },
                        temperature: 0.2,
                    }),
                });

                // Quota exceeded — try next key
                if (response.status === 429) {
                    console.warn(`[Backend] Groq [${model}] 429 Quota. Trying next...`);
                    break; // Next key
                }

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.error?.message || `Groq ${response.status}`);
                }

                const data = await response.json();
                const content = data.choices[0]?.message?.content || '{}';
                console.log(`[Backend] ✅ Groq [${model}] Success`);
                return JSON.parse(content);

            } catch (e: any) {
                console.warn(`[Backend] Groq [${model}] Error:`, e.message);
                lastError = e;
                continue;
            }
        }
    }

    throw lastError || new Error('Barcha Groq kalitlari va modellari ishlamadi');
}

export async function chatWithGroq(messages: any[]) {
    const keys = getGroqKeys();
    if (keys.length === 0) throw new Error('GROQ_API_KEY not found');

    let lastError: any = null;

    for (const key of keys) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: messages,
                    temperature: 0.7,
                }),
            });

            if (response.status === 429) {
                console.warn(`[Backend] Groq Chat 429. Trying next key...`);
                continue;
            }

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error?.message || `Groq Chat ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (e: any) {
            console.warn('[Backend] Groq Chat Error:', e.message);
            lastError = e;
        }
    }

    throw lastError || new Error('Groq Chat: barcha kalitlar ishlamadi');
}
