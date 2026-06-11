// backend/controllers/chatController.js

import Groq from "groq-sdk";

let groqClient = null;
const getGroq = () => {
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
};

const SYSTEM_PROMPT = `You are ColleXa AI, an expert college counselor and education advisor for Indian students.

Your expertise includes:
- Detailed knowledge of Indian colleges: IITs, IIMs, NITs, BITS, top private universities, medical colleges, law schools
- Admission processes: JEE, CAT, NEET, CLAT, GATE, XAT, SNAP, and other entrance exams
- Course information: B.Tech, MBA, MBBS, BBA, BSc, M.Tech, PhD programs
- Campus life, hostels, placements, faculty, fees, scholarships
- Career guidance and branch selection advice
- Cutoffs, rankings (NIRF, QS, Times), and college comparisons

FORMATTING RULES (strictly follow):
- Use "- " (dash space) for ALL bullet points. NEVER use asterisk (*) as a bullet character.
- Use **bold text** only for section headings or key terms, like: **Placements:**
- Use numbered lists (1. 2. 3.) for ranked items or steps
- NEVER start any line with "* " - only use "- " for list items
- Keep responses concise — ideally under 200 words
- If unsure about very recent data (cutoffs this year), mention it may have changed
- Always answer in the context of Indian higher education unless asked otherwise`;

export const chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Messages array is required" });
    }

    const groq = getGroq();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.slice(-12),
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    // Post-process: replace any remaining "* " bullets with "- "
    let reply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    reply = reply.replace(/^\* /gm, "- ").replace(/^  \* /gm, "  - ");

    res.json({ reply });

  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ message: "Chat service unavailable", error: err.message });
  }
};
