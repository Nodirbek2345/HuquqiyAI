import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { adminLogin } from '../../services/adminApi';

interface AdminAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AdminAccessModal: React.FC<AdminAccessModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLogin('');
            setPassword('');
            setError('');
            setShake(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await adminLogin(login, password);
            if (response.success) {
                onSuccess();
            } else {
                setError("Login yoki parol noto'g'ri");
                setShake(true);
                setTimeout(() => setShake(false), 500);
            }
        } catch (err: any) {
            setError(err.message || "Login yoki parol noto'g'ri");
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-end p-4 sm:p-6 pointer-events-none">
            {/* Backdrop with blur - faqat modal orqasi emas, balki butun ekran, lekin bosganda yopilishi uchun */}
            <div
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] transition-opacity pointer-events-auto"
                onClick={onClose}
            />

            {/* Modal Card - Compact & Top-Right */}
            <div className={`relative w-full max-w-[320px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden transform transition-all duration-300 pointer-events-auto mt-16 border border-white/50 ${shake ? 'animate-in shake' : 'scale-100'}`}>

                {/* Header */}
                <div className="bg-slate-50/80 border-b border-slate-100 p-4 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-center justify-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Admin Kirish</h2>
                            <p className="text-[10px] text-slate-500 font-medium">Xavfsiz hudud</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5">
                    {error && (
                        <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-100 flex items-center gap-2 text-rose-600 text-[10px] font-bold animate-in slide-in-from-top-1">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Login ID</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Shield className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={login}
                                    onChange={(e) => setLogin(e.target.value)}
                                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="admin"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Parol</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-10 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    KIRISH <ArrowRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="bg-slate-50/50 p-3 text-center border-t border-slate-100">
                    <p className="text-[9px] text-slate-400 font-medium tracking-wide">Tizim xavfsizligi ta'minlangan</p>
                </div>
            </div>
        </div>
    );
};

