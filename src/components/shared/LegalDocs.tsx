import React from 'react';
import { X, ShieldAlert, Scale, FileText } from 'lucide-react';

export type LegalDocType = 'privacy' | 'terms' | null;

interface LegalDocsProps {
  type: LegalDocType;
  onClose: () => void;
}

const LegalDocs: React.FC<LegalDocsProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${type === 'privacy' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {type === 'privacy' ? <ShieldAlert className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {type === 'privacy' ? "Maxfiylik Siyosati" : "Foydalanish Shartlari"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 text-gray-700 leading-relaxed space-y-8">
          
          {type === 'privacy' ? (
            // --- PRIVACY POLICY ---
            <>
              <div className="text-sm text-gray-500 mb-6">So‘nggi yangilanish: 2025-yil</div>
              
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">1. Kirish va Ogohlantirish</h3>
                <p>
                  "AdolatAI" platformasi foydalanuvchilarning shaxsiy ma'lumotlarini hurmat qiladi. 
                  Ushbu Maxfiylik Siyosati biz sizning ma'lumotlaringizni qanday ishlashimizni tushuntiradi. 
                  <br/><br/>
                  <strong>Muhim ogohlantirish:</strong> Internet orqali ma'lumot uzatish hech qachon 100% xavfsiz emas. 
                  Biz himoya choralarini ko'rishimizga qaramay, ma'lumotlarning mutlaq xavfsizligiga yoki 
                  tizimning texnik xatolardan holi bo'lishiga kafolat bera olmaymiz.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">2. Ma'lumotlarni Yig'ish va Qayta Ishlash</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Vaqtinchalik Tahlil:</strong> Siz yuklagan hujjatlar yoki kiritgan matnlar faqat tahlil jarayoni davomida 
                    sun'iy intellekt (AI) modeli tomonidan qayta ishlanadi.
                  </li>
                  <li>
                    <strong>Saqlash Siyosati:</strong> "AdolatAI" serverlari foydalanuvchi yuklagan hujjatlarni uzoq muddatli xotirada saqlamaydi. 
                    Tahlil yakunlangach, ma'lumotlar operativ xotiradan o'chiriladi.
                  </li>
                  <li>
                    <strong>Mahalliy Tarix (LocalStorage):</strong> Tahlil tarixi faqat sizning qurilmangizda (brauzer xotirasida) saqlanadi. 
                    Agar siz brauzer keshini tozalasangiz, bu ma'lumotlar yo'qoladi. Biz bu ma'lumotlarga kira olmaymiz.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">3. Uchinchi Tomon Xizmatlari (AI Provayder)</h3>
                <p>
                  Tahlilni amalga oshirish uchun biz Google Gemini API (yoki shunga o'xshash ilg'or LLM provayderlari) dan foydalanamiz. 
                  Sizning matningiz tahlil uchun ushbu provayderga shifrlangan holda yuboriladi. 
                  Uchinchi tomon AI provayderlari o'z siyosatlariga ko'ra ma'lumotlarni vaqtinchalik qayta ishlashi mumkin, 
                  ammo biz ularning ichki jarayonlari uchun javobgar emasmiz.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">4. AI Tahlilining Cheklovlari</h3>
                <p>
                  Sun'iy intellekt tomonidan qayta ishlangan ma'lumotlar <strong>noto'g'ri talqin qilinishi, kontekstdan uzilishi yoki to'liq bo'lmasligi mumkin.</strong> 
                  Shu sababli, AI tahliliga asoslanib qabul qilingan qarorlar uchun platforma ma'muriyati javobgarlikni o'z zimmasiga olmaydi.
                </p>
              </section>
            </>
          ) : (
            // --- TERMS OF USE ---
            <>
               <div className="text-sm text-gray-500 mb-6">So‘nggi yangilanish: 2025-yil</div>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">1. Xizmatning Mohiyati</h3>
                <p>
                  "AdolatAI" — bu yuridik va boshqa turdagi hujjatlarni tahlil qilishga yordam beruvchi sun'iy intellektga asoslangan vosita. 
                  <strong>Platforma yuridik firma emas, notarius emas va professional yurist o'rnini bosmaydi.</strong>
                </p>
              </section>

              <section className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <h3 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" />
                  2. Javobgarlikni Cheklash (O'ta Muhim)
                </h3>
                <p className="text-amber-900 text-sm font-medium">
                  Foydalanuvchi quyidagilarni so'zsiz qabul qiladi:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-2 text-amber-800 text-sm">
                  <li>
                    <strong>Natijalar Ehtimoliydir:</strong> AI tomonidan taqdim etilgan tahlil deterministik (qat'iy) emas, balki ehtimoliydir. 
                    Bir xil hujjat qayta tahlil qilinganda turli natijalar berishi mumkin.
                  </li>
                  <li>
                    <strong>Xatoliklar Ehtimoli:</strong> Tizim matnni noto'g'ri tushunishi, muhim yuridik nuanslarni o'tkazib yuborishi 
                    yoki mavjud bo'lmagan xavflarni ("gallyutsinatsiya") ko'rsatishi mumkin.
                  </li>
                  <li>
                    <strong>Yuridik Maslahat Emas:</strong> Platforma bergan ma'lumotlar yuridik maslahat sifatida qabul qilinmasligi kerak. 
                    Yakuniy qaror qabul qilishdan oldin har doim malakali mutaxassis bilan maslahatlashing.
                  </li>
                  <li>
                    <strong>Zararlarni Qoplamaslik:</strong> Platforma ma'muriyati ushbu vositadan foydalanish natijasida kelib chiqadigan 
                    har qanday to'g'ridan-to'g'ri yoki bilvosita moddiy/ma'naviy zararlar uchun javobgar emas.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">3. Foydalanuvchi Majburiyatlari</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Siz yuklayotgan hujjatlaringizda uchinchi shaxslarning konfidensial ma'lumotlari bo'lsa, ularni yuklashdan oldin 
                    tegishli ruxsatga ega ekanligingizga ishonch hosil qilish sizning majburiyatingizdir.
                  </li>
                  <li>
                    Siz platformadan noqonuniy maqsadlarda, jumladan, firibgarlik yoki soxta hujjatlar tayyorlash uchun foydalanmaslikka rozilik berasiz.
                  </li>
                  <li>
                    Siz AI taqdim etgan ma'lumotlarni mustaqil ravishda tekshirib ko'rish mas'uliyatini o'z zimmangizga olasiz.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">4. O'zgartirishlar</h3>
                <p>
                  Biz ushbu foydalanish shartlarini istalgan vaqtda ogohlantirmasdan o'zgartirish huquqini saqlab qolamiz. 
                  Xizmatdan foydalanishda davom etishingiz yangi shartlarni qabul qilganingizni anglatadi.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalDocs;
