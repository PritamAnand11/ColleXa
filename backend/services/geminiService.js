// backend/services/geminiService.js

import Groq from "groq-sdk";

// Lazy init — client is created inside the function AFTER .env is loaded
let groqClient = null;

const getGroqClient = () => {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    console.log("GROQ_API_KEY loaded:", apiKey ? "YES ✅" : "NO ❌");
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
};


export const analyzeReviewsWithGemini = async (reviews) => {
  try {

    if (!reviews || reviews.length === 0) {
      return {
        pros: [],
        cons: [],
        summary: "No reviews available",
        sentiment: "Neutral"
      };
    }

    const groq = getGroqClient();

    const prompt = `
You are an expert education analyst like QS World Rankings and NIRF.
Analyze these student reviews and return ONLY a raw JSON object.
No markdown, no backticks, no explanation. Just the JSON.

{
  "pros": ["strength 1", "strength 2", "strength 3"],
  "cons": ["weakness 1", "weakness 2", "weakness 3"],
  "summary": "3-4 sentence professional neutral summary",
  "sentiment": "Positive"
}

sentiment must be exactly one of: Positive, Neutral, Negative

Reviews:
${reviews.join("\n\n---\n\n")}
`;

    console.log("Calling Groq API...");

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const text = response.choices[0]?.message?.content || "";
    console.log("Groq raw response:", text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const parsed = JSON.parse(jsonMatch[0].trim());

    if (!parsed.pros || !parsed.cons || !parsed.summary) {
      throw new Error("Incomplete JSON from Groq");
    }

    const validSentiments = ["Positive", "Neutral", "Negative"];
    if (!validSentiments.includes(parsed.sentiment)) {
      parsed.sentiment = "Neutral";
    }

    console.log("Groq parsed successfully:", parsed);
    return parsed;

  } catch (error) {
    console.error("Groq error:", error.message || error);
    return {
      pros: [],
      cons: [],
      summary: "AI analysis unavailable",
      sentiment: "Neutral"
    };
  }
};