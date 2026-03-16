import React, { useState, useEffect } from 'react';
import { FilePlus, Edit3, Eye, MoreHorizontal, File, Loader2, Calendar, FileText, X, Save, Download, FileDown, ShieldCheck } from 'lucide-react';
import { getTemplatesList, deleteTemplate } from '../../services/adminApi';
import { TableRowActions } from '../components/shared/TableRowActions';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';

interface TemplateDoc {
    id: string;
    documentType: string; // Used as title/name
    summary: string; // Used as category/description 
    createdAt: string;
    version?: string;
}

export const TemplatesManager: React.FC = () => {
    const [templates, setTemplates] = useState<TemplateDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [viewingTemplate, setViewingTemplate] = useState<TemplateDoc | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTemplate, setNewTemplate] = useState({ name: '', category: '', version: 'v1.0' });
    const [saving, setSaving] = useState(false);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const data = await getTemplatesList(1, 20);
            setTemplates(data.templates);
            setTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleAddTemplate = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setIsAddModalOpen(false);
            alert("✅ Yangi shablon muvaffaqiyatli saqlandi!");
            // Mock refreshing
            const mockNew = {
                id: 'TPL-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
                documentType: newTemplate.category || 'Shartnoma',
                summary: newTemplate.name || 'Yangi Shablon',
                createdAt: new Date().toISOString(),
                version: newTemplate.version
            };
            setTemplates([mockNew, ...templates]);
            setTotal(total + 1);
            setNewTemplate({ name: '', category: '', version: 'v1.0' });
        }, 1000);
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm("Haqiqatdan ham ushbu shablonni o'chirmoqchimisiz?")) return;

        try {
            await deleteTemplate(id);
            setTemplates(templates.filter(t => t.id !== id));
            setTotal(total - 1);
        } catch (error) {
            alert("O'chirishda xatolik yuz berdi");
        }
    };

    const handleExportTemplate = (tpl: TemplateDoc) => {
        const data = JSON.stringify(tpl, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tpl.documentType.toLowerCase()}_template.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportWord = async (tpl: TemplateDoc) => {
        try {
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({
                            text: tpl.summary.toUpperCase(),
                            heading: HeadingLevel.HEADING_1,
                            alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Hujjat turi: ${tpl.documentType}`,
                                    bold: true,
                                }),
                            ],
                            spacing: { before: 400, after: 200 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Versiya: ${tpl.version || 'v1.0'}`,
                                    italics: true,
                                }),
                            ],
                            spacing: { after: 400 },
                        }),
                        new Paragraph({
                            text: "Mazkur hujjat O'zbekiston Respublikasi qonunchiligiga muvofiq ishlab chiqilgan.",
                            spacing: { after: 200 },
                        }),
                        new Paragraph({
                            text: "[... SHABLON MATNI BU YERDA BO'LISHI KERAK ...]",
                            spacing: { before: 400, after: 400 },
                        }),
                        new Paragraph({
                            text: `Sana: ${new Date().toLocaleDateString('uz-UZ')}`,
                            alignment: AlignmentType.RIGHT,
                        })
                    ],
                }],
            });

            const blob = await Packer.toBlob(doc);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${tpl.documentType.toLowerCase()}_shablon.docx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Word export failed', error);
            alert("Word yuklashda xatolik yuz berdi");
        }
    };

    const handleExportPDF = (tpl: TemplateDoc) => {
        try {
            const doc = new jsPDF();

            doc.setFontSize(20);
            const title = tpl.summary.toUpperCase();
            const textWidth = doc.getTextWidth(title);
            doc.text(title, (doc.internal.pageSize.getWidth() - textWidth) / 2, 20);

            doc.setFontSize(12);
            doc.text(`Hujjat turi: ${tpl.documentType}`, 20, 40);
            doc.text(`Versiya: ${tpl.version || 'v1.0'}`, 20, 50);
            doc.text(`ID: ${tpl.id}`, 20, 60);

            doc.line(20, 65, 190, 65);

            doc.setFontSize(10);
            doc.text("Mazkur hujjat O'zbekiston Respublikasi qonunchiligiga muvofiq ishlab chiqilgan.", 20, 80);

            doc.setFontSize(12);
            const dummyText = "[... SHABLON MATNI BU YERDA BO'LISHI KERAK ...]";
            doc.text(dummyText, 20, 100);

            doc.setFontSize(10);
            doc.text(`Sana: ${new Date().toLocaleDateString('uz-UZ')}`, 150, 200);

            doc.save(`${tpl.documentType.toLowerCase()}_shablon.pdf`);
        } catch (error) {
            console.error('PDF export failed', error);
            alert("PDF yuklashda xatolik yuz berdi");
        }
    };

    const getRandomVersion = () => `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)}`;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Hujjat Shablonlari Boshqaruvi</h3>
                    <p className="text-sm text-slate-500">Rasmiy tasdiqlangan hujjat namunalari ro'yxati ({total} ta).</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                    <FilePlus className="w-4 h-4" /> Yangi Shablon
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Shablon Nomi</th>
                            <th className="px-6 py-4">Kategoriya</th>
                            <th className="px-6 py-4">Versiya</th>
                            <th className="px-6 py-4">Sana</th>
                            <th className="px-6 py-4 text-right">Amallar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4"><div className="h-5 w-48 bg-slate-100 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-100 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4"><div className="h-8 w-20 bg-slate-100 animate-pulse rounded ml-auto"></div></td>
                                </tr>
                            ))
                        ) : templates.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p className="font-medium">Shablonlar topilmadi</p>
                                </td>
                            </tr>
                        ) : (
                            templates.map((tpl) => (
                                <tr key={tpl.id || Math.random()} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                            <File className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-bold">{tpl.summary || 'Nomsiz shablon'}</div>
                                            <div className="text-xs text-slate-400 font-mono mt-0.5">{tpl.id?.substring(0, 8).toUpperCase() || 'ID-MISSING'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                                            {tpl.documentType || 'Shablon'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-slate-100 text-slate-600 text-xs font-mono px-2 py-1 rounded border border-slate-200">
                                            {tpl.version || getRandomVersion()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        {tpl.createdAt && !isNaN(new Date(tpl.createdAt).getTime()) ? new Date(tpl.createdAt).toLocaleDateString('uz-UZ') : 'Yaqunda'}
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <TableRowActions
                                            onView={() => setViewingTemplate(tpl)}
                                            onEdit={() => {
                                                setNewTemplate({ name: tpl.summary, category: tpl.documentType, version: tpl.version || 'v1.0' });
                                                setIsAddModalOpen(true);
                                            }}
                                            onDelete={() => handleDeleteTemplate(tpl.id)}
                                            extraActions={[
                                                { label: 'Word (.docx)', icon: FileDown, onClick: () => handleExportWord(tpl) },
                                                { label: 'PDF (.pdf)', icon: FileText, onClick: () => handleExportPDF(tpl), variant: 'success' },
                                                { label: 'JSON Yuklash', icon: Download, onClick: () => handleExportTemplate(tpl) }
                                            ]}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">
                                {newTemplate.name ? 'Shablonni Tahrirlash' : 'Yangi Shablon Qo\'shish'}
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Shablon Nomi</label>
                                <input
                                    type="text"
                                    value={newTemplate.name}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900/10 outline-none font-medium"
                                    placeholder="Masalan: Mehnat shartnomasi loyihasi"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tur / Kategoriya</label>
                                    <select
                                        value={newTemplate.category}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900/10 outline-none font-medium"
                                    >
                                        <option value="">Tanlang</option>
                                        <option value="Shartnoma">Shartnoma</option>
                                        <option value="Buyruq">Buyruq</option>
                                        <option value="Nizom">Nizom</option>
                                        <option value="Ariza">Ariza</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Versiya</label>
                                    <input
                                        type="text"
                                        value={newTemplate.version}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, version: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900/10 outline-none font-medium"
                                        placeholder="v1.0"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Bekor qilish
                            </button>
                            <button
                                onClick={handleAddTemplate}
                                disabled={saving}
                                className="px-8 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-70 active:scale-95 shadow-lg shadow-slate-900/20"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewingTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-xl tracking-tight leading-none mb-1">{viewingTemplate.summary}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{viewingTemplate.id}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{viewingTemplate.version || 'v1.0'}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setViewingTemplate(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tur</p>
                                    <p className="text-sm font-bold text-slate-700">{viewingTemplate.documentType}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Yaratilgan Sana</p>
                                    <p className="text-sm font-bold text-slate-700">{new Date(viewingTemplate.createdAt).toLocaleDateString('uz-UZ')}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shablon Matni (Simulyatsiya)</h4>
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm text-slate-600 font-mono leading-relaxed max-h-60 overflow-y-auto">
                                    <p className="font-bold text-slate-900 mb-4">{viewingTemplate.summary.toUpperCase()}</p>
                                    <p className="mb-4">Mazkur {viewingTemplate.documentType.toLowerCase()} O'zbekiston Respublikasi Fuqarolik kodeksi hamda boshqa qonun hujjatlariga muvofiq ishlab chiqilgan.</p>
                                    <p className="mb-4">[... Maxfiy matn namunasi ...]</p>
                                    <p className="text-slate-400 italic">Eslatma: Bu shunchaki vizual ko'rinish uchun namuna hisoblanadi.</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setViewingTemplate(null)}
                                className="px-10 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl hover:shadow-xl hover:shadow-slate-900/20 active:scale-95 transition-all"
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
