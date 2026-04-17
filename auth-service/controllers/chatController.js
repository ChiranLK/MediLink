import { StatusCodes } from "http-status-codes";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ── Customization ────────────────────────────────────────────────────────────
const BOT_NAME = "MediLink AI";
const SYSTEM_PROMPT = `You are ${BOT_NAME}, a friendly and knowledgeable healthcare assistant for the MediLink platform. 
You help users with:
- Understanding MediLink's services (appointments, telemedicine, prescriptions, reports)
- General health information and wellness tips
- Navigating the platform (booking appointments, finding doctors, managing profiles)
- Answering FAQs about the platform

Guidelines:
- Be concise, warm, and professional.
- Never diagnose conditions or prescribe medications — always recommend consulting a doctor.
- If asked about emergencies, advise calling emergency services immediately.
- Keep responses under 150 words unless the user asks for detail.
- If unsure, say so honestly and suggest the user contact support via the Contact page.`;
// ─────────────────────────────────────────────────────────────────────────────

// ── Model (change here to switch Groq models) ───────────────────────────────
const GROQ_MODEL = "llama-3.3-70b-versatile";
// ─────────────────────────────────────────────────────────────────────────────

export const chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "messages array is required" });
    }

    // Validate each message has role and content
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Each message must have role and content" });
      }
      if (!["user", "assistant"].includes(msg.role)) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Message role must be 'user' or 'assistant'" });
      }
      if (typeof msg.content !== "string" || msg.content.length > 2000) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({
            message: "Message content must be a string under 2000 characters",
          });
      }
    }

    // Limit conversation history to last 20 messages to prevent abuse
    const trimmedMessages = messages.slice(-20);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is not configured");
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Chat service is not configured" });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...trimmedMessages,
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      return res
        .status(StatusCodes.BAD_GATEWAY)
        .json({ message: "Failed to get response from AI service" });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res
        .status(StatusCodes.BAD_GATEWAY)
        .json({ message: "Empty response from AI service" });
    }

    return res.status(StatusCodes.OK).json({ reply });
  } catch (error) {
    console.error("Chat endpoint error:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong. Please try again." });
  }
};
