import { LessonPlanData } from '../types';

// Declare global types for CDN libraries
declare global {
  interface Window {
    JSZip: any;
    saveAs: (blob: Blob, filename: string) => void;
  }
}

/**
 * Tạo XML paragraph với text màu đỏ (NLS) - tuân theo chuẩn DOCX OOXML
 */
const createRedParagraphXml = (text: string): string => {
  // Escape XML special characters
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  return `<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:pPr>
      <w:ind w:left="720" w:hanging="360"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:color w:val="FF0000"/>
        <w:sz w:val="26"/>
        <w:szCs w:val="26"/>
      </w:rPr>
      <w:t xml:space="preserve">${escaped}</w:t>
    </w:r>
  </w:p>`;
};

/**
 * Tạo paragraph với bullet point màu đỏ
 */
const createBulletParagraphXml = (text: string): string => {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  return `<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:pPr>
      <w:ind w:left="1080" w:hanging="360"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:color w:val="FF0000"/>
        <w:sz w:val="26"/>
        <w:szCs w:val="26"/>
      </w:rPr>
      <w:t xml:space="preserve">+ ${escaped}</w:t>
    </w:r>
  </w:p>`;
};

/**
 * Tạo nội dung NLS dưới dạng XML để chèn vào DOCX
 */
const generateNLSXmlContent = (data: LessonPlanData, includeAI: boolean): string => {
  let xmlContent = '';

  // Header Năng lực số
  xmlContent += createRedParagraphXml('- Năng lực số:');

  // Các mục tiêu NLS
  if (data.digitalGoals && data.digitalGoals.length > 0) {
    data.digitalGoals.forEach((goal) => {
      xmlContent += createBulletParagraphXml(goal.description);
    });
  } else {
    // Default goals nếu không có
    xmlContent += createBulletParagraphXml('Khai thác và sử dụng các công cụ số trong học tập');
    xmlContent += createBulletParagraphXml('Hợp tác và giao tiếp qua môi trường số');
    xmlContent += createBulletParagraphXml('Đánh giá và chọn lọc thông tin số');
  }

  // Năng lực AI nếu được bật
  if (includeAI) {
    xmlContent += createRedParagraphXml('- Năng lực trí tuệ nhân tạo:');
    xmlContent += createBulletParagraphXml('Sử dụng công cụ AI hỗ trợ học tập có trách nhiệm');
    xmlContent += createBulletParagraphXml('Đánh giá và kiểm chứng thông tin từ AI');
  }

  return xmlContent;
};

/**
 * Tìm vị trí thích hợp để chèn NLS (sau "năng lực" hoặc sau "mục tiêu")
 */
const findInsertPosition = (xmlContent: string): { position: number; found: boolean } => {
  // Tìm các pattern phổ biến trong giáo án Việt Nam
  const patterns = [
    /Về năng lực/i,
    /năng lực:/i,
    /2\.\s*Năng lực/i,
    /năng lực chung/i,
    /năng lực đặc thù/i,
    /năng lực riêng/i,
    /MỤC TIÊU/i,
    /I\.\s*MỤC TIÊU/i
  ];

  let bestMatch = { position: -1, found: false };

  for (const pattern of patterns) {
    const match = xmlContent.match(pattern);
    if (match && match.index !== undefined) {
      // Tìm thẻ </w:p> tiếp theo sau vị trí tìm được
      const afterMatch = xmlContent.indexOf('</w:p>', match.index);
      if (afterMatch !== -1) {
        const insertPos = afterMatch + '</w:p>'.length;
        if (bestMatch.position === -1 || insertPos < bestMatch.position) {
          bestMatch = { position: insertPos, found: true };
        }
      }
    }
  }

  // Fallback: tìm paragraph đầu tiên nếu không tìm được
  if (!bestMatch.found) {
    const firstPEnd = xmlContent.indexOf('</w:p>');
    if (firstPEnd !== -1) {
      bestMatch = { position: firstPEnd + '</w:p>'.length, found: true };
    }
  }

  return bestMatch;
};

/**
 * Lấy tên file output từ tên file gốc
 */
const getOutputFileName = (originalFileName: string): string => {
  if (!originalFileName) {
    return 'GiaoAn_NLS.docx';
  }

  // Bỏ phần mở rộng và thêm _NLS
  const lastDotIndex = originalFileName.lastIndexOf('.');
  if (lastDotIndex > 0) {
    const nameWithoutExt = originalFileName.substring(0, lastDotIndex);
    return `${nameWithoutExt}_NLS.docx`;
  }

  return `${originalFileName}_NLS.docx`;
};

/**
 * Download file DOCX với NLS được chèn vào, giữ nguyên định dạng gốc
 */
export const downloadAsDocx = async (
  data: LessonPlanData,
  includeAI: boolean,
  originalContent?: string,
  originalFile?: ArrayBuffer,
  originalFileName?: string
): Promise<void> => {
  try {
    // Kiểm tra JSZip đã load chưa
    if (!window.JSZip) {
      console.error('JSZip not loaded');
      alert('Lỗi: Thư viện JSZip chưa được tải. Vui lòng refresh trang.');
      return;
    }

    // Nếu có file DOCX gốc, sử dụng XML injection
    if (originalFile && originalFileName?.endsWith('.docx')) {
      await modifyOriginalDocx(originalFile, data, includeAI, originalFileName);
    } else {
      // Fallback: tạo file text nếu không có file gốc hoặc không phải DOCX
      await downloadAsTxt(data, includeAI, originalFileName);
    }
  } catch (error) {
    console.error('Error downloading:', error);
    alert('Có lỗi xảy ra khi tải file. Vui lòng thử lại.');
  }
};

/**
 * Chỉnh sửa file DOCX gốc bằng XML injection
 */
const modifyOriginalDocx = async (
  originalFile: ArrayBuffer,
  data: LessonPlanData,
  includeAI: boolean,
  originalFileName: string
): Promise<void> => {
  const JSZip = window.JSZip;

  // Đọc file DOCX gốc (thực chất là file ZIP)
  const zip = await JSZip.loadAsync(originalFile);

  // Đọc nội dung document.xml (chứa nội dung chính của DOCX)
  const documentXml = await zip.file('word/document.xml')?.async('string');

  if (!documentXml) {
    throw new Error('Không thể đọc nội dung file DOCX');
  }

  // Tạo nội dung NLS XML
  const nlsXmlContent = generateNLSXmlContent(data, includeAI);

  // Tìm vị trí để chèn
  const insertResult = findInsertPosition(documentXml);

  let modifiedXml: string;

  if (insertResult.found && insertResult.position > 0) {
    // Chèn NLS XML vào vị trí tìm được
    modifiedXml =
      documentXml.slice(0, insertResult.position) +
      nlsXmlContent +
      documentXml.slice(insertResult.position);
  } else {
    // Fallback: chèn vào cuối <w:body>
    const bodyEnd = documentXml.lastIndexOf('</w:body>');
    if (bodyEnd !== -1) {
      modifiedXml =
        documentXml.slice(0, bodyEnd) +
        nlsXmlContent +
        documentXml.slice(bodyEnd);
    } else {
      throw new Error('Không thể tìm vị trí chèn nội dung');
    }
  }

  // Cập nhật document.xml trong ZIP
  zip.file('word/document.xml', modifiedXml);

  // Tạo file DOCX mới
  const newDocxBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  // Tạo tên file output
  const outputFileName = getOutputFileName(originalFileName);

  // Download file
  if (window.saveAs) {
    window.saveAs(newDocxBlob, outputFileName);
  } else {
    // Fallback
    const url = URL.createObjectURL(newDocxBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = outputFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Fallback: Download dưới dạng TXT nếu không có file DOCX gốc
 */
const downloadAsTxt = async (
  data: LessonPlanData,
  includeAI: boolean,
  originalFileName?: string
): Promise<void> => {
  let content = '════════════════════════════════════════════════════════\n';
  content += '    NỘI DUNG NĂNG LỰC SỐ CẦN CHÈN VÀO GIÁO ÁN\n';
  content += '════════════════════════════════════════════════════════\n\n';

  if (data.title) {
    content += `Bài học: ${data.title}\n\n`;
  }

  content += '📌 CHÈN VÀO PHẦN "I. MỤC TIÊU" → mục "2. Về năng lực:"\n';
  content += '────────────────────────────────────────────────────────\n\n';

  // Năng lực số
  content += '   - Năng lực số:\n';
  if (data.digitalGoals && data.digitalGoals.length > 0) {
    data.digitalGoals.forEach((goal) => {
      content += `      + ${goal.description}\n`;
    });
  }

  // Năng lực AI
  if (includeAI) {
    content += '   - Năng lực trí tuệ nhân tạo:\n';
    content += '      + Sử dụng công cụ AI hỗ trợ học tập có trách nhiệm\n';
    content += '      + Đánh giá và kiểm chứng thông tin từ AI\n';
  }

  // Tạo tên file
  const outputFileName = originalFileName
    ? originalFileName.replace(/\.[^.]+$/, '_NLS.txt')
    : 'Noi_dung_NLS.txt';

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

  if (window.saveAs) {
    window.saveAs(blob, outputFileName);
  } else {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = outputFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Tạo nội dung NLS để copy vào clipboard
 */
const generateNLSContent = (data: LessonPlanData, includeAI: boolean): string => {
  let content = '';

  // Năng lực số
  content += '   - Năng lực số:\n';
  if (data.digitalGoals && data.digitalGoals.length > 0) {
    data.digitalGoals.forEach((goal) => {
      content += `      + ${goal.description}\n`;
    });
  } else {
    content += '      + Khai thác và sử dụng các công cụ số trong học tập\n';
    content += '      + Hợp tác và giao tiếp qua môi trường số\n';
    content += '      + Đánh giá và chọn lọc thông tin số\n';
  }

  // Năng lực AI
  if (includeAI) {
    content += '   - Năng lực trí tuệ nhân tạo:\n';
    content += '      + Sử dụng công cụ AI hỗ trợ học tập có trách nhiệm\n';
    content += '      + Đánh giá và kiểm chứng thông tin từ AI\n';
  }

  return content;
};

/**
 * Copy nội dung NLS vào clipboard
 */
export const copyNLSToClipboard = async (
  data: LessonPlanData,
  includeAI: boolean
): Promise<boolean> => {
  try {
    const content = generateNLSContent(data, includeAI);
    await navigator.clipboard.writeText(content);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

export default { downloadAsDocx, copyNLSToClipboard };
