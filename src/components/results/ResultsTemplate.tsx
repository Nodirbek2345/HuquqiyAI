import React, { useState } from 'react';
import { AnalysisResult } from '../../types';
import { GradientCard, SectionLabel, StatusBadge, ScoreGauge } from './PremiumUI';
import {
    FilePlus, Info, CheckCircle, Copy, Printer,
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Undo2, Redo2, Type, Palette, ShieldAlert, ChevronRight
} from 'lucide-react';

interface ResultsTemplateProps {
    result: AnalysisResult;
    template?: any;
    onTemplateChange?: (t: any) => void;
}

export const ResultsTemplate: React.FC<ResultsTemplateProps> = ({ result, template: propTemplate, onTemplateChange }) => {
    const defaultTemplate = {
        header: `O'zbekiston Respublikasi\n${new Date().toLocaleDateString('uz-UZ')}`,
        title: result.documentType || 'HUJJAT LOYIHASI',
        body: result.summary || result.detailedConclusion || 'Hujjat matni bu yerda ko\'rsatiladi...',
        footer: new Date().toLocaleDateString('uz-UZ')
    };
    const [internalTemplate, setInternalTemplate] = useState(result.generatedTemplate || defaultTemplate);
    const [copied, setCopied] = useState(false);
    const template = propTemplate || internalTemplate;

    const updateTemplate = (field: string, value: string) => {
        const newTemplate = { ...template, [field]: value };
        if (onTemplateChange) {
            onTemplateChange(newTemplate);
        } else {
            setInternalTemplate(newTemplate);
        }
    };


    const handleCopy = () => {
        const text = `${template.header}\n\n${template.title}\n\n${template.body}\n\n${template.footer}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCommand = (command: string, arg?: string) => (e: React.MouseEvent) => {
        e.preventDefault(); // Matn fokusini yo'qotmaslik uchun
        document.execCommand(command, false, arg);
    };

    const ToolbarBtn = ({ children, command, arg, active = false }: { children: React.ReactNode; command?: string; arg?: string; active?: boolean }) => (
        <button
            onMouseDown={command ? handleCommand(command, arg) : undefined}
            className={`w-7 h-7 flex items-center justify-center rounded hover:bg-blue-50 transition-colors ${active ? 'bg-blue-100 text-blue-700' : 'text-slate-500'}`}
            title={command}
            type="button"
        >
            {children}
        </button>
    );

    // Toolbar separator
    const Sep = () => <div className="w-px h-5 bg-slate-200 mx-1" />;

    // Ruler component
    const Ruler = () => (
        <div className="h-5 bg-white border-b border-slate-200 flex items-end px-[96px] select-none overflow-hidden">
            <div className="flex-1 flex items-end relative h-full">
                {Array.from({ length: 18 }, (_, i) => (
                    <div key={i} className="flex-1 relative h-full flex items-end">
                        <div className="absolute bottom-0 left-0 w-px h-2.5 bg-slate-400" />
                        <span className="absolute bottom-2.5 left-0.5 text-[8px] text-slate-400 font-mono leading-none">{i + 1}</span>
                        {/* Half ticks */}
                        <div className="absolute bottom-0 left-1/2 w-px h-1.5 bg-slate-300" />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
            {/* Sidebar Controls */}
            <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
                <GradientCard className="text-center bg-emerald-50/30 border-emerald-100 shadow-sm relative overflow-hidden">
                    {/* DEV Version Badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-amber-400 text-amber-900 text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm animate-pulse">
                        DEV
                    </div>
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                            <FilePlus className="w-10 h-10" />
                        </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">HUJJAT LOYIHASI</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{result.documentType}</p>
                    <p className="text-[10px] font-bold text-amber-600 mt-2 uppercase tracking-widest">Dev versiya v0.1</p>
                </GradientCard>

                <GradientCard title="Qo'llanma" icon={Info}>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                        Ushbu shablon <b>O'zbekiston Respublikasi</b> qonunchiligi va davlat standartlariga mos ravishda AI tomonidan avtomatik yaratildi. Hujjat matnini tahrirlash uchun qog'oz ustiga to'g'ridan-to'g'ri bosing. Belgilangan maydonlarni o'z ma'lumotlaringiz bilan to'ldiring.
                    </p>
                </GradientCard>

                <div className="space-y-4">
                    <button
                        onClick={handleCopy}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-slate-800 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        {copied ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                        {copied ? "NUSXA OLINDI" : "MATNNI NUSXALASH"}
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="w-full py-5 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black text-sm uppercase tracking-widest shadow-sm hover:bg-slate-50 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 hover:border-blue-200 hover:text-blue-700"
                    >
                        <Printer className="w-5 h-5" /> PDF / CHOP ETISH
                    </button>
                </div>
            </div>

            {/* MS Word-like Document Editor */}
            <div className="lg:col-span-6 order-1 lg:order-2">
                <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-200/80">
                    {/* Word Toolbar */}
                    <div className="bg-[#f3f3f3] border-b border-slate-200">
                        {/* Tab bar */}
                        <div className="flex items-center gap-0 px-2 pt-1.5">
                            <div className="px-4 py-1.5 text-[11px] font-bold text-slate-800 bg-white border-t-2 border-t-blue-500 border-x border-slate-200 rounded-t-md">Bosh sahifa</div>
                            <div className="px-4 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">Qo'shish</div>
                            <div className="px-4 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">Sahifa</div>
                        </div>
                        {/* Tool buttons */}
                        <div className="flex items-center gap-0.5 px-3 py-1.5 bg-white border-t border-slate-100 flex-wrap">
                            <ToolbarBtn command="undo"><Undo2 className="w-3.5 h-3.5" /></ToolbarBtn>
                            <ToolbarBtn command="redo"><Redo2 className="w-3.5 h-3.5" /></ToolbarBtn>
                            <Sep />
                            {/* Font selector */}
                            <select
                                onChange={(e) => { document.execCommand('fontName', false, e.target.value); }}
                                className="flex items-center gap-1 px-2 py-1 border border-slate-200 rounded text-[11px] font-medium text-slate-700 bg-white min-w-[120px] outline-none cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Arial">Arial</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Georgia">Georgia</option>
                            </select>
                            <select
                                onChange={(e) => { document.execCommand('fontSize', false, e.target.value); }}
                                defaultValue="4"
                                className="flex items-center gap-1 px-2 py-1 border border-slate-200 rounded text-[11px] font-medium text-slate-700 bg-white w-[55px] justify-center ml-1 outline-none cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <option value="3">12</option>
                                <option value="4">14</option>
                                <option value="5">18</option>
                                <option value="6">24</option>
                                <option value="7">36</option>
                            </select>
                            <Sep />
                            <ToolbarBtn command="bold"><Bold className="w-3.5 h-3.5" /></ToolbarBtn>
                            <ToolbarBtn command="italic"><Italic className="w-3.5 h-3.5" /></ToolbarBtn>
                            <ToolbarBtn command="underline"><Underline className="w-3.5 h-3.5" /></ToolbarBtn>
                            <Sep />
                            <ToolbarBtn command="justifyLeft"><AlignLeft className="w-3.5 h-3.5" /></ToolbarBtn>
                            <ToolbarBtn command="justifyCenter"><AlignCenter className="w-3.5 h-3.5" /></ToolbarBtn>
                            <ToolbarBtn command="justifyRight"><AlignRight className="w-3.5 h-3.5" /></ToolbarBtn>
                            <ToolbarBtn command="justifyFull"><AlignJustify className="w-3.5 h-3.5" /></ToolbarBtn>
                            <Sep />
                            <ToolbarBtn command="insertUnorderedList"><List className="w-3.5 h-3.5" /></ToolbarBtn>
                            <ToolbarBtn command="insertOrderedList"><ListOrdered className="w-3.5 h-3.5" /></ToolbarBtn>
                            <Sep />
                            <label title="Text Color" className="w-7 h-7 flex items-center justify-center rounded hover:bg-blue-50 transition-colors text-slate-500 cursor-pointer overflow-hidden relative">
                                <Palette className="w-3.5 h-3.5 pointer-events-none" />
                                <input
                                    type="color"
                                    onChange={(e) => document.execCommand('foreColor', false, e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Ruler */}
                    <Ruler />

                    {/* Page Container (Gray desk background) */}
                    <div className="bg-[#e8e8e8] p-8 md:p-12 flex justify-center min-h-[900px]">
                        {/* A4 Page */}
                        <div className="bg-white w-full max-w-[700px] shadow-[0_2px_20px_rgba(0,0,0,0.12)] p-16 md:p-20 min-h-[1000px] flex flex-col font-serif text-slate-900 relative">
                            {/* Page margin lines (subtle) */}
                            <div className="absolute top-12 left-12 right-12 bottom-12 border border-blue-100/30 pointer-events-none rounded-sm" />

                            {/* Header */}
                            <div className="flex justify-end mb-16">
                                <div
                                    contentEditable
                                    suppressContentEditableWarning
                                    onInput={(e) => updateTemplate('header', e.currentTarget.innerText)}
                                    className="w-full max-w-[320px] text-left text-[14px] leading-relaxed font-bold outline-none focus:bg-blue-50/40 p-1.5 rounded transition-colors whitespace-pre-wrap"
                                >
                                    {template.header}
                                </div>
                            </div>

                            {/* Title */}
                            <div className="text-center mb-12">
                                <h1
                                    contentEditable
                                    suppressContentEditableWarning
                                    onInput={(e) => updateTemplate('title', e.currentTarget.innerText)}
                                    className="text-xl font-black uppercase tracking-[0.15em] outline-none focus:bg-blue-50/40 p-1.5 rounded transition-colors whitespace-pre-wrap"
                                >
                                    {template.title}
                                </h1>
                            </div>

                            {/* Body */}
                            <div
                                contentEditable
                                suppressContentEditableWarning
                                onInput={(e) => updateTemplate('body', e.currentTarget.innerText)}
                                className="flex-grow text-[16px] leading-[1.8] text-justify whitespace-pre-wrap mb-16 indent-12 outline-none focus:bg-blue-50/40 p-2 rounded transition-colors"
                            >
                                {template.body}
                            </div>

                            {/* Footer / Signature */}
                            <div className="mt-auto pt-10 border-t border-slate-100 flex justify-between items-end">
                                <div className="text-sm">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Sana</span>
                                    <span
                                        contentEditable
                                        suppressContentEditableWarning
                                        onInput={(e) => updateTemplate('footer', e.currentTarget.innerText)}
                                        className="font-bold border-b border-dashed border-slate-400 pb-1 outline-none focus:border-blue-400"
                                    >
                                        {template.footer}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Imzo</span>
                                    <div className="w-32 h-[1px] bg-slate-300 ml-auto mb-1" />
                                    <div className="text-[10px] text-slate-400 italic">(shaxsiy imzo)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status bar */}
                    <div className="bg-[#2b579a] text-white flex items-center justify-between px-4 py-1">
                        <div className="flex items-center gap-4 text-[10px] font-medium">
                            <span>Sahifa 1 / 1</span>
                            <span>So'zlar: {(template.body || '').split(/\s+/).filter(Boolean).length}</span>
                            <span>O'zbek tili</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="opacity-60">100%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Smart Validator Sidebar */}
            <div className="lg:col-span-3 order-3 space-y-6">
                <GradientCard className="text-center bg-rose-50/30 border-rose-100">
                    <div className="mb-6 flex justify-center">
                        <ScoreGauge
                            score={result.riskScore || 100}
                            label="XAVFSIZLIK BALLI"
                            color={result.riskScore && result.riskScore < 50 ? 'rose' : (result.riskScore && result.riskScore < 80 ? 'amber' : 'emerald')}
                        />
                    </div>
                    <StatusBadge variant={result.riskScore && result.riskScore < 50 ? 'danger' : 'success'}>SMART VALIDATOR</StatusBadge>
                </GradientCard>

                {result.issues && result.issues.length > 0 && (
                    <GradientCard title="Kamchiliklar va Vazifalar" icon={ShieldAlert} className="border-t-4 border-t-amber-400">
                        <div className="space-y-4">
                            {result.issues.map((issue, i) => (
                                <div key={i} className="flex flex-col gap-3 p-5 bg-white rounded-2xl border border-rose-100/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-400 group-hover:bg-rose-500 transition-colors" />

                                    <div className="flex items-start justify-between">
                                        <h4 className="text-sm font-black text-slate-800 uppercase pr-8 tracking-tight">{issue.title || "To'ldirilishi kerak bo'lgan band"}</h4>
                                        <StatusBadge variant={issue.riskLevel === 'HIGH' ? 'danger' : 'warning'} className="scale-75 origin-top-right">
                                            {issue.riskLevel || 'MEDIUM'}
                                        </StatusBadge>
                                    </div>

                                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                        {issue.explanation || issue.description || issue.title}
                                    </p>

                                    {issue.clauseText && (
                                        <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100/50 text-xs font-mono text-rose-800/80 italic">
                                            "{issue.clauseText}"
                                        </div>
                                    )}

                                    <div className="mt-2 pt-3 border-t border-slate-100/80">
                                        <p className="text-sm font-bold text-amber-600 flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            {issue.recommendation}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GradientCard>
                )}

                {result.recommendations && result.recommendations.length > 0 && (
                    <GradientCard title="Amaliy Maslahatlar" icon={CheckCircle}>
                        <div className="space-y-4">
                            {result.recommendations.map((rec, i) => (
                                <div key={i} className="flex gap-4 items-start p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/50 hover:bg-emerald-50/60 transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">{i + 1}</div>
                                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </GradientCard>
                )}
            </div>
        </div>
    );
};
