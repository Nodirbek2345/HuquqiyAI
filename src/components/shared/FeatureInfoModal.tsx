
import React from 'react';
import { AnalysisMode } from '../../types';
import { FileSearch, Shield, Check, X, Info, Scale, BrainCircuit, FileX, FilePlus } from 'lucide-react';

interface FeatureInfoModalProps {
  mode: AnalysisMode;
  onCancel: () => void;
}

const FeatureInfoModal: React.FC<FeatureInfoModalProps> = ({ mode, onCancel }) => {

  const features = {
    quick: {
      title: "Notarial Ko'rik (Beta)",
      icon: <Scale className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-50 text-blue-700",
      descriptionPoints: [
        "Hujjatni neytral va xolis ko'rib chiqish (Pre-review).",
        "Baholi, vahimali yoki hukm qiluvchi so'zlardan xoli tahlil.",
        "Notariuslar va yuristlar uchun hujjat bilan birlamchi tanishish vositasi.",
        "E’tibor qaratilishi mumkin bo‘lgan jihatlarni ajratib ko'rsatadi."
      ],
      footerNote: "Bu funksiya notarial tasdiqlash emas, balki oldindan ko'rib chiqish vositasidir."
    },
    professional: {
      title: "Professional Tahlil (PRO)",
      icon: <Shield className="w-6 h-6 text-indigo-600" />,
      color: "bg-indigo-50 text-indigo-700",
      descriptionPoints: [
        "Hujjatdagi yashirin xavflar va noaniqliklarni tizimli tahlil qiladi.",
        "Huquqiy ta'sir, noaniqliklar va texnik eslatmalarni alohida ko'rsatadi.",
        "Shartnoma imzolashdan oldin chuqur o'rganish uchun tavsiya etiladi.",
        "Neytral, ammo aniq va batafsil professional tilda."
      ],
      footerNote: "Yakuniy yuridik xulosa uchun mutaxassis ko'rigi talab etiladi."
    },
    simple: {
      title: "Oddiy Tushuntirish",
      icon: <Check className="w-6 h-6 text-emerald-600" />,
      color: "bg-emerald-50 text-emerald-700",
      descriptionPoints: [
        "Hech qanday yuridik atamalarsiz, sodda o'zbek tilida tushuntirish.",
        "Bandlarning ma'nosi va kontekstini ochib berish.",
        "Agar band amaliyotda ko'p uchrasa, bu haqida ma'lumot berish.",
        "Foydalanuvchiga hech qanday ko'rsatma yoki maslahat berilmaydi."
      ],
      footerNote: "Maqsad — tushunishni osonlashtirish, qaror qabul qilish emas."
    },
    kazus: {
      title: "Kazus Yechish",
      icon: <BrainCircuit className="w-6 h-6 text-indigo-600" />,
      color: "bg-indigo-50 text-indigo-700",
      descriptionPoints: [
        "Huquqiy muammo (kazus) shartlari tahlil qilinadi.",
        "O'zbekiston qonunchiligiga asoslangan yechim taklif etiladi.",
        "Nazariy bilimlar va sud amaliyoti inobatga olinadi.",
        "Yuridik fakultet talabalari va yuristlar uchun mo'ljallangan."
      ],
      footerNote: "Yechim faqat tavsiyaviy va ta'limiy xarakterga ega."
    },
    rejected: {
      title: "Rad Etilgan Hujjat",
      icon: <FileX className="w-6 h-6 text-rose-600" />,
      color: "bg-rose-50 text-rose-700",
      descriptionPoints: [
        "Notarius yoki tashkilot tomonidan rad etilgan hujjat tahlili.",
        "Rad etishning huquqiy va texnik sabablari aniqlanadi.",
        "Kamchiliklarni bartaraf etish bo'yicha aniq ko'rsatmalar.",
        "Qayta topshirishga tayyorgarlik ko'rishda yordam beradi."
      ],
      footerNote: "Rad javobini faqat vakolatli organ beradi, bu tahlil taxminiy sabablarni ko'rsatadi."
    },
    template: {
      title: "Hujjat Yaratish",
      icon: <FilePlus className="w-6 h-6 text-emerald-600" />,
      color: "bg-emerald-50 text-emerald-700",
      descriptionPoints: [
        "Foydalanuvchi tavsifi asosida professional shartnoma yaratish.",
        "O'zbekiston qonunchiligi (Fuqarolik kodeksi) standartlariga mos.",
        "Barcha yuridik struktura (taraflar, predmet, narx) inobatga olinadi.",
        "Hujjatni nusxalash va tahrirlash imkoniyati."
      ],
      footerNote: "Yaratilgan hujjat shabloni bazaviy yuridik kuchga ega, ammo individual nuanslar uchun mutaxassis ko'rigi zarur."
    }
  };

  const content = features[mode] || {
    title: "",
    icon: null,
    color: "",
    descriptionPoints: [],
    footerNote: ""
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="p-6 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${content.color}`}>
              {content.icon}
            </div>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{content.title}</h2>
          <div className="space-y-3 mb-6">
            {content.descriptionPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></span>
                <p className="text-gray-700 text-sm leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 mt-auto">
          <div className="flex items-start gap-2 text-xs text-gray-500 italic">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <p>{content.footerNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureInfoModal;
