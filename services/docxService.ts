import { LessonPlanData } from '../types';
// @ts-ignore - imported via importmap in index.html
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
// @ts-ignore - imported via importmap in index.html  
import { saveAs } from 'file-saver';

/**
 * Tạo nội dung NLS để chèn vào giáo án
 */
const createNLSParagraphs = (data: LessonPlanData, includeAI: boolean): Paragraph[] => {
  const paragraphs: Paragraph[] = [];

  // Năng lực số
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '   - Năng lực số:',
          bold: true,
          color: 'DC2626', // Màu đỏ
        }),
      ],
    })
  );

  if (data.digitalGoals && data.digitalGoals.length > 0) {
    data.digitalGoals.forEach((goal) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `      + ${goal.description}`,
              color: 'DC2626',
            }),
          ],
        })
      );
    });
  } else {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '      + Khai thác và sử dụng các công cụ số trong học tập',
            color: 'DC2626',
          }),
        ],
      })
    );
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '      + Hợp tác và giao tiếp qua môi trường số',
            color: 'DC2626',
          }),
        ],
      })
    );
  }

  // Năng lực AI (nếu được chọn)
  if (includeAI) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '   - Năng lực trí tuệ nhân tạo:',
            bold: true,
            color: '2563EB', // Màu xanh
          }),
        ],
      })
    );
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '      + Sử dụng công cụ AI hỗ trợ học tập có trách nhiệm',
            color: '2563EB',
          }),
        ],
      })
    );
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '      + Đánh giá và kiểm chứng thông tin từ AI',
            color: '2563EB',
          }),
        ],
      })
    );
  }

  return paragraphs;
};

/**
 * Tạo document Word mới với nội dung NLS
 */
export const createNLSDocument = async (
  data: LessonPlanData,
  includeAI: boolean,
  originalContent?: string
): Promise<Blob> => {
  const sections: Paragraph[] = [];

  // Header
  sections.push(
    new Paragraph({
      text: 'NỘI DUNG NĂNG LỰC SỐ CẦN CHÈN VÀO GIÁO ÁN',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    })
  );

  sections.push(new Paragraph({ text: '' }));

  // Thông tin bài học
  if (data.title) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Bài học: ', bold: true }),
          new TextRun({ text: data.title }),
        ],
      })
    );
  }

  sections.push(new Paragraph({ text: '' }));

  // Hướng dẫn
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '📌 CHÈN VÀO PHẦN "I. MỤC TIÊU" → mục "2. Về năng lực:"',
          bold: true,
        }),
      ],
    })
  );

  sections.push(new Paragraph({ text: '' }));

  // Nội dung NLS
  sections.push(...createNLSParagraphs(data, includeAI));

  sections.push(new Paragraph({ text: '' }));
  sections.push(new Paragraph({ text: '' }));

  // Hoạt động số
  if (data.activities && data.activities.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '📌 CHÈN VÀO CÁC HOẠT ĐỘNG HỌC TẬP:',
            bold: true,
          }),
        ],
      })
    );

    sections.push(new Paragraph({ text: '' }));

    data.activities.forEach((activity) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `🔹 ${activity.name}`,
              bold: true,
            }),
          ],
        })
      );

      if (activity.digitalActivity) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `   → Hoạt động số: ${activity.digitalActivity}`,
                color: 'DC2626',
              }),
            ],
          })
        );
      }

      if (activity.digitalTools && activity.digitalTools.length > 0) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `   → Công cụ: ${activity.digitalTools.join(', ')}`,
                color: '059669',
              }),
            ],
          })
        );
      }

      if (includeAI) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '   → AI: Học sinh có thể sử dụng AI hỗ trợ',
                color: '2563EB',
              }),
            ],
          })
        );
      }

      sections.push(new Paragraph({ text: '' }));
    });
  }

  // Công cụ khuyến nghị
  if (data.recommendedTools && data.recommendedTools.length > 0) {
    sections.push(new Paragraph({ text: '' }));
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '📌 CÔNG CỤ SỐ KHUYẾN NGHỊ:',
            bold: true,
          }),
        ],
      })
    );

    data.recommendedTools.forEach((tool, idx) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `   ${idx + 1}. ${tool}`,
            }),
          ],
        })
      );
    });
  }

  // Footer
  sections.push(new Paragraph({ text: '' }));
  sections.push(new Paragraph({ text: '' }));
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '💡 Hướng dẫn: Copy nội dung trên và paste vào file giáo án gốc tại các vị trí được chỉ định.',
          italics: true,
          color: '6B7280',
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        children: sections,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
};

/**
 * Download file Word với nội dung NLS
 */
export const downloadAsDocx = async (
  data: LessonPlanData,
  includeAI: boolean,
  originalContent?: string
): Promise<void> => {
  try {
    const blob = await createNLSDocument(data, includeAI, originalContent);
    const safeTitle = (data.title || 'NLS').replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\s]/g, '_').substring(0, 30);
    saveAs(blob, `Noi_dung_NLS_${safeTitle}.docx`);
  } catch (error) {
    console.error('Error creating docx:', error);
    // Fallback to simple HTML download
    downloadAsFallback(data, includeAI);
  }
};

/**
 * Fallback download nếu thư viện docx không hoạt động
 */
const downloadAsFallback = (data: LessonPlanData, includeAI: boolean): void => {
  let content = 'NỘI DUNG NĂNG LỰC SỐ CẦN CHÈN VÀO GIÁO ÁN\n\n';
  content += '📌 CHÈN VÀO PHẦN "I. MỤC TIÊU" → mục "2. Về năng lực:"\n\n';
  content += '   - Năng lực số:\n';

  if (data.digitalGoals && data.digitalGoals.length > 0) {
    data.digitalGoals.forEach((goal) => {
      content += `      + ${goal.description}\n`;
    });
  } else {
    content += '      + Khai thác và sử dụng các công cụ số trong học tập\n';
  }

  if (includeAI) {
    content += '\n   - Năng lực trí tuệ nhân tạo:\n';
    content += '      + Sử dụng công cụ AI hỗ trợ học tập có trách nhiệm\n';
    content += '      + Đánh giá và kiểm chứng thông tin từ AI\n';
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Noi_dung_NLS_${data.title || 'giao_an'}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Copy nội dung NLS vào clipboard
 */
export const copyNLSToClipboard = async (
  data: LessonPlanData,
  includeAI: boolean
): Promise<boolean> => {
  try {
    let content = '   - Năng lực số:\n';

    if (data.digitalGoals && data.digitalGoals.length > 0) {
      data.digitalGoals.forEach((goal) => {
        content += `      + ${goal.description}\n`;
      });
    } else {
      content += '      + Khai thác và sử dụng các công cụ số trong học tập\n';
      content += '      + Hợp tác và giao tiếp qua môi trường số\n';
    }

    if (includeAI) {
      content += '\n   - Năng lực trí tuệ nhân tạo:\n';
      content += '      + Sử dụng công cụ AI hỗ trợ học tập có trách nhiệm\n';
      content += '      + Đánh giá và kiểm chứng thông tin từ AI\n';
    }

    await navigator.clipboard.writeText(content);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

export default { createNLSDocument, downloadAsDocx, copyNLSToClipboard };
