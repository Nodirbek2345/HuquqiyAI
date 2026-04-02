import React, { useState, useEffect } from 'react';
import { AnalysisResult, AnalysisMode } from '../../types';
import {
  Printer, MessageSquare, ArrowLeft, FileSearch, Eye, Copy, CheckCircle,
  BrainCircuit, FileWarning, FilePlus, ShieldCheck, Landmark, Scale, BookOpen, ChevronRight
} from 'lucide-react';
import DocumentChat from './DocumentChat';
import { ResultsAudit } from '../results/ResultsAudit';
import { ResultsKazus } from '../results/ResultsKazus';
import { ResultsRejected } from '../results/ResultsRejected';
import { ResultsTemplate } from '../results/ResultsTemplate';

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
  onUpdateHistory?: (updated: AnalysisResult) => void;
  documentText?: string;
  mode: AnalysisMode;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, onReset, onUpdateHistory, documentText, mode }) => {
  const getDefaultTemplate = () => ({
    header: `O'zbekiston Respublikasi\n${new Date().toLocaleDateString('uz-UZ')}`,
    title: result.documentType || 'HUJJAT LOYIHASI',
    body: result.summary || result.detailedConclusion || 'Hujjat matni...',
    footer: new Date().toLocaleDateString('uz-UZ')
  });
  const [localTemplate, setLocalTemplate] = useState<any>(result.generatedTemplate || getDefaultTemplate());
  const [copied, setCopied] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState<'report' | 'original' | 'decrees'>('report');
  const [editableDocText, setEditableDocText] = useState(documentText || "");

  useEffect(() => {
    if (result.generatedTemplate) setLocalTemplate(result.generatedTemplate);
  }, [result]);

  const isKazus = mode === 'kazus';
  const isRejected = mode === 'rejected';
  const isTemplate = mode === 'template';

  const handleCopy = () => {
    const text = activeTab === 'original'
      ? editableDocText
      : isTemplate
        ? `${localTemplate?.header || ''}\n\n${localTemplate?.title || ''}\n\n${localTemplate?.body || ''}\n\n${localTemplate?.footer || ''}`
        : documentText || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderOriginalVariant = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white rounded-sm border border-slate-200 shadow-2xl p-16 md:p-24 font-serif text-slate-900 min-h-[1000px] flex flex-col relative group">
        <div className="absolute top-8 left-8 flex items-center gap-2 no-print">
          <span className="text-[11px] font-black text-slate-400 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 uppercase tracking-widest">
            Hujjatning Original Varianti (Tahrirlash mumkin)
          </span>
        </div>
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setEditableDocText(e.currentTarget.innerText)}
          className="flex-grow text-[18px] leading-[1.9] text-justify whitespace-pre-wrap mt-12 font-serif text-slate-800 indent-12 outline-none focus:bg-slate-50 focus:ring-1 ring-blue-100 p-2 rounded transition-all"
        >
          {editableDocText || "Hujjat matni kiritilmagan."}
        </div>
        <div className="mt-12 pt-10 border-t border-slate-100 flex justify-between items-end opacity-40 italic text-sm">
          <div>AdolatAI tizimi orqali tahlil qilindi</div>
          <div>{new Date().toLocaleDateString('uz-UZ')}</div>
        </div>
      </div>

      <div className="flex justify-center no-print">
        <button
          onClick={handleCopy}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 transition-all"
        >
          {copied ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          {copied ? "NUSXA OLINDI" : "MATNNI NUSXALASH"}
        </button>
      </div>
    </div>
  );

  const renderDecreesPanel = () => {
    // Collect all legal bases from issues
    const issueBases = (result.issues || [])
      .filter((issue: any) => issue.legalBasis)
      .map((issue: any) => ({
        codeName: issue.legalBasis.codeName || issue.legalBasis.lawName || '',
        articleNumber: issue.legalBasis.articleNumber || issue.legalBasis.article || '',
        comment: issue.legalBasis.comment || '',
        issueTitle: issue.title
      }));

    // Collect root-level legalBases (Kazus mode)
    const rootBases = ((result as any).legalBases || []).map((base: any) => ({
      codeName: base.lawName || base.codeName || '',
      articleNumber: base.article || base.articleNumber || '',
      comment: base.comment || ''
    }));

    const allBases = [...rootBases, ...issueBases];

    return (
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xl">
              <Landmark className="w-10 h-10" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
            Prezident Farmonlari va Qarorlar Tahlili
          </h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Hujjatga tegishli me'yoriy-huquqiy hujjatlar ro'yxati
          </p>
        </div>

        {/* Legal Bases Cards */}
        {allBases.length > 0 ? (
          <div className="space-y-6">
            {allBases.map((base: any, i: number) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-md p-8 hover:shadow-xl transition-all group relative overflow-hidden">
                {/* Left accent */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-orange-500 group-hover:w-2 transition-all" />

                <div className="flex items-start gap-6 pl-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <Scale className="w-7 h-7" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{base.codeName}</h3>
                      <span className="inline-block mt-1 text-sm font-bold text-amber-700 bg-amber-50 px-4 py-1 rounded-full border border-amber-100">
                        {base.articleNumber}
                      </span>
                    </div>
                    {base.comment && (
                      <p className="text-base text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                        {base.comment}
                      </p>
                    )}
                    {base.issueTitle && (
                      <div className="flex items-center gap-2 text-sm text-slate-400 font-bold">
                        <ChevronRight className="w-4 h-4" />
                        Tegishli muammo: <span className="text-slate-600">{base.issueTitle}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-12 text-center space-y-4">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-lg font-bold text-slate-400">
              Hujjatda aniq qonuniy asoslar topilmadi.
            </p>
            <p className="text-sm text-slate-400">
              AI tahlil natijasida Prezident farmonlari yoki qarorlarga aniq havola keltirmagan. Batafsil tahlil uchun matnni tekshiring.
            </p>
          </div>
        )}

        {/* Recommendations Section */}
        {result.recommendations && result.recommendations.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Amaliy Tavsiyalar</h3>
            </div>
            <div className="space-y-4">
              {result.recommendations.map((rec: string, i: number) => (
                <div key={i} className="flex gap-4 items-start p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 hover:bg-emerald-50/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-base font-semibold text-slate-700 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-16 px-4 animate-in fade-in duration-500 space-y-10">
      {/* Dynamic Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl no-print">
        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center text-white shadow-lg ${isKazus ? 'bg-indigo-600' : isRejected ? 'bg-rose-600' : isTemplate ? 'bg-emerald-600' : 'bg-blue-600'}`}>
            {isKazus ? <BrainCircuit className="w-8 h-8" /> : isRejected ? <FileWarning className="w-8 h-8" /> : isTemplate ? <FilePlus className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1 uppercase">
              {isKazus ? "Kazus Yechimi" : isRejected ? "Rad Etilgan Hujjat Tahlili" : isTemplate ? "Hujjat Loyihasi" : "HUQUQIY TAHLIL"}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AdolatAI — {result.timestamp?.split('T')[0] || new Date().toISOString().split('T')[0]} tahlili</p>
          </div>
        </div>

        {/* Top Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'report' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <FileSearch className="w-4 h-4" /> Hisobot
          </button>
          <button
            onClick={() => setActiveTab('original')}
            className={`px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'original' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Eye className="w-4 h-4" /> Asl Nusxa
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2 w-full md:w-auto">
          <button onClick={() => setShowChat(!showChat)} className={`px-5 py-3 border-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 active:scale-95 w-full sm:w-auto justify-center ${showChat ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
            <MessageSquare className="w-4 h-4" /> {showChat ? "CHATNI YOPISH" : "CHATNI OCHISH"}
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-3 border-2 border-emerald-200 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all flex items-center gap-2 active:scale-95 w-[48%] sm:w-auto justify-center"
            title="Hujjatni chop etish"
          >
            <Printer className="w-4 h-4" /> CHOP ETISH
          </button>
          <button onClick={onReset} className="px-5 py-3 border-2 border-slate-200 text-slate-900 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95 w-[48%] sm:w-auto justify-center">
            <ArrowLeft className="w-4 h-4" /> ORQAGA
          </button>
        </div>
      </header>

      {/* TOP: CHAT SECTION (if open) */}
      {showChat && (
        <div className="animate-in slide-in-from-top-4 duration-500 no-print">
          <DocumentChat documentText={documentText || result.summary} />
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main>
        {activeTab === 'report' ? (
          <>
            {isTemplate && <ResultsTemplate result={result} template={localTemplate} onTemplateChange={setLocalTemplate} />}
            {isRejected && <ResultsRejected result={result} />}
            {isKazus && <ResultsKazus result={result} />}
            {!isTemplate && !isRejected && !isKazus && <ResultsAudit result={result} />}
          </>
        ) : activeTab === 'decrees' ? (
          renderDecreesPanel()
        ) : (
          renderOriginalVariant()
        )}
      </main>
    </div>
  );
};

export default ResultsDashboard;