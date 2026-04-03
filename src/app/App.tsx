// AdolatAI - Yangi strukturadagi asosiy App

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Shield, BrainCircuit, FileSearch, Zap, FileX, FilePlus, History as HistoryIcon, Info } from 'lucide-react';

// Yangi struktura importlari
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
const AdminApp = lazy(() => import('../admin/AdminApp').then(m => ({ default: m.AdminApp })));

// Shared komponentlar (eski)
import DisclaimerModal from '../components/shared/DisclaimerModal';
import UploadSection from '../components/shared/UploadSection';
import ResultsDashboard from '../components/shared/ResultsDashboard';
import HistorySidebar from '../components/shared/HistorySidebar';
import LegalDocs, { LegalDocType } from '../components/shared/LegalDocs';
import FeatureInfoModal from '../components/shared/FeatureInfoModal';
import { AdminAccessModal } from '../components/shared/AdminAccessModal';
import ErrorBoundary from '../components/shared/ErrorBoundary';
import { UserRegistrationModal, getPlatformUser } from '../components/shared/UserRegistrationModal';

// Types va services
import { AnalysisResult, AppStep, AnalysisMode } from '../types';
import { analyzeDocument } from '../services/ai/aiService';

// Constants
import { ANALYSIS_STEPS, STORAGE_KEYS } from '../core/constants';

const App: React.FC = () => {
    // Admin panel: pathname /admin yoki hash #admin bo'lsa
    const isAdminPath = () =>
        window.location.pathname === '/admin' || window.location.hash === '#admin';
    const [isAdminMode, setIsAdminMode] = useState(isAdminPath());
    const [showAdminLogin, setShowAdminLogin] = useState(false);

    // Hash yoki pathname o'zgarganda admin rejimini yangilash (Kirish tugmasi uchun)
    useEffect(() => {
        const check = () => setIsAdminMode(isAdminPath());
        window.addEventListener('hashchange', check);
        window.addEventListener('popstate', check);
        return () => {
            window.removeEventListener('hashchange', check);
            window.removeEventListener('popstate', check);
        };
    }, []);

    const [currentStep, setCurrentStep] = useState<AppStep>('landing');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [analyzedText, setAnalyzedText] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('quick');
    const [history, setHistory] = useState<AnalysisResult[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>(null);
    const [showFeatureInfo, setShowFeatureInfo] = useState<boolean>(false);
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState('');
    const [showRegistration, setShowRegistration] = useState(false);
    const [pendingMode, setPendingMode] = useState<AnalysisMode | null>(null);
    const [showPendingAlert, setShowPendingAlert] = useState(false);
    const [showRejectedAlert, setShowRejectedAlert] = useState(false);

    // LocalStorage dan tarix yuklash
    useEffect(() => {
        const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Tarixni yuklashda xato", e);
            }
        }
    }, []);

    // Tarixni saqlash
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }, [history]);

    // Sahifa yuqorisiga scroll
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentStep]);

    // Progress simulatsiya
    useEffect(() => {
        if (currentStep === 'analyzing') {
            setProgress(0);
            const modeKey = analysisMode === 'kazus' ? 'kazus'
                : analysisMode === 'rejected' ? 'rejected'
                    : analysisMode === 'template' ? 'template'
                        : 'quick';

            const currentLabels = ANALYSIS_STEPS[modeKey] || ANALYSIS_STEPS.quick;

            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 95) return prev;
                    const next = prev + Math.floor(Math.random() * 5) + 2;
                    const labelIdx = Math.min(Math.floor(next / 20), currentLabels.length - 1);
                    setProgressLabel(currentLabels[labelIdx]);
                    return next;
                });
            }, 300);

            return () => clearInterval(interval);
        }
    }, [currentStep, analysisMode]);

    // Admin mode bo'lsa AdminApp (barcha hook'lar yuqorida chaqirilgan bo'lishi kerak)
    if (isAdminMode) {
        return (
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Yuklanmoqda...</p>
                    </div>
                </div>
            }>
                <AdminApp />
            </Suspense>
        );
    }

    const startFlow = (mode: AnalysisMode) => {
        // 1) Tekshirish: foydalanuvchi ro'yxatdan o'tganmi?
        const user = getPlatformUser();
        if (!user) {
            setPendingMode(mode);
            setShowRegistration(true);
            return;
        }
        // 2) Tasdiqlangan mi?
        if (user.status === 'rejected') {
            setShowRejectedAlert(true);
            return;
        }
        if (user.status === 'pending') {
            setShowPendingAlert(true);
            return;
        }
        // 3) Tasdiqlangan — davom etish
        setAnalysisMode(mode);
        setCurrentStep('disclaimer');
    };

    const handleRegistered = () => {
        setShowRegistration(false);
        setShowPendingAlert(true);
    };

    const openInfo = (mode: AnalysisMode) => {
        setAnalysisMode(mode);
        setShowFeatureInfo(true);
    };

    const handleAnalyze = async (text: string, fileName?: string) => {
        setLoading(true);
        setCurrentStep('analyzing');
        setError(null);
        setAnalyzedText(text);
        try {
            const result = await analyzeDocument(text, analysisMode);
            if (fileName) {
                result.fileName = fileName;
            }
            setProgress(100);
            setTimeout(() => {
                setAnalysisResult(result);
                setHistory(prev => [result, ...prev]);
                setCurrentStep('results');
            }, 500);
        } catch (err: any) {
            console.error("Analysis Error:", err);
            setError(err.message || "Tahlil jarayonida xatolik yuz berdi");
            setCurrentStep('upload');
        } finally {
            setLoading(false);
        }
    };

    const updateHistoryItem = (updatedItem: AnalysisResult) => {
        setHistory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        setAnalysisResult(updatedItem);
    };

    const handleSelectHistory = (item: AnalysisResult) => {
        setAnalysisResult(item);
        setAnalyzedText('');
        setCurrentStep('results');
        setIsHistoryOpen(false);
    };

    const resetApp = () => {
        setAnalysisResult(null);
        setAnalyzedText('');
        setCurrentStep('upload');
        setError(null);
        setProgress(0);
    };

    const getBrandColor = () => {
        switch (analysisMode) {
            case 'rejected': return 'bg-rose-600';
            case 'kazus': return 'bg-indigo-600';
            case 'template': return 'bg-emerald-600';
            default: return 'bg-blue-600';
        }
    };

    const getTextColor = () => {
        switch (analysisMode) {
            case 'rejected': return 'text-rose-600';
            case 'kazus': return 'text-indigo-600';
            case 'template': return 'text-emerald-600';
            default: return 'text-blue-600';
        }
    };

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900 overflow-x-hidden">
                <LegalDocs type={activeLegalDoc} onClose={() => setActiveLegalDoc(null)} />
                {showFeatureInfo && (
                    <FeatureInfoModal mode={analysisMode} onCancel={() => setShowFeatureInfo(false)} />
                )}

                {/* Ro'yxatdan o'tish modali */}
                <UserRegistrationModal
                    isOpen={showRegistration}
                    onClose={() => setShowRegistration(false)}
                    onRegistered={handleRegistered}
                />

                {/* Kutilmoqda xabari */}
                {showPendingAlert && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in fade-in zoom-in duration-200">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Kutilmoqda</h3>
                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                Sizning so'rovingiz qabul qilindi. <strong>Admin tasdiqlashi</strong>ni kutib turing. Tasdiqlanganingizdan keyin platformadan foydalanishingiz mumkin.
                            </p>
                            <button
                                onClick={() => setShowPendingAlert(false)}
                                className="w-full bg-slate-900 text-white font-bold text-sm py-3 rounded-lg hover:bg-slate-800 transition-all"
                            >
                                Tushundim
                            </button>
                        </div>
                    </div>
                )}

                {/* Rad etilgan xabari */}
                {showRejectedAlert && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in fade-in zoom-in duration-200">
                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Ruxsat berilmagan</h3>
                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                Afsuski, admin sizning so'rovingizni <strong>rad etdi</strong>. Iltimos, admin bilan bog'laning.
                            </p>
                            <button
                                onClick={() => setShowRejectedAlert(false)}
                                className="w-full bg-slate-900 text-white font-bold text-sm py-3 rounded-lg hover:bg-slate-800 transition-all"
                            >
                                Yopish
                            </button>
                        </div>
                    </div>
                )}

                <HistorySidebar
                    isOpen={isHistoryOpen}
                    onClose={() => setIsHistoryOpen(false)}
                    history={history}
                    onSelectHistory={handleSelectHistory}
                    currentResultId={analysisResult?.id}
                />

                {/* Header (Visible ONLY on Landing) */}
                {currentStep === 'landing' && (
                    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 no-print">
                        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                            <div
                                className="flex items-center gap-2 cursor-pointer group select-none"
                                onClick={() => setCurrentStep('landing')}
                                onDoubleClick={() => setShowAdminLogin(true)}
                                title="Admin panelga kirish uchun ikki marta bosing"
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:rotate-12 ${getBrandColor()}`}>
                                    <Shield className="w-5 h-5" />
                                </div>
                                <span className="text-xl font-black tracking-tight text-slate-900 uppercase">Adolat<span className={getTextColor()}>AI</span></span>
                            </div>

                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setIsHistoryOpen(true)}
                                    className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest"
                                >
                                    <HistoryIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">Tarix</span>
                                </button>
                            </div>
                        </div>
                    </header>
                )}

                {/* Standalone History Button (For Inner Pages) */}
                {currentStep !== 'landing' && (
                    <div className="absolute top-6 right-6 z-50 no-print">
                        <button
                            onClick={() => setIsHistoryOpen(true)}
                            className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white shadow-sm"
                        >
                            <HistoryIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Tarix</span>
                        </button>
                    </div>
                )}

                <main className="flex-grow flex flex-col">
                    {/* Landing */}
                    {currentStep === 'landing' && (
                        <div className="flex-grow flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-20">
                            <div className="max-w-7xl mx-auto w-full space-y-10 sm:space-y-16">
                                <div className="text-center space-y-5 sm:space-y-6 mt-4 sm:mt-0" onDoubleClick={() => setShowAdminLogin(true)} title="Admin kirish (Double Click)">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-full bg-blue-50/80 border border-blue-100 shadow-sm shadow-blue-100/40 text-blue-600 text-[11px] sm:text-[13px] font-bold animate-in fade-in slide-in-from-top-4 duration-700">
                                        <Zap className="w-3 h-3 sm:w-4 sm:h-4 fill-blue-600/10" />
                                        <span>Yuridik ishingizga yordamchi AI</span>
                                    </div>

                                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 px-2 sm:px-0 break-words hyphens-auto">
                                        Yuridik ishingizni <br className="hidden sm:block" />
                                        <span className="text-blue-600">to'liq avtomatlashtiring</span>
                                    </h1>

                                    <p className="text-sm sm:text-lg text-slate-500 max-w-3xl mx-auto font-medium animate-in fade-in duration-1000 delay-300 px-4 sm:px-0">
                                        AdolatAI hujjatlarni tahlil qiladi, kazuslarni yechadi va professional shablonlarni noldan yaratib beradi.
                                    </p>
                                </div>

                                {/* Feature Cards: 2x2 grid on mobile, 4 in a row on desktop */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 animate-in fade-in zoom-in-95 duration-1000 delay-500 w-full max-w-lg lg:max-w-none mx-auto">
                                    {/* Tahlil */}
                                    <div className="group relative">
                                        <button onClick={() => startFlow('quick')} className="w-full h-full flex flex-col items-center justify-center text-center p-5 sm:p-10 bg-white border border-slate-200 rounded-[28px] sm:rounded-[48px] shadow-lg sm:shadow-xl hover:shadow-blue-100/50 transition-all active:scale-[0.98] lg:hover:-translate-y-2 overflow-hidden">
                                            <div className="w-12 h-12 sm:w-20 sm:h-20 bg-blue-50 rounded-[18px] sm:rounded-[28px] flex items-center justify-center mb-3 sm:mb-6 lg:group-hover:scale-110 transition-transform duration-500">
                                                <Zap className="w-5 h-5 sm:w-8 sm:h-8 text-blue-600" />
                                            </div>
                                            <h3 className="text-sm sm:text-xl font-black text-slate-900 mb-1 sm:mb-2 uppercase">Tahlil</h3>
                                            <p className="text-slate-500 text-[9px] sm:text-xs font-medium leading-relaxed px-1">Shartnomalardagi yashirin xavflarni aniqlash</p>
                                        </button>
                                        <button onClick={() => openInfo('quick')} className="absolute top-3 right-3 sm:top-6 sm:right-6 p-1.5 sm:p-2 bg-slate-50/80 backdrop-blur-sm text-slate-400 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all z-10" title="Batafsil ma'lumot"><Info className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                                    </div>

                                    {/* Kazus */}
                                    <div className="group relative">
                                        <button onClick={() => startFlow('kazus')} className="w-full h-full flex flex-col items-center justify-center text-center p-5 sm:p-10 bg-white border border-slate-200 rounded-[28px] sm:rounded-[48px] shadow-lg sm:shadow-xl hover:shadow-indigo-100/50 transition-all active:scale-[0.98] lg:hover:-translate-y-2 overflow-hidden">
                                            <div className="w-12 h-12 sm:w-20 sm:h-20 bg-indigo-50 rounded-[18px] sm:rounded-[28px] flex items-center justify-center mb-3 sm:mb-6 lg:group-hover:scale-110 transition-transform duration-500">
                                                <BrainCircuit className="w-5 h-5 sm:w-8 sm:h-8 text-indigo-600" />
                                            </div>
                                            <h3 className="text-sm sm:text-xl font-black text-slate-900 mb-1 sm:mb-2 uppercase">Kazus</h3>
                                            <p className="text-slate-500 text-[9px] sm:text-xs font-medium leading-relaxed px-1">Murakkab huquqiy vaziyatlarga mantiqiy yechimlar</p>
                                        </button>
                                        <button onClick={() => openInfo('kazus')} className="absolute top-3 right-3 sm:top-6 sm:right-6 p-1.5 sm:p-2 bg-slate-50/80 backdrop-blur-sm text-slate-400 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-all z-10" title="Batafsil ma'lumot"><Info className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                                    </div>

                                    {/* Rad Etilgan */}
                                    <div className="group relative">
                                        <button onClick={() => startFlow('rejected')} className="w-full h-full flex flex-col items-center justify-center text-center p-5 sm:p-10 bg-white border border-slate-200 rounded-[28px] sm:rounded-[48px] shadow-lg sm:shadow-xl hover:shadow-rose-100/50 transition-all active:scale-[0.98] lg:hover:-translate-y-2 overflow-hidden">
                                            <div className="w-12 h-12 sm:w-20 sm:h-20 bg-rose-50 rounded-[18px] sm:rounded-[28px] flex items-center justify-center mb-3 sm:mb-6 lg:group-hover:scale-110 transition-transform duration-500">
                                                <FileX className="w-5 h-5 sm:w-8 sm:h-8 text-rose-600" />
                                            </div>
                                            <h3 className="text-sm sm:text-xl font-black text-slate-900 mb-1 sm:mb-2 uppercase mt-[-2px]">Rad Etilgan</h3>
                                            <p className="text-slate-500 text-[9px] sm:text-xs font-medium leading-relaxed px-1">Hujjat xatolarini diagnostika va to'g'rilash</p>
                                        </button>
                                        <button onClick={() => openInfo('rejected')} className="absolute top-3 right-3 sm:top-6 sm:right-6 p-1.5 sm:p-2 bg-slate-50/80 backdrop-blur-sm text-slate-400 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all z-10" title="Batafsil ma'lumot"><Info className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                                    </div>

                                    {/* Shablonlar */}
                                    <div className="group relative">
                                        <button onClick={() => startFlow('template')} className="w-full h-full flex flex-col items-center justify-center text-center p-5 sm:p-10 bg-white border border-slate-200 rounded-[28px] sm:rounded-[48px] shadow-lg sm:shadow-xl hover:shadow-emerald-100/50 transition-all active:scale-[0.98] lg:hover:-translate-y-2 overflow-hidden">
                                            <div className="w-12 h-12 sm:w-20 sm:h-20 bg-emerald-50 rounded-[18px] sm:rounded-[28px] flex items-center justify-center mb-3 sm:mb-6 lg:group-hover:scale-110 transition-transform duration-500">
                                                <FilePlus className="w-5 h-5 sm:w-8 sm:h-8 text-emerald-600" />
                                            </div>
                                            <h3 className="text-sm sm:text-xl font-black text-slate-900 mb-1 sm:mb-2 uppercase mt-[-2px]">Shablonlar</h3>
                                            <p className="text-slate-500 text-[9px] sm:text-xs font-medium leading-relaxed px-1">Professional hujjatlarni noldan yaratish</p>
                                        </button>
                                        <button onClick={() => openInfo('template')} className="absolute top-3 right-3 sm:top-6 sm:right-6 p-1.5 sm:p-2 bg-slate-50/80 backdrop-blur-sm text-slate-400 rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-all z-10" title="Batafsil ma'lumot"><Info className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Disclaimer */}
                    {currentStep === 'disclaimer' && (
                        <DisclaimerModal
                            mode={analysisMode}
                            onAccept={() => setCurrentStep('upload')}
                            onCancel={() => setCurrentStep('landing')}
                        />
                    )}

                    {/* Upload */}
                    {currentStep === 'upload' && (
                        <div className="flex-grow flex flex-col items-center justify-center px-6 py-12 sm:py-20">
                            <div className="w-full max-w-5xl">
                                {error && (
                                    <div className="bg-rose-50 text-rose-700 p-5 rounded-3xl mb-10 flex items-center gap-4 border border-rose-100 shadow-sm animate-in shake duration-500">
                                        <Shield className="w-6 h-6 flex-shrink-0" />
                                        <span className="font-black text-sm uppercase tracking-wide">{error}</span>
                                    </div>
                                )}
                                <UploadSection
                                    onAnalyze={handleAnalyze}
                                    onShowHistory={() => setIsHistoryOpen(true)}
                                    onBack={() => setCurrentStep('landing')}
                                    mode={analysisMode}
                                />
                            </div>
                        </div>
                    )}

                    {/* Analyzing */}
                    {currentStep === 'analyzing' && (
                        <div className="flex-grow flex flex-col items-center justify-center px-4">
                            <div className="flex flex-col items-center space-y-10 max-w-md w-full">
                                <div className={`w-28 h-28 rounded-[40px] flex items-center justify-center shadow-2xl animate-pulse ${getBrandColor()} text-white`}>
                                    <BrainCircuit className="w-14 h-14" />
                                </div>
                                <div className="text-center space-y-3">
                                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Ishlanmoqda...</h3>
                                    <p className="text-slate-400 font-bold uppercase tracking-[0.25em] text-[9px] min-h-[1rem]">{progressLabel}</p>
                                </div>

                                <div className="w-full space-y-3">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${getTextColor()}`}>
                                            {Math.floor(progress / 20) + 1} / 5 Bosqich
                                        </span>
                                        <span className="text-xl font-black text-slate-900">{progress}%</span>
                                    </div>
                                    <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                                        <div
                                            className={`h-full transition-all duration-300 ease-out rounded-full ${getBrandColor()}`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {currentStep === 'results' && analysisResult && (
                        <div className="px-6 py-12">
                            <ResultsDashboard
                                result={analysisResult}
                                onReset={resetApp}
                                onUpdateHistory={updateHistoryItem}
                                documentText={analyzedText}
                                mode={analysisMode}
                            />
                        </div>
                    )}
                </main>

                {/* Footer */}
                {/* Footer (Visible ONLY on Landing) */}
                {currentStep === 'landing' && (
                    <footer className="bg-white border-t border-slate-100 py-8 no-print">
                        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
                            <div>&copy; 2026 AdolatAI. Barcha huquqlar himoyalangan.</div>
                            <div className="flex gap-8">
                                <button onClick={() => setActiveLegalDoc('privacy')} className="hover:text-blue-600 transition-colors">Maxfiylik siyosati</button>
                                <button onClick={() => setActiveLegalDoc('terms')} className="hover:text-blue-600 transition-colors">Foydalanish shartlari</button>
                            </div>
                        </div>
                    </footer>
                )}

                {/* Admin Login Modal */}
                <AdminAccessModal
                    isOpen={showAdminLogin}
                    onClose={() => setShowAdminLogin(false)}
                    onSuccess={() => {
                        setShowAdminLogin(false);
                        setIsAdminMode(true);
                        window.location.hash = '#admin';
                        localStorage.setItem('adolat_admin_token', 'valid_session_2026');
                    }}
                />
            </div>
        </ErrorBoundary>
    );
};

export default App;
