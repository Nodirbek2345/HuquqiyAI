// AdolatAI - Header Layout komponenti

import React from 'react';
import { Shield, History as HistoryIcon } from 'lucide-react';
import { AnalysisMode } from '../../types';

interface HeaderProps {
    mode?: AnalysisMode;
    onLogoClick?: () => void;
    onHistoryClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    mode = 'quick',
    onLogoClick,
    onHistoryClick
}) => {
    const getBrandColor = () => {
        switch (mode) {
            case 'rejected': return 'bg-rose-600';
            case 'kazus': return 'bg-indigo-600';
            case 'template': return 'bg-emerald-600';
            default: return 'bg-blue-600';
        }
    };

    const getTextColor = () => {
        switch (mode) {
            case 'rejected': return 'text-rose-600';
            case 'kazus': return 'text-indigo-600';
            case 'template': return 'text-emerald-600';
            default: return 'text-blue-600';
        }
    };

    return (
        <header className="sticky top-0 z-40 w-full no-print pt-2 sm:pt-0 bg-slate-50/80 sm:bg-white/80 backdrop-blur-xl sm:border-b border-slate-100/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group active:scale-95 transition-transform"
                    onClick={onLogoClick}
                >
                    <div className={`
                        w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white 
                        shadow-md sm:shadow-lg transition-all duration-500 group-hover:rotate-12 
                        ${getBrandColor()}
                    `}>
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                    </div>
                    <span className="text-[17px] sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                        Adolat<span className={`${getTextColor()} ml-[1px]`}>AI</span>
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-6">
                    <button
                        onClick={onHistoryClick}
                        className="flex items-center justify-center gap-2 text-[11px] sm:text-sm font-black text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full sm:rounded-xl transition-all uppercase tracking-widest active:scale-90 bg-white sm:bg-transparent shadow-sm sm:shadow-none border border-slate-200/60 sm:border-transparent"
                        title="Tarix"
                    >
                        <HistoryIcon className="w-4 h-4 sm:w-4 sm:h-4 stroke-[2.5]" />
                        <span className="hidden sm:inline mt-[1px]">Tarix</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;



