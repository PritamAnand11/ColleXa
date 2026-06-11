import Groq from "groq-sdk";
import College from "../models/College.js";
import Review  from "../models/Review.js";

let groqClient = null;
const getGroq = () => {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY not set");
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

// ── Average helper ───────────────────────────────────────────
const avg = (arr, key) => {
  const vals = arr.map(r => r[key]).filter(v => v > 0);
  return vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 0;
};

// ── GET /api/truth-layer/:collegeId ──────────────────────────
// Returns fresh analysis (or cached if < 48 hrs old)
export const getTruthLayer = async (req, res) => {
  try {
    const { collegeId } = req.params;

    const college = await College.findById(collegeId);
    if (!college) return res.status(404).json({ error: "College not found." });

    const reviews = await Review.find({ collegeId }).sort({ createdAt: -1 });

    if (reviews.length === 0) {
      return res.json({
        cached: false,
        reviewCount: 0,
        message: "No reviews yet. Add reviews to unlock Truth Layer.",
        officialRating: college.overallRating || 0,
      });
    }

    // Check cache (48-hour TTL)
    if (
      college.truthLayer?.cachedAt &&
      Date.now() - new Date(college.truthLayer.cachedAt).getTime() < 48 * 60 * 60 * 1000 &&
      college.truthLayer?.verdict
    ) {
      return res.json({
        cached: true,
        reviewCount: reviews.length,
        officialRating: college.overallRating || 0,
        realityScores: {
          overall:    avg(reviews, "overallRating"),
          faculty:    avg(reviews, "facultyRating"),
          placement:  avg(reviews, "placementRating"),
          infra:      avg(reviews, "infraRating"),
          hostel:     avg(reviews, "hostelRating"),
        },
        ...college.truthLayer,
      });
    }

    // Build reality scores
    const realityScores = {
      overall:   avg(reviews, "overallRating"),
      faculty:   avg(reviews, "facultyRating"),
      placement: avg(reviews, "placementRating"),
      infra:     avg(reviews, "infraRating"),
      hostel:    avg(reviews, "hostelRating"),
    };

    const officialRating = college.overallRating || 0;

    // Build prompt
    const prompt = `You are ColleXa's "Truth Layer" AI — identify the gap between a college's marketing claims and actual student experiences.

College: ${college.name}
Location: ${college.location || "India"}

OFFICIAL (MARKETED) RATINGS:
- Overall: ${officialRating}/5

STUDENT REALITY (from ${reviews.length} verified reviews):
- Overall Reality: ${realityScores.overall}/5
- Faculty Reality: ${realityScores.faculty}/5
- Placement Reality: ${realityScores.placement}/5
- Infrastructure Reality: ${realityScores.infra}/5
- Hostel Reality: ${realityScores.hostel}/5

Gap (Official - Reality): ${(officialRating - realityScores.overall).toFixed(2)} points

RECENT REVIEW EXCERPTS:
${reviews
  .slice(0, 8)
  .map((r, i) => `${i + 1}. "${r.review || ""}" ${r.pros ? `| Pros: ${r.pros}` : ""} ${r.cons ? `| Cons: ${r.cons}` : ""}`)
  .join("\n")}

Respond ONLY with valid JSON in this exact format:
{
  "verdict": "one of: Mostly Accurate | Slightly Inflated | Significantly Inflated | Severely Overhyped",
  "verdictReason": "One sentence explaining the overall gap in plain language.",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "concerns": ["concern 1", "concern 2", "concern 3"],
  "biggestGap": "The single biggest area where reality differs from marketing",
  "trustScore": 75,
  "studentQuote": "A realistic, honest summary sentence a student would say about this college",
  "recommendation": "One clear sentence advising what type of student this college suits best"
}`;

    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.6,
    });

    const raw    = completion.choices[0]?.message?.content || "";
    const clean  = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(clean);

    // Cache in College document
    const truthLayerData = {
      ...parsed,
      cachedAt: new Date(),
    };
    await College.findByIdAndUpdate(collegeId, { $set: { truthLayer: truthLayerData } });

    return res.json({
      cached: false,
      reviewCount: reviews.length,
      officialRating,
      realityScores,
      ...parsed,
    });

  } catch (err) {
    console.error("❌ Truth Layer error:", err.message);
    return res.status(500).json({ error: "Truth Layer analysis failed. Please try again." });
  }
};

// ── POST /api/truth-layer/:collegeId/refresh ─────────────────
// Force refresh (bypass cache)
export const refreshTruthLayer = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const college = await College.findById(collegeId);
    if (!college) return res.status(404).json({ error: "College not found." });

    // Clear cache and re-run
    await College.findByIdAndUpdate(collegeId, { $unset: { truthLayer: "" } });
    req.params.collegeId = collegeId;
    return getTruthLayer(req, res);
  } catch (err) {
    console.error("❌ Truth Layer refresh error:", err.message);
    return res.status(500).json({ error: "Refresh failed." });
  }
};
