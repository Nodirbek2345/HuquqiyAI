// AdolatAI - Shablonni to'ldirish moduli

import logger from '../../core/logger';

interface FillResult {
    filledContent: string;
    missingVariables: string[];
    filledVariables: string[];
}

/**
 * Shablonni ma'lumotlar bilan to'ldirish
 */
export const fillTemplate = (
    template: { header: string; title: string; body: string; footer: string; variables: string[] },
    data: Record<string, string>
): FillResult => {
    logger.info('Filling template', { variablesCount: Object.keys(data).length });

    const missingVariables: string[] = [];
    const filledVariables: string[] = [];

    // Barcha bo'limlarni birlashtirish
    let fullContent = [
        template.header,
        '',
        template.title,
        '',
        template.body,
        '',
        template.footer
    ].join('\n');

    // O'zgaruvchilarni almashtirish
    for (const variable of template.variables) {
        const pattern = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
        const value = data[variable];

        if (value && value.trim() !== '') {
            fullContent = fullContent.replace(pattern, value);
            filledVariables.push(variable);
        } else {
            missingVariables.push(variable);
        }
    }

    return {
        filledContent: fullContent,
        missingVariables,
        filledVariables
    };
};

/**
 * O'zgaruvchilarni matnga aylantirish
 */
export const variablesToPrompt = (variables: string[]): string => {
    const translations: Record<string, string> = {
        shahar: 'Shahar nomi',
        sana: 'Sana (kun.oy.yil)',
        tomon1_nomi: 'Birinchi tomon nomi',
        tomon2_nomi: 'Ikkinchi tomon nomi',
        predmet: 'Shartnoma predmeti',
        summa: 'Summa (raqamda)',
        tolov_tartibi: 'To\'lov tartibi',
        boshlanish_sanasi: 'Boshlanish sanasi',
        tugash_sanasi: 'Tugash sanasi',
        manzil: 'Manzil',
        telefon: 'Telefon raqami',
        email: 'Elektron pochta',
        fish: 'Familiya Ism Sharif'
    };

    return variables.map(v => {
        const label = translations[v] || v.replace(/_/g, ' ');
        return `- ${label}: {{${v}}}`;
    }).join('\n');
};

/**
 * Shablonni HTML formatida chiqarish
 */
export const templateToHtml = (content: string): string => {
    return content
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
};

/**
 * Shablonni print-ready formatda olish
 */
export const templateToPrintFormat = (content: string): string => {
    return `
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>Hujjat</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 14pt;
      line-height: 1.5;
      max-width: 210mm;
      margin: 20mm auto;
      padding: 20mm;
    }
    @media print {
      body { margin: 0; padding: 15mm; }
    }
  </style>
</head>
<body>
${templateToHtml(content)}
</body>
</html>
  `.trim();
};

export default {
    fillTemplate,
    variablesToPrompt,
    templateToHtml,
    templateToPrintFormat
};
