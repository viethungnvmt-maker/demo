
import { GoogleGenAI, Type } from "@google/genai";
import { LessonPlanData, Skill } from "../types";

// Initialize the Google GenAI client with the API key from environment variables.
// Note: In Vite, we should use import.meta.env, but for now we follow the existing pattern
// checking if the process.env replacement worked or if we need to check import.meta.env
const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

export const analyzeLessonPlan = async (content: string, selectedSkill?: Skill): Promise<LessonPlanData> => {
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error("Missing or invalid GEMINI_API_KEY. Please set it in .env.local");
  }

  // Construct the system prompt based on the selected skill or use a default
  let roleContext = "";
  if (selectedSkill) {
    roleContext = `
    VAI TRÒ CỦA BẠN:
    ${selectedSkill.systemPrompt}
    
    HÃY ĐÓNG VAI CHUYÊN GIA NÀY ĐỂ PHÂN TÍCH GIÁO ÁN. Đừng chỉ đưa ra lời khuyên chung chung. Hãy đưa ra các ý tưởng đột phá, sáng tạo và mang đậm dấu ấn chuyên môn của bạn (ví dụ: Game Developer thì phải đề xuất Gamification, AI Architect thì đề xuất tư duy hệ thống/tool use).
    `;
  } else {
    roleContext = "VAI TRÒ: Bạn là một chuyên gia giáo dục số hàng đầu (Digital Pedagogy Expert).";
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash', // Upgraded model for better performance
    contents: `${roleContext}

    Hãy phân tích giáo án sau và tích hợp năng lực số (Digital Competency) theo khung năng lực số dành cho học sinh phổ thông Việt Nam. 
    
    NỘI DUNG GIÁO ÁN:
    ${content}

    YÊU CẦU:
    1. Tóm tắt ngắn gọn giáo án.
    2. Đề xuất ít nhất 3 mục tiêu năng lực số cụ thể phù hợp với bài dạy.
    3. Đề xuất các công cụ số phù hợp (ví dụ: Kahoot, Quizizz, Canva, Google Earth, Padlet...).
    4. Chia giáo án thành 4 hoạt động chính: Khởi động, Khám phá kiến thức, Luyện tập, Vận dụng. Với mỗi hoạt động, hãy đề xuất 1 hoạt động số cụ thể giúp tích hợp CNTT hiệu quả.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          grade: { type: Type.STRING },
          subject: { type: Type.STRING },
          summary: { type: Type.STRING },
          digitalGoals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                description: { type: Type.STRING },
                frameworkRef: { type: Type.STRING }
              },
              required: ["id", "description"]
            }
          },
          recommendedTools: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                originalContent: { type: Type.STRING },
                digitalActivity: { type: Type.STRING },
                digitalTools: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["id", "name", "digitalActivity"]
            }
          }
        },
        required: ["title", "digitalGoals", "activities"]
      }
    }
  });

  // Handle markdown code blocks if the model includes them despite responseMimeType
  let text = response.text || "{}";
  if (text.startsWith("```json")) {
    text = text.replace(/^```json/, "").replace(/```$/, "");
  } else if (text.startsWith("```")) {
    text = text.replace(/^```/, "").replace(/```$/, "");
  }

  const data = JSON.parse(text);

  return {
    ...data,
    originalFullText: content
  } as LessonPlanData;
};
