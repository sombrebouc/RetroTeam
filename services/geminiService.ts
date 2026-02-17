import { GoogleGenAI, Type } from "@google/genai";
import { RetroCard, ColumnType } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing via process.env.API_KEY");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeRetro = async (cards: RetroCard[], previousActions: string[]) => {
  const ai = getClient();
  if (!ai) throw new Error("API Key not found");

  const positives = cards.filter(c => c.column === ColumnType.POSITIVE).map(c => c.text).join('; ');
  const negatives = cards.filter(c => c.column === ColumnType.NEGATIVE).map(c => c.text).join('; ');
  const continues = cards.filter(c => c.column === ColumnType.CONTINUE).map(c => c.text).join('; ');
  const prevContext = previousActions.length > 0 ? previousActions.join('; ') : "Aucune";

  const prompt = `
    Tu es un coach agile expert. Analyse cette rétrospective d'équipe.
    
    Données de la rétrospective:
    - POSITIF: ${positives}
    - NÉGATIF: ${negatives}
    - À CONTINUER: ${continues}
    - ACTIONS PRÉCÉDENTES: ${prevContext}

    Tâche:
    Génère 3 à 5 actions concrètes et réalisables (SMART) pour la prochaine itération, basées principalement sur les points négatifs et les améliorations possibles.
    Génère aussi un court résumé global de l'ambiance de l'équipe (1 phrase).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Résumé de l'ambiance de l'équipe" },
            suggestedActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                    text: {type: Type.STRING, description: "L'action à entreprendre"}
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};