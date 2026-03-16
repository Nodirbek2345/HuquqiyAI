import React, { useState, useEffect } from 'react';
import { Shield, Lock, Globe, AlertTriangle, CloudRain, Save, Loader2 } from 'lucide-react';
import { getSystemSettings, updateSystemSettings, type AppSettings } from '../../services/adminApi';

export const SecurityControl: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [backupStatus, setBackupStatus] = useState<string>('Oxirgi nusxa: Bugun, 04:00 da');
    const [takingBackup, setTakingBackup] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await getSystemSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            await updateSystemSettings(settings);
            alert("✅ Xavfsizlik sozlamalari saqlandi!");
        } catch (error) {
            alert("❌ Xatolik yuz berdi");
        } finally {
            setSaving(false);
        }
    };

    const handleBackup = () => {
        setTakingBackup(true);
        // Simulate backup process
        setTimeout(() => {
            setTakingBackup(false);
            const now = new Date();
            setBackupStatus(`Oxirgi nusxa: Bugun, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} da`);
            alert("✅ Tizimning to'liq zaxira nusxasi muvaffaqiyatli olindi!");
        }, 2000);
    };

    if (loading || !settings) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Info */}
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl flex items-start gap-4">
                <Shield className="w-6 h-6 text-emerald-600 mt-1" />
                <div>
                    <h3 className="text-lg font-bold text-emerald-900">Xavfsizlik Siyosati (Faol)</h3>
                    <p className="text-sm text-emerald-700 mt-1 max-w-2xl">
                        Tizim ISO 27001 standarti asosida himoyalangan. Barcha o'zgarishlar maxsus shifrlangan loglarda saqlanadi.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Access Control */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <Lock className="w-5 h-5 text-slate-400" />
                        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">Kirish Settings</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-900">Ikki Bosqichli Kirish (2FA)</p>
                                <p className="text-xs text-slate-500">SMS yoki Authenticator orqali</p>
                            </div>
                            <div
                                onClick={() => setSettings({ ...settings, twoFactorEnabled: !settings.twoFactorEnabled })}
                                className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer ${settings.twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                                <span className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ${settings.twoFactorEnabled ? 'left-6' : 'left-1'}`}></span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-900">Sessiya muddati</p>
                                <p className="text-xs text-slate-500">Avtomatik chiqish vaqti</p>
                            </div>
                            <select
                                value={settings.sessionDuration || '15 daqiqa'}
                                onChange={(e) => setSettings({ ...settings, sessionDuration: e.target.value })}
                                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option>15 daqiqa</option>
                                <option>30 daqiqa</option>
                                <option>1 soat</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-900">Parol murakkabligi</p>
                                <p className="text-xs text-slate-500">Kamida 12 ta belgi, maxsus belgilar</p>
                            </div>
                            <div className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">YUQORI</div>
                        </div>
                    </div>
                </div>

                {/* IP & Network */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <Globe className="w-5 h-5 text-slate-400" />
                        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">Tarmoq Xavfsizligi</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-2">Ruxsat etilgan IP manzillar (Whitelist)</p>
                            <textarea
                                value={settings.whitelistedIps || ''}
                                onChange={(e) => setSettings({ ...settings, whitelistedIps: e.target.value })}
                                className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none"
                            ></textarea>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-xs">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span>VPN orqali kirish faqat Adminlar uchun ruxsat etilgan.</span>
                        </div>
                    </div>
                </div>

                {/* Data Backup */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 lg:col-span-2">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <CloudRain className="w-5 h-5 text-slate-400" />
                        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">Ma'lumotlarni Saqlash</h3>
                    </div>

                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-medium text-slate-900">Avtomatik Rezerv Nusxa (Backup)</p>
                            <p className="text-xs text-slate-500">{backupStatus}</p>
                        </div>
                        <button
                            onClick={handleBackup}
                            disabled={takingBackup}
                            className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-70 disabled:cursor-wait"
                        >
                            {takingBackup ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudRain className="w-4 h-4" />}
                            {takingBackup ? 'Nusxalanmoqda...' : 'Hozir Nusxa Olish'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all shadow-xl disabled:opacity-70 disabled:cursor-wait"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saqlanmoqda...' : 'O\'zgarishlarni Saqlash'}
                </button>
            </div>
        </div>
    );
};
