import React, { useState, useEffect } from 'react';
import { FileX, AlertCircle, Wrench, ArrowRight, Loader2, RefreshCcw } from 'lucide-react';
import { getRejectedList } from '../../services/adminApi';

interface RejectedDoc {
    id: string;
    documentType: string;
    summary: string;
    issues: any[];
    recommendations: any[];
    documentText: string;
    createdAt: string;
}

export const RejectedMonitor: React.FC = () => {
    const [documents, setDocuments] = useState<RejectedDoc[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<RejectedDoc | null>(null);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Hech qachon';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Hech qachon';
        return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };
    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getRejectedList(1, 20);
            setDocuments(data.rejected);
            setTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch rejected documents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getReason = (doc: RejectedDoc) => {
        if (doc.issues && doc.issues.length > 0) {
            return typeof doc.issues[0] === 'string' ? doc.issues[0] : (doc.issues[0].description || doc.issues[0].text);
        }
        return "Hujjatda jiddiy qonunbuzilishlar aniqlangan";
    };

    const getRecommendation = (doc: RejectedDoc) => {
        if (doc.recommendations && doc.recommendations.length > 0) {
            return typeof doc.recommendations[0] === 'string' ? doc.recommendations[0] : (doc.recommendations[0].description || doc.recommendations[0].text);
        }
        return "Hujjatni qayta ko'rib chiqish tavsiya etiladi";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                    <FileX className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Rad etilgan hujjatlar yo'q</h3>
                <p className="text-slate-500">Ajoyib! Barcha hujjatlar qonunchilikka mos.</p>
                <button
                    onClick={fetchData}
                    className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                    <RefreshCcw className="w-4 h-4" /> Yangilash
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Rad Etilgan Hujjatlar Auditi</h3>
                    <p className="text-sm text-slate-500">Tizim tomonidan avtomatik ravishda xato deb topilgan va qaytarilgan barcha hujjatlar ro'yxati.</p>
                </div>
                <div className="bg-rose-50 text-rose-700 px-3 py-1 rounded-lg border border-rose-100 font-bold text-sm">
                    Jami: {total} ta
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {documents.map((doc) => (
                    <div key={doc.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                            <div className="flex-1 pr-4">
                                <span className="inline-block px-2 py-1 rounded bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-wide border border-rose-100 mb-2">
                                    Kritik Xatolik
                                </span>
                                <h4 className="font-bold text-slate-900 line-clamp-1" title={doc.summary}>{doc.summary || 'Nomsiz hujjat'}</h4>
                                <p className="text-xs text-slate-400 mt-1 font-mono">ID: {doc.id?.substring(0, 8).toUpperCase() || 'ID-MISSING'}</p>
                            </div>
                            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center flex-shrink-0">
                                <FileX className="w-5 h-5 text-rose-500" />
                            </div>
                        </div>

                        <div className="p-6 flex-1 space-y-4 bg-slate-50/30">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-700 uppercase mb-1">Rad Etish Sababi</p>
                                    <p className="text-sm text-slate-600 line-clamp-3">
                                        {getReason(doc)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Wrench className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-700 uppercase mb-1">Tuzatish Bo'yicha Tavsiya</p>
                                    <p className="text-sm text-slate-600 line-clamp-3">
                                        {getRecommendation(doc)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-between items-center">
                            <span className="text-xs text-slate-400">
                                {isNaN(Date.parse(doc.createdAt)) ? 'Yaqunda' : new Date(doc.createdAt).toLocaleDateString('uz-UZ', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                            <button
                                onClick={() => setSelectedDoc(doc)}
                                className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors active:scale-95"
                            >
                                To'liq Hisobotni Ko'rish <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-black text-slate-900 text-xl flex items-center gap-2">
                                    <FileX className="w-6 h-6 text-rose-500" />
                                    Rad Etish Hisoboti
                                </h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {selectedDoc.id || 'Noma\'lum'}</p>
                            </div>
                            <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8">
                            <section>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Hujjat nomi</h4>
                                <p className="text-lg font-bold text-slate-800 leading-tight bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    {selectedDoc.summary}
                                </p>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <section className="p-5 bg-rose-50 rounded-2xl border border-rose-100">
                                    <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Aniqlangan Xatoliklar
                                    </h4>
                                    <ul className="space-y-4">
                                        {selectedDoc.issues.map((issue, i) => (
                                            <li key={i} className="text-sm text-rose-900 font-medium leading-relaxed flex gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0"></div>
                                                {typeof issue === 'string' ? issue : (issue.description || issue.text)}
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Wrench className="w-4 h-4" /> Tuzatish Tavsiyalari
                                    </h4>
                                    <ul className="space-y-4">
                                        {selectedDoc.recommendations.map((rec, i) => (
                                            <li key={i} className="text-sm text-blue-900 font-medium leading-relaxed flex gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                                                {typeof rec === 'string' ? rec : (rec.description || rec.text)}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </div>

                            <section>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Hujjat turi va holati</h4>
                                <div className="flex gap-4">
                                    <div className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 uppercase tracking-wider">
                                        {selectedDoc.documentType}
                                    </div>
                                    <div className="px-4 py-2 bg-rose-100 rounded-lg text-xs font-bold text-rose-600 border border-rose-200 uppercase tracking-wider">
                                        Rad Etildi
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                            <p className="text-xs text-slate-400 font-medium">Tahlil vaqti: {new Date(selectedDoc.createdAt).toLocaleString('uz-UZ')}</p>
                            <button
                                onClick={() => setSelectedDoc(null)}
                                className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm tracking-wide hover:shadow-lg hover:shadow-slate-200 active:scale-95 transition-all"
                            >
                                Yopish
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
