
import { GoogleGenAI, Type } from "@google/genai";
import { BudgetData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (data: BudgetData) => {
  const totalFixed = data.fixed.rent + data.fixed.utilities + data.fixed.other;
  const totalFuture = data.future.savings + data.future.investment;
  const totalDials = data.dials.reduce((acc, d) => acc + d.value, 0);
  const remaining = data.income - (totalFixed + totalFuture + totalDials);

  const prompt = `
    Analiza el siguiente presupuesto mensual para un plan de 'Gasto Consciente' (Money Dials):
    - Ingreso Mensual: ${data.income}
    - Gastos Fijos (Arriendo, Servicios, etc.): ${totalFixed} (${((totalFixed / data.income) * 100).toFixed(1)}% del ingreso)
    - Futuro (Ahorros e Inversiones): ${totalFuture} (${((totalFuture / data.income) * 100).toFixed(1)}% del ingreso)
    - Perillas del Dinero (Gasto libre de culpa en lo que amas): ${totalDials} (${((totalDials / data.income) * 100).toFixed(1)}% del ingreso)
    - Saldo Restante: ${remaining}

    Las 'Perillas' actuales son: ${data.dials.map(d => `${d.name} (${d.value})`).join(', ')}.

    Proporciona consejos expertos en formato JSON y EN ESPAÑOL.
    Usa un tono alentador pero honesto. 
    Si están excedidos de presupuesto, sé firme. 
    Si ahorran menos del 10%, sugiere aumentarlo.
    Enfócate en la filosofía de 'gastar generosamente en las cosas que amas, y recortar costos sin piedad en las cosas que no'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Un breve resumen de la salud financiera." },
            tips: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 consejos accionables para el usuario."
            },
            tone: { 
              type: Type.STRING, 
              enum: ['positive', 'warning', 'neutral'],
              description: "El tono general del consejo."
            }
          },
          required: ["summary", "tips", "tone"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error al obtener consejo de IA:", error);
    return {
      summary: "Tengo problemas para conectarme con los mercados financieros ahora mismo. Pero en general: ¡vigila esos costos fijos!",
      tips: ["Revisa tus suscripciones recurrentes.", "Apunta a un ahorro del 20% si es posible.", "Asegúrate de que tus 'perillas' realmente te traigan alegría."],
      tone: "neutral"
    };
  }
};
