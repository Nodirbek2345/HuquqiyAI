// AdolatAI - Button komponenti

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-100',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100'
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-base rounded-xl',
    lg: 'px-7 py-3.5 text-lg rounded-2xl'
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
}) => {
    return (
        <button
            className={`
        inline-flex items-center justify-center gap-2
        font-semibold transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            ) : icon ? (
                icon
            ) : null}
            {children}
        </button>
    );
};

export default Button;
