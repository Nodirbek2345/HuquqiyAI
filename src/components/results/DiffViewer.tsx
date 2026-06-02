import React, { useMemo } from 'react';
import * as Diff from 'diff';

interface DiffViewerProps {
    originalText: string;
    improvedText: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ originalText, improvedText }) => {
    const diffResult = useMemo(() => {
        return Diff.diffWords(originalText || '', improvedText || '');
    }, [originalText, improvedText]);

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                
                {/* Original */}
                <div className="flex-1 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 flex flex-col">
                    <div className="p-5 border-b border-slate-200 bg-slate-100 flex items-center justify-center">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Original Hujjat</span>
                    </div>
                    <div className="p-8 flex-1 text-[16px] leading-[1.8] font-serif text-slate-700 whitespace-pre-wrap overflow-y-auto max-h-[800px]">
                        {diffResult.map((part, index) => (
                            <span 
                                key={`orig-${index}`} 
                                className={part.added ? 'hidden' : part.removed ? 'bg-red-100 text-red-800 line-through decoration-red-400' : ''}
                            >
                                {part.value}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Improved */}
                <div className="flex-1 flex flex-col bg-white">
                    <div className="p-5 border-b border-slate-200 bg-emerald-50 flex items-center justify-center">
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            AI tomonidan to'g'rilangan
                        </span>
                    </div>
                    <div className="p-8 flex-1 text-[16px] leading-[1.8] font-serif text-slate-800 whitespace-pre-wrap overflow-y-auto max-h-[800px]">
                        {diffResult.map((part, index) => (
                            <span 
                                key={`impr-${index}`} 
                                className={part.removed ? 'hidden' : part.added ? 'bg-emerald-100 text-emerald-800 font-medium' : ''}
                            >
                                {part.value}
                            </span>
                        ))}
                    </div>
                </div>

            </div>
            
            {/* Legend */}
            <div className="mt-6 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">O'chirilgan</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-100 border border-emerald-200 rounded"></div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Qo'shilgan</span>
                </div>
            </div>
        </div>
    );
};
