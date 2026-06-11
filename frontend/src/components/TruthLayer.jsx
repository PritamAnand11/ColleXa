import React, { useState, useEffect } from "react";
import API from "../services/api";

// ── Theme helper ─────────────────────────────────────────────
const getTheme = () =>
  document.documentElement.getAttribute("data-theme") === "dark" ||
  document.body.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";

// ── Gap severity ─────────────────────────────────────────────
const getGapLevel = (official, reality) => {
  const gap = official - reality;
  if (gap >= 1.5) return { label: "Large Gap", color: "#EF4444", bg: "#FEE2E2", icon: "🚨" };
  if (gap >= 0.8) return { label: "Moderate Gap", color: "#F59E0B", bg: "#FEF3C7", icon: "⚠️" };
  if (gap >= 0.3) return { label: "Small Gap", color: "#3B82F6", bg: "#DBEAFE", icon: "ℹ️" };
  return { label: "Accurate", color: "#10B981", bg: "#D1FAE5", icon: "✅" };
};

// ── Score Bar ─────────────────────────────────────────────────
function ScoreBar({ label, value, max = 5, color, d }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: d ? "#9694C0" : "#6B7280", fontFamily: "Arial" }}>
          {label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "Arial" }}>
          {value.toFixed(1)} / {max}
        </span>
      </div>
      <div style={{ height: 8, background: d ? "#2D2B50" : "#E5E7EB", borderRadius: 99, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 99,
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}

// ── Gap Meter ────────────────────────────────────────────────
function GapMeter({ official, reality, d }) {
  const gap = official - reality;
  const severity = getGapLevel(official, reality);
  const gapPct = Math.min(Math.abs(gap) / 5 * 100 * 2.5, 100);

  return (
    <div style={{
      background: d ? "#12102A" : severity.bg,
      border: `1.5px solid ${severity.color}`,
      borderRadius: 14,
      padding: "16px 20px",
      marginBottom: 20,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: severity.color, fontFamily: "Arial" }}>
          {severity.icon} Reality vs Hype Gap
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "3px 10px",
          background: severity.color, color: "#fff", borderRadius: 999, fontFamily: "Arial"
        }}>
          {severity.label}
        </span>
      </div>

      {/* Two score pills */}
      <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 120, background: d ? "#1A1830" : "#fff", borderRadius: 10, padding: "12px 16px", border: `1px solid ${d ? "#2D2B50" : "#E5E7EB"}` }}>
          <div style={{ fontSize: 10, color: d ? "#9694C0" : "#9CA3AF", marginBottom: 4, fontFamily: "Arial", textTransform: "uppercase", letterSpacing: 1 }}>
            Official Rating
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#4F46E5", lineHeight: 1, fontFamily: "Arial" }}>
            {official.toFixed(1)}
          </div>
          <div style={{ fontSize: 10, color: d ? "#6B7280" : "#9CA3AF", marginTop: 2, fontFamily: "Arial" }}>
            Claimed / Marketed
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
          →
        </div>

        <div style={{ flex: 1, minWidth: 120, background: d ? "#1A1830" : "#fff", borderRadius: 10, padding: "12px 16px", border: `1.5px solid ${severity.color}` }}>
          <div style={{ fontSize: 10, color: d ? "#9694C0" : "#9CA3AF", marginBottom: 4, fontFamily: "Arial", textTransform: "uppercase", letterSpacing: 1 }}>
            Student Reality
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: severity.color, lineHeight: 1, fontFamily: "Arial" }}>
            {reality.toFixed(1)}
          </div>
          <div style={{ fontSize: 10, color: d ? "#6B7280" : "#9CA3AF", marginTop: 2, fontFamily: "Arial" }}>
            Verified Reviews
          </div>
        </div>
      </div>

      {/* Gap bar */}
      <div style={{ fontSize: 11, color: d ? "#9694C0" : "#6B7280", marginBottom: 5, fontFamily: "Arial" }}>
        Gap: <strong style={{ color: severity.color }}>
          {gap > 0 ? "-" : "+"}{Math.abs(gap).toFixed(1)} points
        </strong>
      </div>
      <div style={{ height: 6, background: d ? "#2D2B50" : "#E5E7EB", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${gapPct}%`, background: severity.color, borderRadius: 99, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function TruthLayer({ college, reviews = [] }) {
  const [theme,    setTheme]    = useState(getTheme());
  const [loading,  setLoading]  = useState(false);
  const [insight,  setInsight]  = useState(null);
  const [error,    setError]    = useState("");
  const [expanded, setExpanded] = useState(false);

  const d = theme === "dark";

  // Theme observer
  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(getTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    obs.observe(document.body,            { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  if (!college) return null;

  // ── Derived values ──────────────────────────────────────────
  // Official = what the college markets (we use their overall rating)
  // Reality  = average from actual student reviews
  const officialRating  = college.overallRating || 0;
  const reviewCount     = reviews.length;

  // Reality scores computed from reviews
  const avg = (key) => {
    if (!reviews.length) return 0;
    const vals = reviews.map(r => r[key]).filter(v => v > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const realityOverall    = avg("overallRating");
  const realityFaculty    = avg("facultyRating");
  const realityPlacement  = avg("placementRating");
  const realityInfra      = avg("infraRating");
  const realityHostel     = avg("hostelRating");

  // Use official overall vs real overall as the headline gap
  const displayOfficial = officialRating;
  const displayReality  = realityOverall > 0 ? realityOverall : officialRating;

  // ── Fetch AI insight ────────────────────────────────────────
  const fetchInsight = async () => {
    if (reviewCount === 0) {
      setError("No reviews available yet. Add reviews to unlock The Truth Layer.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const prompt = `You are ColleXa's "Truth Layer" AI — your job is to identify the gap between a college's marketing claims and actual student experiences.

College: ${college.name}
Location: ${college.location || "India"}

OFFICIAL (MARKETED) RATINGS:
- Overall: ${officialRating}/5

STUDENT REALITY (from ${reviewCount} verified reviews):
- Overall Reality: ${realityOverall.toFixed(2)}/5
- Faculty Reality: ${realityFaculty.toFixed(2)}/5
- Placement Reality: ${realityPlacement.toFixed(2)}/5
- Infrastructure Reality: ${realityInfra.toFixed(2)}/5
- Hostel Reality: ${realityHostel.toFixed(2)}/5

Gap (Official - Reality): ${(officialRating - realityOverall).toFixed(2)} points

RECENT REVIEW EXCERPTS (for context):
${reviews
  .slice(0, 8)
  .map((r, i) => `${i + 1}. "${r.review || ""}" ${r.pros ? `| Pros: ${r.pros}` : ""} ${r.cons ? `| Cons: ${r.cons}` : ""}`)
  .join("\n")}

Based on this data, respond ONLY with valid JSON. No markdown, no explanation. Use this exact format:
{
  "verdict": "one of: Mostly Accurate | Slightly Inflated | Significantly Inflated | Severely Overhyped",
  "verdictReason": "One sentence explaining the overall gap in plain language.",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "concerns": ["concern 1", "concern 2", "concern 3"],
  "biggestGap": "The single biggest area where reality differs from marketing",
  "trustScore": 75,
  "studentQuote": "A realistic, honest summary sentence a student would say about this college",
  "recommendation": "One clear sentence advising what type of student this college suits best"
}

Rules:
- strengths and concerns must each have exactly 3 items
- trustScore is a number 0-100 (how trustworthy the official marketing is)
- Be honest, specific, and reference actual data points
- Return ONLY valid JSON`;

      const res = await API.post("/chat", {
        messages: [{ role: "user", content: prompt }],
      });

      const raw   = res.data.reply || "";
      const clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);
      setInsight(parsed);
      setExpanded(true);
    } catch (err) {
      setError("Failed to analyse. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Styles ──────────────────────────────────────────────────
  const S = {
    wrap: {
      background: d ? "#1A1830" : "#FAFAFA",
      border: `1.5px solid ${d ? "#2D2B50" : "#E5E7EB"}`,
      borderRadius: 20,
      overflow: "hidden",
      marginTop: 28,
      fontFamily: "Arial, sans-serif",
    },
    header: {
      background: d
        ? "linear-gradient(135deg, #1E1B4B, #2D2B6B)"
        : "linear-gradient(135deg, #1E1B4B, #4F46E5)",
      padding: "22px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
    },
    headerLeft: { display: "flex", alignItems: "center", gap: 14 },
    badge: {
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: 8,
      padding: "8px 14px",
      fontSize: 22,
    },
    title: { margin: 0, fontSize: 20, fontWeight: 800, color: "#fff" },
    subtitle: { margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.65)" },
    newBadge: {
      background: "#EF4444",
      color: "#fff",
      fontSize: 10,
      fontWeight: 700,
      padding: "3px 8px",
      borderRadius: 999,
      letterSpacing: 1,
    },
    body: { padding: "24px 28px" },
    analyseBtn: (loading) => ({
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "12px 28px",
      background: loading
        ? (d ? "#2D2B50" : "#E5E7EB")
        : "linear-gradient(135deg, #4F46E5, #7C3AED)",
      color: loading ? (d ? "#6B7280" : "#9CA3AF") : "#fff",
      border: "none",
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 700,
      cursor: loading ? "not-allowed" : "pointer",
      transition: "all 0.2s",
      fontFamily: "Arial",
    }),
    insightBox: {
      background: d ? "#12102A" : "#F8F6FF",
      border: `1px solid ${d ? "#2D2B50" : "#EDE9FE"}`,
      borderRadius: 14,
      padding: "20px 22px",
      marginTop: 20,
    },
    strengthItem: {
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "10px 14px", borderRadius: 10, marginBottom: 8,
      background: d ? "#0F2A1E" : "#ECFDF5",
      border: `1px solid ${d ? "#1A4A30" : "#A7F3D0"}`,
    },
    concernItem: {
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "10px 14px", borderRadius: 10, marginBottom: 8,
      background: d ? "#2A1010" : "#FEF2F2",
      border: `1px solid ${d ? "#4A1A1A" : "#FECACA"}`,
    },
    twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 },
    sectionTitle: {
      fontSize: 13, fontWeight: 700,
      color: d ? "#E8E6FF" : "#1E1B4B",
      marginBottom: 10, marginTop: 16,
      display: "flex", alignItems: "center", gap: 6,
    },
    trustMeter: (score) => ({
      height: 10, borderRadius: 99, overflow: "hidden",
      background: d ? "#2D2B50" : "#E5E7EB", marginTop: 6,
    }),
    trustFill: (score) => ({
      height: "100%", borderRadius: 99,
      width: `${score}%`,
      background: score >= 75 ? "#10B981"
        : score >= 50 ? "#F59E0B"
        : "#EF4444",
      transition: "width 1.2s ease",
    }),
    quoteBox: {
      background: d ? "#1A1830" : "#EEF2FF",
      border: `1px solid ${d ? "#4F46E5" : "#C7D2FE"}`,
      borderRadius: 12,
      padding: "14px 18px",
      marginTop: 14,
      borderLeft: "4px solid #4F46E5",
    },
    errorBox: {
      background: d ? "#2D1B1B" : "#FEF2F2",
      border: "1px solid #EF4444",
      borderRadius: 10, padding: "14px 18px",
      color: "#EF4444", fontSize: 13,
      marginTop: 16,
    },
    noReviewsBox: {
      background: d ? "#1E1B4B" : "#EEF2FF",
      borderRadius: 12, padding: "16px 20px",
      border: `1px solid ${d ? "#4F46E5" : "#C7D2FE"}`,
      textAlign: "center", marginTop: 16,
    },
  };

  const verdictColor = insight
    ? insight.verdict === "Mostly Accurate" ? "#10B981"
    : insight.verdict === "Slightly Inflated" ? "#3B82F6"
    : insight.verdict === "Significantly Inflated" ? "#F59E0B"
    : "#EF4444"
    : "#6B7280";

  return (
    <div style={S.wrap}>
      {/* ── Header ── */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.badge}>🔍</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={S.title}>The Truth Layer</h3>
              <span style={S.newBadge}>NEW</span>
            </div>
            <p style={S.subtitle}>Reality vs Hype — Verified by Student Reviews + AI</p>
          </div>
        </div>
        {reviewCount > 0 && (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
            Based on <strong style={{ color: "#A5B4FC" }}>{reviewCount} verified reviews</strong>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={S.body}>

        {/* No reviews yet */}
        {reviewCount === 0 && (
          <div style={S.noReviewsBox}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
            <p style={{ fontSize: 14, fontWeight: 700, color: d ? "#E8E6FF" : "#1E1B4B", margin: "0 0 6px" }}>
              No Reviews Yet
            </p>
            <p style={{ fontSize: 12, color: d ? "#9694C0" : "#6B7280", margin: 0 }}>
              Be the first to review this college and unlock The Truth Layer analysis.
            </p>
          </div>
        )}

        {/* Has reviews — show gap meter */}
        {reviewCount > 0 && (
          <>
            <GapMeter
              official={displayOfficial}
              reality={displayReality}
              d={d}
            />

            {/* Category breakdown */}
            <div style={{ marginBottom: 20 }}>
              <div style={S.sectionTitle}>
                📊 Category Breakdown
              </div>
              {[
                { label: "Faculty",        reality: realityFaculty,   color: "#4F46E5" },
                { label: "Placements",     reality: realityPlacement, color: "#059669" },
                { label: "Infrastructure", reality: realityInfra,     color: "#0891B2" },
                { label: "Hostel",         reality: realityHostel,    color: "#D97706" },
              ].map(row => (
                <ScoreBar
                  key={row.label}
                  label={row.label + " (Student Reality)"}
                  value={row.reality}
                  color={row.color}
                  d={d}
                />
              ))}
            </div>

            {/* Analyse button */}
            {!insight && (
              <button
                style={S.analyseBtn(loading)}
                onClick={fetchInsight}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 14, height: 14,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid #fff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "tlSpin 0.8s linear infinite",
                    }} />
                    Analysing Reality vs Hype...
                  </>
                ) : (
                  <>🔍 Run AI Truth Analysis</>
                )}
              </button>
            )}

            <style>{`@keyframes tlSpin { to { transform: rotate(360deg); } }`}</style>

            {/* Error */}
            {error && <div style={S.errorBox}>{error}</div>}

            {/* AI Insight Results */}
            {insight && expanded && (
              <div style={S.insightBox}>

                {/* Verdict banner */}
                <div style={{
                  background: verdictColor + "22",
                  border: `1.5px solid ${verdictColor}`,
                  borderRadius: 12,
                  padding: "14px 18px",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}>
                  <span style={{ fontSize: 24 }}>
                    {insight.verdict === "Mostly Accurate" ? "✅"
                      : insight.verdict === "Slightly Inflated" ? "ℹ️"
                      : insight.verdict === "Significantly Inflated" ? "⚠️"
                      : "🚨"}
                  </span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: verdictColor, fontFamily: "Arial" }}>
                      {insight.verdict}
                    </div>
                    <div style={{ fontSize: 12, color: d ? "#9694C0" : "#6B7280", marginTop: 2, fontFamily: "Arial" }}>
                      {insight.verdictReason}
                    </div>
                  </div>
                </div>

                {/* Trust Score */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: d ? "#E8E6FF" : "#1E1B4B", fontFamily: "Arial" }}>
                      🎯 Marketing Trust Score
                    </span>
                    <span style={{
                      fontSize: 14, fontWeight: 900, fontFamily: "Arial",
                      color: insight.trustScore >= 75 ? "#10B981"
                        : insight.trustScore >= 50 ? "#F59E0B" : "#EF4444"
                    }}>
                      {insight.trustScore} / 100
                    </span>
                  </div>
                  <div style={S.trustMeter(insight.trustScore)}>
                    <div style={S.trustFill(insight.trustScore)} />
                  </div>
                  <div style={{ fontSize: 11, color: d ? "#9694C0" : "#6B7280", marginTop: 4, fontFamily: "Arial" }}>
                    {insight.trustScore >= 75 ? "College marketing is largely trustworthy"
                      : insight.trustScore >= 50 ? "Marketing has some exaggerations — verify claims"
                      : "Significant gap detected — research thoroughly before deciding"}
                  </div>
                </div>

                {/* Strengths + Concerns two-column */}
                <div style={S.twoCol}>
                  <div>
                    <div style={S.sectionTitle}>✅ Verified Strengths</div>
                    {(insight.strengths || []).map((s, i) => (
                      <div key={i} style={S.strengthItem}>
                        <span style={{ color: "#10B981", fontSize: 14, flexShrink: 0, marginTop: 1 }}>●</span>
                        <span style={{ fontSize: 12.5, color: d ? "#D1FAE5" : "#065F46", lineHeight: 1.5, fontFamily: "Arial" }}>
                          {s}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={S.sectionTitle}>⚠️ Hidden Concerns</div>
                    {(insight.concerns || []).map((c, i) => (
                      <div key={i} style={S.concernItem}>
                        <span style={{ color: "#EF4444", fontSize: 14, flexShrink: 0, marginTop: 1 }}>●</span>
                        <span style={{ fontSize: 12.5, color: d ? "#FEE2E2" : "#991B1B", lineHeight: 1.5, fontFamily: "Arial" }}>
                          {c}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Biggest gap */}
                {insight.biggestGap && (
                  <div style={{
                    background: d ? "#2A1010" : "#FEF3C7",
                    border: `1px solid ${d ? "#7C2020" : "#FCD34D"}`,
                    borderRadius: 10, padding: "12px 16px", marginTop: 16,
                    display: "flex", alignItems: "flex-start", gap: 10,
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>🔎</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#D97706", marginBottom: 3, fontFamily: "Arial", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Biggest Gap Found
                      </div>
                      <div style={{ fontSize: 12.5, color: d ? "#FDE68A" : "#92400E", fontFamily: "Arial", lineHeight: 1.5 }}>
                        {insight.biggestGap}
                      </div>
                    </div>
                  </div>
                )}

                {/* Student quote */}
                {insight.studentQuote && (
                  <div style={S.quoteBox}>
                    <div style={{ fontSize: 11, color: "#7C3AED", fontWeight: 700, marginBottom: 5, fontFamily: "Arial" }}>
                      💬 WHAT STUDENTS ACTUALLY SAY
                    </div>
                    <div style={{ fontSize: 13, color: d ? "#C4C2F0" : "#374151", fontFamily: "Arial", lineHeight: 1.6, fontStyle: "italic" }}>
                      "{insight.studentQuote}"
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                {insight.recommendation && (
                  <div style={{
                    background: d ? "#0F1E3A" : "#EFF6FF",
                    border: `1px solid ${d ? "#1E3A6A" : "#BFDBFE"}`,
                    borderRadius: 10, padding: "12px 16px", marginTop: 12,
                    display: "flex", alignItems: "flex-start", gap: 10,
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>🎓</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#3B82F6", marginBottom: 3, fontFamily: "Arial", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Who Should Apply
                      </div>
                      <div style={{ fontSize: 12.5, color: d ? "#BFDBFE" : "#1E40AF", fontFamily: "Arial", lineHeight: 1.5 }}>
                        {insight.recommendation}
                      </div>
                    </div>
                  </div>
                )}

                {/* Disclaimer + Re-analyse */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, flexWrap: "wrap", gap: 8 }}>
                  <p style={{ fontSize: 10, color: d ? "#6B7280" : "#9CA3AF", margin: 0, fontFamily: "Arial" }}>
                    🤖 AI analysis based on {reviewCount} student reviews · Powered by Groq Llama 3.3
                  </p>
                  <button
                    onClick={() => { setInsight(null); setExpanded(false); }}
                    style={{
                      background: "transparent",
                      border: `1px solid ${d ? "#2D2B50" : "#E5E7EB"}`,
                      borderRadius: 8, padding: "5px 14px",
                      fontSize: 11, color: d ? "#9694C0" : "#6B7280",
                      cursor: "pointer", fontFamily: "Arial",
                    }}
                  >
                    ↩ Re-analyse
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
