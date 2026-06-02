import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye, Edit3, Trash2, Download, ShieldCheck } from 'lucide-react';

interface ActionItem {
    label: string;
    icon: any;
    onClick: () => void;
    variant?: 'default' | 'danger' | 'success';
}

interface TableRowActionsProps {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    extraActions?: ActionItem[];
}

export const TableRowActions: React.FC<TableRowActionsProps> = ({ onView, onEdit, onDelete, extraActions = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex items-center justify-end gap-1 relative" ref={menuRef}>
            {onView && (
                <button
                    onClick={(e) => { e.stopPropagation(); onView(); }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-90"
                    title="Ko'rish"
                >
                    <Eye className="w-4 h-4" />
                </button>
            )}
            {onEdit && (
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all active:scale-90"
                    title="Tahrirlash"
                >
                    <Edit3 className="w-4 h-4" />
                </button>
            )}

            <div className="relative">
                <button
                    onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                    className={`p-2 rounded-lg transition-all active:scale-90 ${isOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}
                    title="Boshqa amallar"
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                        {extraActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setIsOpen(false); action.onClick(); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 ${action.variant === 'danger' ? 'text-rose-600' :
                                        action.variant === 'success' ? 'text-emerald-600' : 'text-slate-600'
                                    }`}
                            >
                                <action.icon className="w-4 h-4" />
                                <span className="font-medium">{action.label}</span>
                            </button>
                        ))}

                        {onDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDelete(); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 mt-1"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="font-bold uppercase tracking-wider text-[10px]">O'chirish</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
