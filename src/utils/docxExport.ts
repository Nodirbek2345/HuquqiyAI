import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

export const generateDocx = async (title: string, content: string) => {
    // Matnni xatboshilarga bo'lamiz
    const lines = content.split('\n').filter(line => line.trim().length > 0);

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        text: title,
                        heading: HeadingLevel.TITLE,
                        alignment: AlignmentType.CENTER,
                        spacing: {
                            after: 400,
                        },
                    }),
                    ...lines.map(line => {
                        return new Paragraph({
                            children: [
                                new TextRun({
                                    text: line.trim(),
                                    size: 24, // 12pt (docx o'lchami yarim punktlarda beriladi)
                                }),
                            ],
                            spacing: {
                                after: 200,
                                line: 360, // 1.5 qator oralig'i
                            },
                            alignment: AlignmentType.JUSTIFIED,
                        });
                    })
                ],
            },
        ],
    });

    // DOCX blob yaratish
    const blob = await Packer.toBlob(doc);
    
    // Yuklab olish uchun vaqtinchalik havola
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || 'Hujjat_AdolatAI'}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};
