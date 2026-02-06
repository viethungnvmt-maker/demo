import { LessonPlanData } from '../types';

/**
 * Inject NLS content into the original lesson plan
 * Preserves 100% of original structure, only adds NLS content at appropriate positions
 */
export const injectNLSIntoLessonPlan = (
  originalContent: string,
  data: LessonPlanData,
  includeAI: boolean
): string => {
  if (!originalContent || originalContent.trim() === '') {
    return originalContent;
  }

  let modifiedContent = originalContent;

  // === CHÈN NLS VÀO SAU PHẦN MỤC TIÊU ===
  // Tìm các pattern phổ biến cho phần mục tiêu trong giáo án Việt Nam
  const objectiveEndPatterns = [
    // Pattern: I. Mục tiêu ... II. (tìm điểm bắt đầu phần II)
    /(I\.\s*Mục tiêu[\s\S]*?)((?=II\.\s)|(?=2\.\s)|(?=\nII\.)|(?=\n2\.))/gi,
    // Pattern: 1. Mục tiêu ... 2. (tìm điểm bắt đầu phần 2)
    /(1\.\s*Mục tiêu[\s\S]*?)((?=2\.\s)|(?=\nII\.)|(?=\n2\.))/gi,
  ];

  // Tạo nội dung NLS để chèn
  let nlsGoalsText = '\n\n* Năng lực số:\n';
  if (data.digitalGoals && data.digitalGoals.length > 0) {
    data.digitalGoals.forEach((goal) => {
      nlsGoalsText += `- ${goal.description}\n`;
    });
  } else {
    nlsGoalsText += '- Khai thác và sử dụng các công cụ số trong học tập\n';
    nlsGoalsText += '- Hợp tác và giao tiếp qua môi trường số\n';
  }

  if (includeAI) {
    nlsGoalsText += '\n* Năng lực trí tuệ nhân tạo:\n';
    nlsGoalsText += '- Sử dụng công cụ AI hỗ trợ học tập có trách nhiệm\n';
    nlsGoalsText += '- Đánh giá và kiểm chứng thông tin từ AI\n';
  }

  // Thử chèn NLS sau phần mục tiêu
  let injected = false;
  for (const pattern of objectiveEndPatterns) {
    if (pattern.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(pattern, (match, p1, p2) => {
        injected = true;
        return p1 + nlsGoalsText + '\n' + p2;
      });
      if (injected) break;
    }
  }

  // Nếu không tìm thấy pattern, thử tìm "Mục tiêu" và chèn sau đoạn đó
  if (!injected) {
    const simplePattern = /(Mục tiêu[^\n]*\n(?:[^\n]*\n)*?)(\n(?:II\.|2\.|Thiết bị|Chuẩn bị|Nội dung))/gi;
    if (simplePattern.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(simplePattern, (match, p1, p2) => {
        injected = true;
        return p1 + nlsGoalsText + p2;
      });
    }
  }

  // === CHÈN HOẠT ĐỘNG SỐ VÀO CÁC HOẠT ĐỘNG ===
  if (data.activities && data.activities.length > 0) {
    data.activities.forEach((activity) => {
      // Tìm hoạt động theo tên
      const activityPatterns = [
        new RegExp(`(${escapeRegex(activity.name)}[^\\n]*)(\\n)`, 'gi'),
        new RegExp(`(Hoạt động[^:]*:[^\\n]*${escapeRegex(activity.name.substring(0, 20))}[^\\n]*)(\\n)`, 'gi'),
      ];

      let nlsActivityText = '';
      if (activity.digitalActivity) {
        nlsActivityText += `\n[Hoạt động số: ${activity.digitalActivity}]`;
      }
      if (activity.digitalTools && activity.digitalTools.length > 0) {
        nlsActivityText += `\n[Công cụ: ${activity.digitalTools.join(', ')}]`;
      }
      if (includeAI && nlsActivityText) {
        nlsActivityText += '\n[Tích hợp AI: HS có thể sử dụng AI hỗ trợ]';
      }

      if (nlsActivityText) {
        for (const pattern of activityPatterns) {
          if (pattern.test(modifiedContent)) {
            modifiedContent = modifiedContent.replace(pattern, (match, p1, p2) => {
              return p1 + nlsActivityText + p2;
            });
            break;
          }
        }
      }
    });
  }

  // Nếu không chèn được gì, thêm phần NLS vào cuối
  if (!injected) {
    modifiedContent += '\n\n========================================\n';
    modifiedContent += 'BỔ SUNG NĂNG LỰC SỐ\n';
    modifiedContent += '========================================\n';
    modifiedContent += nlsGoalsText;

    if (data.activities && data.activities.length > 0) {
      modifiedContent += '\n* Hoạt động số tích hợp:\n';
      data.activities.forEach((activity) => {
        if (activity.digitalActivity) {
          modifiedContent += `- ${activity.name}: ${activity.digitalActivity}\n`;
        }
      });
    }
  }

  return modifiedContent;
};

/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Download the modified lesson plan as a .doc file
 * Keeps original structure and injects NLS content
 */
export const downloadAsDocx = (
  data: LessonPlanData,
  includeAI: boolean,
  originalContent?: string
): void => {
  let finalContent: string;

  if (originalContent && originalContent.trim()) {
    // Chèn NLS vào nội dung gốc
    finalContent = injectNLSIntoLessonPlan(originalContent, data, includeAI);
  } else {
    // Fallback nếu không có nội dung gốc
    finalContent = 'Không có nội dung giáo án gốc.';
  }

  // Tạo file Word (HTML format mà Word đọc được)
  // Giữ nguyên cấu trúc text, chỉ wrap trong HTML cơ bản
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { 
  font-family: 'Times New Roman', serif; 
  font-size: 13pt; 
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
</head>
<body>
${escapeHtml(finalContent)}
</body>
</html>`;

  // Tạo và tải file
  const blob = new Blob([htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const safeTitle = (data.title || 'Giao_an').replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\s]/g, '_').substring(0, 50);
  const filename = `${safeTitle}_tich_hop_NLS.doc`;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>\n');
}

export default { injectNLSIntoLessonPlan, downloadAsDocx };
