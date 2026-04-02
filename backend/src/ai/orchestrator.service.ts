import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getPrompt, AnalysisMode } from './prompt-registry';
import { analyzeWithOpenAI, chatWithOpenAI } from './providers/openai';
import { analyzeWithGroq, chatWithGroq } from './providers/groq';
import { analyzeWithGemini, chatWithGemini } from './providers/gemini';
import { SettingsService } from '../modules/admin/settings.service';
import * as fs from 'fs';
import * as path from 'path';

export interface AnalysisResult {
    id: string;
    timestamp: string;
    documentType: string;
    summary: string;
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    riskScore: number;
    issues: any[];
    recommendations: string[];
    detailedConclusion?: string;
    logicalChain?: string[];
    alternativeSolutions?: string[];
    fixInstructions?: string[];
    analysisConfidence?: string;
    confidenceReason?: string;
    [key: string]: any;
}

@Injectable()
export class AiOrchestratorService {
    private readonly logger = new Logger(AiOrchestratorService.name);

    constructor(
        private configService: ConfigService,
        private settingsService: SettingsService
    ) {
        this.loadEnv();
    }

    private loadEnv() {
        // Multiple paths to search for env files
        const envPaths = [
            path.resolve(process.cwd(), '.env'),
            path.resolve(process.cwd(), '../.env.local'),
            path.resolve(process.cwd(), '..', '.env.local'),
            path.resolve(__dirname, '..', '..', '..', '.env.local'),
            path.resolve(__dirname, '..', '..', '..', '..', '.env.local'),
            path.resolve(process.cwd(), '.env.example'),
        ];

        let loaded = false;

        // Store all unique key values found
        const foundOpenAIKeys = new Set<string>();
        const foundGeminiKeys = new Set<string>();
        const foundGroqKeys = new Set<string>();

        // Pre-populate with existing process.env keys if any
        if (process.env.OPENAI_API_KEY) foundOpenAIKeys.add(process.env.OPENAI_API_KEY);
        if (process.env.GEMINI_API_KEY) foundGeminiKeys.add(process.env.GEMINI_API_KEY);
        if (process.env.GROQ_API_KEY) foundGroqKeys.add(process.env.GROQ_API_KEY);

        for (const envPath of envPaths) {
            try {
                if (!fs.existsSync(envPath)) continue;

                const envContent = fs.readFileSync(envPath, 'utf-8');
                const lines = envContent.split(/\r?\n/);

                for (const line of lines) {
                    const match = line.match(/^((?:VITE_)?(GEMINI|OPENAI|GROQ)_API_KEY(?:_ALT|_2|_3)?)\s*=\s*["']?([^"'\s#]+)["']?/);
                    if (match) {
                        const [_, keyName, type, value] = match;
                        if (value && value !== 'your-gemini-api-key-here' && value.length > 20) {
                            if (type === 'OPENAI') foundOpenAIKeys.add(value);
                            if (type === 'GEMINI') foundGeminiKeys.add(value);
                            if (type === 'GROQ') foundGroqKeys.add(value);
                            loaded = true;
                        }
                    }

                    // Also capture VITE_AI_PROVIDER for Gemini
                    const providerMatch = line.match(/^VITE_AI_PROVIDER\s*=\s*["']?([^"'\s#]+)["']?/);
                    if (providerMatch && providerMatch[1]?.startsWith('AIza')) {
                        foundGeminiKeys.add(providerMatch[1]);
                        loaded = true;
                    }
                }

                if (loaded) this.logger.log(`✅ Scanned keys from: ${envPath}`);

            } catch (e) { }
        }

        // Assign all unique keys to process.env with incremental suffixes
        let i = 1;
        foundOpenAIKeys.forEach(key => {
            const envName = i === 1 ? 'OPENAI_API_KEY' : `OPENAI_API_KEY_${i}`;
            process.env[envName] = key;
            this.logger.log(`[Env] Set ${envName} (...${key.slice(-6)})`);
            i++;
        });

        i = 1;
        foundGeminiKeys.forEach(key => {
            const envName = i === 1 ? 'GEMINI_API_KEY' : `GEMINI_API_KEY_${i}`;
            process.env[envName] = key;
            this.logger.log(`[Env] Set ${envName} (...${key.slice(-6)})`);
            i++;
        });

        i = 1;
        foundGroqKeys.forEach(key => {
            const envName = i === 1 ? 'GROQ_API_KEY' : `GROQ_API_KEY_${i}`;
            process.env[envName] = key;
            this.logger.log(`[Env] Set ${envName} (...${key.slice(-6)})`);
            i++;
        });

        if (!loaded) {
            this.logger.error("❌ No API keys found! AI analysis will use fallback only.");
        }
    }

    async analyzeDocument(text: string, mode: AnalysisMode): Promise<AnalysisResult> {
        const systemPrompt = getPrompt(mode);
        const settings = this.settingsService.getSettings();
        let lastError: any = null;

        // Barcha faol provayderlarni ruyhatga olish
        const activeProviders = [];
        if (settings.groqEnabled !== false) activeProviders.push('groq');
        if (settings.geminiEnabled !== false) activeProviders.push('gemini');
        if (settings.openaiEnabled !== false) activeProviders.push('openai');

        // Ularni aralashtirish (Load Balancing - bir u, bir bu ishlashi uchun)
        const shuffledProviders = activeProviders.sort(() => 0.5 - Math.random());

        for (const provider of shuffledProviders) {
            try {
                this.logger.log(`[Orchestrator] Attempting ${provider} for mode: ${mode}`);

                let result;
                let reason;

                if (provider === 'groq') {
                    result = await analyzeWithGroq(text, systemPrompt);
                    reason = "Groq Llama 3.3 (Load Balanced)";
                } else if (provider === 'gemini') {
                    result = await analyzeWithGemini(text, systemPrompt);
                    reason = "Gemini Analysis (Load Balanced)";
                } else if (provider === 'openai') {
                    result = await analyzeWithOpenAI(text, systemPrompt);
                    reason = "OpenAI Analysis (Load Balanced)";
                }

                return {
                    ...this.normalizeResult(result),
                    analysis_mode: provider,
                    confidenceReason: reason
                };
            } catch (err: any) {
                this.logger.warn(`${provider} failed: ${err.message}`);
                lastError = err;
            }
        }

        throw new Error(`AI Tahlil Xatosi (Barcha provayderlar ishlamadi): ${lastError?.message || 'Noma\'lum xato'}`);
    }

    private normalizeResult(data: any): AnalysisResult {
        // Basic normalization to ensure frontend compatibility
        return {
            id: data.id || crypto.randomUUID(),
            timestamp: data.timestamp || new Date().toISOString(),
            documentType: data.documentType || "Noma'lum",
            summary: data.summary || "",
            overallRisk: data.overallRisk || (data.riskScore > 70 ? 'HIGH' : data.riskScore > 30 ? 'MEDIUM' : 'LOW'),
            riskScore: data.riskScore || 0,
            issues: data.issues || [],
            recommendations: data.recommendations || [],
            ...data
        };
    }

    async chat(message: string, context?: string): Promise<string> {
        const settings = this.settingsService.getSettings();
        const messages = [
            {
                role: "system",
                content: "Siz O'zbekiston qonunchiligi bo'yicha yurist-konsultantsiz. Javoblaringiz aniq, qonuniy asoslangan va o'zbek tilida bo'lishi kerak." + (context ? `\n\nCONTEXT:\n${context}` : "")
            },
            { role: "user", content: message }
        ];

        let lastError: any = null;

        const activeProviders = [];
        if (settings.groqEnabled !== false) activeProviders.push('groq');
        if (settings.geminiEnabled !== false) activeProviders.push('gemini');
        if (settings.openaiEnabled !== false) activeProviders.push('openai');

        const shuffledProviders = activeProviders.sort(() => 0.5 - Math.random());

        for (const provider of shuffledProviders) {
            try {
                if (provider === 'groq') return await chatWithGroq(messages);
                if (provider === 'gemini') return await chatWithGemini(messages);
                if (provider === 'openai') return await chatWithOpenAI(messages);
            } catch (e: any) {
                this.logger.warn(`[Chat] ${provider} failed: ${e.message}`);
                lastError = e;
            }
        }

        throw new Error(`AI xizmatlari vaqtincha ishlamayapti: ${lastError?.message || 'Noma\'lum'}`);
    }
}

