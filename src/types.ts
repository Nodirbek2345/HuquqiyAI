export type AnalysisMode = 'quick' | 'kazus' | 'rejected' | 'template' | 'audit';
export type AppStep = 'landing' | 'disclaimer' | 'upload' | 'analyzing' | 'results';
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  SAFE = 'SAFE'
}

export interface Issue {
  title: string;
  clauseText: string;      // Used in dashboard
  explanation: string;     // Used in dashboard (was description)
  riskLevel: RiskLevel;    // Used in dashboard
  recommendation: string;
  potentialConsequences?: string[];
  improvedText?: string;   // AI-suggested legally sound rewritten clause
  legalBasis: {            // Used in dashboard
    codeName: string;
    articleNumber: string;
    comment?: string;
  };
}

export interface AnalysisResult {
  id?: string;
  timestamp?: string;
  fileName?: string;
  documentType: string;
  analysisLevel: "AI" | "LOCAL";
  riskScore: number;
  overallRisk: string;     // Dashboard uses check: === RiskLevel.HIGH
  rejectionProbability?: string;
  summary: string;
  issues: Issue[];
  recommendations: string[];

  // Optional complex fields for other modes
  logicalChain?: string[];
  alternativeSolutions?: string[];
  detailedConclusion?: string;
  fixInstructions?: string[];
  potentialScenarios?: string[];
  riskDistribution?: string;
  analysisConfidence?: string;
  confidenceReason?: string;
  generatedTemplate?: any;
  missingInformation?: string[];
  notaryConsiderations?: string[];
  legalCompliance?: any;
  topRisks?: { description: string; whyImportant: string }[];
  totalIssuesCount?: number;
}

export interface ChatSession {
  sendMessageStream(message: string): AsyncGenerator<{ text: string; isError?: boolean }, void, unknown>;
}

export interface AIProvider {
  name: string;
  analyzeDocument(text: string, mode: AnalysisMode): Promise<AnalysisResult>;
  createChat(context: string): Promise<ChatSession>;
}