
import React from 'react';
import { AlertTriangle, ShieldCheck, BrainCircuit, FileX, Scale, Info, FilePlus } from 'lucide-react';
import { AnalysisMode } from '../../types';

interface DisclaimerModalProps {
  onAccept: () => void;
  onCancel: () => void;
  mode: AnalysisMode;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept, onCancel, mode }) => {

  const getContent = () => {
    switch (mode) {
      case 'kazus':
        return {
          colorClass: 'bg-indigo-50 border-indigo-100',
          iconBg: 'bg-indigo-100 text-indigo-600',
          Icon: BrainCircuit,
          title: "Kazus Yechimi — Eslatma",
          description: "AdolatAI taqdim etgan yechim huquqiy nazariya va mantiqqa asoslangan. Bu sudning yakuniy hukmi yoki rasmiy yuridik xulosa emas.",
          points: [
            "Yechim faqat nazariy va ta'limiy xarakterga ega.",
            "Haqiqiy sud amaliyotida natija dalillarga qarab farq qilishi mumkin.",
            "Bu yechimdan rasmiy nizolarda to'g'ridan-to'g'ri dalil sifatida foydalanmang."
          ],
          buttonColor: 'bg-indigo-600 hover:bg-indigo-700'
        };

      case 'rejected':
        return {
          colorClass: 'bg-rose-50 border-rose-100',
          iconBg: 'bg-rose-100 text-rose-600',
          Icon: FileX,
          title: "Rad Etish Sabablarini Aniqlash",
          description: "Tizim rad etilgan hujjatdagi ehtimoliy xatolarni qidiradi. Biz davlat organi yoki notarius nomidan kafolat bermaymiz.",
          points: [
            "Aniqlangan sabablar AI taxminlariga asoslanadi.",
            "Rasmiy rad javobi faqat vakolatli organ tomonidan beriladi.",
            "Tuzatishlar kiritilgach, hujjatni qayta mutaxassisga ko'rsating."
          ],
          buttonColor: 'bg-rose-600 hover:bg-rose-700'
        };

      case 'template':
        return {
          colorClass: 'bg-emerald-50 border-emerald-100',
          iconBg: 'bg-emerald-100 text-emerald-600',
          Icon: FilePlus,
          title: "Hujjat Yaratish (Shablon)",
          description: "Siz uchun professional hujjat shabloni yaratiladi. Ushbu shablon asosiy talablarga javob beradi, ammo individual o'zgarishlar talab qilishi mumkin.",
          points: [
            "Yaratilgan matn umumiy xarakterga ega.",
            "Hujjatni imzolashdan oldin barcha bandlarni tekshirib chiqing.",
            "Qonunchilik o'zgarishlari natijasida shablonni yangilab turish kerak."
          ],
          buttonColor: 'bg-emerald-600 hover:bg-emerald-700'
        };

      default:
        return {
          colorClass: 'bg-amber-50 border-amber-100',
          iconBg: 'bg-amber-100 text-amber-600',
          Icon: AlertTriangle,
          title: "Muhim Ogohlantirish",
          description: "AdolatAI yuridik firma emas. Ushbu platforma sun'iy intellekt yordamida hujjatdagi xavflarni aniqlash uchun axborot beruvchi vositadir.",
          points: [
            "Natijalar faqat ma'lumot olish uchun mo'ljallangan.",
            "AI xulosasi 100% aniqlikni kafolatlamaydi.",
            "Yakuniy qaror qabul qilishdan oldin professional yurist bilan maslahatlashing."
          ],
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const content = getContent();
  const Icon = content.Icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
        <div className={`flex items-center justify-center w-14 h-14 rounded-full mx-auto mb-5 ${content.iconBg}`}>
          <Icon className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-center text-gray-900 mb-3">{content.title}</h2>
        <p className="text-gray-600 text-center mb-6 text-sm leading-relaxed px-2">{content.description}</p>
        <div className={`p-5 rounded-xl border mb-6 text-sm text-gray-800 space-y-3 ${content.colorClass}`}>
          {content.points.map((point, index) => (
            <div key={index} className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 mt-0.5 opacity-70" />
              <span className="font-medium">{point}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">Bekor qilish</button>
          <button onClick={onAccept} className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors font-medium shadow-sm text-sm ${content.buttonColor}`}>Tushundim va Davom etaman</button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
