// AdolatAI - Kazus tahlil moduli

import { AnalysisResult, RiskLevel } from '../../types';
import { generateId } from '../../utils/helpers';
import logger from '../../core/logger';

interface KazusFact {
    id: string;
    description: string;
    importance: 'high' | 'medium' | 'low';
}

interface LegalIssue {
    question: string;
    relevantLaws: string[];
}

interface ParsedCase {
    facts: KazusFact[];
    parties: string[];
    legalIssues: LegalIssue[];
    timeline: string[];
}

/**
 * Kazusni ajratish va tahlil qilish
 */
export const parseCase = (text: string): ParsedCase => {
    logger.info('Parsing legal case');

    const facts = extractFacts(text);
    const parties = extractParties(text);
    const legalIssues = identifyLegalIssues(text);
    const timeline = extractTimeline(text);

    return {
        facts,
        parties,
        legalIssues,
        timeline
    };
};

/**
 * Faktlarni ajratish
 */
const extractFacts = (text: string): KazusFact[] => {
    const facts: KazusFact[] = [];

    // Matnni gaplarga ajratish
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);

    for (const sentence of sentences) {
        const importance = determineFactImportance(sentence);
        if (importance !== null) {
            facts.push({
                id: generateId(),
                description: sentence.trim(),
                importance
            });
        }
    }

    return facts.slice(0, 10); // Max 10 ta fakt
};

/**
 * Fakt muhimligini aniqlash
 */
const determineFactImportance = (sentence: string): 'high' | 'medium' | 'low' | null => {
    const lower = sentence.toLowerCase();

    const highPriorityKeywords = [
        'jarima', 'zarar', 'buzildi', 'qonunbuzar', 'sud',
        'qamoq', 'huquqbuzar', 'jinoyat', 'jarohat'
    ];

    const mediumPriorityKeywords = [
        'shartnoma', 'kelishuv', 'to\'lov', 'muddat',
        'majburiyat', 'mas\'uliyat', 'talqin'
    ];

    if (highPriorityKeywords.some(kw => lower.includes(kw))) {
        return 'high';
    }

    if (mediumPriorityKeywords.some(kw => lower.includes(kw))) {
        return 'medium';
    }

    // Faqat ma'lumot beruvchi gaplarni o'tkazib yuborish
    if (lower.length < 50 && !lower.includes('da')) {
        return null;
    }

    return 'low';
};

/**
 * Tomonlarni aniqlash
 */
const extractParties = (text: string): string[] => {
    const parties: string[] = [];
    const lower = text.toLowerCase();

    // Ism va familiyalarni qidirish
    const namePattern = /([A-Z][a-z]+\s+[A-Z][a-z]+)/g;
    const names = text.match(namePattern) || [];
    parties.push(...names.slice(0, 4));

    // Tashkilotlarni qidirish
    const orgPatterns = [
        /(".*?"\s*(mchj|xk|qk|ak))/gi,
        /(mchj|xk|qk|ak)\s+".*?"/gi
    ];

    for (const pattern of orgPatterns) {
        const matches = text.match(pattern) || [];
        parties.push(...matches);
    }

    // Da'volar, javobgar va hokazo
    if (lower.includes('da\'vogar')) parties.push('Da\'vogar');
    if (lower.includes('javobgar')) parties.push('Javobgar');
    if (lower.includes('uchinchi shaxs')) parties.push('Uchinchi shaxs');

    return [...new Set(parties)]; // Takrorlanmasin
};

/**
 * Huquqiy masalalarni aniqlash
 */
const identifyLegalIssues = (text: string): LegalIssue[] => {
    const issues: LegalIssue[] = [];
    const lower = text.toLowerCase();

    // Fuqarolik huquqi masalalari
    if (lower.includes('shartnoma') || lower.includes('kelishuv')) {
        issues.push({
            question: 'Shartnomaviy majburiyatlar bajarilganmi?',
            relevantLaws: ['Fuqarolik kodeksi', 'O\'zR FK 353-modda']
        });
    }

    // Mehnat huquqi
    if (lower.includes('ish beruvchi') || lower.includes('xodim') || lower.includes('mehnat')) {
        issues.push({
            question: 'Mehnat qonunchiligi buzilganmi?',
            relevantLaws: ['Mehnat kodeksi', 'O\'zR MK']
        });
    }

    // Oila huquqi
    if (lower.includes('er') || lower.includes('xotin') || lower.includes('nikoh') || lower.includes('ajralish')) {
        issues.push({
            question: 'Oila huquqlari masalasi?',
            relevantLaws: ['Oila kodeksi', 'O\'zR OK']
        });
    }

    // Jinoyat huquqi
    if (lower.includes('jinoyat') || lower.includes('o\'g\'rilik') || lower.includes('firibgar')) {
        issues.push({
            question: 'Jinoyat tarkibi mavjudmi?',
            relevantLaws: ['Jinoyat kodeksi', 'O\'zR JK']
        });
    }

    // Ma'muriy huquq
    if (lower.includes('jarima') || lower.includes('ma\'muriy')) {
        issues.push({
            question: 'Ma\'muriy javobgarlik mavjudmi?',
            relevantLaws: ['Ma\'muriy javobgarlik kodeksi', 'O\'zR MJK']
        });
    }

    return issues;
};

/**
 * Vaqt chizig'ini tuzish
 */
const extractTimeline = (text: string): string[] => {
    const timeline: string[] = [];

    // Sanalarni qidirish
    const datePattern = /(\d{1,2}[\.\-\/]\d{1,2}[\.\-\/]\d{2,4})/g;
    const dates = text.match(datePattern) || [];

    // Sanali gaplarni ajratish
    const sentences = text.split(/[.!?]+/);
    for (const sentence of sentences) {
        for (const date of dates) {
            if (sentence.includes(date)) {
                timeline.push(`${date}: ${sentence.trim().slice(0, 100)}`);
                break;
            }
        }
    }

    return timeline.slice(0, 5);
};

export default parseCase;
