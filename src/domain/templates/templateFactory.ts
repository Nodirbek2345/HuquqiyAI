// AdolatAI - Shablon yaratish fabrikasi

import { generateId } from '../../utils/helpers';
import logger from '../../core/logger';

interface DocumentTemplate {
    id: string;
    type: string;
    header: string;
    title: string;
    body: string;
    footer: string;
    variables: string[];
}

type TemplateType =
    | 'shartnoma'
    | 'ariza'
    | 'ishonchnoma'
    | 'davo'
    | 'akt'
    | 'bayonnoma'
    | 'buyruq'
    | 'xat';

/**
 * Shablon yaratish fabrikasi
 */
export const createTemplate = (
    type: TemplateType,
    customData?: Partial<DocumentTemplate>
): DocumentTemplate => {
    logger.info('Creating template', { type });

    const baseTemplates: Record<TemplateType, Omit<DocumentTemplate, 'id'>> = {
        shartnoma: {
            type: 'Shartnoma',
            header: 'O\'ZBEKISTON RESPUBLIKASI',
            title: 'SHARTNOMA № ___',
            body: `
{{shahar}}, {{sana}}

"{{tomon1_nomi}}" (keyingi o'rinlarda "Birinchi tomon" deb yuritiladi), bir tomondan, va "{{tomon2_nomi}}" (keyingi o'rinlarda "Ikkinchi tomon" deb yuritiladi), ikkinchi tomondan, quyidagi shartnomani tuzdilar:

1. SHARTNOMA PREDMETI
1.1. {{predmet}}

2. TOMONLARNING HUQUQ VA MAJBURIYATLARI
2.1. Birinchi tomon majburiyatlari:
- {{tomon1_majburiyat1}}
- {{tomon1_majburiyat2}}

2.2. Ikkinchi tomon majburiyatlari:
- {{tomon2_majburiyat1}}
- {{tomon2_majburiyat2}}

3. HISOB-KITOBLAR
3.1. Shartnoma summasi: {{summa}} so'm.
3.2. To'lov tartibi: {{tolov_tartibi}}

4. JAVOBGARLIK
4.1. Tomonlar o'z majburiyatlarini bajarmagan taqdirda qonunchilikka muvofiq javobgar bo'ladilar.

5. FORS-MAJOR
5.1. Tomonlar o'z nazoratidan tashqari favqulodda holatlarda javobgarlikdan ozod etiladi.

6. YAKUNIY QOIDALAR
6.1. Shartnoma {{boshlanish_sanasi}} dan boshlab {{tugash_sanasi}} gacha amal qiladi.
6.2. Shartnoma 2 nusxada tuzildi, qonuniy kuchga ega.
      `.trim(),
            footer: `
TOMONLARNING REKVIZITLARI VA IMZOLARI:

BIRINCHI TOMON:                     IKKINCHI TOMON:
{{tomon1_nomi}}                     {{tomon2_nomi}}
Manzil: {{tomon1_manzil}}           Manzil: {{tomon2_manzil}}
INN: {{tomon1_inn}}                 INN: {{tomon2_inn}}
H/R: {{tomon1_hr}}                  H/R: {{tomon2_hr}}

_____________________               _____________________
        (imzo)                              (imzo)
          M.O.                                M.O.
      `.trim(),
            variables: [
                'shahar', 'sana', 'tomon1_nomi', 'tomon2_nomi', 'predmet',
                'tomon1_majburiyat1', 'tomon1_majburiyat2',
                'tomon2_majburiyat1', 'tomon2_majburiyat2',
                'summa', 'tolov_tartibi', 'boshlanish_sanasi', 'tugash_sanasi',
                'tomon1_manzil', 'tomon1_inn', 'tomon1_hr',
                'tomon2_manzil', 'tomon2_inn', 'tomon2_hr'
            ]
        },

        ariza: {
            type: 'Ariza',
            header: '',
            title: '{{kimga}}\n{{ariza_beruvchi}}dan',
            body: `
ARIZA

{{ariza_mazmuni}}

Ilova:
{{ilovalar}}

Hurmat bilan,
{{sana}}
      `.trim(),
            footer: `
_____________________
       (F.I.SH., imzo)
      `.trim(),
            variables: ['kimga', 'ariza_beruvchi', 'ariza_mazmuni', 'ilovalar', 'sana']
        },

        ishonchnoma: {
            type: 'Ishonchnoma',
            header: 'ISHONCHNOMA',
            title: '№ ___ / {{sana}}',
            body: `
Men, {{ishonch_beruvchi_fish}}, pasport {{pasport_raqami}}, {{manzil}} da yashovchi,

ushbu ishonchnoma orqali, {{ishonch_oluvchi_fish}}, pasport {{ishonch_oluvchi_pasport}},

ga quyidagi vakolatlarni beraman:

{{vakolatlar}}

Ishonchnoma {{amal_qilish_muddati}} muddat bilan berildi.

{{shahar}}, {{sana}}
      `.trim(),
            footer: `
_____________________
       (imzo)
       
Tasdiqlangan:
Notarius ________________
Reestr № _______________
      `.trim(),
            variables: [
                'ishonch_beruvchi_fish', 'pasport_raqami', 'manzil',
                'ishonch_oluvchi_fish', 'ishonch_oluvchi_pasport',
                'vakolatlar', 'amal_qilish_muddati', 'shahar', 'sana'
            ]
        },

        davo: {
            type: 'Da\'vo arizasi',
            header: '{{sud_nomi}}',
            title: 'DA\'VO ARIZASI',
            body: `
Da'vogar: {{davogar_fish}}
Manzil: {{davogar_manzil}}
Tel: {{davogar_tel}}

Javobgar: {{javobgar_fish}}
Manzil: {{javobgar_manzil}}
Tel: {{javobgar_tel}}

Da'vo summasi: {{davo_summasi}} so'm

DA'VO TALABI HAQIDA

{{davo_mazmuni}}

Yuqoridagilarni inobatga olib,

SO'RAYMAN:

{{davo_talabi}}

ILOVA:
{{ilovalar}}

{{sana}}
      `.trim(),
            footer: `
Da'vogar: _____________________
                 (imzo)
      `.trim(),
            variables: [
                'sud_nomi', 'davogar_fish', 'davogar_manzil', 'davogar_tel',
                'javobgar_fish', 'javobgar_manzil', 'javobgar_tel',
                'davo_summasi', 'davo_mazmuni', 'davo_talabi', 'ilovalar', 'sana'
            ]
        },

        akt: {
            type: 'Dalolatnoma',
            header: '',
            title: 'DALOLATNOMA (AKT)',
            body: `
{{shahar}}                                          {{sana}}

Biz, quyida imzo chekuvchilar:
1. {{shaxs1_fish}}, lavozimi: {{shaxs1_lavozim}}
2. {{shaxs2_fish}}, lavozimi: {{shaxs2_lavozim}}
3. {{shaxs3_fish}}, lavozimi: {{shaxs3_lavozim}}

ushbu dalolatnomani tuzdik:

{{dalolatnoma_mazmuni}}

Xulosa:
{{xulosa}}
      `.trim(),
            footer: `
Imzolar:
1. _____________________ ({{shaxs1_fish}})
2. _____________________ ({{shaxs2_fish}})
3. _____________________ ({{shaxs3_fish}})
      `.trim(),
            variables: [
                'shahar', 'sana',
                'shaxs1_fish', 'shaxs1_lavozim',
                'shaxs2_fish', 'shaxs2_lavozim',
                'shaxs3_fish', 'shaxs3_lavozim',
                'dalolatnoma_mazmuni', 'xulosa'
            ]
        },

        bayonnoma: {
            type: 'Bayonnoma',
            header: 'BAYONNOMA',
            title: '№ ___ / {{sana}}',
            body: `
Ishtirokchilar:
{{ishtirokchilar}}

KUN TARTIBI:
{{kun_tartibi}}

MUHOKAMA:
{{muhokama}}

QAROR QILINDI:
{{qaror}}
      `.trim(),
            footer: `
Rais: _____________________ ({{rais_fish}})
Kotib: _____________________ ({{kotib_fish}})
      `.trim(),
            variables: [
                'sana', 'ishtirokchilar', 'kun_tartibi',
                'muhokama', 'qaror', 'rais_fish', 'kotib_fish'
            ]
        },

        buyruq: {
            type: 'Buyruq',
            header: '{{tashkilot_nomi}}',
            title: 'BUYRUQ № ___',
            body: `
{{shahar}}                                          {{sana}}

{{buyruq_sababi}}

BUYURAMAN:

{{buyruq_mazmuni}}

Nazorat zimmasiga: {{nazoratchi}}
      `.trim(),
            footer: `
Rahbar: _____________________ ({{rahbar_fish}})
              M.O.
      `.trim(),
            variables: [
                'tashkilot_nomi', 'shahar', 'sana',
                'buyruq_sababi', 'buyruq_mazmuni',
                'nazoratchi', 'rahbar_fish'
            ]
        },

        xat: {
            type: 'Rasmiy xat',
            header: '{{jo\'natuvchi}}',
            title: '',
            body: `
{{oluvchi}}

Hurmatli {{oluvchi_nomi}},

{{xat_mazmuni}}

Hurmat bilan,
{{jo\'natuvchi_fish}}
{{lavozim}}
{{sana}}
      `.trim(),
            footer: `
Tel: {{telefon}}
Email: {{email}}
      `.trim(),
            variables: [
                'jo\'natuvchi', 'oluvchi', 'oluvchi_nomi',
                'xat_mazmuni', 'jo\'natuvchi_fish',
                'lavozim', 'sana', 'telefon', 'email'
            ]
        }
    };

    const baseTemplate = baseTemplates[type];

    return {
        id: generateId(),
        ...baseTemplate,
        ...customData
    };
};

/**
 * Mavjud shablon turlarini olish
 */
export const getTemplateTypes = (): TemplateType[] => {
    return ['shartnoma', 'ariza', 'ishonchnoma', 'davo', 'akt', 'bayonnoma', 'buyruq', 'xat'];
};

export default createTemplate;
