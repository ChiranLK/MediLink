import { GoogleGenerativeAI } from "@google/generative-ai";

export const getAISuggestions = async (symptoms) => {
    try {
        // Verify API key exists
        if (!process.env.GEMINI_API_KEY) {
            console.warn("⚠️  GEMINI_API_KEY not found in .env file");
            return "AI suggestions currently unavailable - API key not configured.";
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Correct format: lowercase with hyphens
        
        const prompt = `As an AI medical assistant for the MediLink platform, analyze these symptoms: ${symptoms}. 
                        Provide a short preliminary health suggestion and recommend the most suitable doctor specialty.`;
        
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("❌ AI Error:", error.message);
        
        // Provide helpful error messages
        if (error.message.includes("API_KEY_INVALID")) {
            console.error("   → Your GEMINI_API_KEY is invalid. Get a new one at: https://aistudio.google.com/apikey");
        } else if (error.message.includes("UNAUTHENTICATED")) {
            console.error("   → API key authentication failed. Check if the key is correct in .env");
        }
        
        return "AI suggestions currently unavailable. Appointment can still be processed.";
    }
};