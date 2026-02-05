
import { GoogleGenAI, Type } from "@google/genai";
import { LessonPlanData, Skill } from "../types";

// Model fallback order as per AI_INSTRUCTIONS.md
const MODEL_FALLBACK_ORDER = [
  'gemini-2.5-flash',
  'gemini-2.5-pro-preview-05-06',
  'gemini-2.0-flash'
];

// Get API key from localStorage
export const getApiKey = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('gemini_api_key');
  }
  return null;
};

// Set API key to localStorage
export const setApiKey = (key: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gemini_api_key', key);
  }
};

// Get selected model from localStorage
export const getSelectedModel = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('gemini_model') || MODEL_FALLBACK_ORDER[0];
  }
  return MODEL_FALLBACK_ORDER[0];
};

// Set selected model to localStorage
export const setSelectedModel = (model: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gemini_model', model);
  }
};

// Try to call API with model fallback
const tryWithFallback = async <T>(
  apiKey: string,
  startModel: string,
  apiCall: (ai: GoogleGenAI, model: string) => Promise<T>
): Promise<T> => {
  const startIndex = MODEL_FALLBACK_ORDER.indexOf(startModel);
  const modelsToTry = startIndex >= 0
    ? [...MODEL_FALLBACK_ORDER.slice(startIndex), ...MODEL_FALLBACK_ORDER.slice(0, startIndex)]
    : MODEL_FALLBACK_ORDER;

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      return await apiCall(ai, model);
    } catch (error) {
      console.warn(`Model ${model} failed, trying next...`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      // Continue to next model
    }
  }

  throw lastError || new Error('Tất cả các model đều thất bại');
};

export const analyzeLessonPlan = async (content: string, selectedSkill?: Skill): Promise<LessonPlanData> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("Chưa có API Key. Vui lòng nhập API Key trong phần Cài đặt.");
  }

  const selectedModel = getSelectedModel();

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

  return tryWithFallback(apiKey, selectedModel, async (ai, model) => {
    const response = await ai.models.generateContent({
      model: model,
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
  });
};
