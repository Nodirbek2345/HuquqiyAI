import React from 'react';
import { AnalysisResult, RiskLevel } from '../../types';
import { GradientCard, ScoreGauge, StatusBadge, SectionLabel } from './PremiumUI';
import { AlertTriangle, CheckCircle, FileText, Gavel, Shield, AlertOctagon, Info } from 'lucide-react';

interface ResultsAuditProps {
    result: AnalysisResult;
}

export const ResultsAudit: React.FC<ResultsAuditProps> = ({ result }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
            {/* Sidebar Stats */}
            <div className="lg:col-span-3 space-y-6">
                <GradientCard className="text-center">
                    <div className="mb-6 flex justify-center">
                        <ScoreGauge
                            score={result.riskScore}
                            label="Xavf Balli"
                            color={result.overallRisk === RiskLevel.HIGH ? 'rose' : result.overallRisk === RiskLevel.MEDIUM ? 'amber' : 'emerald'}
                        />
                    </div>
                    <div className="space-y-2">
                        <SectionLabel className="justify-center">Xavf Darajasi</SectionLabel>
                        <StatusBadge
                            variant={result.overallRisk === RiskLevel.HIGH ? 'danger' : result.overallRisk === RiskLevel.MEDIUM ? 'warning' : 'success'}
                            className="text-sm px-6 py-2"
                        >
                            {result.overallRisk === 'HIGH' ? 'YUQORI XAVF' : result.overallRisk === 'MEDIUM' ? "O'RTA XAVF" : 'XAVFSIZ'}
                        </StatusBadge>
                    </div>
                </GradientCard>

                <GradientCard title="Hujjat Turi" icon={FileText}>
                    <p className="text-base font-bold text-slate-700 uppercase tracking-wide">{result.documentType}</p>
                </GradientCard>

                <GradientCard title="Tavsiyalar" icon={Shield}>
                    <div className="space-y-4">
                        {result.recommendations.map((rec, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5 shadow-sm">{i + 1}</div>
                                <p className="text-sm font-bold text-slate-600 leading-relaxed">{rec}</p>
                            </div>
                        ))}
                    </div>
                </GradientCard>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-8">
                {/* Executive Summary */}
                <GradientCard title="Tahlil Xulosasi" icon={Info} className="border-l-4 border-l-blue-500">
                    <p className="text-xl font-medium text-slate-800 leading-relaxed italic">
                        "{result.detailedConclusion || result.summary}"
                    </p>
                </GradientCard>

                {/* Issues List */}
                <div className="space-y-6">
                    <SectionLabel>Aniqlangan Muammolar va Yechimlar</SectionLabel>

                    {result.issues.map((issue, idx) => (
                        <div key={idx} className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all group duration-500">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-base border border-slate-100">
                                        #{idx + 1}
                                    </span>
                                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">{issue.title || "Aniqlangan qoidabuzarlik"}</h4>
                                </div>
                                <StatusBadge
                                    variant={issue.riskLevel === 'HIGH' ? 'danger' : issue.riskLevel === 'MEDIUM' ? 'warning' : 'success'}
                                >
                                    {issue.riskLevel}
                                </StatusBadge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left: Problem */}
                                <div className="space-y-4">
                                    <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100">
                                        <SectionLabel>Muammo Mohiyati</SectionLabel>
                                        <p className="text-lg font-bold text-slate-700 leading-relaxed">{issue.explanation}</p>
                                    </div>

                                    <div className="p-8 bg-rose-50/30 rounded-3xl border border-rose-100/50">
                                        <SectionLabel className="text-rose-400">Hujjatdagi Band</SectionLabel>
                                        <p className="text-base font-mono text-rose-800/80 italic">"{issue.clauseText}"</p>
                                    </div>

                                    {issue.potentialConsequences && issue.potentialConsequences.length > 0 && (
                                        <div className="space-y-3 mt-6">
                                            <SectionLabel className="text-rose-400">Huquqiy Oqibatlar</SectionLabel>
                                            {issue.potentialConsequences.map((cons, i) => (
                                                <div key={i} className="flex gap-4 items-start p-5 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                                                    <AlertOctagon className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
                                                    <p className="text-base font-bold text-rose-700 leading-relaxed">{cons}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right: Solution */}
                                <div className="space-y-6">
                                    <div className="p-8 bg-emerald-50/30 rounded-3xl border border-emerald-100/50 h-full flex flex-col">
                                        <SectionLabel className="text-emerald-500">Tavsiya va Yechim</SectionLabel>
                                        <p className="text-lg font-bold text-emerald-800 leading-relaxed mb-6">{issue.recommendation}</p>

                                        {issue.improvedText && (
                                            <div className="mt-auto pt-5 border-t border-emerald-100/50">
                                                <span className="text-sm uppercase font-black tracking-widest text-emerald-500 block mb-3">To'g'rilangan Matn</span>
                                                <div className="bg-white/80 p-6 rounded-2xl text-base font-mono text-emerald-900 border border-emerald-100 shadow-sm leading-relaxed">
                                                    {issue.improvedText}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Legal Basis Footer */}
                            {issue.legalBasis?.codeName && (
                                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center gap-2 text-slate-400">
                                    <Gavel className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-widest">
                                        {issue.legalBasis.codeName} {issue.legalBasis.articleNumber && `| ${issue.legalBasis.articleNumber}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
