import React, { useState, useEffect } from 'react';
import { BrainCircuit, BookOpen, Check, AlertOctagon, Scale, ArrowLeft, Search, Filter, Loader2, FileText } from 'lucide-react';
import { getKazusList } from '../../services/adminApi';
import { TableRowActions } from '../components/shared/TableRowActions';

interface KazusItem {
    id: string;
    documentText: string;
    summary: string;
    overallRisk: string;
    riskScore: number;
    issues: any[];
    recommendations: any[];
    createdAt: string;
}

export const KazusMonitor: React.FC = () => {
    const [kazusList, setKazusList] = useState<KazusItem[]>([]);
    const [selectedKazus, setSelectedKazus] = useState<KazusItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Barcha Holatlar');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchKazus = async () => {
            setLoading(true);
            try {
                const data = await getKazusList(1, 20);
                setKazusList(data.kazuslar);
                setTotal(data.total);
            } catch (error) {
                console.error('Failed to fetch kazus:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchKazus();
    }, []);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Noma\'lum';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Hozir';
        return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
            date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    };

    const getConfidenceColor = (score: number): string => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (score >= 60) return 'text-indigo-600 bg-indigo-50 border-indigo-100';
        return 'text-amber-600 bg-amber-50 border-amber-100';
    };

    // Detail View
    if (selectedKazus) {
        const confidence = 100 - selectedKazus.riskScore;

        return (
            <div className="space-y-8">
                {/* Back Button */}
                <button
                    onClick={() => setSelectedKazus(null)}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Orqaga qaytish
                </button>

                {/* Header */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            Kazus №{selectedKazus.id?.substring(0, 8).toUpperCase() || 'NOMA\'LUM'}
                        </h3>
                        <p className="text-sm text-slate-500 max-w-3xl">
                            "{selectedKazus.documentText?.substring(0, 150) || selectedKazus.summary || 'Matn mavjud emas'}..."
                        </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg border flex items-center gap-2 ${getConfidenceColor(confidence)}`}>
                        <BrainCircuit className="w-3 h-3" /> Ishonch: {confidence}%
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Analysis */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h4 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                                    <Scale className="w-4 h-4 text-slate-500" /> Huquqiy Tahlil
                                </h4>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">1. Huquqiy Muammo (Issue)</h5>
                                    <p className="text-slate-800 text-sm leading-relaxed p-4 bg-slate-50 rounded-lg border border-slate-100">
                                        {selectedKazus.summary || 'Kazus tahlili bajarilmoqda...'}
                                    </p>
                                </div>

                                <div>
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">2. Qo'llaniladigan Qonun (Rule)</h5>
                                    <ul className="space-y-2">
                                        {(selectedKazus.recommendations?.length > 0 ? selectedKazus.recommendations : [
                                            "O'zbekiston Respublikasi Mehnat Kodeksi - 172-modda (Hisob-kitob qilish muddatlari)",
                                            "O'zbekiston Respublikasi Mehnat Kodeksi - 254-modda (Ish beruvchining moddiy javobgarligi)",
                                            "Oliy Sud Plenumi qarori №12"
                                        ]).map((rule: any, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-indigo-900 bg-indigo-50/50 p-2 rounded border border-indigo-50">
                                                <BookOpen className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                                                {typeof rule === 'string' ? rule : rule.text || rule.title || JSON.stringify(rule)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">3. Tahlil (Analysis)</h5>
                                    <p className="text-slate-700 text-sm leading-relaxed">
                                        {selectedKazus.issues?.length > 0
                                            ? selectedKazus.issues.map((i: any) => typeof i === 'string' ? i : i.description).join(' ')
                                            : "Qonunchilikka ko'ra, mehnat shartnomasi bekor qilingan kuni ish beruvchi xodim bilan to'liq hisob-kitob qilishi shart. Agar ushbu muddat ish beruvchining aybi bilan o'tkazib yuborilsa, u har bir kechiktirilgan kun uchun jarima to'lashi shart."}
                                    </p>
                                </div>

                                <div>
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">4. Xulosa (Conclusion)</h5>
                                    <div className={`p-4 rounded-lg flex items-start gap-3 ${selectedKazus.overallRisk === 'HIGH'
                                        ? 'bg-rose-50 border border-rose-100'
                                        : 'bg-emerald-50 border border-emerald-100'
                                        }`}>
                                        <Check className={`w-5 h-5 mt-0.5 ${selectedKazus.overallRisk === 'HIGH' ? 'text-rose-600' : 'text-emerald-600'
                                            }`} />
                                        <div>
                                            <p className={`font-bold text-sm ${selectedKazus.overallRisk === 'HIGH' ? 'text-rose-900' : 'text-emerald-900'
                                                }`}>
                                                {selectedKazus.overallRisk === 'HIGH' ? 'Yuqori xavf mavjud.' : 'Javobgarlik mavjud.'}
                                            </p>
                                            <p className={`text-xs mt-1 ${selectedKazus.overallRisk === 'HIGH' ? 'text-rose-700' : 'text-emerald-700'
                                                }`}>
                                                Xodim sudga murojaat qilishga va kechiktirilgan har bir kun uchun o'rtacha ish haqini undirishni talab qilishga haqli.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar details */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Metadatalar</h4>
                            <dl className="space-y-4 text-sm">
                                <div className="flex justify-between pb-2 border-b border-slate-50">
                                    <dt className="text-slate-500">So'rov vaqti</dt>
                                    <dd className="font-medium text-slate-900">{formatDate(selectedKazus.createdAt)}</dd>
                                </div>
                                <div className="flex justify-between pb-2 border-b border-slate-50">
                                    <dt className="text-slate-500">Kim tomonidan</dt>
                                    <dd className="font-medium text-slate-900">Auditor User</dd>
                                </div>
                                <div className="flex justify-between pb-2 border-b border-slate-50">
                                    <dt className="text-slate-500">AI Modeli</dt>
                                    <dd className="font-medium text-slate-900">GPT-4o (Reasoning)</dd>
                                </div>
                                <div className="flex justify-between pb-2 border-b border-slate-50">
                                    <dt className="text-slate-500">Xavf Balli</dt>
                                    <dd className="font-medium text-slate-900">{selectedKazus.riskScore}%</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="bg-rose-50 rounded-xl border border-rose-100 p-6">
                            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <AlertOctagon className="w-4 h-4" /> Mantiqiy Ogohlantirishlar
                            </h4>
                            <p className="text-xs text-rose-800 leading-relaxed">
                                AI tahlilida subyektiv omillar (xodimning o'zi hisob raqamini bermaganligi) ehtimoli to'liq inkor etilmagan.
                                Qo'shimcha tekshiruv talab qilinishi mumkin.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Kazus qidirish..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-3 relative">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all active:scale-95 ${statusFilter !== 'Barcha Holatlar'
                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Filter className="w-4 h-4" /> {statusFilter}
                    </button>

                    {showFilters && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                            {['Barcha Holatlar', 'Yuqori', "O'rta", 'Past'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setShowFilters(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${statusFilter === status ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-600'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Kazus ID</th>
                                <th className="px-6 py-4">Tavsif</th>
                                <th className="px-6 py-4 text-center">Ishonch</th>
                                <th className="px-6 py-4">Xavf</th>
                                <th className="px-6 py-4">Sana</th>
                                <th className="px-6 py-4 text-right">Ko'rish</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-64 bg-slate-100 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-4 text-center"><div className="h-6 w-16 bg-slate-100 animate-pulse rounded mx-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-100 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-100 animate-pulse rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : kazusList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <Scale className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p className="font-medium">Kazuslar topilmadi</p>
                                        <p className="text-sm mt-1">Hali hech qanday kazus yechilmagan</p>
                                    </td>
                                </tr>
                            ) : (
                                kazusList.filter(k => {
                                    const matchesSearch = !search ||
                                        k.documentText?.toLowerCase().includes(search.toLowerCase()) ||
                                        k.summary?.toLowerCase().includes(search.toLowerCase());

                                    const statusMap: Record<string, string> = {
                                        'Yuqori': 'HIGH',
                                        "O'rta": 'MEDIUM',
                                        'Past': 'LOW'
                                    };

                                    const matchesStatus = statusFilter === 'Barcha Holatlar' || k.overallRisk === statusMap[statusFilter];

                                    return matchesSearch && matchesStatus;
                                }).map((kazus) => {
                                    const riskScore = typeof kazus.riskScore === 'number' ? kazus.riskScore : (parseInt(kazus.riskScore) || 0);
                                    const confidence = Math.max(0, Math.min(100, 100 - riskScore));
                                    const kazusId = kazus.id?.substring(0, 6).toUpperCase() || Math.random().toString(36).substring(2, 8).toUpperCase();

                                    return (
                                        <tr key={kazus.id || Math.random()} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-bold text-slate-700">
                                                    KZ-{kazusId}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-slate-800 font-medium truncate max-w-md">
                                                    {kazus.documentText?.substring(0, 80) || kazus.summary || 'Tavsif yo\'q'}...
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border ${getConfidenceColor(confidence)}`}>
                                                    <BrainCircuit className="w-3 h-3" />
                                                    {confidence}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase border ${kazus.overallRisk === 'HIGH' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                                                    kazus.overallRisk === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                        'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                    }`}>
                                                    {kazus.overallRisk === 'HIGH' ? 'Yuqori' : kazus.overallRisk === 'MEDIUM' ? "O'rta" : 'Past'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 tabular-nums">
                                                {formatDate(kazus.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <TableRowActions
                                                    onView={() => setSelectedKazus(kazus)}
                                                    onDelete={() => {
                                                        if (window.confirm('Haqiqatdan ham ushbu kazusni o\'chirmoqchimisiz?')) {
                                                            alert('Kazus o\'chirildi (Mock)');
                                                            setKazusList(prev => prev.filter(k => k.id !== kazus.id));
                                                        }
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500 font-medium">
                    <span>Jami kazuslar: {total} ta</span>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400">Sahifa: 1</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
