
declare global {
    interface Window {
        pdfjsLib: any;
        mammoth: any;
    }
}

export const extractTextFromFile = async (file: File): Promise<string> => {
    if (!file) throw new Error("Fayl tanlanmagan");

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    // PDF — o'z ichida barcha xatolarni (parol, skanerlangan va h.k.) hal qiladi
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return await parsePDF(file);
    }

    // DOCX
    if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
    ) {
        return await parseDOCX(file);
    }

    // TXT
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        const rawText = await file.text();
        return decodeBase64IfNeeded(rawText);
    }

    throw new Error("Faqat PDF, DOCX va TXT fayllar qo'llab-quvvatlanadi.");
};

/**
 * Base64 kodlangan matnni aniqlash va dekodlash.
 */
const decodeBase64IfNeeded = (text: string): string => {
    const trimmed = text.trim();
    const base64Regex = /^[A-Za-z0-9+/=\s]+$/;

    if (trimmed.length > 100 && base64Regex.test(trimmed)) {
        try {
            const cleaned = trimmed.replace(/\s/g, '');
            const decoded = atob(cleaned);
            const isPrintable = /^[\x20-\x7E\u0000-\uFFFF\s]+$/.test(decoded);
            if (isPrintable && decoded.length > 20) {
                return `[Base64 dan dekodlangan matn]\n\n${decoded}`;
            }
        } catch {
            // Base64 emas
        }
    }
    return text;
};

/**
 * Xato pdf.js PasswordException ekanligini tekshirish
 */
const isPasswordError = (error: any): boolean => {
    if (!error) return false;
    // pdf.js 3.x: error.name === 'PasswordException'
    if (error.name === 'PasswordException') return true;
    // pdf.js ba'zi versiyalarida: error.code === 1 (NEED_PASSWORD) yoki 2 (INCORRECT_PASSWORD)
    if (error.code === 1 || error.code === 2) return true;
    // Umumiy string tekshiruv
    const msg = String(error.message || error || '').toLowerCase();
    if (msg.includes('password') || msg.includes('encrypted') || msg.includes('need a password')) return true;
    return false;
};

const parsePDF = async (file: File, password?: string): Promise<string> => {
    if (!window.pdfjsLib) {
        throw new Error("PDF kutubxonasi yuklanmagan. Iltimos, sahifani yangilang.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingParams: any = { data: new Uint8Array(arrayBuffer) };

    if (password) {
        loadingParams.password = password;
    }

    let pdf: any;
    try {
        pdf = await window.pdfjsLib.getDocument(loadingParams).promise;
    } catch (error: any) {
        console.error("PDF loading error:", error, "name:", error?.name, "code:", error?.code);

        // --- Parol bilan himoyalangan PDF ---
        if (isPasswordError(error)) {
            if (password) {
                // Parol kiritilgan lekin noto'g'ri
                const retryPassword = window.prompt(
                    "❌ Kiritilgan parol noto'g'ri!\n\nIltimos, to'g'ri parolni qayta kiriting:"
                );
                if (!retryPassword) {
                    throw new Error("Parol kiritilmadi. Himoyalangan PDF ni ochish imkoni yo'q.");
                }
                return parsePDF(file, retryPassword);
            }

            // Birinchi marta — parol so'rash
            const userPassword = window.prompt(
                "🔒 Bu PDF fayl parol bilan himoyalangan.\n\nIltimos, faylning parolini kiriting:"
            );

            if (!userPassword) {
                throw new Error("Parol kiritilmadi. Himoyalangan faylni ochish uchun parol kerak.");
            }

            return parsePDF(file, userPassword);
        }

        // Boshqa xato
        throw new Error(`PDF faylni ochishda xatolik: ${error.message || error}`);
    }

    // --- Matnni o'qish ---
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
        fullText += `--- ${i}-sahifa ---\n${pageText}\n\n`;
    }

    const result = fullText.trim();

    // Skanerlangan PDF tekshiruvi
    if (result.replace(/---\s*\d+-sahifa\s*---/g, '').trim().length < 30) {
        throw new Error(
            "PDF dan matn o'qib bo'lmadi. Bu skanerlangan (rasm sifatida) PDF bo'lishi mumkin. " +
            "Iltimos, OCR orqali matnli versiyasini yuklang yoki matnni qo'lda kiriting."
        );
    }

    return decodeBase64IfNeeded(result);
};

const parseDOCX = async (file: File): Promise<string> => {
    if (!window.mammoth) {
        throw new Error("DOCX kutubxonasi yuklanmagan. Iltimos, sahifani yangilang.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer });

    if (result.messages.length > 0) {
        console.warn("Mammoth warnings:", result.messages);
    }

    const text = result.value.trim();
    return decodeBase64IfNeeded(text);
};
