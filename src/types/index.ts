// AdolatAI - Asosiy tiplar

export enum RiskLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    SAFE = 'SAFE'
}

export type AnalysisMode = 'quick' | 'professional' | 'simple' | 'kazus' | 'rejected' | 'template' | 'audit';

// ====================
// TAHLIL NATIJALARI
// ====================

export interface TopRisk {
    description: string;
    whyImportant: string;
}

export interface LegalBasis {
    codeName: string;
    articleNumber: string;
    comment: string;
}

export interface Issue {
    title: string; // Sarlavha
    clauseText: string; // Hujjatdan parcha
    detailedDescription: string; // Muammo mohiyati (batafsil)
    riskLevel: RiskLevel;
    potentialConsequences: string[]; // Potensial oqibatlar
    legalBasis?: LegalBasis;
    recommendation?: string;
    improvedText?: string; // To'g'rilangan variant
    // Backwards compatibility uchun:
    explanation?: string;
    consequence?: string;
    whoBenefits?: string;
}

export interface AnalysisResult {
    id: string;
    timestamp: string;
    fileName?: string;
    documentType: string;
    analysisLevel?: 'AI' | 'FALLBACK' | 'EMERGENCY' | string;
    summary: string;
    overallRisk: RiskLevel;
    riskScore: number;
    topRisks: TopRisk[];
    issues: Issue[];
    recommendations: string[];
    notaryConsiderations: string[];
    missingInformation: string[];
    totalIssuesCount: number;
    analysisConfidence: string;
    confidenceReason: string;
    // Kengaytirilgan maydonlar
    isJustified?: string;
    justificationReason?: string;
    rejectionProbability?: 'PAST' | 'O\'RTA' | 'YUQORI';
    alternativeSolutions?: string[];
    logicalChain?: string[];
    legalIssue?: string;
    detailedConclusion?: string;
    // Qonuniy moslik bloki
    legalCompliance?: {
        checkedDocs: string[]; // Tekshirilgan hujjatlar ro'yxati
        complianceStatus: 'To‘liq mos' | 'Qisman mos' | 'Mos emas';
        complianceReason: string; // Sababi
    };
    fixInstructions?: string[];
    riskDistribution?: string;
    potentialScenarios?: string[];
    generatedTemplate?: {
        header: string;
        title: string;
        body: string;
        footer: string;
    };
}

export type AppStep = 'landing' | 'disclaimer' | 'upload' | 'analyzing' | 'results';

// ====================
// FOYDALANUVCHI
// ====================

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin' | 'lawyer';
    createdAt: string;
}

// ====================
// HUJJATLAR
// ====================

export interface Document {
    id: string;
    name: string;
    content: string;
    type: string;
    uploadedAt: string;
    analyzedAt?: string;
}

// ====================
// AI TIZIMLARI
// ====================

export type AIProviderType = 'gemini' | 'openai';

export interface AIProvider {
    name: string;
    analyzeDocument(text: string, mode: AnalysisMode): Promise<AnalysisResult>;
    createChat(context: string): Promise<ChatSession>;
}

export interface ChatSession {
    sendMessageStream(message: string): AsyncGenerator<{ text: string; isError?: boolean }>;
}

// ====================
// API JAVOBLARI
// ====================

export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
