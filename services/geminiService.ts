
import { GoogleGenAI, Type } from "@google/genai";
import { FrequencyInsight } from "../types";

// Helper to get API Key safely in browser or node
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env.API_KEY) return process.env.API_KEY;
  // Fallback for browser direct hosting - you might need to hardcode for the hackathon
  // or use a Firebase Function as a proxy.
  return (window as any).CATPHISH_API_KEY || ""; 
};

export const transformToCat = async (imageBuffer: string): Promise<{ catImage: string, description: string, eyeColor: string }> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    TASK: Replace the human in this selfie with a cat avatar. 
    STRICT REQUIREMENTS:
    1. HEAD & HAIR REMOVAL: Completely remove the human head, neck, and ALL human hair. No human hair or skin should remain visible.
    2. FUR LENGTH: Match the cat's fur length to the human's hair length.
    3. CLOTHING: The cat's body must wear the exact same clothing colors and patterns as the human.
    4. BACKGROUND: The background must be 100% identical to the original photo.
    5. POSE: The cat must maintain the exact physical pose of the human.
    6. EYES: The cat's iris color must be the same as the human's iris color.
    
    OUTPUT: Provide the generated image and a text part naming the detected iris color (e.g., "Iris color: Amber").
  `;

  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: imageBuffer.split(',')[1] || imageBuffer,
    },
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }, imagePart] },
    config: {
      imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
    }
  });

  let catImage = '';
  let eyeColor = 'Prismatic';

  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) {
      catImage = `data:image/png;base64,${part.inlineData.data}`;
    } else if (part.text) {
      const eyeMatch = part.text.match(/iris color:?\s*([^.\n]+)/i) || part.text.match(/eye color:?\s*([^.\n]+)/i);
      if (eyeMatch) eyeColor = eyeMatch[1].trim();
    }
  }

  return { catImage, description: 'Feline Proxy Layered', eyeColor };
};

export const generateFrequencyInsight = async (day: number, answersSoFar: string[], coreTruth: string): Promise<FrequencyInsight> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    Dating Frequency Experiment Analysis Protocol.
    CORE TRUTH: "${coreTruth}"
    ANSWERS TO THE 5 PROTOCOL QUESTIONS:
    ${answersSoFar.join("\n")}
    
    Based on these semantic inputs, provide a psychological profile of what kind of partner they are subconsciously seeking.
    Return a response in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          archetype: { type: Type.STRING, description: "A 2-3 word name for their current vibe (e.g. 'The Stoic Architect')" },
          summary: { type: Type.STRING, description: "A 1-sentence summary of their current frequency" },
          seeking: { type: Type.STRING, description: "Who they are REALLY searching for right now" },
          shadow: { type: Type.STRING, description: "A trait they are likely suppressing but need in a partner" }
        },
        required: ["archetype", "summary", "seeking", "shadow"]
      }
    }
  });

  return {
    day,
    ...JSON.parse(response.text.trim())
  };
};

export const rankResonance = async (userAnswer: string, pool: { id: string, answer: string }[]): Promise<{ id: string, score: number }[]> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const candidatesString = pool.map(p => `ID: ${p.id} | Answer: ${p.answer}`).join('\n');
  
  const prompt = `
    USER ANSWER: "${userAnswer}"
    CANDIDATES:
    ${candidatesString}
    Evaluate how much the USER ANSWER resonates with each CANDIDATE. Return resonance scores (0.0 to 1.0).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            score: { type: Type.NUMBER }
          },
          required: ["id", "score"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    return pool.map(p => ({ id: p.id, score: 0.5 }));
  }
};
