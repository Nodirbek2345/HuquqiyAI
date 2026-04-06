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
            <div className="lg:col-span-4 space-y-6 min-w-0">
                {/* Score & Status Pro Card */}
                <GradientCard className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    {/* Decorative Background Elements */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

                    <div className="relative flex flex-col items-center justify-center py-6">
                        <h4 className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mb-8">Huquqiy Xavfsizlik</h4>
                        <ScoreGauge
                            score={result.riskScore}
                            color={result.overallRisk === RiskLevel.HIGH ? 'rose' : result.overallRisk === RiskLevel.MEDIUM ? 'amber' : 'emerald'}
                        />
                        <div className="mt-8 flex flex-col items-center gap-3">
                            <StatusBadge
                                variant={result.overallRisk === RiskLevel.HIGH ? 'danger' : result.overallRisk === RiskLevel.MEDIUM ? 'warning' : 'success'}
                                className="text-sm px-6 py-2 bg-white/10 backdrop-blur-md border-white/20"
                            >
                                {result.overallRisk === 'HIGH' ? 'YUQORI XAVF' : result.overallRisk === 'MEDIUM' ? "O'RTA XAVF" : 'XAVFSIZ'}
                            </StatusBadge>

                            {/* Document Type Badge inside the same premium card */}
                            <div className="flex items-center gap-2 mt-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wide">
                                <FileText className="w-3.5 h-3.5 opacity-70" />
                                {result.documentType}
                            </div>
                        </div>
                    </div>
                </GradientCard>

                {/* Recommendations */}
                <GradientCard title="Birlamchi Tavsiyalar" icon={Shield} className="border-t-4 border-t-emerald-400">
                    <div className="space-y-4">
                        {result.recommendations.map((rec, i) => (
                            <div key={i} className="flex gap-3 items-start p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-50 transition-colors">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-[10px] flex-shrink-0 mt-0.5">{i + 1}</div>
                                <p className="text-sm font-bold text-slate-700 leading-relaxed">{rec}</p>
                            </div>
                        ))}
                    </div>
                </GradientCard>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-8 space-y-6 min-w-0">
                {/* Executive Summary */}
                <GradientCard title="Umumiy Tahlil Xulosasi" icon={Info} className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-100 shadow-inner">
                    <div className="flex gap-6 items-start">
                        <span className="text-blue-300 font-serif text-5xl leading-none opacity-50">"</span>
                        <p className="text-xl font-bold text-slate-800 leading-relaxed font-serif tracking-tight mt-2">
                            {result.detailedConclusion || result.summary}
                        </p>
                    </div>
                </GradientCard>

                {/* Issues List */}
                <div className="space-y-6">
                    <SectionLabel>Aniqlangan Muammolar va Yechimlar</SectionLabel>

                    {result.issues.map((issue, idx) => (
                        <div key={idx} className="bg-white rounded-3xl md:rounded-[32px] p-6 md:p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all group duration-500 min-w-0 overflow-hidden w-full max-w-full">
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
                                <div className="space-y-4 min-w-0 max-w-full">
                                    <div className="p-5 md:p-8 bg-slate-50/50 rounded-2xl md:rounded-3xl border border-slate-100 min-w-0 break-words w-full">
                                        <SectionLabel>Muammo Mohiyati</SectionLabel>
                                        <p className="text-lg font-bold text-slate-700 leading-relaxed break-words">{issue.explanation}</p>
                                    </div>

                                    <div className="p-5 md:p-8 bg-rose-50/30 rounded-2xl md:rounded-3xl border border-rose-100/50 min-w-0 break-words w-full">
                                        <SectionLabel className="text-rose-400">Hujjatdagi Band</SectionLabel>
                                        <p className="text-base font-mono text-rose-800/80 italic break-words break-all whitespace-pre-wrap">"{issue.clauseText}"</p>
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
                                <div className="space-y-6 min-w-0 max-w-full">
                                    <div className="p-5 md:p-8 bg-emerald-50/30 rounded-2xl md:rounded-3xl border border-emerald-100/50 h-full flex flex-col min-w-0 break-words w-full">
                                        <SectionLabel className="text-emerald-500">Tavsiya va Yechim</SectionLabel>
                                        <p className="text-lg font-bold text-emerald-800 leading-relaxed mb-6">{issue.recommendation}</p>

                                        {issue.improvedText && (
                                            <div className="mt-auto pt-5 border-t border-emerald-100/50">
                                                <span className="text-sm uppercase font-black tracking-widest text-emerald-500 block mb-3">To'g'rilangan Matn</span>
                                                <div className="bg-white/80 p-6 rounded-2xl text-base font-mono text-emerald-900 border border-emerald-100 shadow-sm leading-relaxed break-words break-all whitespace-pre-wrap">
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
