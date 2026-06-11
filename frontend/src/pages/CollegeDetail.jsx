// frontend/src/pages/CollegeDetail.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

import TruthLayer from "../components/TruthLayer";

import UnfilteredSection from "../components/UnfilteredSection";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

/* =========================================================
   THEME
========================================================= */
const getTheme = () =>
  document.documentElement.getAttribute("data-theme") === "dark" ||
  document.body.getAttribute("data-theme") === "dark"
    ? "dark" : "light";

const T = {
  dark: {
    page:           "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
    heroBg:         "rgba(255,255,255,0.02)",
    heroBorder:     "rgba(255,255,255,0.06)",
    collegeName:    "linear-gradient(135deg, #ffffff 30%, #a78bfa 100%)",
    locationColor:  "#7c7c9a",
    cardBg:         "rgba(255,255,255,0.04)",
    cardBorder:     "rgba(255,255,255,0.08)",
    cardTitle:      "#7c7c9a",
    text:           "#e8e8f0",
    textMuted:      "#b0b0c8",
    textFaint:      "#3a3a55",
    barTrack:       "rgba(255,255,255,0.06)",
    radarGrid:      "rgba(255,255,255,0.07)",
    radarTick:      "#6868a8",
    tooltipBg:      "#1a1a2e",
    tooltipBorder:  "rgba(255,255,255,0.1)",
    prosBg:         "rgba(34,197,94,0.06)",
    prosBorder:     "rgba(34,197,94,0.15)",
    consBg:         "rgba(239,68,68,0.06)",
    consBorder:     "rgba(239,68,68,0.15)",
    listItem:       "#b0b0c8",
    reviewBg:       "rgba(255,255,255,0.03)",
    reviewBorder:   "rgba(255,255,255,0.06)",
    reviewHover:    "rgba(124,58,237,0.28)",
    reviewText:     "#c0c0d8",
    miniProsBg:     "rgba(34,197,94,0.06)",
    miniProsBorder: "rgba(34,197,94,0.12)",
    miniConsBg:     "rgba(239,68,68,0.06)",
    miniConsBorder: "rgba(239,68,68,0.12)",
    miniProsColor:  "#86efac",
    miniConsColor:  "#fca5a5",
    tagBg:          "rgba(255,255,255,0.06)",
    tagBorder:      "rgba(255,255,255,0.08)",
    tagColor:       "#6868a8",
    tagHlBg:        "rgba(124,58,237,0.2)",
    tagHlBorder:    "rgba(124,58,237,0.3)",
    tagHlColor:     "#c4b5fd",
    emptyColor:     "#4a4a62",
    refreshBg:      "rgba(124,58,237,0.15)",
    refreshBorder:  "rgba(124,58,237,0.3)",
    refreshColor:   "#a78bfa",
    spinnerBorder:  "rgba(124,58,237,0.15)",
    skBg:           "rgba(255,255,255,0.04)",
    skShimmer:      "rgba(255,255,255,0.09)",
  },
  light: {
    page:           "linear-gradient(135deg, #f0f2ff 0%, #e8eaff 50%, #f5f0ff 100%)",
    heroBg:         "rgba(255,255,255,0.7)",
    heroBorder:     "rgba(0,0,0,0.06)",
    collegeName:    "linear-gradient(135deg, #1a1a2e 30%, #7c3aed 100%)",
    locationColor:  "#888",
    cardBg:         "rgba(255,255,255,0.85)",
    cardBorder:     "rgba(0,0,0,0.07)",
    cardTitle:      "#888",
    text:           "#1a1a2e",
    textMuted:      "#444",
    textFaint:      "#aaa",
    barTrack:       "rgba(0,0,0,0.07)",
    radarGrid:      "rgba(0,0,0,0.08)",
    radarTick:      "#888",
    tooltipBg:      "#fff",
    tooltipBorder:  "rgba(0,0,0,0.1)",
    prosBg:         "rgba(34,197,94,0.08)",
    prosBorder:     "rgba(34,197,94,0.25)",
    consBg:         "rgba(239,68,68,0.06)",
    consBorder:     "rgba(239,68,68,0.2)",
    listItem:       "#333",
    reviewBg:       "rgba(255,255,255,0.9)",
    reviewBorder:   "rgba(0,0,0,0.07)",
    reviewHover:    "rgba(124,58,237,0.2)",
    reviewText:     "#333",
    miniProsBg:     "rgba(34,197,94,0.08)",
    miniProsBorder: "rgba(34,197,94,0.2)",
    miniConsBg:     "rgba(239,68,68,0.06)",
    miniConsBorder: "rgba(239,68,68,0.15)",
    miniProsColor:  "#16a34a",
    miniConsColor:  "#dc2626",
    tagBg:          "rgba(0,0,0,0.05)",
    tagBorder:      "rgba(0,0,0,0.08)",
    tagColor:       "#555",
    tagHlBg:        "rgba(124,58,237,0.1)",
    tagHlBorder:    "rgba(124,58,237,0.25)",
    tagHlColor:     "#6d28d9",
    emptyColor:     "#999",
    refreshBg:      "rgba(124,58,237,0.08)",
    refreshBorder:  "rgba(124,58,237,0.2)",
    refreshColor:   "#7c3aed",
    spinnerBorder:  "rgba(124,58,237,0.12)",
    skBg:           "rgba(0,0,0,0.05)",
    skShimmer:      "rgba(0,0,0,0.09)",
  },
};

const BAR_COLORS = ["#7c3aed", "#2563eb", "#d97706", "#dc2626"];

/* =========================================================
   STAR DISPLAY
========================================================= */
function Stars({ value, size = 14 }) {
  return (
    <span style={{ fontSize: size, letterSpacing: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(value) ? "#f59e0b" : "#d1d5db" }}>★</span>
      ))}
    </span>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function CollegeDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [college,   setCollege]   = useState(null);
  const [reviews,   setReviews]   = useState([]);
  const [ai,        setAi]        = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error,     setError]     = useState(null);
  const [theme,     setTheme]     = useState(getTheme);

  /* watch theme */
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(getTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    observer.observe(document.body,            { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const fetchCollege = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const url = forceRefresh ? `/colleges/${id}?refresh=true` : `/colleges/${id}`;
      const res = await API.get(url);
      setCollege(res.data.college);
      setReviews(res.data.reviews);
      setAi(res.data.aiAnalysis);
    } catch (err) {
      console.error(err);
      setError("Failed to load college. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCollege(); }, [id]);

  const handleRefreshAI = async () => {
    try {
      setAiLoading(true);
      const res = await API.get(`/colleges/${id}?refresh=true`);
      setAi(res.data.aiAnalysis);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading)  return <LoadingSkeleton theme={theme} />;
  if (error)    return <ErrorState message={error} onRetry={fetchCollege} theme={theme} />;
  if (!college) return <ErrorState message="College not found." theme={theme} />;

  const C = T[theme];

  const STALE = [
    "No reviews available",
    "AI analysis unavailable",
    "No reviews available yet. Be the first to review!",
  ];
  const hasAi = ai?.pros?.length > 0 && ai?.summary && !STALE.includes(ai.summary);

  const barData = [
    { label: "Faculty",        value: college.avgFacultyRating    || 0, color: BAR_COLORS[0] },
    { label: "Placement",      value: college.avgPlacementRating  || 0, color: BAR_COLORS[1] },
    { label: "Infrastructure", value: college.avgInfraRating      || 0, color: BAR_COLORS[2] },
    { label: "Hostel",         value: college.avgHostelRating     || 0, color: BAR_COLORS[3] },
  ];

  const radarData = barData.map(d => ({
    subject:  d.label,
    value:    Math.round(d.value * 20),
    fullMark: 100,
  }));

  const sentimentPillBg = (s) =>
    s === "Positive" ? "linear-gradient(135deg,#22c55e,#16a34a)"
    : s === "Negative" ? "linear-gradient(135deg,#ef4444,#dc2626)"
    : "linear-gradient(135deg,#f59e0b,#d97706)";

  /* ── card style helper ── */
  const card = (extra = {}) => ({
    background:     C.cardBg,
    border:         `1px solid ${C.cardBorder}`,
    borderRadius:   20,
    padding:        28,
    backdropFilter: "blur(12px)",
    transition:     "background 0.3s ease",
    ...extra,
  });

  return (
    <motion.div
      style={{
        minHeight:   "100vh",
        background:  C.page,
        fontFamily:  "'DM Sans', 'Segoe UI', sans-serif",
        color:       C.text,
        paddingBottom: 80,
        transition:  "background 0.3s ease, color 0.3s ease",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >

      {/* ════ HERO ════ */}
      <div style={{
        position:       "relative",
        padding:        "60px 40px 50px",
        borderBottom:   `1px solid ${C.heroBorder}`,
        background:     C.heroBg,
        backdropFilter: "blur(10px)",
        transition:     "background 0.3s ease",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", gap: 24, flexWrap: "wrap",
        }}>
          <div>
            <motion.h1
              style={{
                fontSize:               "clamp(2rem, 5vw, 3.2rem)",
                fontWeight:             800,
                letterSpacing:          "-1.5px",
                margin:                 0,
                background:             C.collegeName,
                WebkitBackgroundClip:   "text",
                WebkitTextFillColor:    "transparent",
                lineHeight:             1.1,
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {college.name}
            </motion.h1>
            <motion.p
              style={{ marginTop: 10, fontSize: 15, color: C.locationColor, display: "flex", alignItems: "center", gap: 6 }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.18 }}
            >
              <span>📍</span>
              {college.location || "Location not specified"}
            </motion.p>
          </div>

          <motion.div
            style={{
              background:  "linear-gradient(135deg, #7c3aed, #4f46e5)",
              borderRadius: 20,
              padding:     "18px 28px",
              textAlign:   "center",
              boxShadow:   "0 8px 32px rgba(124,58,237,0.35)",
              flexShrink:  0,
            }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
          >
            <div style={{ fontSize: 42, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-2px" }}>
              {(college.overallRating || 0).toFixed(1)}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 4 }}>
              Overall Rating
            </div>
          </motion.div>
        </div>
      </div>


      {/* ════ BODY ════ */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 0" }}>

        {/* ── Row 1: Rating Breakdown + AI Analysis ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
          gap: 24, marginBottom: 24,
        }}>

          {/* Rating Breakdown */}
          <motion.div
            style={card()}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: C.cardTitle, margin: "0 0 22px 0" }}>
              Rating Breakdown
            </p>

            <ResponsiveContainer width="100%" height={195}>
              <RadarChart data={radarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <PolarGrid stroke={C.radarGrid} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: C.radarTick, fontSize: 12 }} />
                <Radar dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.22} strokeWidth={2} />
                <Tooltip
                  formatter={(v) => [`${v}%`, "Score"]}
                  contentStyle={{
                    background: C.tooltipBg,
                    border:     `1px solid ${C.tooltipBorder}`,
                    borderRadius: 10,
                    color:      C.text,
                    fontSize:   13,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>

            <div style={{ marginTop: 18 }}>
              {barData.map((bar, i) => (
                <motion.div
                  key={bar.label}
                  style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                >
                  <span style={{ fontSize: 13, color: C.cardTitle, width: 110, flexShrink: 0 }}>{bar.label}</span>
                  <div style={{ flex: 1, height: 7, background: C.barTrack, borderRadius: 999, overflow: "hidden" }}>
                    <motion.div
                      style={{ height: "100%", borderRadius: 999, background: bar.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.value * 20}%` }}
                      transition={{ delay: 0.35 + i * 0.07, duration: 0.9, ease: "easeOut" }}
                    />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text, width: 32, textAlign: "right", flexShrink: 0 }}>
                    {bar.value.toFixed(1)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>


          {/* AI Review Analysis */}
          <motion.div
            style={card()}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: C.cardTitle, margin: 0 }}>
                AI Review Analysis
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {hasAi && ai.sentiment && (
                  <motion.span
                    style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: "1px",
                      textTransform: "uppercase", padding: "5px 14px",
                      borderRadius: 999, color: "#fff",
                      background: sentimentPillBg(ai.sentiment),
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {ai.sentiment}
                  </motion.span>
                )}
                <button
                  onClick={handleRefreshAI}
                  disabled={aiLoading}
                  style={{
                    background:  C.refreshBg,
                    border:      `1px solid ${C.refreshBorder}`,
                    borderRadius: 8,
                    color:       C.refreshColor,
                    fontSize:    12, fontWeight: 600,
                    padding:     "6px 14px", cursor: "pointer",
                    transition:  "all 0.2s",
                  }}
                  onMouseEnter={e => { e.target.style.background = theme === "dark" ? "rgba(124,58,237,0.28)" : "rgba(124,58,237,0.15)"; }}
                  onMouseLeave={e => { e.target.style.background = C.refreshBg; }}
                >
                  {aiLoading ? "Analyzing…" : "↻ Refresh"}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {aiLoading ? (
                <motion.div
                  key="loading"
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 0", gap: 14, color: C.cardTitle, fontSize: 13 }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                  <Spinner theme={theme} />
                  <span>Generating insights from student reviews…</span>
                </motion.div>

              ) : hasAi ? (
                <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

                    {/* Pros */}
                    <div style={{ background: C.prosBg, border: `1px solid ${C.prosBorder}`, borderRadius: 14, padding: "16px 18px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#4ade80", marginBottom: 12, display: "block" }}>
                        ✓ Pros
                      </span>
                      {ai.pros.map((pro, i) => (
                        <motion.div
                          key={i}
                          style={{ fontSize: 13, color: C.listItem, lineHeight: 1.65, paddingLeft: 14, marginBottom: 8, position: "relative" }}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                        >
                          <span style={{ position: "absolute", left: 0, top: 7, width: 5, height: 5, borderRadius: "50%", background: "#4ade80" }} />
                          {pro}
                        </motion.div>
                      ))}
                    </div>

                    {/* Cons */}
                    <div style={{ background: C.consBg, border: `1px solid ${C.consBorder}`, borderRadius: 14, padding: "16px 18px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#f87171", marginBottom: 12, display: "block" }}>
                        ✗ Cons
                      </span>
                      {ai.cons.map((con, i) => (
                        <motion.div
                          key={i}
                          style={{ fontSize: 13, color: C.listItem, lineHeight: 1.65, paddingLeft: 14, marginBottom: 8, position: "relative" }}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                        >
                          <span style={{ position: "absolute", left: 0, top: 7, width: 5, height: 5, borderRadius: "50%", background: "#f87171" }} />
                          {con}
                        </motion.div>
                      ))}
                    </div>

                  </div>
                </motion.div>

              ) : (
                <motion.div
                  key="empty"
                  style={{ textAlign: "center", padding: "40px 20px", color: C.emptyColor, fontSize: 14, lineHeight: 1.7 }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
                  <p style={{ margin: 0 }}>
                    {reviews.length === 0
                      ? "No reviews yet — AI analysis will appear once students submit reviews."
                      : "AI analysis pending. Click Refresh to generate insights."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>


        {/* ── AI Summary ── */}
        {hasAi && (
          <motion.div
            style={{ ...card(), marginBottom: 24 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: C.cardTitle, margin: "0 0 4px 0" }}>
              AI Summary
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.85, color: C.textMuted, margin: "12px 0 0 0" }}>
              {ai.summary}
            </p>
            {ai.lastUpdated && (
              <p style={{ fontSize: 11, color: C.textFaint, marginTop: 14 }}>
                Last analyzed:{" "}
                {new Date(ai.lastUpdated).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            )}
          </motion.div>
        )}
        

        {/* ── Student Reviews ── */}
        <motion.div
          style={card()}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Section header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: C.cardTitle, margin: 0 }}>
              Student Reviews{" "}
              <span style={{ color: C.textFaint, fontWeight: 400 }}>({reviews.length})</span>
            </p>

            {/* ✅ Write Review button */}
            <motion.button
              onClick={() => navigate(`/college/${id}/review`)}
              whileHover={{ translateY: -2, boxShadow: "0 8px 24px rgba(124,58,237,0.4)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                background:   "linear-gradient(135deg, #7c3aed, #4f46e5)",
                border:       "none",
                borderRadius: 10,
                color:        "#fff",
                fontSize:     13,
                fontWeight:   700,
                padding:      "9px 18px",
                cursor:       "pointer",
                fontFamily:   "inherit",
                boxShadow:    "0 4px 16px rgba(124,58,237,0.3)",
                display:      "flex",
                alignItems:   "center",
                gap:          6,
                transition:   "all 0.2s",
              }}
            >
              ✏️ Write Review
            </motion.button>
          </div>

          {/* Reviews list */}
          {reviews.length > 0 ? reviews.map((review, i) => (
            <motion.div
              key={review._id}
              style={{
                background:   C.reviewBg,
                border:       `1px solid ${C.reviewBorder}`,
                borderRadius: 16,
                padding:      "20px 22px",
                marginBottom: 14,
                cursor:       "default",
                transition:   "border-color 0.2s",
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = C.reviewHover)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.reviewBorder)}
            >
              {/* Reviewer name + overall stars */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
    {review.reviewerName || "Anonymous"}
  </span>

  {review.isVerified && (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: 999,
        background: "rgba(34,197,94,0.12)",
        border: "1px solid rgba(34,197,94,0.35)",
        color: "#22c55e",
        letterSpacing: "0.5px"
      }}
    >
      ✓ Verified Review
    </span>
  )}
</div>

              {review.review && (
                <p style={{ fontSize: 14.5, lineHeight: 1.75, color: C.reviewText, margin: "0 0 14px 0" }}>
                  {review.review}
                </p>
              )}

              {(review.pros || review.cons) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "12px 0" }}>
                  {review.pros && (
                    <div style={{ fontSize: 12.5, color: C.miniProsColor, background: C.miniProsBg, border: `1px solid ${C.miniProsBorder}`, borderRadius: 8, padding: "8px 12px", lineHeight: 1.6 }}>
                      <strong style={{ display: "block", marginBottom: 3, fontSize: 11, letterSpacing: "1px", textTransform: "uppercase" }}>✓ Pros</strong>
                      {review.pros}
                    </div>
                  )}
                  {review.cons && (
                    <div style={{ fontSize: 12.5, color: C.miniConsColor, background: C.miniConsBg, border: `1px solid ${C.miniConsBorder}`, borderRadius: 8, padding: "8px 12px", lineHeight: 1.6 }}>
                      <strong style={{ display: "block", marginBottom: 3, fontSize: 11, letterSpacing: "1px", textTransform: "uppercase" }}>✗ Cons</strong>
                      {review.cons}
                    </div>
                  )}
                </div>
              )}

              {/* Rating tags */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                {review.facultyRating   && <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: C.tagBg,   border: `1px solid ${C.tagBorder}`,   color: C.tagColor   }}>Faculty {review.facultyRating}/5</span>}
                {review.placementRating && <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: C.tagBg,   border: `1px solid ${C.tagBorder}`,   color: C.tagColor   }}>Placement {review.placementRating}/5</span>}
                {review.infraRating     && <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: C.tagBg,   border: `1px solid ${C.tagBorder}`,   color: C.tagColor   }}>Infra {review.infraRating}/5</span>}
                {review.hostelRating    && <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: C.tagBg,   border: `1px solid ${C.tagBorder}`,   color: C.tagColor   }}>Hostel {review.hostelRating}/5</span>}
              </div>

              {review.createdAt && (
                <p style={{ fontSize: 11, color: C.textFaint, marginTop: 10 }}>
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              )}
            </motion.div>
          )) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: C.emptyColor, fontSize: 14, lineHeight: 1.7 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
              <p style={{ margin: "0 0 20px" }}>
                No reviews yet. Be the first to share your experience!
              </p>
              <motion.button
                onClick={() => navigate(`/college/${id}/review`)}
                whileHover={{ translateY: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background:   "linear-gradient(135deg,#7c3aed,#4f46e5)",
                  border:       "none",
                  borderRadius: 12,
                  color:        "#fff",
                  fontSize:     14,
                  fontWeight:   700,
                  padding:      "12px 28px",
                  cursor:       "pointer",
                  fontFamily:   "inherit",
                  boxShadow:    "0 4px 16px rgba(124,58,237,0.3)",
                }}
              >
                ✏️ Write the first review
              </motion.button>
            </div>
          )}

          {/* Verified Reviews Section */}
          {college && (
          <UnfilteredSection collegeId={college._id} />
          )}
          
          <TruthLayer college={college} reviews={reviews} />
        </motion.div>

      </div>
    </motion.div>
  );
}


/* =========================================================
   SPINNER
========================================================= */
function Spinner({ theme }) {
  return (
    <>
      <style>{`@keyframes _spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 34, height: 34, borderRadius: "50%",
        border: `3px solid ${theme === "dark" ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.12)"}`,
        borderTopColor: "#7c3aed",
        animation: "_spin 0.8s linear infinite",
      }} />
    </>
  );
}


/* =========================================================
   LOADING SKELETON
========================================================= */
function LoadingSkeleton({ theme }) {
  const bg    = theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";
  const shine = theme === "dark" ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
  const page  = theme === "dark"
    ? "linear-gradient(135deg,#0f0f1a 0%,#1a1a2e 50%,#16213e 100%)"
    : "linear-gradient(135deg,#f0f2ff 0%,#e8eaff 50%,#f5f0ff 100%)";

  return (
    <div style={{ minHeight: "100vh", background: page, padding: "60px 40px" }}>
      <style>{`
        @keyframes _shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        .sk {
          background: linear-gradient(90deg, ${bg} 25%, ${shine} 50%, ${bg} 75%);
          background-size: 200% 100%;
          animation: _shimmer 1.5s infinite;
          border-radius: 12px;
        }
      `}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="sk" style={{ height: 48, width: "40%", marginBottom: 12 }} />
        <div className="sk" style={{ height: 18, width: "20%", marginBottom: 48 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div className="sk" style={{ height: 400 }} />
          <div className="sk" style={{ height: 400 }} />
        </div>
        <div className="sk" style={{ height: 130, marginTop: 24 }} />
        <div className="sk" style={{ height: 250, marginTop: 24 }} />
      </div>
    </div>
  );
}


/* =========================================================
   ERROR STATE
========================================================= */
function ErrorState({ message, onRetry, theme }) {
  const page = theme === "dark"
    ? "linear-gradient(135deg,#0f0f1a 0%,#1a1a2e 50%,#16213e 100%)"
    : "linear-gradient(135deg,#f0f2ff 0%,#e8eaff 50%,#f5f0ff 100%)";

  return (
    <div style={{ minHeight: "100vh", background: page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
        <p style={{ color: "#7c7c9a", marginBottom: 24, fontSize: 15 }}>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
              border: "none", borderRadius: 10, color: "#fff",
              padding: "11px 28px", fontSize: 14, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
