
import { GoogleGenAI, Type } from "@google/genai";
import { UserAnswer } from "../types";

export const transformToCat = async (imageBuffer: string): Promise<{ catImage: string, description: string, eyeColor: string }> => {
  // Re-initialize for fresh key access from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    CATPHISH IDENTITY TRANSFORMATION PROTOCOL:
    
    TASK: Replace the human in this selfie with a cat. 
    
    STRICT REQUIREMENTS:
    1. CLOTHING: The cat MUST be wearing the exact same clothing as the human in the original photo (same colors, same textures, same style).
    2. BACKGROUND: The background setting must remain 100% identical to the original image.
    3. POSE & ANGLE: The cat must be in the exact same physical pose, with the same body orientation and facial angle as the person in the selfie.
    4. EYES: Match the cat's iris color exactly to the human's iris color (e.g., if they have hazel eyes, the cat must have hazel eyes).
    5. SPECIES: Use a domestic cat breed that matches the person's facial 'vibe' but remains a cat.
    
    OUTPUT:
    - Provide the generated image.
    - Provide a short text part describing the eye color found and the cat persona (e.g., "The user has amber eyes...").
  `;

  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: imageBuffer.split(',')[1] || imageBuffer,
    },
  };

  // Gemini 3 Pro Image for high-quality identity/asset transfer
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }, imagePart] },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  let catImage = '';
  let description = 'A mysterious feline avatar.';
  let eyeColor = 'Mystery';

  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) {
      catImage = `data:image/png;base64,${part.inlineData.data}`;
    } else if (part.text) {
      description = part.text;
      const eyeMatch = part.text.match(/iris color is ([^.]+)/i) || part.text.match(/eye color: ([^.]+)/i);
      if (eyeMatch) eyeColor = eyeMatch[1].trim();
    }
  }

  return { catImage, description, eyeColor };
};

export const generateQuizFromAnswers = async (name: string, answers: UserAnswer[], coreTruth: string): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const context = answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `You are the 'Eve' agent in the CatPhish Zero Trust framework. 
    Based on these personal answers and a "Core Truth" from ${name}, generate 3 challenging 'Logic Traps' (multiple-choice questions) for someone trying to unmask them.
    
    HUMAN DATA:
    ${context}

    CORE TRUTH:
    "${coreTruth}"

    OBJECTIVE:
    The user answers must be tested for semantic understanding. The questions should be about things ${name} said, and the distractors should be plausible AI hallucinations.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctIndex: { type: Type.INTEGER }
          },
          required: ["question", "options", "correctIndex"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};
