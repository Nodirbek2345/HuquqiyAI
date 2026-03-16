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
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 no-print">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={onLogoClick}
                >
                    <div className={`
            w-9 h-9 rounded-xl flex items-center justify-center text-white 
            shadow-lg transition-all duration-500 group-hover:rotate-12 
            ${getBrandColor()}
          `}>
                        <Shield className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900 uppercase">
                        Adolat<span className={getTextColor()}>AI</span>
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={onHistoryClick}
                        className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest"
                    >
                        <HistoryIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Tarix</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;



