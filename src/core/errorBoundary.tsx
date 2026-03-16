// AdolatAI - Error Boundary komponenti

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import logger from './logger';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.error('ErrorBoundary caught an error:', { error, errorInfo });
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
                        <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-rose-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            Xatolik yuz berdi
                        </h2>

                        <p className="text-slate-500 mb-6">
                            Dasturda kutilmagan xatolik yuz berdi. Iltimos sahifani yangilang yoki keyinroq urinib ko'ring.
                        </p>

                        {this.state.error && (
                            <div className="bg-slate-100 rounded-xl p-4 mb-6 text-left">
                                <code className="text-xs text-slate-600 break-all">
                                    {this.state.error.message}
                                </code>
                            </div>
                        )}

                        <button
                            onClick={this.handleReset}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Sahifani yangilash
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
