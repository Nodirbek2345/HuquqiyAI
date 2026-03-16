// @ts-nocheck
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false });
        window.location.reload();
    };

    private handleGoHome = () => {
        this.setState({ hasError: false });
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
                    <div className="max-w-md w-full bg-white rounded-[48px] shadow-2xl border border-rose-100 p-12 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-rose-50 rounded-[32px] flex items-center justify-center mx-auto text-rose-600 shadow-inner">
                            <AlertTriangle className="w-12 h-12" />
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Xatolik yuz berdi</h1>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Kechirasiz, dasturda kutilmagan xatolik yuz berdi. Iltimos, sahifani yangilang yoki asosiy sahifaga qayting.
                            </p>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-slate-50 p-4 rounded-2xl text-left overflow-auto max-h-40 border border-slate-100">
                                <p className="text-[10px] font-mono text-rose-600 break-words">{this.state.error.toString()}</p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                            >
                                <RefreshCw className="w-4 h-4" /> Sahifani yangilash
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="w-full py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 flex items-center justify-center gap-3 active:scale-95 transition-all"
                            >
                                <Home className="w-4 h-4" /> Bosh sahifaga qaytish
                            </button>
                        </div>

                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AdolatAI — Xatoliklarni boshqarish tizimi</p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
