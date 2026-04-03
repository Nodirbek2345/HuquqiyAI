import React, { useState } from 'react';
import { X, User, Mail, Phone, Briefcase, CheckCircle, Clock } from 'lucide-react';
import { STORAGE_KEYS } from '../../core/constants';

export interface PlatformUser {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    profession: string;
    status: 'pending' | 'approved' | 'rejected';
    registeredAt: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onRegistered: () => void;
}

const PROFESSIONS = [
    { value: 'yurist', label: 'Yurist' },
    { value: 'advokat', label: 'Advokat' },
    { value: 'notarius', label: 'Notarius' },
    { value: 'sudya', label: 'Sudya' },
    { value: 'tadbirkor', label: 'Tadbirkor' },
    { value: 'talaba', label: 'Talaba' },
    { value: 'boshqa', label: 'Boshqa' },
];

// localStorage'dan platform user olish
export function getPlatformUser(): PlatformUser | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.PLATFORM_USER);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}


export const UserRegistrationModal: React.FC<Props> = ({ isOpen, onClose, onRegistered }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [profession, setProfession] = useState('yurist');
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim() || !email.trim() || !phone.trim()) return;

        setSaving(true);
        try {
            const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
            const API_BASE_URL = isProd ? 'https://huquqiyai-1.onrender.com' : (import.meta.env.VITE_API_URL || '');
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), profession })
            });
            const data = await response.json();

            if (data.success && data.user) {
                // Joriy foydalanuvchini brauzerda saqlaymiz (qayta so'ramasligi uchun)
                localStorage.setItem(STORAGE_KEYS.PLATFORM_USER, JSON.stringify(data.user));
                setTimeout(() => {
                    setSaving(false);
                    onRegistered();
                }, 600);
            } else {
                alert("Xatolik yuz berdi: " + (data.message || "Ulanishda xato"));
                setSaving(false);
            }
        } catch (error) {
            alert("Baza bilan ulanishda xatolik yuz berdi.");
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-t-[32px] sm:rounded-[24px] shadow-2xl w-full max-w-md max-h-[92vh] sm:max-h-[85vh] overflow-y-auto relative flex flex-col animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-500 ease-out">
                {/* Header (Sticky Bottom Sheet Feel) */}
                <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-slate-100 rounded-t-[32px] sm:rounded-t-[24px]">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2 sm:hidden"></div>
                    <div className="px-6 py-4 sm:px-8 sm:py-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Ro'yxatdan o'tish</h3>
                            <p className="text-slate-500 text-[11px] sm:text-xs mt-1 font-medium">Platformadan foydalanish uchun ma'lumotlaringizni kiriting</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors p-2.5 rounded-full mt-[-8px] sm:mt-0 active:scale-90">
                            <X className="w-5 h-5 sm:w-4 sm:h-4" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 sm:space-y-6">
                    {/* F.I.SH */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-1">
                            <User className="w-3.5 h-3.5 inline mr-1.5 text-blue-500 -mt-0.5" />
                            To'liq ism
                        </label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="Masalan: Aziz Rahimov"
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3.5 sm:py-3 text-[15px] sm:text-sm outline-none transition-all shadow-sm font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-1">
                            <Mail className="w-3.5 h-3.5 inline mr-1.5 text-blue-500 -mt-0.5" />
                            Elektron pochta
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="aziz@email.com"
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3.5 sm:py-3 text-[15px] sm:text-sm outline-none transition-all shadow-sm font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
                        />
                    </div>

                    {/* Telefon */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-1">
                            <Phone className="w-3.5 h-3.5 inline mr-1.5 text-blue-500 -mt-0.5" />
                            Telefon raqam
                        </label>
                        <div className="relative">
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={e => setPhone(e.target.value.replace(/[^\d+\s()-]/g, ''))}
                                placeholder="+998 90 123 45 67"
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3.5 sm:py-3 text-[15px] sm:text-sm outline-none transition-all shadow-sm font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium tracking-wide"
                            />
                        </div>
                    </div>

                    {/* Kasb */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-1">
                            <Briefcase className="w-3.5 h-3.5 inline mr-1.5 text-blue-500 -mt-0.5" />
                            Faoliyat turi
                        </label>
                        <div className="relative">
                            <select
                                value={profession}
                                onChange={e => setProfession(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-3.5 sm:py-3 text-[15px] sm:text-sm outline-none transition-all shadow-sm font-bold text-slate-900 appearance-none cursor-pointer"
                            >
                                {PROFESSIONS.map(p => (
                                    <option key={p.value} value={p.value} className="font-medium text-slate-700">{p.label}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-4 flex items-start gap-3 mt-8">
                        <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0 animate-pulse" />
                        <p className="text-[11px] sm:text-xs text-amber-800/80 font-medium leading-[1.6]">
                            Ro'yxatdan o'tganingizdan so'ng, <strong className="text-amber-900">admin tasdiqlashi</strong> talab etiladi. Muvaffaqiyatli tasdiqlangach to'liq kirish huquqiga ega bo'lasiz.
                        </p>
                    </div>

                    {/* Submit Actions */}
                    <div className="flex flex-row justify-between gap-3 pt-4 sm:pt-6 pb-4 sm:pb-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-100 text-slate-600 font-bold text-sm py-3.5 sm:py-3 rounded-2xl hover:bg-slate-200 transition-all text-center active:scale-95"
                        >
                            Orqaga
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !fullName.trim() || !email.trim() || !phone.trim()}
                            className={`flex-[2] font-black text-[14px] py-3.5 sm:py-3 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 duration-200 ${(saving || !fullName.trim() || !email.trim() || !phone.trim())
                                ? 'bg-slate-200/80 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                                : 'bg-red-600 text-white shadow-[0_8px_16px_-6px_rgba(220,38,38,0.5)] hover:shadow-[0_12px_20px_-6px_rgba(220,38,38,0.6)] hover:-translate-y-0.5'
                                }`}
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                            {saving ? 'Kuting...' : "Ro'yxatdan o'tish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
