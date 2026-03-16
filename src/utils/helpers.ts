// AdolatAI - Yordamchi funksiyalar (helpers)

import { RiskLevel } from '../types';
import { RISK_COLORS } from '../core/constants';

// ====================
// MATN ISHLASH
// ====================

/**
 * Matnni qisqartirish
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

/**
 * Matnni tozalash (ortiqcha bo'shliqlarni olib tashlash)
 */
export const cleanText = (text: string): string => {
    return text
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();
};

/**
 * So'zlar sonini hisoblash
 */
export const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
};

// ====================
// SANA ISHLASH
// ====================

/**
 * Sanani formatlash
 */
export const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Sanani qisqa formatda
 */
export const formatDateShort = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('uz-UZ');
};

/**
 * Vaqtni formatlash
 */
export const formatTime = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Nisbiy vaqt (5 daqiqa oldin, kecha, ...)
 */
export const timeAgo = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) return formatDateShort(d);
    if (days > 0) return `${days} kun oldin`;
    if (hours > 0) return `${hours} soat oldin`;
    if (minutes > 0) return `${minutes} daqiqa oldin`;
    return 'Hozirgina';
};

// ====================
// RISK ISHLASH
// ====================

/**
 * Risk darajasiga qarab rang olish
 */
export const getRiskColor = (risk: RiskLevel): string => {
    return RISK_COLORS[risk] || RISK_COLORS.MEDIUM;
};

/**
 * Risk ballini foizga aylantirish
 */
export const formatRiskScore = (score: number): string => {
    return `${Math.round(score)}%`;
};

/**
 * Risk darajasini o'zbekchaga tarjima
 */
export const translateRiskLevel = (risk: RiskLevel): string => {
    const translations: Record<RiskLevel, string> = {
        [RiskLevel.LOW]: 'Past',
        [RiskLevel.MEDIUM]: 'O\'rta',
        [RiskLevel.HIGH]: 'Yuqori',
        [RiskLevel.SAFE]: 'Xavfsiz'
    };
    return translations[risk] || 'Noma\'lum';
};

// ====================
// UNIQUE ID
// ====================

/**
 * Noyob ID yaratish
 */
export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ====================
// LOCAL STORAGE
// ====================

/**
 * LocalStorage dan o'qish
 */
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
};

/**
 * LocalStorage ga yozish
 */
export const setToStorage = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('LocalStorage yozishda xato:', error);
    }
};

// ====================
// FAYL ISHLASH
// ====================

/**
 * Fayl hajmini formatlash
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Fayl kengaytmasini olish
 */
export const getFileExtension = (filename: string): string => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

// ====================
// DEBOUNCE & THROTTLE
// ====================

/**
 * Debounce funksiyasi
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
