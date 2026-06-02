import React from 'react';
import { AnalysisResult, RiskLevel } from '../../types';
import { GradientCard, StatusBadge, ScoreGauge, SectionLabel } from './PremiumUI';
import { AlertTriangle, FileWarning, Wrench, ArrowRight, Gavel, CheckCircle } from 'lucide-react';

interface ResultsRejectedProps {
    result: AnalysisResult;
}

export const ResultsRejected: React.FC<ResultsRejectedProps> = ({ result }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
            {/* Sidebar Stats */}
            <div className="lg:col-span-3 space-y-6">
                <GradientCard className="text-center bg-rose-50/30 border-rose-100">
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <FileWarning className="w-24 h-24 text-rose-500 opacity-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                            <ScoreGauge
                                score={result.riskScore || 85}
                                label="Xatolik Darajasi"
                                color="rose"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <SectionLabel className="justify-center text-rose-400">Rad Ehtimoli</SectionLabel>
                        <p className={`text-2xl font-black ${result.rejectionProbability === 'YUQORI' ? 'text-rose-600' : 'text-amber-500'}`}>
                            {result.rejectionProbability || "YUQORI"}
                        </p>
                    </div>
                </GradientCard>

                <GradientCard title="Yo'riqnoma" icon={Wrench}>
                    <div className="space-y-4">
                        {(result.fixInstructions || result.recommendations || []).map((rec, i) => (
                            <div key={i} className="flex gap-4 items-start group">
                                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black text-[10px] flex-shrink-0 shadow-lg group-hover:bg-rose-600 transition-colors">
                                    {i + 1}
                                </div>
                                <p className="text-[11px] font-bold text-slate-700 leading-tight pt-1">{rec}</p>
                            </div>
                        ))}
                    </div>
                </GradientCard>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-8">
                {/* Diagnostics Header */}
                <GradientCard title="Diagnostika Xulosasi" icon={FileWarning} className="border-l-4 border-l-rose-500 bg-gradient-to-r from-rose-50/50 to-white">
                    <p className="text-xl font-medium text-slate-900 leading-relaxed italic">
                        "{result.summary}"
                    </p>
                </GradientCard>

                {/* Critical Issues */}
                <div className="space-y-6">
                    <SectionLabel>Tuzatish Talab Etiladigan Qismlar</SectionLabel>

                    {result.issues.map((issue, idx) => (
                        <div key={idx} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-rose-100 transition-all group">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-lg bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                                        XATO #{idx + 1}
                                    </span>
                                    {issue.legalBasis?.codeName && (
                                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                            <Gavel className="w-3 h-3" />
                                            {issue.legalBasis.codeName}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Error Explanation */}
                                <div className="space-y-4">
                                    <SectionLabel>Xatolik Sababi</SectionLabel>
                                    <p className="text-base font-bold text-slate-700 leading-relaxed">{issue.explanation}</p>
                                    <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100 italic text-sm text-rose-800/80">
                                        "{issue.clauseText}"
                                    </div>
                                    {issue.potentialConsequences && issue.potentialConsequences.length > 0 && (
                                        <div className="space-y-3 mt-6">
                                            <SectionLabel className="text-rose-400">Huquqiy Oqibatlar</SectionLabel>
                                            {issue.potentialConsequences.map((cons, i) => (
                                                <div key={i} className="flex gap-4 items-start p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                                                    <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm font-bold text-rose-700 leading-tight">{cons}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Fix Recommendation */}
                                <div className="space-y-4">
                                    <SectionLabel className="text-emerald-500">Tuzatish Yo'li</SectionLabel>
                                    <div className="h-full bg-emerald-50/30 rounded-3xl p-6 border border-emerald-100/50 flex flex-col justify-center">
                                        <div className="flex gap-4 mb-4">
                                            <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                                            <p className="text-base font-black text-emerald-700 leading-relaxed">{issue.recommendation}</p>
                                        </div>
                                        {issue.improvedText && (
                                            <div className="mt-4 text-sm font-mono text-emerald-900 bg-white/80 p-5 rounded-xl border border-emerald-100 leading-relaxed">
                                                {issue.improvedText}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
