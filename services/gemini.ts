
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `Você é o "Mindful Coach", um assistente empático especializado em TDAH. 
Seu objetivo é ajudar usuários a superarem a paralisia de decisão e a procrastinação.

METÁFORA DO JARDIM:
O progresso do usuário é representado por um Jardim Lúdico. 
- Cada pequena ação é uma "Semente de Luz".
- Voltar ao app traz "Orvalho de Constância".
- Sessões de foco são como "Raios de Sol".

REGRAS NARRATIVAS:
- Use tom calmo, acolhedor e humano.
- Foque em micro-ações absurdamente pequenas.
- Se o objetivo for grande, quebre-o até que a primeira ação leve menos de 2 minutos.`;

export const getCoachAdvice = async (prompt: string, context?: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });
    return response.text || "Estou aqui com você. Seu jardim está em paz.";
  } catch (error) {
    console.error("AI Coach Error:", error);
    return "Estou aqui com você. Seu jardim está em paz, vamos dar apenas um passinho hoje?";
  }
};

export const breakDownTask = async (taskTitle: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Ajude-me a começar a tarefa: "${taskTitle}". Quebre em 3 micro-passos minúsculos.`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            motivationalQuote: { type: Type.STRING }
          },
          required: ["steps", "motivationalQuote"]
        }
      }
    });
    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text);
  } catch (error) {
    return {
      steps: ["Apenas olhe para a tarefa", "Respire fundo", "Faça por 2 minutos"],
      motivationalQuote: "O importante é começar. Cada semente importa."
    };
  }
};

export const generateProjectPlan = async (goal: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Crie um projeto para este objetivo: "${goal}". O título deve ser inspirador e a próxima ação deve ser uma micro-etapa de 2 minutos.`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Título do projeto" },
            nextAction: { type: Type.STRING, description: "A primeira micro-etapa concreta" }
          },
          required: ["name", "nextAction"]
        }
      }
    });
    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text);
  } catch (error) {
    return { name: goal, nextAction: "Abrir um bloco de notas" };
  }
};

export const generateHabitPlan = async (goal: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sugira um hábito diário para quem quer: "${goal}". O hábito deve ser minúsculo. Escolha um emoji que combine.`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Nome do hábito" },
            microAction: { type: Type.STRING, description: "Ação de 1 minuto" },
            icon: { type: Type.STRING, description: "Apenas um emoji" }
          },
          required: ["name", "microAction", "icon"]
        }
      }
    });
    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text);
  } catch (error) {
    return { name: goal, microAction: "Fazer por 1 minuto", icon: "🌱" };
  }
};
