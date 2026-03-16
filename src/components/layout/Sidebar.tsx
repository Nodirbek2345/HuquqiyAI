// AdolatAI - Sidebar Layout komponenti

import React from 'react';
import { X, FileText, Clock, Trash2 } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { timeAgo, translateRiskLevel, getRiskColor } from '../../utils/helpers';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    history: AnalysisResult[];
    onSelectItem: (item: AnalysisResult) => void;
    onDeleteItem?: (id: string) => void;
    currentItemId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    history,
    onSelectItem,
    onDeleteItem,
    currentItemId
}) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h2 className="font-bold text-lg text-slate-900">Tarix</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="h-full overflow-y-auto pb-20">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Clock className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-sm">Tarix bo'sh</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-3">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    className={`
                    p-4 rounded-2xl border cursor-pointer transition-all
                    ${currentItemId === item.id
                                            ? 'border-blue-200 bg-blue-50'
                                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                        }
                  `}
                                    onClick={() => onSelectItem(item)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-slate-900 line-clamp-1">
                                                    {item.fileName || item.documentType}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {timeAgo(item.timestamp)}
                                                </p>
                                            </div>
                                        </div>

                                        {onDeleteItem && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteItem(item.id);
                                                }}
                                                className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Risk badge */}
                                    <div className="mt-3 flex items-center justify-between">
                                        <span
                                            className="px-2 py-1 rounded-lg text-xs font-semibold"
                                            style={{
                                                backgroundColor: `${getRiskColor(item.overallRisk)}20`,
                                                color: getRiskColor(item.overallRisk)
                                            }}
                                        >
                                            {translateRiskLevel(item.overallRisk)}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {item.riskScore}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
