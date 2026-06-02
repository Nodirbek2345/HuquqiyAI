import html2pdf from 'html2pdf.js';

export const generatePdf = (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Vaqtinchalik o'zgarishlar (masalan chop etish uchun optimallashtirish)
    const originalClasses = element.className;
    element.classList.add('pdf-exporting'); // maxsus CSS qo'shish mumkin
    
    // Yopishqoq (sticky) elementlarni va scrollni to'g'irlaymiz
    const opt = {
        margin:       15,
        filename:     `${filename || 'Hujjat_AdolatAI'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        // Asl holatiga qaytarish
        element.className = originalClasses;
    });
};
