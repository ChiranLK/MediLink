import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generate AI suggestions and pre-medication steps based on symptoms
 * @param {string} symptoms - Patient's symptom description
 * @returns {Promise<Object>} - Contains suggestions, pre-medication steps, and recommended specialty
 */
export const getAISuggestions = async (symptoms) => {
  try {
    // Verify API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️  GEMINI_API_KEY not found in .env file");
      return getDefaultResponse();
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a medical assistant for the MediLink healthcare platform. Analyze these symptoms: "${symptoms}" and provide guidance.

Please respond in the following JSON format only (no extra text):
{
    "suggestion": "Brief 2-3 sentence preliminary assessment of the symptoms",
    "recommendedSpecialty": "Most appropriate medical specialty (e.g., Cardiology, Neurology, Dermatology, etc.)",
    "preMedicationSteps": [
        "Step 1: Specific preparation or precaution",
        "Step 2: Another preparation or guideline", 
        "Step 3: Additional preparation or instruction"
    ],
    "urgency": "low|medium|high"
}

Important guidelines:
- Follow medical best practices
- Include practical, safe pre-medication steps
- Be concise but informative
- Always include at least 3 pre-medication steps`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("✅ AI Analysis completed successfully");
        return {
          suggestion: parsed.suggestion || "Medical assessment provided",
          recommendedSpecialty:
            parsed.recommendedSpecialty || "General Medicine",
          preMedicationSteps: Array.isArray(parsed.preMedicationSteps)
            ? parsed.preMedicationSteps
            : [],
          urgency: parsed.urgency || "medium",
          isAIGenerated: true,
        };
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError.message);
        return getDefaultResponse();
      }
    }

    return getDefaultResponse();
  } catch (error) {
    console.error("❌ AI Error:", error.message);

    // Provide helpful error messages
    if (error.message.includes("API_KEY_INVALID")) {
      console.error(
        "   → Your GEMINI_API_KEY is invalid. Get a new one at: https://aistudio.google.com/apikey",
      );
    } else if (error.message.includes("UNAUTHENTICATED")) {
      console.error(
        "   → API key authentication failed. Check if the key is correct in .env",
      );
    } else if (error.message.includes("503")) {
      console.error(
        "   → Gemini API is experiencing high demand. Using default suggestions.",
      );
    }

    return getDefaultResponse();
  }
};

/**
 * Get default response when AI is unavailable
 */
const getDefaultResponse = () => {
  return {
    suggestion:
      "The AI engine is currently unavailable. Please ensure a valid GEMINI_API_KEY is configured, then try again.",
    recommendedSpecialty: "General Medicine",
    preMedicationSteps: [
      "Schedule an appointment with your healthcare provider",
      "Prepare a list of your current medications",
      "Keep a symptom diary noting frequency and severity",
      "Bring any relevant medical records to your appointment",
    ],
    urgency: "medium",
    isAIGenerated: false,
  };
};
