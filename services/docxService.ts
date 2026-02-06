import { LessonPlanData } from '../types';

/**
 * Generate HTML content for the lesson plan that can be opened in Word
 */
export const generateDocxContent = (data: LessonPlanData, includeAI: boolean): string => {
    const styles = `
    <style>
      body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; }
      h1 { font-size: 16pt; font-weight: bold; text-align: center; color: #1a365d; margin-bottom: 20px; }
      h2 { font-size: 14pt; font-weight: bold; color: #2563eb; margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid #2563eb; padding-bottom: 5px; }
      h3 { font-size: 13pt; font-weight: bold; color: #1e40af; margin-top: 15px; }
      .info-box { background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 10px; margin: 10px 0; }
      .goal-item { margin: 8px 0; padding-left: 20px; }
      .goal-item::before { content: "✓ "; color: #22c55e; font-weight: bold; }
      .activity-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 10px 0; background-color: #fafafa; }
      .activity-name { font-weight: bold; color: #f59e0b; font-size: 13pt; margin-bottom: 8px; }
      .digital-content { color: #dc2626; font-weight: bold; }
      .ai-content { color: #2563eb; font-style: italic; }
      .tool-tag { display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 3px 10px; border-radius: 15px; margin: 3px; font-size: 11pt; }
      .section { margin-bottom: 20px; }
      .nls-badge { background-color: #fef2f2; border: 1px solid #dc2626; padding: 8px 15px; border-radius: 5px; color: #dc2626; margin: 10px 0; }
      .ai-badge { background-color: #eff6ff; border: 1px solid #2563eb; padding: 8px 15px; border-radius: 5px; color: #2563eb; margin: 10px 0; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      td, th { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
      th { background-color: #f1f5f9; font-weight: bold; }
    </style>
  `;

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
    </head>
    <body>
      <h1>KẾ HOẠCH BÀI DẠY TÍCH HỢP NĂNG LỰC SỐ</h1>
      
      <div class="info-box">
        <strong>Môn học:</strong> ${data.subject || 'Chưa xác định'}<br>
        <strong>Khối lớp:</strong> ${data.grade || 'Chưa xác định'}<br>
        <strong>Bài học:</strong> ${data.title || 'Chưa xác định'}
      </div>

      ${data.summary ? `<p><em>${data.summary}</em></p>` : ''}
  `;

    // Digital Goals Section
    if (data.digitalGoals && data.digitalGoals.length > 0) {
        html += `
      <h2>I. MỤC TIÊU NĂNG LỰC SỐ</h2>
      <div class="section">
        <div class="nls-badge">★ Nội dung Năng lực số được tích hợp (hiển thị màu đỏ trong giáo án)</div>
    `;

        data.digitalGoals.forEach((goal, idx) => {
            html += `
        <div class="goal-item">
          <span class="digital-content">${goal.description}</span>
        </div>
      `;
        });
        html += `</div>`;
    }

    // AI Competency Section (only if includeAI is true)
    if (includeAI) {
        html += `
      <h2>II. NĂNG LỰC TRÍ TUỆ NHÂN TẠO</h2>
      <div class="section">
        <div class="ai-badge">★ Năng lực AI được tích hợp (hiển thị màu xanh lam trong giáo án)</div>
        <div class="goal-item">
          <span class="ai-content">Học sinh nhận biết và sử dụng các công cụ AI hỗ trợ học tập một cách có trách nhiệm</span>
        </div>
        <div class="goal-item">
          <span class="ai-content">Học sinh hiểu được nguyên lý cơ bản của AI và cách AI hỗ trợ trong bài học</span>
        </div>
        <div class="goal-item">
          <span class="ai-content">Học sinh biết đánh giá và kiểm chứng thông tin từ các công cụ AI</span>
        </div>
      </div>
    `;
    }

    // Activities Section
    if (data.activities && data.activities.length > 0) {
        html += `
      <h2>${includeAI ? 'III' : 'II'}. CÁC HOẠT ĐỘNG HỌC TẬP</h2>
      <div class="section">
    `;

        data.activities.forEach((activity, idx) => {
            html += `
        <div class="activity-box">
          <div class="activity-name">${idx + 1}. ${activity.name}</div>
          ${activity.digitalActivity ? `<p><span class="digital-content">Hoạt động số:</span> ${activity.digitalActivity}</p>` : ''}
      `;

            if (activity.digitalTools && activity.digitalTools.length > 0) {
                html += `<p><strong>Công cụ sử dụng:</strong> `;
                activity.digitalTools.forEach(tool => {
                    html += `<span class="tool-tag">${tool}</span>`;
                });
                html += `</p>`;
            }

            // Add AI integration suggestion if includeAI is enabled
            if (includeAI) {
                html += `
          <p class="ai-content">💡 Tích hợp AI: Học sinh có thể sử dụng công cụ AI để hỗ trợ tìm kiếm thông tin, tạo ý tưởng hoặc kiểm tra kết quả.</p>
        `;
            }

            html += `</div>`;
        });
        html += `</div>`;
    }

    // Recommended Tools Section
    if (data.recommendedTools && data.recommendedTools.length > 0) {
        html += `
      <h2>${includeAI ? 'IV' : 'III'}. CÔNG CỤ SỐ KHUYẾN NGHỊ</h2>
      <div class="section">
        <table>
          <tr>
            <th>STT</th>
            <th>Công cụ</th>
            <th>Mục đích sử dụng</th>
          </tr>
    `;

        data.recommendedTools.forEach((tool, idx) => {
            html += `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${tool}</strong></td>
          <td>Hỗ trợ hoạt động dạy học số</td>
        </tr>
      `;
        });

        html += `</table></div>`;
    }

    // Footer
    html += `
      <hr style="margin-top: 30px; border: 1px solid #e2e8f0;">
      <p style="text-align: center; color: #64748b; font-size: 11pt;">
        <em>Giáo án được tạo bởi công cụ Soạn Giáo án Năng lực số<br>
        Tác giả: Nguyễn Việt Hùng - Facebook: @viethungnvmt</em>
      </p>
    </body>
    </html>
  `;

    return html;
};

/**
 * Download the lesson plan as a .docx file
 */
export const downloadAsDocx = (data: LessonPlanData, includeAI: boolean): void => {
    const htmlContent = generateDocxContent(data, includeAI);

    // Create a Blob with the HTML content
    // Microsoft Word can open HTML files saved as .doc
    const blob = new Blob([htmlContent], {
        type: 'application/msword'
    });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Generate filename
    const filename = `Giao_an_NLS_${data.title?.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/g, '_') || 'Untitled'}_${new Date().toISOString().slice(0, 10)}.doc`;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);
};

export default { generateDocxContent, downloadAsDocx };
