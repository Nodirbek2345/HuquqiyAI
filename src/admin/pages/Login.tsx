import React, { useState } from 'react';
import { Shield, Lock, AlertCircle, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { adminLogin } from '../../services/adminApi';

interface LoginProps {
    onLogin: () => void;
}

export const AdminLogin: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await adminLogin(email, password);
            if (response.success) {
                onLogin();
            } else {
                setError("Noto'g'ri login yoki parol");
            }
        } catch (err: any) {
            setError(err.message || "Noto'g'ri login yoki parol");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans relative">
            {/* Back to Home Button */}
            <a href="/" className="absolute top-8 left-8 p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-all group backdrop-blur-sm border border-white/5 hover:border-white/10" title="Asosiy sahifaga qaytish">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </a>

            <div className="w-full max-w-md">
                {/* Brand */}
                <div className="text-center mb-10">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-2xl shadow-blue-900/50 mb-6">
                        <Shield className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Adolat<span className="text-blue-500">AI</span></h1>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="px-8 py-10">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-slate-400" />
                            Tizimga kirish
                        </h2>

                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-100 flex items-start gap-3 text-rose-600 text-sm font-medium animate-pulse">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Login ID</label>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900"
                                    placeholder="admin"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parol</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-11 pl-4 pr-11 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        TIZIMGA KIRISH <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                    <div className="bg-slate-50 px-8 py-4 text-center border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 font-medium">
                            &copy; 2026 AdolatAI. Maxfiy va himoyalangan tizim.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
