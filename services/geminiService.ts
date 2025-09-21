import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      return imagePart.inlineData.data;
    } else {
      const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
      const errorMessage = textPart?.text || "The model did not return an image. It may have refused the request due to safety policies.";
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to communicate with the AI model. Please check your connection or API key.");
  }
};


export const generateArtisticPrompt = async (base64ImageData: string, mimeType: string): Promise<string> => {
  try {
    const instruction = "Analizza questa immagine e suggerisci un prompt creativo e artistico per trasformarla radicalmente in italiano. Il prompt deve descrivere uno stile, un'atmosfera e una trasformazione visiva. Sii conciso e creativo, e restituisci solo la stringa del prompt. Esempi: 'Trasforma questa immagine in un dipinto ad olio nello stile di Van Gogh, con pennellate spesse e colori vibranti.' oppure 'Applica un'estetica cyberpunk, con luci al neon, riflessi sulla pioggia e un'atmosfera futuristica.'";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: instruction },
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
        ],
      },
    });

    const prompt = response.text;
    if (prompt) {
      return prompt.trim();
    } else {
      const safetyReason = response.candidates?.[0]?.finishReason;
      if (safetyReason && safetyReason !== 'STOP') {
        throw new Error(`Generazione del prompt bloccata per motivi di sicurezza: ${safetyReason}`);
      }
      throw new Error("L'IA non è riuscita a generare un prompt per l'immagine.");
    }
  } catch (error) {
    console.error("Gemini API Error (generateArtisticPrompt):", error);
     if (error instanceof Error && error.message.includes('sicurezza')) {
        throw error;
    }
    throw new Error("Impossibile generare un prompt artistico. Riprova.");
  }
};