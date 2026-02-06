import { LessonPlanData } from '../types';

// Declare global types for CDN libraries
declare global {
  interface Window {
    JSZip: any;
    saveAs: (blob: Blob, filename: string) => void;
  }
}

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
 * Download file với nội dung NLS tham khảo
 */
export const downloadAsDocx = async (
  data: LessonPlanData,
  includeAI: boolean,
  originalContent?: string,
  originalFile?: ArrayBuffer
): Promise<void> => {
  try {
    // Tạo nội dung tham khảo NLS
    let content = '════════════════════════════════════════════════════════\n';
    content += '    NỘI DUNG NĂNG LỰC SỐ CẦN CHÈN VÀO GIÁO ÁN\n';
    content += '════════════════════════════════════════════════════════\n\n';

    if (data.title) {
      content += `Bài học: ${data.title}\n\n`;
    }

    content += '📌 CHÈN VÀO PHẦN "I. MỤC TIÊU" → mục "2. Về năng lực:"\n';
    content += '────────────────────────────────────────────────────────\n\n';
    content += generateNLSContent(data, includeAI);

    // Hoạt động số
    if (data.activities && data.activities.length > 0) {
      content += '\n\n📌 CHÈN VÀO CÁC HOẠT ĐỘNG:\n';
      content += '────────────────────────────────────────────────────────\n\n';

      data.activities.forEach((activity) => {
        content += `🔹 ${activity.name}\n`;
        if (activity.digitalActivity) {
          content += `   → Hoạt động số: ${activity.digitalActivity}\n`;
        }
        if (activity.digitalTools && activity.digitalTools.length > 0) {
          content += `   → Công cụ: ${activity.digitalTools.join(', ')}\n`;
        }
        content += '\n';
      });
    }

    // Công cụ khuyến nghị
    if (data.recommendedTools && data.recommendedTools.length > 0) {
      content += '\n📌 CÔNG CỤ SỐ KHUYẾN NGHỊ:\n';
      content += '────────────────────────────────────────────────────────\n';
      data.recommendedTools.forEach((tool, idx) => {
        content += `   ${idx + 1}. ${tool}\n`;
      });
    }

    content += '\n\n════════════════════════════════════════════════════════\n';
    content += '💡 Copy nội dung trên và paste vào file Word gốc\n';
    content += '   tại các vị trí được chỉ định để giữ nguyên định dạng.\n';
    content += '════════════════════════════════════════════════════════\n';

    // Sử dụng FileSaver từ CDN
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const safeTitle = (data.title || 'NLS').replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\s]/g, '_').substring(0, 30);

    if (window.saveAs) {
      window.saveAs(blob, `Noi_dung_NLS_${safeTitle}.txt`);
    } else {
      // Fallback nếu FileSaver chưa load
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Noi_dung_NLS_${safeTitle}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error downloading:', error);
  }
};

/**
 * Copy nội dung NLS vào clipboard - CÁCH TỐT NHẤT để giữ định dạng
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
