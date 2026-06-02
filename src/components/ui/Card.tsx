// AdolatAI - Card komponenti

import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
    onClick?: () => void;
}

const paddingStyles: Record<string, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
};

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'md',
    hover = false,
    onClick
}) => {
    return (
        <div
            className={`
        bg-white rounded-2xl border border-slate-100 shadow-sm
        ${paddingStyles[padding]}
        ${hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

interface CardHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
    title,
    subtitle,
    icon,
    action
}) => {
    return (
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        {icon}
                    </div>
                )}
                <div>
                    <h3 className="font-bold text-slate-900">{title}</h3>
                    {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
                </div>
            </div>
            {action}
        </div>
    );
};

export default Card;
