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
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
            <div className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Ro'yxatdan o'tish</h3>
                        <p className="text-slate-500 text-xs mt-1 font-medium">Platformadan foydalanish uchun ma'lumotlaringizni kiriting</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 shadow-sm transition-colors p-2 rounded-full border border-slate-200/50">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {/* F.I.SH */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            <User className="w-3.5 h-3.5 inline mr-1.5 text-slate-400 -mt-0.5" />
                            F.I.SH (To'liq ism)
                        </label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="Masalan: Aziz Rahimov"
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm font-medium text-slate-900"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            <Mail className="w-3.5 h-3.5 inline mr-1.5 text-slate-400 -mt-0.5" />
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="aziz@email.com"
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm font-medium text-slate-900"
                        />
                    </div>

                    {/* Telefon */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            <Phone className="w-3.5 h-3.5 inline mr-1.5 text-slate-400 -mt-0.5" />
                            Telefon raqam
                        </label>
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="+998 90 123 45 67"
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm font-medium text-slate-900"
                        />
                    </div>

                    {/* Kasb */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            <Briefcase className="w-3.5 h-3.5 inline mr-1.5 text-slate-400 -mt-0.5" />
                            Kasb / Faoliyat turi
                        </label>
                        <select
                            value={profession}
                            onChange={e => setProfession(e.target.value)}
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm font-medium text-slate-900 cursor-pointer"
                        >
                            {PROFESSIONS.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Info */}
                    <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 flex items-start gap-3">
                        <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700/80 font-medium leading-relaxed">
                            Ro'yxatdan o'tganingizdan so'ng, <strong>admin tasdiqlashi</strong> kerak bo'ladi. Tasdiqlanganingizdan keyin platformadan foydalanishingiz mumkin.
                        </p>
                    </div>

                    {/* Submit Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-1/3 bg-white border border-slate-200 text-slate-600 font-bold text-sm py-3 rounded-xl hover:bg-slate-50 transition-all text-center shadow-sm"
                        >
                            Orqaga
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !fullName.trim() || !email.trim() || !phone.trim()}
                            className={`w-2/3 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${(saving || !fullName.trim() || !email.trim() || !phone.trim())
                                ? 'bg-slate-200 text-slate-500 shadow-none cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5'
                                }`}
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4" />
                            )}
                            {saving ? 'Saqlanmoqda...' : "Ro'yxatdan o'tish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
