import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getAISuggestions = async (symptoms) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Aluth model eka use karanna
        const prompt = `As an AI medical assistant for the MediLink platform, analyze these symptoms: ${symptoms}. 
                        Provide a short preliminary health suggestion and recommend the most suitable doctor specialty[cite: 30, 31].`;
        
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("AI Error:", error);
        return "AI suggestions currently unavailable.";
    }
};