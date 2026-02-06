import { LessonPlanData } from '../types';
// @ts-ignore - imported via importmap in index.html
import JSZip from 'jszip';
// @ts-ignore - imported via importmap in index.html  
import { saveAs } from 'file-saver';

/**
 * Tạo XML paragraph cho nội dung NLS (định dạng Open XML)
 */
const createNLSXmlParagraphs = (data: LessonPlanData, includeAI: boolean): string => {
  let xml = '';

  // Tạo paragraph rỗng để tạo khoảng cách
  const emptyPara = '<w:p><w:pPr></w:pPr></w:p>';

  // Năng lực số - màu đỏ (DC2626)
  xml += `
    <w:p>
      <w:pPr><w:ind w:left="720"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:color w:val="DC2626"/></w:rPr>
        <w:t>- Năng lực số:</w:t>
      </w:r>
    </w:p>
  `;

  if (data.digitalGoals && data.digitalGoals.length > 0) {
    data.digitalGoals.forEach((goal) => {
      xml += `
        <w:p>
          <w:pPr><w:ind w:left="1440"/></w:pPr>
          <w:r>
            <w:rPr><w:color w:val="DC2626"/></w:rPr>
            <w:t>+ ${escapeXml(goal.description)}</w:t>
          </w:r>
        </w:p>
      `;
    });
  } else {
    xml += `
      <w:p>
        <w:pPr><w:ind w:left="1440"/></w:pPr>
        <w:r>
          <w:rPr><w:color w:val="DC2626"/></w:rPr>
          <w:t>+ Khai thác và sử dụng các công cụ số trong học tập</w:t>
        </w:r>
      </w:p>
      <w:p>
        <w:pPr><w:ind w:left="1440"/></w:pPr>
        <w:r>
          <w:rPr><w:color w:val="DC2626"/></w:rPr>
          <w:t>+ Hợp tác và giao tiếp qua môi trường số</w:t>
        </w:r>
      </w:p>
    `;
  }

  // Năng lực AI - màu xanh (2563EB)
  if (includeAI) {
    xml += `
      <w:p>
        <w:pPr><w:ind w:left="720"/></w:pPr>
        <w:r>
          <w:rPr><w:b/><w:color w:val="2563EB"/></w:rPr>
          <w:t>- Năng lực trí tuệ nhân tạo:</w:t>
        </w:r>
      </w:p>
      <w:p>
        <w:pPr><w:ind w:left="1440"/></w:pPr>
        <w:r>
          <w:rPr><w:color w:val="2563EB"/></w:rPr>
          <w:t>+ Sử dụng công cụ AI hỗ trợ học tập có trách nhiệm</w:t>
        </w:r>
      </w:p>
      <w:p>
        <w:pPr><w:ind w:left="1440"/></w:pPr>
        <w:r>
          <w:rPr><w:color w:val="2563EB"/></w:rPr>
          <w:t>+ Đánh giá và kiểm chứng thông tin từ AI</w:t>
        </w:r>
      </w:p>
    `;
  }

  return xml;
};

/**
 * Escape ký tự đặc biệt cho XML
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Chỉnh sửa file docx gốc và chèn nội dung NLS
 */
export const modifyDocxWithNLS = async (
  originalFile: ArrayBuffer,
  data: LessonPlanData,
  includeAI: boolean
): Promise<Blob> => {
  try {
    // Đọc file docx (là file zip)
    const zip = await JSZip.loadAsync(originalFile);

    // Lấy file document.xml - chứa nội dung chính
    const documentXml = await zip.file('word/document.xml')?.async('string');

    if (!documentXml) {
      throw new Error('Không tìm thấy document.xml trong file');
    }

    // Tạo nội dung NLS dạng XML
    const nlsXml = createNLSXmlParagraphs(data, includeAI);

    // Tìm các vị trí để chèn NLS
    let modifiedXml = documentXml;

    // Pattern 1: Tìm "2. Về năng lực" hoặc "Về năng lực"
    const competencyPatterns = [
      /(<w:t[^>]*>(?:[^<]*)?2\.\s*Về năng lực[^<]*<\/w:t>)/gi,
      /(<w:t[^>]*>(?:[^<]*)?Về năng lực[^<]*<\/w:t>)/gi,
      /(<w:t[^>]*>(?:[^<]*)?b[\.\)]\s*Năng lực[^<]*<\/w:t>)/gi,
    ];

    let injected = false;

    for (const pattern of competencyPatterns) {
      if (pattern.test(modifiedXml)) {
        // Tìm thẻ </w:p> đầu tiên sau vị trí match
        modifiedXml = modifiedXml.replace(pattern, (match) => {
          // Tìm vị trí của match trong document
          const matchIndex = modifiedXml.indexOf(match);
          if (matchIndex > -1) {
            // Tìm thẻ đóng </w:p> sau match
            const afterMatch = modifiedXml.substring(matchIndex);
            const closingPIndex = afterMatch.indexOf('</w:p>');
            if (closingPIndex > -1) {
              injected = true;
              // Chèn NLS sau thẻ </w:p>
              return match;
            }
          }
          return match;
        });

        if (injected) {
          // Chèn sau pattern tìm được
          modifiedXml = modifiedXml.replace(
            /(<w:t[^>]*>(?:[^<]*)?(?:2\.\s*)?Về năng lực[^<]*<\/w:t><\/w:r><\/w:p>)/i,
            `$1${nlsXml}`
          );
          break;
        }
      }
    }

    // Nếu không tìm thấy pattern cụ thể, tìm "I. Mục tiêu" và chèn sau section đó
    if (!injected) {
      const objectivePattern = /(<w:t[^>]*>(?:[^<]*)?(?:I\.\s*)?Mục tiêu[^<]*<\/w:t>)/gi;
      if (objectivePattern.test(modifiedXml)) {
        // Tìm thẻ </w:p> thứ 5 sau "Mục tiêu" (ước tính kết thúc section)
        const match = modifiedXml.match(objectivePattern);
        if (match) {
          const matchIndex = modifiedXml.indexOf(match[0]);
          const afterMatch = modifiedXml.substring(matchIndex);

          // Tìm vị trí II. hoặc section tiếp theo
          const nextSectionPattern = /<w:t[^>]*>(?:[^<]*)?(?:II\.|2\.|Thiết bị|Chuẩn bị)[^<]*<\/w:t>/i;
          const nextSectionMatch = afterMatch.match(nextSectionPattern);

          if (nextSectionMatch) {
            const nextSectionIndex = afterMatch.indexOf(nextSectionMatch[0]);
            // Tìm thẻ <w:p> trước section tiếp theo
            const beforeNextSection = afterMatch.substring(0, nextSectionIndex);
            const lastParagraphEnd = beforeNextSection.lastIndexOf('</w:p>');

            if (lastParagraphEnd > -1) {
              const insertPosition = matchIndex + lastParagraphEnd + 6; // 6 = length of '</w:p>'
              modifiedXml =
                modifiedXml.substring(0, insertPosition) +
                nlsXml +
                modifiedXml.substring(insertPosition);
              injected = true;
            }
          }
        }
      }
    }

    // Nếu vẫn không inject được, thêm vào cuối document (trước </w:body>)
    if (!injected) {
      modifiedXml = modifiedXml.replace('</w:body>', `${nlsXml}</w:body>`);
    }

    // Cập nhật file document.xml trong zip
    zip.file('word/document.xml', modifiedXml);

    // Tạo file docx mới
    const blob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    return blob;
  } catch (error) {
    console.error('Error modifying docx:', error);
    throw error;
  }
};

/**
 * Download file docx đã chỉnh sửa
 */
export const downloadAsDocx = async (
  data: LessonPlanData,
  includeAI: boolean,
  originalContent?: string,
  originalFile?: ArrayBuffer
): Promise<void> => {
  try {
    if (originalFile) {
      // Có file gốc - chỉnh sửa và giữ định dạng
      const modifiedBlob = await modifyDocxWithNLS(originalFile, data, includeAI);
      const safeTitle = (data.title || 'Giao_an').replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\s]/g, '_').substring(0, 30);
      saveAs(modifiedBlob, `${safeTitle}_tich_hop_NLS.docx`);
    } else {
      // Không có file gốc - tạo file mới (fallback)
      downloadNLSReference(data, includeAI);
    }
  } catch (error) {
    console.error('Error downloading docx:', error);
    // Fallback
    downloadNLSReference(data, includeAI);
  }
};

/**
 * Tạo file tham khảo NLS riêng (fallback)
 */
const downloadNLSReference = (data: LessonPlanData, includeAI: boolean): void => {
  let content = 'NỘI DUNG NĂNG LỰC SỐ CẦN CHÈN VÀO GIÁO ÁN\n\n';
  content += 'CHÈN VÀO PHẦN "I. MỤC TIÊU" → mục "2. Về năng lực:"\n\n';
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
  saveAs(blob, `Noi_dung_NLS_${data.title || 'giao_an'}.txt`);
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

export default { modifyDocxWithNLS, downloadAsDocx, copyNLSToClipboard };
