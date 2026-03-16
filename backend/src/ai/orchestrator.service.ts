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

        // 1️⃣ Try Groq (Primary if enabled)
        if (settings.groqEnabled !== false) {
            try {
                this.logger.log(`[Orchestrator] Attempting Groq for mode: ${mode}`);
                const result = await analyzeWithGroq(text, systemPrompt);
                return {
                    ...this.normalizeResult(result),
                    analysis_mode: "groq",
                    confidenceReason: "Groq Llama 3.3 (Primary)"
                };
            } catch (err: any) {
                this.logger.warn(`Groq failed: ${err.message}`);
                lastError = err;
            }
        }

        // 2️⃣ Gemini fallback (if enabled)
        if (settings.geminiEnabled !== false) {
            try {
                this.logger.log(`[Orchestrator] Attempting Gemini for mode: ${mode}`);
                const result = await analyzeWithGemini(text, systemPrompt);
                return {
                    ...this.normalizeResult(result),
                    analysis_mode: "gemini",
                    confidenceReason: "Gemini Analysis (Secondary)"
                };
            } catch (err: any) {
                this.logger.warn(`Gemini failed: ${err.message}`);
                lastError = err;
            }
        }

        // 3️⃣ OpenAI fallback (if enabled)
        if (settings.openaiEnabled !== false) {
            try {
                this.logger.log(`[Orchestrator] Attempting OpenAI for mode: ${mode}`);
                const result = await analyzeWithOpenAI(text, systemPrompt);
                return {
                    ...this.normalizeResult(result),
                    analysis_mode: "openai",
                    confidenceReason: "OpenAI Analysis (Tertiary)"
                };
            } catch (err: any) {
                this.logger.warn(`OpenAI failed: ${err.message}`);
                lastError = err;
            }
        }

        // 3️⃣ Local fallback (Removed per user request)
        // If we reached here, both AI providers failed

        throw new Error(`AI Tahlil Xatosi (Barcha provayderlar): ${lastError?.message || 'Noma\'lum xato'}`);
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

        // 1️⃣ Try Groq
        if (settings.groqEnabled !== false) {
            try {
                return await chatWithGroq(messages);
            } catch (e) {
                this.logger.warn("Groq Chat failed, switching fallback...");
            }
        }

        // 2️⃣ Try Gemini
        if (settings.geminiEnabled !== false) {
            try {
                return await chatWithGemini(messages);
            } catch (e) {
                this.logger.warn("Gemini Chat failed...");
            }
        }

        // 3️⃣ Try OpenAI
        if (settings.openaiEnabled !== false) {
            try {
                return await chatWithOpenAI(messages);
            } catch (e) {
                this.logger.error("OpenAI Chat failed...");
            }
        }

        throw new Error("AI xizmatlari vaqtincha ishlamayapti");
    }
}

