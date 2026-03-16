import React, { useState, useEffect } from 'react';
import { Eye, FileText, AlertTriangle, CheckCircle, Search, Filter, Download, Loader2, FileDown } from 'lucide-react';
import { getAnalysisList, deleteAnalysis, type AnalysisRecord } from '../../services/adminApi';
import { TableRowActions } from '../components/shared/TableRowActions';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';

export const AnalysisMonitor: React.FC = () => {
    const [documents, setDocuments] = useState<AnalysisRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const limit = 10;

    const [statusFilter, setStatusFilter] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const filterRef = React.useRef<HTMLDivElement>(null);
    const exportRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setFilterOpen(false);
            }
            if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
                setExportOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getAnalysisList(page, limit, search, statusFilter);
                setDocuments(data.analyses);
                setTotal(data.total);
            } catch (error) {
                console.error('Failed to fetch analyses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [page, search, statusFilter]);

    // ... date and status helpers ...
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Noma\'lum';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Yaqunda';
        return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getRiskLevel = (score: any): { level: string; color: string } => {
        const nScore = typeof score === 'number' ? score : (parseInt(score) || 0);
        if (nScore >= 70) return { level: 'YUQORI', color: 'bg-rose-100 text-rose-700 border-rose-200' };
        if (nScore >= 40) return { level: 'O\'RTA', color: 'bg-amber-100 text-amber-700 border-amber-200' };
        return { level: 'PAST', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    };

    const getStatus = (riskScore: any): string => {
        const nScore = typeof riskScore === 'number' ? riskScore : (parseInt(riskScore) || 0);
        if (nScore >= 80) return 'Rad etilgan';
        if (nScore >= 50) return 'Ko\'rib chiqilmoqda';
        if (nScore >= 30) return 'Tahlil qilinmoqda';
        return 'Tasdiqlangan';
    };

    const getStatusColor = (status: string): string => {
        if (status === 'Rad etilgan') return 'text-rose-600';
        if (status === 'Ko\'rib chiqilmoqda') return 'text-amber-600';
        if (status === 'Tahlil qilinmoqda') return 'text-blue-600';
        return 'text-emerald-600';
    };

    const [viewingDoc, setViewingDoc] = useState<AnalysisRecord | null>(null);

    const handleDeleteAnalysis = async (id: string) => {
        if (!confirm("Ushbu tahlil yozuvini o'chirmoqchimisiz?")) return;

        try {
            await deleteAnalysis(id);
            setDocuments(documents.filter(d => d.id !== id));
            setTotal(total - 1);
        } catch (error) {
            alert("O'chirishda xatolik yuz berdi");
        }
    };

    const handleDownloadReport = (record?: AnalysisRecord) => {
        try {
            const dataToExport = record ? record : documents;
            if (!dataToExport || (Array.isArray(dataToExport) && dataToExport.length === 0)) {
                alert("Eksport qilish uchun ma'lumot yo'q");
                return;
            }

            const filename = record
                ? `analysis_${record.id}_${new Date().toISOString().split('T')[0]}.json`
                : `analysis_report_${new Date().toISOString().split('T')[0]}.json`;

            const reportData = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([reportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            // alert("JSON hisoboti yuklandi");
        } catch (error) {
            console.error('JSON export failed', error);
            alert("JSON yuklashda xatolik");
        }
    };

    const handleExportBatchWord = async () => {
        if (documents.length === 0) {
            alert("Eksport qilish uchun ma'lumot yo'q");
            return;
        }

        try {
            alert("Word hisoboti tayyorlanmoqda...");
            const wordDoc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({
                            text: "ADOLAT AI - UMUMY TAHLIL HISOBOTI",
                            heading: HeadingLevel.HEADING_1,
                            alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                            text: `Sana: ${new Date().toLocaleDateString('uz-UZ')}`,
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 400 },
                        }),
                        ...documents.flatMap(doc => [
                            new Paragraph({
                                text: `DOC ID: ${doc.id} - ${doc.summary || 'Nomsiz'}`,
                                heading: HeadingLevel.HEADING_2,
                                spacing: { before: 400 },
                            }),
                            new Paragraph({
                                text: `Turi: ${doc.documentType} | Xavf Balli: ${doc.riskScore}`,
                            }),
                            new Paragraph({
                                text: "--------------------------------------------------",
                            })
                        ])
                    ],
                }],
            });

            const blob = await Packer.toBlob(wordDoc);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `umumiy_hisobot_${new Date().toISOString().split('T')[0]}.docx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Batch Word export failed', error);
            alert("Word yuklashda xatolik yuz berdi");
        }
    };

    const handleExportWord = async (doc: AnalysisRecord) => {
        try {
            const wordDoc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({
                            text: "ADOLAT AI - HUQUQIY TAHLIL HISOBOTI",
                            heading: HeadingLevel.HEADING_1,
                            alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                            text: `${doc.summary || 'Nomsiz hujjat'}`.toUpperCase(),
                            heading: HeadingLevel.HEADING_2,
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 200, after: 400 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: "Hujjat ID: ", bold: true }),
                                new TextRun(doc.id),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: "Turi: ", bold: true }),
                                new TextRun(doc.documentType),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: "Xavf Balli: ", bold: true }),
                                new TextRun(`${doc.riskScore}/100`),
                            ],
                            spacing: { after: 400 },
                        }),

                        new Paragraph({
                            text: "ANIQLANGAN HOLATLAR",
                            heading: HeadingLevel.HEADING_3,
                            spacing: { before: 400, after: 200 },
                        }),
                        ...(doc.issues?.length ? doc.issues.map((issue: any) =>
                            new Paragraph({
                                text: `• ${typeof issue === 'string' ? issue : (issue.description || issue.explanation)}`,
                                spacing: { after: 100 },
                            })
                        ) : [new Paragraph({ children: [new TextRun({ text: "Muammolar aniqlanmadi.", italics: true })] })]),

                        new Paragraph({
                            text: `Sana: ${formatDate(doc.createdAt)}`,
                            alignment: AlignmentType.RIGHT,
                            spacing: { before: 600 },
                        })
                    ],
                }],
            });

            const blob = await Packer.toBlob(wordDoc);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tahlil_${doc.id}.docx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Word export failed', error);
            alert("Word yuklashda xatolik yuz berdi");
        }
    };

    const handleExportPDF = (doc: AnalysisRecord) => {
        try {
            const pdf = new jsPDF();

            pdf.setFontSize(18);
            pdf.text("ADOLAT AI - TAHLIL HISOBOTI", 105, 20, { align: 'center' });

            pdf.setFontSize(14);
            pdf.text(doc.summary || 'Nomsiz hujjat', 105, 35, { align: 'center' });

            pdf.setFontSize(10);
            pdf.text(`Hujjat ID: ${doc.id}`, 20, 50);
            pdf.text(`Turi: ${doc.documentType}`, 20, 60);
            pdf.text(`Xavf Balli: ${doc.riskScore}/100`, 20, 70);

            pdf.line(20, 75, 190, 75);

            pdf.setFontSize(12);
            pdf.text("Aniqlangan muammolar:", 20, 90);

            pdf.setFontSize(10);
            let y = 100;
            if (doc.issues?.length) {
                doc.issues.forEach((issue: any) => {
                    const text = `• ${typeof issue === 'string' ? issue : (issue.description || issue.explanation)}`;
                    pdf.text(text, 25, y);
                    y += 10;
                });
            } else {
                pdf.text("Muammolar aniqlanmadi.", 25, y);
            }

            pdf.text(`Sana: ${formatDate(doc.createdAt)}`, 150, 200);

            pdf.save(`tahlil_${doc.id}.pdf`);
        } catch (error) {
            console.error('PDF export failed', error);
            alert("PDF yuklashda xatolik yuz berdi");
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Hujjat nomi yoki ID orqali qidirish..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${statusFilter ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Filter className="w-4 h-4" />
                            {statusFilter || 'Barcha Statuslar'}
                        </button>

                        {filterOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                    onClick={() => { setStatusFilter(''); setFilterOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${statusFilter === '' ? 'bg-slate-50 font-medium text-blue-600' : 'text-slate-600'}`}
                                >
                                    Barcha Statuslar
                                </button>
                                <button
                                    onClick={() => { setStatusFilter('Tasdiqlangan'); setFilterOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                >
                                    Tasdiqlangan
                                </button>
                                <button
                                    onClick={() => { setStatusFilter('Tahlil qilinmoqda'); setFilterOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                >
                                    Tahlil qilinmoqda
                                </button>
                                <button
                                    onClick={() => { setStatusFilter('Ko\'rib chiqilmoqda'); setFilterOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                >
                                    Ko'rib chiqilmoqda
                                </button>
                                <button
                                    onClick={() => { setStatusFilter('Rad etilgan'); setFilterOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 text-rose-600"
                                >
                                    Rad etilgan
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={exportRef}>
                        <button
                            onClick={() => setExportOpen(!exportOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
                        >
                            <Download className="w-4 h-4" /> Hisobotni Yuklash
                        </button>

                        {exportOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50">Formatni Tanlang</div>
                                <button
                                    onClick={() => { handleExportBatchWord(); setExportOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                >
                                    <FileDown className="w-4 h-4 text-blue-600" />
                                    <span>Word (.docx)</span>
                                </button>
                                <button
                                    onClick={() => { alert("PDF umumiy hisoboti tez orada qo'shiladi. Hozircha JSON yoki Word dan foydalaning."); setExportOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors opacity-50"
                                >
                                    <FileText className="w-4 h-4 text-rose-600" />
                                    <span>PDF (Tez kunda)</span>
                                </button>
                                <button
                                    onClick={() => { handleDownloadReport(); setExportOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors border-t border-slate-50"
                                >
                                    <Download className="w-4 h-4 text-slate-400" />
                                    <span>JSON Ma'lumotlar</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Hujjat</th>
                                <th className="px-6 py-4">Turi</th>
                                <th className="px-6 py-4 text-center">Xavf Balli</th>
                                <th className="px-6 py-4">Xavf Darajasi</th>
                                <th className="px-6 py-4 text-center">Muammolar</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Sana</th>
                                <th className="px-6 py-4 text-right">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                // Loading skeleton
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4">
                                            <div className="h-5 w-48 bg-slate-100 animate-pulse rounded"></div>
                                            <div className="h-3 w-24 bg-slate-100 animate-pulse rounded mt-2"></div>
                                        </td>
                                        <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-100 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-4 text-center"><div className="h-5 w-8 bg-slate-100 animate-pulse rounded mx-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-4 text-center"><div className="h-6 w-6 bg-slate-100 animate-pulse rounded-full mx-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-100 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-100 animate-pulse rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : documents.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p className="font-medium">Hujjatlar topilmadi</p>
                                        <p className="text-sm mt-1">Qidiruv so'rovingizni o'zgartiring</p>
                                    </td>
                                </tr>
                            ) : (
                                documents.map((doc) => {
                                    const riskScore = typeof doc.riskScore === 'number' ? doc.riskScore : (parseInt(doc.riskScore) || 0);
                                    const risk = getRiskLevel(riskScore);
                                    const status = getStatus(riskScore);
                                    const issueCount = doc.issues?.length || Math.floor(riskScore / 10);
                                    const docId = doc.id?.substring(0, 8).toUpperCase() || 'DOC-' + Math.random().toString(36).substring(2, 6).toUpperCase();

                                    return (
                                        <tr key={doc.id || Math.random()} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{doc.summary || 'Nomsiz hujjat'}</div>
                                                <div className="text-xs text-slate-400 font-mono mt-0.5">{docId}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                                                    <FileText className="w-3 h-3" /> {doc.documentType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-mono font-bold text-slate-700">
                                                {doc.riskScore}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${risk.color}`}>
                                                    {risk.level === 'YUQORI' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                                    {risk.level === 'PAST' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                    {risk.level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                                                    {issueCount}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-xs font-medium ${getStatusColor(status)}`}>
                                                {status}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 tabular-nums">
                                                {formatDate(doc.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <TableRowActions
                                                    onView={() => setViewingDoc(doc)}
                                                    onDelete={() => handleDeleteAnalysis(doc.id)}
                                                    extraActions={[
                                                        { label: 'Word (.docx)', icon: FileDown, onClick: () => handleExportWord(doc) },
                                                        { label: 'PDF (.pdf)', icon: FileText, onClick: () => handleExportPDF(doc) },
                                                        { label: 'JSON Yuklash', icon: Download, onClick: () => handleDownloadReport(doc) }
                                                    ]}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500 font-medium">
                    <span>Jami hujjatlar: {total} ta</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 text-slate-600"
                        >
                            Oldingi
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={documents.length < limit || loading}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 text-slate-600"
                        >
                            Keyingi
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Details Modal */}
            {viewingDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Hujjat Tafsilotlari</h3>
                                <p className="text-xs text-slate-500 font-mono">ID: {viewingDoc.id}</p>
                            </div>
                            <button onClick={() => setViewingDoc(null)} className="text-slate-400 hover:text-slate-600">
                                <span className="sr-only">Yopish</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 uppercase mb-2">Hujjat Matni</h4>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                                    {viewingDoc.summary}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <h5 className="font-bold text-blue-800 text-xs uppercase mb-1">Xavf Balli</h5>
                                    <p className="text-2xl font-bold text-blue-600">{viewingDoc.riskScore}/100</p>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                    <h5 className="font-bold text-emerald-800 text-xs uppercase mb-1">Status</h5>
                                    <p className="text-lg font-bold text-emerald-600">{getStatus(viewingDoc.riskScore)}</p>
                                </div>
                            </div>

                            {viewingDoc.issues && viewingDoc.issues.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 uppercase mb-2">Aniqlangan Muammolar</h4>
                                    <ul className="space-y-2">
                                        {viewingDoc.issues.map((issue, i) => (
                                            <li key={i} className="flex gap-2 items-start bg-rose-50 p-3 rounded-lg border border-rose-100 text-sm text-rose-800">
                                                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                <span>{typeof issue === 'string' ? issue : (issue.description || issue.explanation)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {viewingDoc.recommendations && viewingDoc.recommendations.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 uppercase mb-2">Tavsiyalar</h4>
                                    <ul className="space-y-2">
                                        {viewingDoc.recommendations.map((rec, i) => (
                                            <li key={i} className="flex gap-2 items-start bg-amber-50 p-3 rounded-lg border border-amber-100 text-sm text-amber-800">
                                                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                <span>{typeof rec === 'string' ? rec : rec.description}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setViewingDoc(null)}
                                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-300 transition-colors"
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
