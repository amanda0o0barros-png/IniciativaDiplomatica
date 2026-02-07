
import { GoogleGenAI, Type } from "@google/genai";
import { CorrectionResult, PracticeQuestion, DossierHighlight } from "../types";

const SYSTEM_INSTRUCTION = `Você é o Mentor CACD, professor particular e corretor oficial de discursivas do CACD (nível Instituto Rio Branco). 
Regras Estritas de Formatação:
- NÃO USE caracteres de markdown como asteriscos (**), hashtags (#) ou sublinhados (_) nos textos.
- Use APENAS letras MAIÚSCULAS para dar ênfase a títulos ou termos importantes se necessário.
- Use hifens (-) para listas.
- Mantenha o texto limpo, formal e elegante.

Regras de Correção:
1. Nota de 0,00 a 10,00 com duas casas decimais.
2. Justificativa baseada no edital (estrutura, profundidade conceitual, autores, das, tratados, linguagem diplomática).
3. Ser rigoroso: notas 5.50-6.50 para medianas, abaixo de 3.00 para ruins.
4. Fornecer modelo de resposta nota 10.00 com introdução forte, 3-4 parágrafos de desenvolvimento e conclusão prospectiva.
5. Plano de melhoria personalizado em 5-7 itens.`;

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function correctEssay(topic: string, essay: string): Promise<CorrectionResult> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Tema: ${topic}\n\nResposta do Aluno: ${essay}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          justification: { type: Type.STRING },
          errors: { type: Type.ARRAY, items: { type: Type.STRING } },
          omissions: { type: Type.ARRAY, items: { type: Type.STRING } },
          highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
          bankGrade: { type: Type.NUMBER },
          approvedGrade: { type: Type.NUMBER },
          modelResponse: { type: Type.STRING },
          improvementPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["score", "justification", "errors", "omissions", "highlights", "bankGrade", "approvedGrade", "modelResponse", "improvementPlan"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as CorrectionResult;
}

export async function generateQuestion(subject: string): Promise<PracticeQuestion> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Gere uma questão inédita padrão CACD (discursiva) sobre: ${subject}. Use comandos complexos que exijam análise histórica ou política profunda.`,
    config: {
      systemInstruction: "Você é um elaborador de provas do CACD. NÃO USE markdown (asteriscos, hashtags). Use APENAS texto simples e parágrafos claros.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          command: { type: Type.STRING },
          lines: { type: Type.NUMBER },
          subject: { type: Type.STRING }
        },
        required: ["topic", "command", "lines", "subject"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as PracticeQuestion;
}

export async function explainSubject(subject: string, subtopic: string): Promise<string> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explique de forma estratégica para o CACD o assunto: ${subject} - ${subtopic}. Foque em conceitos-chave e autores.`,
    config: {
      systemInstruction: "Você é um mentor experiente do CACD. NÃO USE markdown (asteriscos, hashtags). Use APENAS hifens para listas e texto simples formatado com espaços em branco.",
    }
  });
  return response.text || "Desculpe, não consegui explicar este assunto agora.";
}

export async function generateStudySchedule(daysRemaining: number, context: string): Promise<string> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Crie um cronograma de estudos estratégico para o CACD. 
      Dias restantes: ${daysRemaining}. 
      Contexto atual do progresso: ${context}. 
      Priorize os tópicos com maior incidência e que ainda não foram lidos.`,
    config: {
      systemInstruction: "Você é um estrategista de estudos para o CACD. Gere um plano de estudos eficiente. NÃO USE markdown (asteriscos, hashtags). Use APENAS letras MAIÚSCULAS para dar ênfase a títulos e hifens para listas.",
    }
  });
  return response.text || "Desculpe, não consegui gerar o cronograma estratégico agora.";
}

export interface DossierData {
  current: string;
  previous: string;
  highlights: DossierHighlight[];
  sources: { title: string, uri: string }[];
}

export async function getWeeklyDiplomaticDossier(): Promise<DossierData> {
  const ai = getGeminiClient();
  const today = new Date().toLocaleDateString('pt-BR');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Compilado Diplomático Brasileiro. DATA: ${today}. Pesquise posicionamentos em Cúpulas, Acordos e Crises. Foque no que é relevante para o CACD. Extraia 3 fatos curtíssimos para destaques rápidos e TENTE incluir um link real de notícia se encontrar.`,
    config: {
      systemInstruction: "Analista do MRE. SEM MARKDOWN. Retorne um JSON estruturado com 'highlights' contendo 'text' e 'url' (opcional).",
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          current: { type: Type.STRING },
          previous: { type: Type.STRING },
          highlights: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                url: { type: Type.STRING }
              },
              required: ["text"]
            }
          },
        },
        required: ["current", "previous", "highlights"]
      }
    }
  });

  const parsed = JSON.parse(response.text || "{}");
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources: { title: string; uri: string }[] = (groundingChunks as any[])
    .map((chunk: any) => chunk.web)
    .filter((web: any) => web && web.title && web.uri)
    .map((web: any) => ({ title: String(web.title), uri: String(web.uri) }));

  // If URL is missing in highlight, try to assign one from sources
  const highlights = (parsed.highlights || []).map((h: DossierHighlight, idx: number) => {
    if (!h.url && sources[idx]) h.url = sources[idx].uri;
    return h;
  });

  return { 
    current: parsed.current, 
    previous: parsed.previous, 
    highlights: highlights, 
    sources: Array.from(new Map(sources.map(s => [s.uri, s])).values()) 
  };
}
