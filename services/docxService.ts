import { LessonPlanData } from '../types';

/**
 * Generate NLS content to be injected into the original lesson plan
 * This creates content that can be inserted without changing the original structure
 */
export const generateNLSInjectionContent = (data: LessonPlanData, includeAI: boolean): string => {
  let nlsContent = '';

  // Section 1: NLS Goals to add to objectives
  if (data.digitalGoals && data.digitalGoals.length > 0) {
    nlsContent += '\n\n--- NỘI DUNG NĂNG LỰC SỐ CẦN CHÈN VÀO MỤC TIÊU ---\n';
    nlsContent += '(Chèn vào phần mục tiêu bài học, sau các mục tiêu kiến thức/kỹ năng)\n\n';
    nlsContent += '📌 MỤC TIÊU NĂNG LỰC SỐ:\n';
    data.digitalGoals.forEach((goal, idx) => {
      nlsContent += `   ${idx + 1}. ${goal.description}\n`;
    });
  }

  // Section 2: AI Goals (if enabled)
  if (includeAI) {
    nlsContent += '\n📌 MỤC TIÊU NĂNG LỰC TRÍ TUỆ NHÂN TẠO:\n';
    nlsContent += '   - Học sinh nhận biết và sử dụng các công cụ AI hỗ trợ học tập một cách có trách nhiệm\n';
    nlsContent += '   - Học sinh hiểu được nguyên lý cơ bản của AI và cách AI hỗ trợ trong bài học\n';
    nlsContent += '   - Học sinh biết đánh giá và kiểm chứng thông tin từ các công cụ AI\n';
  }

  // Section 3: Digital activities to add to each activity
  if (data.activities && data.activities.length > 0) {
    nlsContent += '\n\n--- NỘI DUNG NLS CẦN CHÈN VÀO CÁC HOẠT ĐỘNG ---\n';
    nlsContent += '(Chèn vào cuối mỗi hoạt động tương ứng)\n';

    data.activities.forEach((activity, idx) => {
      nlsContent += `\n🔹 ${activity.name.toUpperCase()}:\n`;
      if (activity.digitalActivity) {
        nlsContent += `   ➤ Hoạt động số: ${activity.digitalActivity}\n`;
      }
      if (activity.digitalTools && activity.digitalTools.length > 0) {
        nlsContent += `   ➤ Công cụ: ${activity.digitalTools.join(', ')}\n`;
      }
      if (includeAI) {
        nlsContent += `   ➤ Tích hợp AI: Học sinh sử dụng AI để hỗ trợ tìm kiếm, phân tích và kiểm tra kết quả\n`;
      }
    });
  }

  // Section 4: Recommended tools
  if (data.recommendedTools && data.recommendedTools.length > 0) {
    nlsContent += '\n\n--- CÔNG CỤ SỐ KHUYẾN NGHỊ ---\n';
    nlsContent += '(Có thể thêm vào phần phương tiện/thiết bị dạy học)\n\n';
    data.recommendedTools.forEach((tool, idx) => {
      nlsContent += `   ${idx + 1}. ${tool}\n`;
    });
  }

  return nlsContent;
};

/**
 * Inject NLS content into the original lesson plan text
 * This preserves the original structure and adds NLS content at appropriate positions
 */
export const injectNLSIntoLessonPlan = (
  originalContent: string,
  data: LessonPlanData,
  includeAI: boolean
): string => {
  let modifiedContent = originalContent;

  // Patterns to find sections in Vietnamese lesson plans
  const objectivePatterns = [
    /(\bMỤC TIÊU\b[^\n]*\n)/gi,
    /(\bI\.\s*MỤC TIÊU\b[^\n]*)/gi,
    /(\b1\.\s*Mục tiêu\b[^\n]*)/gi,
  ];

  const activityPatterns = [
    /(\bHOẠT ĐỘNG\s*\d*[^\n]*)/gi,
    /(\bTIẾN TRÌNH[^\n]*)/gi,
    /(\bCÁC HOẠT ĐỘNG[^\n]*)/gi,
  ];

  // Generate NLS goals text
  let nlsGoalsText = '\n\n📌 NĂNG LỰC SỐ:\n';
  if (data.digitalGoals && data.digitalGoals.length > 0) {
    data.digitalGoals.forEach((goal, idx) => {
      nlsGoalsText += `- ${goal.description}\n`;
    });
  }

  if (includeAI) {
    nlsGoalsText += '\n📌 NĂNG LỰC TRÍ TUỆ NHÂN TẠO:\n';
    nlsGoalsText += '- Sử dụng công cụ AI hỗ trợ học tập có trách nhiệm\n';
    nlsGoalsText += '- Đánh giá và kiểm chứng thông tin từ AI\n';
  }

  // Try to inject NLS goals after objectives section
  let injectedGoals = false;
  for (const pattern of objectivePatterns) {
    if (pattern.test(modifiedContent)) {
      // Find the end of the objectives section and inject NLS
      modifiedContent = modifiedContent.replace(pattern, (match) => {
        injectedGoals = true;
        return match + nlsGoalsText;
      });
      if (injectedGoals) break;
    }
  }

  // Generate activity-specific NLS content
  if (data.activities && data.activities.length > 0) {
    data.activities.forEach((activity) => {
      const activityName = activity.name;
      // Try to find and inject after each activity
      const activityRegex = new RegExp(`(${activityName}[^\\n]*\\n)`, 'gi');

      if (activityRegex.test(modifiedContent)) {
        let nlsActivityText = '';
        if (activity.digitalActivity) {
          nlsActivityText += `\n   🔹 [NLS] ${activity.digitalActivity}`;
        }
        if (activity.digitalTools && activity.digitalTools.length > 0) {
          nlsActivityText += `\n   🔹 [Công cụ] ${activity.digitalTools.join(', ')}`;
        }
        if (includeAI) {
          nlsActivityText += '\n   🔹 [AI] HS sử dụng AI để hỗ trợ học tập';
        }

        if (nlsActivityText) {
          modifiedContent = modifiedContent.replace(activityRegex, (match) => {
            return match + nlsActivityText + '\n';
          });
        }
      }
    });
  }

  // If we couldn't inject into specific sections, append at the end
  if (!injectedGoals) {
    modifiedContent += '\n\n' + '='.repeat(50) + '\n';
    modifiedContent += 'NỘI DUNG NĂNG LỰC SỐ BỔ SUNG\n';
    modifiedContent += '='.repeat(50) + '\n';
    modifiedContent += generateNLSInjectionContent(data, includeAI);
  }

  return modifiedContent;
};

/**
 * Download the modified lesson plan as a .docx file
 * Keeps original structure and injects NLS content
 */
export const downloadAsDocx = (
  data: LessonPlanData,
  includeAI: boolean,
  originalContent?: string
): void => {
  let finalContent: string;

  if (originalContent) {
    // If we have original content, inject NLS into it
    finalContent = injectNLSIntoLessonPlan(originalContent, data, includeAI);
  } else {
    // Fallback: Create document with just NLS content
    finalContent = generateNLSInjectionContent(data, includeAI);
  }

  // Create HTML wrapper for Word compatibility
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.6; white-space: pre-wrap; }
        .nls { color: #dc2626; }
        .ai { color: #2563eb; }
      </style>
    </head>
    <body>
${finalContent.replace(/📌 NĂNG LỰC SỐ/g, '<span class="nls">📌 NĂNG LỰC SỐ</span>')
      .replace(/📌 NĂNG LỰC TRÍ TUỆ NHÂN TẠO/g, '<span class="ai">📌 NĂNG LỰC TRÍ TUỆ NHÂN TẠO</span>')
      .replace(/\[NLS\]/g, '<span class="nls">[NLS]</span>')
      .replace(/\[AI\]/g, '<span class="ai">[AI]</span>')
      .replace(/\n/g, '<br>\n')}
    </body>
    </html>
  `;

  // Create Blob and download
  const blob = new Blob([htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const filename = `Giao_an_tich_hop_NLS_${data.title?.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/g, '_') || 'Untitled'}_${new Date().toISOString().slice(0, 10)}.doc`;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default { generateNLSInjectionContent, injectNLSIntoLessonPlan, downloadAsDocx };
