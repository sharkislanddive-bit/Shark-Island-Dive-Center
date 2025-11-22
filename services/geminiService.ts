import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

export const initializeGemini = () => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key missing");
    return;
  }
  genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const askSharkExpert = async (
  question: string, 
  contextData: string
): Promise<string> => {
  if (!genAI) {
    initializeGemini();
    if (!genAI) return "I'm sorry, I can't connect to the shark database right now.";
  }

  try {
    const model = genAI!.models;
    const systemInstruction = `
      You are "Fin," the senior dive master at Shark Island Dive Center in Fuvahmulah, Maldives. 
      Your tone is professional, excited, and deeply knowledgeable about Tiger Sharks.
      
      Use the provided context about our pricing and accommodation to help the user.
      If the user asks about pricing, refer to the specific numbers in the context.
      
      Key Facts to know:
      - Fuvahmulah is famous for Tiger Sharks, Thresher Sharks, and Hammerheads.
      - It is a one-island atoll.
      - Diving is deep and sometimes current-heavy.
      
      Context Data (Current Settings):
      ${contextData}
      
      Keep answers under 80 words unless asked for a detailed itinerary.
    `;

    const result = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return result.text || "I couldn't decipher that signal.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Communications are down due to a storm. Please try again later.";
  }
};