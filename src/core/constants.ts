// AdolatAI - Doimiy qiymatlar (constants)

// ====================
// APP KONFIGURATSIYASI
// ====================

export const APP_NAME = 'AdolatAI';
export const APP_VERSION = '2.0.0';
export const APP_DESCRIPTION = 'Yuridik AI yordamchi tizim';

// ====================
// API SOZLAMALARI
// ====================

export const API_TIMEOUT = 30000; // 30 sekund
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 sekund

// ====================
// TAHLIL LIMITLERI
// ====================

export const MAX_DOCUMENT_SIZE = 50000; // 50KB matn
export const MAX_DOCUMENT_CHARS = 100000;
export const MIN_DOCUMENT_CHARS = 50;

// ====================
// RISK DARAJALARI
// ====================

export const RISK_THRESHOLDS = {
    LOW: { min: 0, max: 30 },
    MEDIUM: { min: 31, max: 60 },
    HIGH: { min: 61, max: 100 }
} as const;

export const RISK_COLORS = {
    LOW: '#10b981',      // yashil
    MEDIUM: '#f59e0b',   // sariq
    HIGH: '#ef4444',     // qizil
    SAFE: '#3b82f6'      // ko'k
} as const;

// ====================
// TAHLIL BOSQICHLARI
// ====================

export const ANALYSIS_STEPS = {
    quick: [
        "O'zR Kodekslari yuklanmoqda...",
        "Mantiqiy ziddiyatlar tekshirilmoqda...",
        "Xavf indeksi aniqlanmoqda...",
        "Hisobot tayyorlanmoqda..."
    ],
    kazus: [
        "Vaziyat (kazus) tahlil qilinmoqda...",
        "Tegishli qonunlar qidirilmoqda...",
        "Huquqiy mantiqiy zanjir qurilmoqda...",
        "Yechim va muqobil variantlar shakllantirilmoqda...",
        "Yakuniy xulosa yozilmoqda..."
    ],
    rejected: [
        "Rad etilgan hujjat diagnostika qilinmoqda...",
        "Texnik xatolar aniqlanmoqda...",
        "Rad sababi huquqiy asoslanmoqda...",
        "Tuzatish yo'riqnomasi tuzilmoqda...",
        "Qayta topshirish ehtimoli hisoblanmoqda..."
    ],
    template: [
        "Hujjat turi aniqlanmoqda...",
        "Qonunchilik bazasi o'rganilmoqda...",
        "Struktura va bandlar yaratilmoqda...",
        "Professional tahrir qilinmoqda...",
        "Tayyor shablon shakllantirilmoqda..."
    ]
} as const;

// ====================
// LOCAL STORAGE KALITLARI
// ====================

export const STORAGE_KEYS = {
    HISTORY: 'adolat_history',
    USER: 'adolat_user',
    SETTINGS: 'adolat_settings',
    THEME: 'adolat_theme'
} as const;

// ====================
// HUJJAT TURLARI
// ====================

export const DOCUMENT_TYPES = [
    'shartnoma',
    'ariza',
    'da\'vo',
    'qaror',
    'buyruq',
    'ishonchnoma',
    'akt',
    'bayonnoma',
    'boshqa'
] as const;
