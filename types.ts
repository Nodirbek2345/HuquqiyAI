
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  SAFE = 'SAFE'
}

export type AnalysisMode = 'quick' | 'professional' | 'simple' | 'kazus' | 'rejected' | 'template';

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
  clauseText: string;
  riskLevel: RiskLevel;
  explanation: string;
  consequence: string;
  whoBenefits: string;
  recommendation?: string;
  legalBasis?: LegalBasis;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  fileName?: string;
  documentType: string;
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
  // Kengaytirilgan maydonlar (Full-screen result uchun)
  isJustified?: string;
  justificationReason?: string;
  rejectionProbability?: 'PAST' | 'O\'RTA' | 'YUQORI';
  alternativeSolutions?: string[];
  logicalChain?: string[];
  detailedConclusion?: string;
  fixInstructions?: string[];
  riskDistribution?: string; // Xavflar taqsimoti izohi
  potentialScenarios?: string[]; // "Nima bo'lishi mumkin?" ssenariylari
  generatedTemplate?: {
    header: string;
    title: string;
    body: string;
    footer: string;
  };
}

export type AppStep = 'landing' | 'disclaimer' | 'upload' | 'analyzing' | 'results';
