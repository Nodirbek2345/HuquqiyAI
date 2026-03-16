import React from 'react';

/**
 * Premium Gradient Card
 * Glassmorphism effect with subtle gradient border and shadow
 */
export const GradientCard = ({
    children,
    className = "",
    title,
    icon: Icon,
    rightContent
}: {
    children: React.ReactNode;
    className?: string;
    title?: string;
    icon?: any;
    rightContent?: React.ReactNode;
}) => (
    <div className={`bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-[32px] overflow-hidden transition-all hover:shadow-2xl hover:bg-white/90 ${className}`}>
        {(title || Icon) && (
            <div className="px-8 py-6 border-b border-slate-100/50 flex justify-between items-center bg-gradient-to-r from-white/50 to-transparent">
                <div className="flex items-center gap-4">
                    {Icon && (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-600 shadow-inner">
                            <Icon className="w-6 h-6" />
                        </div>
                    )}
                    {title && <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>}
                </div>
                {rightContent}
            </div>
        )}
        <div className="p-10">
            {children}
        </div>
    </div>
);

/**
 * Premium Status Badge
 * Glow effect with refined colors
 */
export const StatusBadge = ({
    children,
    variant = 'default',
    className = ""
}: {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'premium';
    className?: string;
}) => {
    const variants = {
        default: 'bg-slate-100 text-slate-600 border-slate-200',
        success: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/10',
        warning: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/10',
        danger: 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-500/10',
        info: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-500/10',
        premium: 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-500/10'
    };

    return (
        <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

/**
 * Circular Score Gauge
 * Visualizes a score from 0-100
 */
export const ScoreGauge = ({
    score,
    label,
    size = 'md',
    color = 'blue'
}: {
    score: number;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo';
}) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const sizeClasses = {
        sm: 'w-24 h-24',
        md: 'w-32 h-32',
        lg: 'w-48 h-48'
    };

    const colorClasses = {
        blue: 'text-blue-500',
        emerald: 'text-emerald-500',
        amber: 'text-amber-500',
        rose: 'text-rose-500',
        indigo: 'text-indigo-500'
    };

    return (
        <div className="flex flex-col items-center">
            <div className={`relative flex flex-col items-center justify-center ${sizeClasses[size]}`}>
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        className="text-slate-100"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="50%"
                        cy="50%"
                    />
                    <circle
                        className={`${colorClasses[color]} transition-all duration-1000 ease-out`}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="50%"
                        cy="50%"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-slate-800">{score}</span>
                </div>
            </div>
            {label && <span className="text-sm uppercase font-bold text-slate-400 tracking-wider mt-2">{label}</span>}
        </div>
    );
};

/**
 * Section Label
 * Small uppercase label for sections
 */
export const SectionLabel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-3 ${className}`}>
        {children}
        <div className="h-px bg-slate-100 flex-grow"></div>
    </div>
);
