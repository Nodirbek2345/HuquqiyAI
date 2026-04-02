import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, RefreshCw, Save, ShieldAlert, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { getSystemSettings, updateSystemSettings, type AppSettings } from '../../services/adminApi';

const TempSlider = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => {
    const [local, setLocal] = useState(value);
    useEffect(() => { setLocal(value); }, [value]);

    return (
        <div className="flex items-center gap-4 w-full">
            <input
                type="range"
                min="0"
                max="100"
                value={local * 100}
                onChange={(e) => setLocal(parseInt(e.target.value) / 100)}
                onMouseUp={() => onChange(local)}
                onTouchEnd={() => onChange(local)}
                className="w-full h-2 flex-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="font-mono text-sm font-bold bg-slate-100 px-2 py-1 rounded min-w-[3rem] text-center">
                {local.toFixed(1)}
            </span>
        </div>
    );
};

export const AIControlCenter: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings>({
        geminiEnabled: true,
        groqEnabled: true,
        openaiEnabled: false,
        temperature: 0.1,
        maxTokens: '4,096 (Standart)'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        loadSettings();
    }, []);

    // Auto-hide toast after 4 seconds
    useEffect(() => {
        if (saveStatus !== 'idle') {
            const timer = setTimeout(() => setSaveStatus('idle'), 4000);
            return () => clearTimeout(timer);
        }
    }, [saveStatus]);

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
        setSaving(true);
        setSaveStatus('idle');
        try {
            const updated = await updateSystemSettings(settings);
            setSettings(updated);
            setSaveStatus('success');
        } catch (error) {
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const toggleProvider = async (provider: 'gemini' | 'openai' | 'groq') => {
        const key = `${provider}Enabled` as keyof AppSettings;
        const newSettings = {
            ...settings,
            [key]: !settings[key]
        };
        setSettings(newSettings);

        // Darhol saqlash (auto-save)
        try {
            const updated = await updateSystemSettings(newSettings);
            setSettings(updated);
            setSaveStatus('success');
        } catch {
            setSaveStatus('error');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Save Status Toast */}
            {saveStatus !== 'idle' && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-[slideIn_0.3s_ease-out] ${saveStatus === 'success'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                    }`}
                    style={{ animation: 'slideIn 0.3s ease-out' }}
                >
                    {saveStatus === 'success' ? (
                        <>
                            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-sm">Sozlamalar saqlandi!</p>
                                <p className="text-xs opacity-80">O'zgarishlar darhol kuchga kirdi.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-6 h-6 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-sm">Xatolik yuz berdi</p>
                                <p className="text-xs opacity-80">Iltimos qayta urinib ko'ring.</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Header Info */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex items-start gap-4">
                <ShieldAlert className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                    <h3 className="text-lg font-bold text-blue-900">AI Konfiguratsiyasi (Juda Muhim)</h3>
                    <p className="text-sm text-blue-700 mt-1 max-w-2xl">
                        Tizimning analitik qobiliyatini boshqarish paneli. Provayderni o'chirish darhol "fallback" (zaxira) tizimini ishga tushiradi.
                        Barcha o'zgarishlar Audit jurnalida qayd etiladi.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Provider Controls */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Faol Provayderlar</h3>
                        <button
                            onClick={loadSettings}
                            className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                        >
                            <RefreshCw className="w-3 h-3" /> Statusni Yangilash
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Gemini */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${settings.geminiEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Google Gemini 2.0 Flash</h4>
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">Asosiy • Kechikish: 450ms</p>
                                </div>
                            </div>
                            <button onClick={() => toggleProvider('gemini')} className="text-slate-400 hover:text-blue-600 transition-colors">
                                {settings.geminiEnabled ? <ToggleRight className="w-8 h-8 text-blue-600" /> : <ToggleLeft className="w-8 h-8" />}
                            </button>
                        </div>

                        {/* Groq (Llama) */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${settings.groqEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Groq (Llama 3.3 70B)</h4>
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">Tezkor • Kechikish: 250ms</p>
                                </div>
                            </div>
                            <button onClick={() => toggleProvider('groq')} className="text-slate-400 hover:text-blue-600 transition-colors">
                                {settings.groqEnabled ? <ToggleRight className="w-8 h-8 text-blue-600" /> : <ToggleLeft className="w-8 h-8" />}
                            </button>
                        </div>

                        {/* OpenAI */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${settings.openaiEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                <div>
                                    <h4 className="font-bold text-slate-900">OpenAI GPT-4o</h4>
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">Ikkilamchi Zaxira • Kechikish: 800ms</p>
                                </div>
                            </div>
                            <button onClick={() => toggleProvider('openai')} className="text-slate-400 hover:text-blue-600 transition-colors">
                                {settings.openaiEnabled ? <ToggleRight className="w-8 h-8 text-blue-600" /> : <ToggleLeft className="w-8 h-8" />}
                            </button>
                        </div>

                        {/* Local Rules */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Mahalliy Qoidalar (Local Rules)</h4>
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">Zaxira • Offline Rejim</p>
                                </div>
                            </div>
                            <button disabled className="opacity-50 cursor-not-allowed">
                                <ToggleRight className="w-8 h-8 text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Configuration & Thresholds */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Model Parametrlari</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Temperature (Kreativlik)</label>
                            <TempSlider
                                value={settings.temperature}
                                onChange={(val) => setSettings({ ...settings, temperature: val })}
                            />
                            <p className="text-xs text-slate-400 mt-1">Huquqiy tahlil uchun past qiymat (0.1) tavsiya etiladi.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Maksimal Tokenlar</label>
                            <select
                                value={settings.maxTokens}
                                onChange={(e) => setSettings({ ...settings, maxTokens: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 font-medium"
                            >
                                <option>4,096 (Standart)</option>
                                <option>8,192 (Yuqori)</option>
                                <option>32,768 (Katta Kontekst)</option>
                            </select>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 active:scale-95 transform duration-150 disabled:opacity-70 disabled:cursor-wait"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Saqlanmoqda...' : 'Sozlamalarni Saqlash'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
