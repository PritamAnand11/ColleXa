import Groq from "groq-sdk";

let groqClient = null;

const getGroq = () => {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not set in .env");
    }
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

// ── Label maps for readable prompt ───────────────────────────
const INTEREST_LABELS = {
  tech: "Technology & Software Development",
  finance: "Finance, Economics & Business",
  creative: "Creative Arts, Design & Media",
  healthcare: "Healthcare & Medicine",
  science: "Pure Science & Research",
  law: "Law & Public Policy",
  education: "Teaching & Education",
  social: "Social Impact & NGO Work",
};

const STRENGTH_LABELS = {
  math: "Mathematics",
  physics: "Physics",
  chemistry: "Chemistry",
  biology: "Biology",
  cs: "Computer Science",
  economics: "Economics",
  english: "English & Literature",
  history: "History & Social Science",
};

const ENV_LABELS = {
  product: "Building products / startups",
  management: "Management & leadership",
  research: "Research & academia",
  fieldwork: "Fieldwork & hands-on work",
  creative_work: "Creative studio / media production",
  corporate: "Corporate / MNC environment",
};

const EXAM_LABELS = {
  jee: "JEE (Engineering)",
  neet: "NEET (Medical/Healthcare)",
  cat: "CAT/MAT (Management)",
  clat: "CLAT (Law)",
  nid: "NID/NIFT (Design)",
  cuet: "CUET (General UG)",
  other: "Open / Not decided yet",
};

const PRIORITY_LABELS = {
  placement: "Highest placement packages",
  research_opp: "Research & innovation opportunities",
  campus: "Campus life & infrastructure",
  fee: "Affordable fees",
  location: "Metro city location",
  brand: "Brand name & prestige",
};

// ── Build prompt from answers ─────────────────────────────────
const buildPrompt = (answers) => {
  const interests = (answers.interests || []).map((v) => INTEREST_LABELS[v] || v).join(", ");
  const strengths = (answers.strengths || []).map((v) => STRENGTH_LABELS[v] || v).join(", ");
  const environment = ENV_LABELS[answers.environment] || answers.environment;
  const exam = EXAM_LABELS[answers.exam] || answers.exam;
  const priority = PRIORITY_LABELS[answers.priority] || answers.priority;

  return `
You are ColleXa's personalized college recommendation AI for Indian students.

A student has completed our discovery quiz. Here is their profile:
- Core Interests: ${interests}
- Academic Strengths: ${strengths}
- Preferred Work Environment: ${environment}
- Entrance Exam: ${exam}
- Top Priority: ${priority}

Based on this exact profile, respond ONLY with a valid JSON object. No markdown, no explanation, no extra text.

The JSON must follow this exact structure:
{
  "careerRoadmap": "A 3-4 sentence personalised paragraph explaining the career paths available to this student based on their specific interests and strengths. Mention 2-3 specific job roles they could realistically aim for. Be encouraging, specific to India, and realistic.",
  
  "futureScope": "A 2-3 sentence paragraph about industry trends and growth potential in their chosen field over the next 5-10 years in India. Mention salary ranges, demand growth, and emerging opportunities.",
  
  "colleges": [
    {
      "name": "Full Official College Name",
      "location": "City, State",
      "type": "IIT / IIM / NIT / Private / Deemed / Government etc.",
      "whyItFits": "One specific sentence (max 30 words) explaining exactly why THIS college matches THIS student's specific profile — reference their interests, strengths, or work environment preference.",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}

Rules:
- Recommend exactly 5 colleges
- All colleges must be real, well-known Indian institutions
- Colleges must be specifically strong in the student's area of interest, not just overall top colleges
- whyItFits must be personalised to their answers — do NOT write generic descriptions
- tags should be 3-4 short strings like "Strong Placements", "Research Focus", "Industry Connect", "Affordable Fees", "IIT Brand", "Startup Culture", "Government College", "Top Faculty" etc.
- If exam is JEE → include IITs/NITs. If NEET → AIIMS/top medical. If CAT → IIMs/top B-schools. If NID/NIFT → design schools. If CUET/other → central/state universities.
- careerRoadmap must reference the student's specific interests and strengths, not be generic
- Return ONLY valid JSON. Nothing else.
`;
};

// ── Controller ────────────────────────────────────────────────
export const getCollegeRecommendations = async (req, res) => {
  try {
    const { answers } = req.body;

    // Validate
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ error: "Answers are required." });
    }

    if (!answers.interests?.length) {
      return res.status(400).json({ error: "Please complete all quiz steps." });
    }

    const prompt = buildPrompt(answers);
    const groq = getGroq();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1800,
      temperature: 0.65,
    });

    const raw = completion.choices[0]?.message?.content || "";

    // Clean and parse
    const clean = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error("JSON parse failed. Raw response:", raw);
      return res.status(500).json({
        error: "AI returned invalid response. Please try again.",
      });
    }

    // Validate structure
    if (!parsed.careerRoadmap || !parsed.colleges || !Array.isArray(parsed.colleges)) {
      return res.status(500).json({
        error: "Incomplete AI response. Please try again.",
      });
    }

    return res.json({
      careerRoadmap: parsed.careerRoadmap,
      futureScope: parsed.futureScope || "",
      colleges: parsed.colleges.slice(0, 5),
    });

  } catch (err) {
    console.error("❌ CollegeForMe error:", err.message);
    return res.status(500).json({
      error: "Recommendation engine failed. Please try again.",
    });
  }
};
