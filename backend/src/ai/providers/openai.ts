// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AdolatAI Backend — OpenAI Provider
// Multi-Key + Multi-Model Fallback
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const OPENAI_MODELS = [
    'gpt-4o-mini',
    'gpt-3.5-turbo',
];

function getOpenAIKeys(): string[] {
    const keys: string[] = [];

    // Dynamically find all OPENAI keys
    Object.keys(process.env).forEach(key => {
        if (key.startsWith('OPENAI_API_KEY') || key.startsWith('VITE_OPENAI_API_KEY')) {
            const val = process.env[key];
            if (val && val.length > 20) keys.push(val);
        }
    });

    return [...new Set(keys)];
}

export async function analyzeWithOpenAI(text: string, systemPrompt: string) {
    const keys = getOpenAIKeys();
    if (keys.length === 0) throw new Error('OPENAI_API_KEY not found');

    let lastError: any = null;

    for (const key of keys) {
        for (const model of OPENAI_MODELS) {
            try {
                console.log(`[Backend] OpenAI [${model}] key:${key.slice(0, 8)}...`);

                const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
                    console.warn(`[Backend] OpenAI [${model}] 429 Quota. Trying next...`);
                    break; // Next key (same model will 429 too)
                }

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.error?.message || `OpenAI ${response.status}`);
                }

                const data = await response.json();
                const content = data.choices[0]?.message?.content || '{}';
                console.log(`[Backend] ✅ OpenAI [${model}] Success`);
                return JSON.parse(content);

            } catch (e: any) {
                console.warn(`[Backend] OpenAI [${model}] Error:`, e.message);
                lastError = e;
                // Model not found — try next model
                if (e.message?.includes('404')) continue;
                // Other errors — try next model too
                continue;
            }
        }
    }

    throw lastError || new Error('Barcha OpenAI kalitlari va modellari ishlamadi');
}

export async function chatWithOpenAI(messages: any[]) {
    const keys = getOpenAIKeys();
    if (keys.length === 0) throw new Error('OPENAI_API_KEY not found');

    let lastError: any = null;

    for (const key of keys) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: messages,
                    temperature: 0.7,
                }),
            });

            if (response.status === 429) {
                console.warn(`[Backend] OpenAI Chat 429. Trying next key...`);
                continue;
            }

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error?.message || `OpenAI Chat ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (e: any) {
            console.warn('[Backend] OpenAI Chat Error:', e.message);
            lastError = e;
        }
    }

    throw lastError || new Error('OpenAI Chat: barcha kalitlar ishlamadi');
}
