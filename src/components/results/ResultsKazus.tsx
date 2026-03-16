import React from 'react';
import { AnalysisResult } from '../../types';
import { GradientCard, StatusBadge, ScoreGauge, SectionLabel } from './PremiumUI';
import { BrainCircuit, Lightbulb, Puzzle, BookOpen, Scale, AlertOctagon, CheckCircle, Gavel } from 'lucide-react';

interface ResultsKazusProps {
    result: AnalysisResult;
}

export const ResultsKazus: React.FC<ResultsKazusProps> = ({ result }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
            {/* Sidebar */}
            <div className="lg:col-span-3 space-y-6">
                <GradientCard className="text-center bg-indigo-50/30 border-indigo-100">
                    <div className="mb-6 flex justify-center">
                        <ScoreGauge
                            score={result.riskScore || 95}
                            label="Ishonch Balli"
                            color="indigo"
                        />
                    </div>
                    <StatusBadge variant="premium">KAZUS YECHIMI</StatusBadge>
                </GradientCard>

                <GradientCard title="Muqobil Yechimlar" icon={Lightbulb}>
                    <div className="space-y-4">
                        {(result.alternativeSolutions || []).map((alt, i) => (
                            <div key={i} className="p-6 bg-gradient-to-br from-indigo-50/90 to-blue-50/50 backdrop-blur-sm rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-all text-base font-semibold text-indigo-900 leading-relaxed group">
                                <span className="text-indigo-400 font-serif text-2xl leading-none block mb-2 opacity-50 group-hover:opacity-100 transition-opacity">"</span>
                                {alt}
                            </div>
                        ))}
                    </div>
                </GradientCard>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-8">
                {/* Huquqiy Muammo */}
                {result.legalIssue && (
                    <GradientCard title="Huquqiy Muammo" icon={AlertOctagon} className="border-t-4 border-t-rose-400">
                        <p className="text-lg font-medium text-slate-800 leading-relaxed">
                            {result.legalIssue}
                        </p>
                    </GradientCard>
                )}

                {/* Huquqiy Yechim */}
                <GradientCard title="Huquqiy Yechim" icon={Scale} className="border-t-4 border-t-indigo-600 shadow-indigo-100">
                    <div className="relative">
                        <div className="absolute -left-4 -top-4 text-indigo-100 opacity-50">
                            <Scale className="w-24 h-24" />
                        </div>
                        <p className="relative z-10 text-2xl font-semibold text-slate-800 leading-relaxed font-serif tracking-tight">
                            {result.detailedConclusion || result.summary}
                        </p>
                    </div>
                </GradientCard>

                {/* Mantiqiy Zanjir */}
                <GradientCard title="Ishni Hal Qilish Mantiqi" icon={Puzzle}>
                    <div className="relative space-y-10 pl-6 py-4">
                        {/* Glowing Vertical Line */}
                        <div className="absolute left-[39px] top-6 bottom-6 w-1 bg-gradient-to-b from-indigo-500 via-blue-400 to-transparent rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>

                        {(result.logicalChain || []).map((step, i) => (
                            <div key={i} className="relative flex gap-8 items-start group">
                                {/* Step Number Node */}
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 border-4 border-white text-white flex items-center justify-center font-black text-xl relative z-10 shadow-xl group-hover:scale-110 group-hover:shadow-indigo-500/50 transition-all duration-300">
                                    {i + 1}
                                </div>
                                {/* Step Content */}
                                <div className="flex-1 bg-gradient-to-br from-white to-slate-50/80 p-8 rounded-[24px] border border-slate-200/60 shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                                    <p className="text-lg font-bold text-slate-700 leading-relaxed">{step}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </GradientCard>

                {/* Aniqlangan Muammolar */}
                {result.issues && result.issues.length > 0 && (
                    <div className="space-y-6">
                        <SectionLabel>Aniqlangan Muammolar va Yechimlar</SectionLabel>
                        {result.issues.map((issue, idx) => (
                            <div key={idx} className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-base border border-indigo-100">
                                            #{idx + 1}
                                        </span>
                                        <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">{issue.title}</h4>
                                    </div>
                                    <StatusBadge variant={issue.riskLevel === 'HIGH' ? 'danger' : issue.riskLevel === 'MEDIUM' ? 'warning' : 'success'}>
                                        {issue.riskLevel}
                                    </StatusBadge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left: Problem */}
                                    <div className="space-y-4">
                                        <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100">
                                            <SectionLabel>Tushuntirish</SectionLabel>
                                            <p className="text-lg font-bold text-slate-700 leading-relaxed">{issue.explanation || issue.description}</p>
                                        </div>

                                        {issue.clauseText && (
                                            <div className="p-8 bg-indigo-50/30 rounded-3xl border border-indigo-100/50">
                                                <SectionLabel className="text-indigo-400">Tegishli Holat</SectionLabel>
                                                <p className="text-base font-mono text-indigo-800/80 italic">"{issue.clauseText}"</p>
                                            </div>
                                        )}

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
                                                    <span className="text-sm uppercase font-black tracking-widest text-emerald-500 block mb-3">To'g'ri Huquqiy Yondashuv</span>
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
                )}

                {/* Qonuniy Asoslar */}
                <GradientCard title="Qonuniy Asoslar" icon={BookOpen} className="bg-gradient-to-br from-white to-indigo-50/30">
                    <div className="space-y-6">
                        {/* From legalBases (root level) */}
                        {(result as any).legalBases?.map((base: any, i: number) => (
                            <div key={`base-${i}`} className="p-8 bg-white rounded-3xl border border-indigo-100/50 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                        <Scale className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-slate-800 uppercase tracking-tight">{base.lawName}</p>
                                        <p className="text-sm text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full inline-block mt-1">{base.article}</p>
                                    </div>
                                </div>
                                {base.comment && (
                                    <p className="text-lg text-slate-600 leading-relaxed mt-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 font-medium">
                                        {base.comment}
                                    </p>
                                )}
                            </div>
                        ))}

                        {/* Fallback: from issues[].legalBasis */}
                        {!(result as any).legalBases?.length && result.issues.map((issue, i) => issue.legalBasis && (
                            <div key={i} className="flex items-center gap-3 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <Scale className="w-6 h-6 text-indigo-400" />
                                <div>
                                    <p className="text-base font-black text-slate-800 uppercase">{issue.legalBasis.codeName}</p>
                                    <p className="text-sm text-indigo-600 font-bold">{issue.legalBasis.articleNumber}</p>
                                    {issue.legalBasis.comment && (
                                        <p className="text-sm text-slate-500 mt-1">{issue.legalBasis.comment}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </GradientCard>

                {/* Tavsiyalar */}
                {result.recommendations && result.recommendations.length > 0 && (
                    <GradientCard title="Amaliy Tavsiyalar" icon={CheckCircle}>
                        <div className="space-y-4">
                            {result.recommendations.map((rec, i) => (
                                <div key={i} className="flex gap-4 items-start p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-sm flex-shrink-0">
                                        {i + 1}
                                    </div>
                                    <p className="text-base font-bold text-slate-700 leading-relaxed">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </GradientCard>
                )}
            </div>
        </div>
    );
};
