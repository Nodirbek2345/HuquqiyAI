
import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, ArrowRight, FileText, FileUp, BrainCircuit, FileSearch, FileX, FilePlus, ArrowLeft } from 'lucide-react';
import { AnalysisMode } from '../../types';
import { extractTextFromFile } from '../../utils/fileParser';



interface UploadSectionProps {
  onAnalyze: (text: string, fileName?: string) => void;
  onShowHistory: () => void;
  onBack: () => void;
  mode: AnalysisMode;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onAnalyze, onShowHistory, onBack, mode }) => {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setFileName(file.name);
    setIsProcessing(true);
    setText('');
    try {
      const extractedText = await extractTextFromFile(file);
      if (extractedText.trim().length < 20) throw new Error("Fayldan yetarli matn o'qib bo'lmadi.");

      // Fayl nomini matn boshiga qo'shish (AI aniqligi uchun)
      setText(`[Hujjat nomi: ${file.name}]\n\n${extractedText}`);
    } catch (error: any) {
      alert(error.message);
      setFileName(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const isKazus = mode === 'kazus';
  const isRejected = mode === 'rejected';
  const isTemplate = mode === 'template';

  const theme = {
    title: isKazus ? "Kazus matnini kiriting" : isRejected ? "Rad etilgan hujjat diagnostikasi" : isTemplate ? "Qanday hujjat kerakligini yozing" : "Hujjatni tahlilga yuklang",
    subtitle: isKazus ? "Vaziyatni yozing va qonunchilik asosida yechim oling" : isRejected ? "Rad etish sabablarini va xatolarni aniqlang" : isTemplate ? "Masalan: Ijara shartnomasi, uy sotib olish arizasi va h.k." : "Shartnoma yoki huquqiy hujjatni tekshiring",
    icon: isKazus ? <BrainCircuit className="w-10 h-10 text-indigo-600" /> : isRejected ? <FileX className="w-10 h-10 text-rose-600" /> : isTemplate ? <FilePlus className="w-10 h-10 text-emerald-600" /> : <Upload className="w-10 h-10 text-blue-600" />,
    uploadCardBg: isKazus ? "bg-indigo-50" : isRejected ? "bg-rose-50" : isTemplate ? "bg-emerald-50" : "bg-blue-50",
    buttonBg: isKazus ? "bg-indigo-600 hover:bg-indigo-700" : isRejected ? "bg-rose-600 hover:bg-rose-700" : isTemplate ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700",
    buttonLabel: isKazus ? "Yechimni ko'rish" : isRejected ? "Xatolarni aniqlash" : isTemplate ? "Hujjatni yaratish" : "Tahlilni boshlash"
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Orqaga
        </button>
      </div>

      <div className="text-center space-y-3">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
          {theme.title}
        </h2>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
          {theme.subtitle}
        </p>
      </div>

      {!isTemplate && (
        <div
          className="bg-white rounded-[40px] p-6 sm:p-10 text-center shadow-xl border border-slate-100 transition-all cursor-pointer hover:border-blue-200 group"
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.docx,.pdf" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />

          <div className="flex flex-col items-center">
            {isProcessing ? (
              <Loader2 className={`w-12 h-12 animate-spin text-slate-400 mb-4`} />
            ) : (
              <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform duration-500 ${theme.uploadCardBg}`}>
                {theme.icon}
              </div>
            )}
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">PDF YOKI DOCX YUKLASH</p>

            {fileName && !isProcessing && (
              <div className="mt-4 inline-flex items-center gap-3 px-6 py-2 rounded-full text-[11px] font-black bg-slate-50 border border-slate-100">
                <FileText className="w-4 h-4" />
                <span className="truncate max-w-[150px] uppercase">{fileName}</span>
                <button onClick={(e) => { e.stopPropagation(); setFileName(null); setText(''); }} className="hover:text-rose-600 ml-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Template Presets — only for Template mode */}
      {isTemplate && (
        <div className="space-y-4">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            ⚡ Tayyor shablonlardan birini tanlang
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: '📝', label: 'Ishdan bo\'shash arizasi', prompt: 'Ishdan bo\'shash to\'g\'risida ariza tayyorlang. Xodim o\'z xohishiga ko\'ra ishdan bo\'shmoqchi. Ariza rasmiy uslubda, ish yuritish qoidalariga mos bo\'lsin.' },
              { emoji: '🏠', label: 'Ijara shartnomasi', prompt: 'Ko\'chmas mulk ijara shartnomasi tayyorlang. Ijara beruvchi va ijara oluvchi o\'rtasida tuzilgan. To\'lov tartibi, fors-major, nizolarni hal qilish va bekor qilish bandlari bo\'lsin.' },
              { emoji: '📢', label: 'Bildirgi', prompt: 'Rasmiy bildirgi tayyorlang. Tashkilot xodimlariga ma\'muriy qaror haqida xabardor qilish uchun. Hodisa bayoni, sabab va tavsiya bo\'lsin.' },
              { emoji: '📋', label: 'Buyruq', prompt: 'Tashkilot rahbarining rasmiy buyrug\'ini tayyorlang. Buyruqda asos, bajarilishi kerak amallar va mas\'ul shaxslar ko\'rsatilsin.' },
              { emoji: '🤝', label: 'Xizmat ko\'rsatish shartnomasi', prompt: 'Xizmat ko\'rsatish shartnomasi tayyorlang. Ijrochi va buyurtmachi o\'rtasida. Xizmat turi, muddati, to\'lov tartibi, sifat talablar, javobgarlik bandlari bo\'lsin.' },
              { emoji: '✉️', label: 'Xizmat xati', prompt: 'Rasmiy idoralararo xizmat xati tayyorlang. Bir tashkilotdan boshqasiga rasmiy murojaat yoki so\'rov shakli bo\'lsin.' },
              { emoji: '⚖️', label: 'Da\'vo arizasi', prompt: 'Sudga beriladigan da\'vo arizasi tayyorlang. Fuqarolik ishi bo\'yicha. Da\'vogar va javobgar ma\'lumotlari, da\'vo asoslari, iltimos qismi bo\'lsin.' },
              { emoji: '🔑', label: 'Ishonchnoma', prompt: 'Notarial ishonchnoma shablonini tayyorlang. Vakolat beruvchi va vakolat oluvchi o\'rtasida. Vakolat turi va muddati ko\'rsatilsin.' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => setText(item.prompt)}
                className="group flex flex-col items-center gap-3 p-6 bg-white rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 active:scale-95"
              >
                <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{item.emoji}</span>
                <span className="text-xs font-black text-slate-700 uppercase tracking-wide text-center leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-[40px] overflow-hidden shadow-2xl border border-slate-100 bg-white">
        <textarea
          className="w-full h-72 p-6 sm:p-10 bg-transparent border-none resize-none focus:ring-0 text-base sm:text-lg leading-relaxed font-medium placeholder:text-slate-200"
          placeholder={isTemplate ? "Masalan: Men uyni ijaraga bermoqchiman, Toshkent shahrida, 1 yilga, 500$ narxda. Shartnoma yaratib ber." : "Matnni shu yerga joylang..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>

        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center px-6 sm:px-10 py-6 sm:py-8 bg-slate-50 border-t border-slate-100 gap-4 sm:gap-0">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 text-slate-300">HAJM</span>
            <span className="text-lg font-black text-slate-900 uppercase">
              {text.length.toLocaleString()} BELGI
            </span>
          </div>
          <button
            disabled={!text.trim() || isProcessing}
            onClick={() => onAnalyze(text, fileName || undefined)}
            className={`w-full sm:w-auto justify-center px-8 sm:px-10 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3 shadow-xl active:scale-95 text-white uppercase tracking-widest
              ${text.trim() ? `${theme.buttonBg}` : 'bg-slate-100 text-slate-300 cursor-not-allowed border-none shadow-none'}`}
          >
            {theme.buttonLabel}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;
