// frontend/src/pages/Compare.jsx
// ── Full file with AI Verdict feature added ──────────────────

import React, { useEffect, useState } from "react";
import { getColleges } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";

const getTheme = () =>
  document.documentElement.getAttribute("data-theme") === "dark" ||
  document.body.getAttribute("data-theme") === "dark"
    ? "dark" : "light";

const METRICS = [
  { key: "overallRating",      label: "Overall Rating", icon: "⭐", max: 5 },
  { key: "avgFacultyRating",   label: "Faculty",        icon: "👨‍🏫", max: 5 },
  { key: "avgPlacementRating", label: "Placements",     icon: "💼", max: 5 },
  { key: "avgInfraRating",     label: "Infrastructure", icon: "🏛️", max: 5 },
  { key: "avgHostelRating",    label: "Hostel",         icon: "🏠", max: 5 },
];

const THEMES = {
  dark: {
    page:"linear-gradient(135deg,#0f0f1a 0%,#1a1a2e 50%,#16213e 100%)",
    text:"#e8e8f0",textMuted:"#7c7c9a",textFaint:"#3a3a55",
    cardBg:"rgba(255,255,255,0.04)",cardBorder:"rgba(255,255,255,0.08)",
    chipBg:"rgba(255,255,255,0.05)",chipBorder:"rgba(255,255,255,0.1)",
    chipSelA:"rgba(124,58,237,0.25)",chipSelBorderA:"rgba(124,58,237,0.5)",
    chipSelB:"rgba(14,165,233,0.2)",chipSelBorderB:"rgba(14,165,233,0.45)",
    barTrack:"rgba(255,255,255,0.07)",rowHover:"rgba(255,255,255,0.03)",
    labelA:"#a78bfa",labelB:"#38bdf8",
    avatarA:"linear-gradient(135deg,#7c3aed,#4f46e5)",
    avatarB:"linear-gradient(135deg,#0ea5e9,#06b6d4)",
    verdictBg:"rgba(108,99,255,0.06)",verdictBorder:"rgba(108,99,255,0.2)",
    verdictItem:"rgba(255,255,255,0.04)",verdictItemBorder:"rgba(255,255,255,0.07)",
  },
  light: {
    page:"linear-gradient(135deg,#f0f2ff 0%,#e8eaff 50%,#f5f0ff 100%)",
    text:"#1a1a2e",textMuted:"#888",textFaint:"#bbb",
    cardBg:"rgba(255,255,255,0.85)",cardBorder:"rgba(0,0,0,0.07)",
    chipBg:"rgba(255,255,255,0.7)",chipBorder:"rgba(0,0,0,0.1)",
    chipSelA:"rgba(124,58,237,0.1)",chipSelBorderA:"rgba(124,58,237,0.4)",
    chipSelB:"rgba(14,165,233,0.1)",chipSelBorderB:"rgba(14,165,233,0.4)",
    barTrack:"rgba(0,0,0,0.07)",rowHover:"rgba(124,58,237,0.03)",
    labelA:"#6d28d9",labelB:"#0284c7",
    avatarA:"linear-gradient(135deg,#7c3aed,#4f46e5)",
    avatarB:"linear-gradient(135deg,#0ea5e9,#06b6d4)",
    verdictBg:"rgba(108,99,255,0.05)",verdictBorder:"rgba(108,99,255,0.18)",
    verdictItem:"rgba(108,99,255,0.04)",verdictItemBorder:"rgba(108,99,255,0.1)",
  },
};

// ── AI Verdict Categories ──────────────────────────────────────
const VERDICT_CATEGORIES = [
  { key:"overall",    label:"Overall Verdict",      icon:"🏆", prompt:"overall strengths and weaknesses" },
  { key:"placements", label:"Placements & Career",  icon:"💼", prompt:"placements and career opportunities" },
  { key:"campus",     label:"Campus & Hostel Life", icon:"🏫", prompt:"campus life, infrastructure and hostel experience" },
  { key:"faculty",    label:"Faculty & Academics",  icon:"📚", prompt:"faculty quality and academic rigor" },
  { key:"fees",       label:"Value for Money",      icon:"💰", prompt:"value for money and return on investment" },
  { key:"future",     label:"Future Scope",         icon:"🚀", prompt:"future career scope and alumni network" },
];

// ── Parse bullet lines from AI response ───────────────────────
const parseVerdict = (text, nameA, nameB) => {
  const lines = text
    .split("\n")
    .map(l => l.replace(/^[-•*]\s*/, "").trim())
    .filter(l => l.length > 10);

  return lines.map(line => {
    const low  = line.toLowerCase();
    const lowA = nameA.toLowerCase().split(" ")[0];
    const lowB = nameB.toLowerCase().split(" ")[0];
    let winner = "neutral";
    if (low.includes(lowA)) winner = "A";
    else if (low.includes(lowB)) winner = "B";
    return { text: line, winner };
  });
};

// ══ AI VERDICT PANEL ══════════════════════════════════════════
function AIVerdictPanel({ collegeA, collegeB, C }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [verdicts,        setVerdicts]       = useState({});

  const nameA = collegeA.name.split(" ")[0];
  const nameB = collegeB.name.split(" ")[0];

  const fetchVerdict = async (category) => {
    // Toggle off if already showing
    if (verdicts[category.key]?.lines) {
      setActiveCategory(prev => prev === category.key ? null : category.key);
      return;
    }

    setActiveCategory(category.key);
    setVerdicts(prev => ({ ...prev, [category.key]: { loading: true, lines: null, error: null } }));

    try {
      const prompt =
`Compare these two Indian colleges specifically for ${category.prompt}.

College A: ${collegeA.name} (${collegeA.location || "India"})
- Overall: ${collegeA.overallRating || "N/A"}/5
- Faculty: ${collegeA.avgFacultyRating || "N/A"}/5
- Placement: ${collegeA.avgPlacementRating || "N/A"}/5
- Infrastructure: ${collegeA.avgInfraRating || "N/A"}/5
- Hostel: ${collegeA.avgHostelRating || "N/A"}/5

College B: ${collegeB.name} (${collegeB.location || "India"})
- Overall: ${collegeB.overallRating || "N/A"}/5
- Faculty: ${collegeB.avgFacultyRating || "N/A"}/5
- Placement: ${collegeB.avgPlacementRating || "N/A"}/5
- Infrastructure: ${collegeB.avgInfraRating || "N/A"}/5
- Hostel: ${collegeB.avgHostelRating || "N/A"}/5

Give exactly 4-5 short, specific bullet points comparing them for ${category.prompt}.
Each bullet MUST mention "${collegeA.name.split(" ")[0]}" or "${collegeB.name.split(" ")[0]}" by name.
Be direct, honest, and India-specific. No intro sentence.
Format: one point per line starting with -`;

      const res = await API.post("/chat", {
        messages: [{ role: "user", content: prompt }],
      });

      const parsed = parseVerdict(res.data.reply || "", collegeA.name, collegeB.name);
      setVerdicts(prev => ({ ...prev, [category.key]: { loading: false, lines: parsed, error: null } }));
    } catch {
      setVerdicts(prev => ({ ...prev, [category.key]: { loading: false, lines: null, error: "Failed to get AI verdict. Please try again." } }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      style={{ marginTop: 24, background: C.verdictBg, border: `1px solid ${C.verdictBorder}`, borderRadius: 20, overflow: "hidden", backdropFilter: "blur(12px)" }}
    >
      {/* Header */}
      <div style={{ padding: "20px 28px 18px", borderBottom: `1px solid ${C.verdictBorder}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#6c63ff,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 4px 14px rgba(108,99,255,0.35)", flexShrink: 0 }}>
          🤖
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.text }}>AI Verdict</h3>
          <p style={{ margin: 0, fontSize: 12, color: C.textMuted }}>
            {nameA} vs {nameB} — pick a category for Groq AI's honest take
          </p>
        </div>
      </div>

      {/* Category buttons */}
      <div style={{ padding: "18px 24px 16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {VERDICT_CATEGORIES.map(cat => {
            const isActive  = activeCategory === cat.key;
            const isLoading = verdicts[cat.key]?.loading;
            const isDone    = !!verdicts[cat.key]?.lines;
            return (
              <motion.button key={cat.key} onClick={() => fetchVerdict(cat)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "9px 16px", borderRadius: 12, fontSize: 13,
                  fontWeight: isActive ? 700 : 600, fontFamily: "inherit",
                  cursor: isLoading ? "wait" : "pointer", transition: "all 0.2s",
                  border: `1.5px solid ${isActive ? "rgba(108,99,255,0.6)" : isDone ? "rgba(108,99,255,0.25)" : C.verdictItemBorder}`,
                  background: isActive ? "linear-gradient(135deg,rgba(108,99,255,0.25),rgba(79,70,229,0.15))" : isDone ? "rgba(108,99,255,0.08)" : C.verdictItem,
                  color: isActive || isDone ? "#a78bfa" : C.textMuted,
                  boxShadow: isActive ? "0 4px 14px rgba(108,99,255,0.2)" : "none",
                }}
              >
                <span>{isLoading ? "⏳" : isDone ? "✅" : cat.icon}</span>
                {cat.label}
                {!isDone && !isLoading && (
                  <span style={{ fontSize: 10, padding: "1px 6px", background: "rgba(108,99,255,0.15)", color: "#a78bfa", borderRadius: 999, fontWeight: 700 }}>
                    Ask AI
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Verdict output */}
      <AnimatePresence mode="wait">
        {activeCategory && (
          <motion.div key={activeCategory}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ margin: "0 24px 24px", background: "linear-gradient(135deg,rgba(108,99,255,0.08),rgba(79,70,229,0.04))", border: "1px solid rgba(108,99,255,0.2)", borderRadius: 16, overflow: "hidden" }}>

              {/* Verdict sub-header */}
              <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(108,99,255,0.12)", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{VERDICT_CATEGORIES.find(c => c.key === activeCategory)?.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{VERDICT_CATEGORIES.find(c => c.key === activeCategory)?.label}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{nameA} vs {nameB}</div>
                </div>
              </div>

              {/* Loading spinner */}
              {verdicts[activeCategory]?.loading && (
                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                  <div style={{ width: 36, height: 36, border: "3px solid rgba(108,99,255,0.2)", borderTop: "3px solid #6c63ff", borderRadius: "50%", animation: "cfm-spin 0.8s linear infinite", margin: "0 auto 14px" }} />
                  <style>{`@keyframes cfm-spin { to { transform: rotate(360deg); } }`}</style>
                  <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>
                    Groq AI is analysing {nameA} vs {nameB}…
                  </p>
                </div>
              )}

              {/* Error state */}
              {verdicts[activeCategory]?.error && (
                <div style={{ padding: "20px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "#ef4444", margin: 0 }}>{verdicts[activeCategory].error}</p>
                  <button onClick={() => { setVerdicts(prev => ({ ...prev, [activeCategory]: undefined })); fetchVerdict(VERDICT_CATEGORIES.find(c => c.key === activeCategory)); }}
                    style={{ marginTop: 10, padding: "7px 18px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    Retry
                  </button>
                </div>
              )}

              {/* Verdict bullet lines */}
              {verdicts[activeCategory]?.lines && (
                <div style={{ padding: "16px 20px 20px" }}>
                  {/* Legend */}
                  <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                    {[{ name: collegeA.name, grad: "linear-gradient(135deg,#7c3aed,#4f46e5)" }, { name: collegeB.name, grad: "linear-gradient(135deg,#0ea5e9,#06b6d4)" }].map((col, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: col.grad }} />
                        <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>{col.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bullet points */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {verdicts[activeCategory].lines.map((line, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                        style={{
                          display: "flex", alignItems: "flex-start", gap: 12,
                          padding: "12px 16px", borderRadius: 12,
                          background: line.winner === "A" ? "rgba(124,58,237,0.08)" : line.winner === "B" ? "rgba(14,165,233,0.08)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${line.winner === "A" ? "rgba(124,58,237,0.2)" : line.winner === "B" ? "rgba(14,165,233,0.2)" : "rgba(255,255,255,0.06)"}`,
                        }}
                      >
                        {/* Color dot */}
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 5,
                          background: line.winner === "A" ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : line.winner === "B" ? "linear-gradient(135deg,#0ea5e9,#06b6d4)" : "#888",
                          boxShadow: line.winner === "A" ? "0 0 6px rgba(124,58,237,0.5)" : line.winner === "B" ? "0 0 6px rgba(14,165,233,0.5)" : "none",
                        }} />

                        <p style={{ margin: 0, fontSize: 13.5, color: C.text, lineHeight: 1.6, flex: 1 }}>
                          {line.text}
                        </p>

                        {/* Winner tag */}
                        {line.winner !== "neutral" && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, flexShrink: 0, padding: "2px 8px", borderRadius: 999, alignSelf: "flex-start", marginTop: 2,
                            background: line.winner === "A" ? "rgba(124,58,237,0.15)" : "rgba(14,165,233,0.15)",
                            color: line.winner === "A" ? "#a78bfa" : "#38bdf8",
                            border: `1px solid ${line.winner === "A" ? "rgba(124,58,237,0.3)" : "rgba(14,165,233,0.3)"}`,
                          }}>
                            {line.winner === "A" ? nameA : nameB}
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <p style={{ fontSize: 11, color: C.textFaint, textAlign: "center", margin: "16px 0 0" }}>
                    🤖 AI verdict based on available ratings data · Always verify with official sources
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ══ MAIN COMPONENT ════════════════════════════════════════════
export default function Compare() {
  const [colleges, setColleges] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search,   setSearch]   = useState("");
  const [theme,    setTheme]    = useState(getTheme);

  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(getTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    obs.observe(document.body,            { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    getColleges()
      .then(res => setColleges(res.data))
      .catch(err => console.error("Failed to load colleges:", err));
  }, []);

  const C = THEMES[theme];

  const toggleSelect = (college) => {
    if (selected.find(c => c._id === college._id)) {
      setSelected(prev => prev.filter(c => c._id !== college._id));
    } else if (selected.length < 2) {
      setSelected(prev => [...prev, college]);
    }
  };

  const isSelected  = (c) => !!selected.find(s => s._id === c._id);
  const selectedIdx = (c) => selected.findIndex(s => s._id === c._id);

  const getWinner = (metricKey) => {
    if (selected.length < 2) return null;
    const a = selected[0][metricKey] || 0;
    const b = selected[1][metricKey] || 0;
    if (a > b) return 0; if (b > a) return 1; return -1;
  };

  const aWins        = METRICS.filter(m => getWinner(m.key) === 0).length;
  const bWins        = METRICS.filter(m => getWinner(m.key) === 1).length;
  const overallWinner = aWins > bWins ? selected[0] : bWins > aWins ? selected[1] : null;
  const isAWinner    = aWins > bWins;
  const filtered     = colleges.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  const chipStyle = (college) => {
    const sel = isSelected(college); const idx = selectedIdx(college);
    const disabled = !sel && selected.length === 2;
    return { padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: sel ? 700 : 500, fontFamily: "inherit", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.35 : 1, background: sel ? (idx === 0 ? C.chipSelA : C.chipSelB) : C.chipBg, border: `1.5px solid ${sel ? (idx === 0 ? C.chipSelBorderA : C.chipSelBorderB) : C.chipBorder}`, color: sel ? (idx === 0 ? C.labelA : C.labelB) : C.textMuted, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" };
  };

  return (
    <div style={{ minHeight: "100vh", background: C.page, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: C.text, paddingBottom: 80, transition: "background 0.3s,color 0.3s" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 0" }}>

        {/* Header */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: C.textMuted, margin: "0 0 8px" }}>Side by side</p>
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, letterSpacing: "-1.5px", margin: "0 0 8px", color: C.text }}>Compare Colleges</h1>
          <p style={{ fontSize: 14, color: C.textMuted, margin: 0 }}>Select any 2 colleges to compare head-to-head — then ask AI for its verdict.</p>
        </motion.div>

        {/* Picker */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: 24, marginBottom: 28, backdropFilter: "blur(12px)" }}>
          <input type="text" placeholder="🔍  Search colleges…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "11px 16px", fontSize: 14, fontFamily: "inherit", background: C.chipBg, border: `1px solid ${C.chipBorder}`, borderRadius: 12, color: C.text, outline: "none", marginBottom: 18, boxSizing: "border-box" }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {filtered.map((college, i) => {
              const sel = isSelected(college); const idx = selectedIdx(college);
              return (
                <motion.button key={college._id} onClick={() => toggleSelect(college)} disabled={!sel && selected.length === 2}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.015 }}
                  whileHover={(!sel && selected.length < 2) || sel ? { scale: 1.04 } : {}} whileTap={{ scale: 0.97 }}
                  style={chipStyle(college)}>
                  {sel && <span style={{ width: 18, height: 18, borderRadius: "50%", background: idx === 0 ? C.avatarA : C.avatarB, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", flexShrink: 0, fontWeight: 700 }}>{idx === 0 ? "A" : "B"}</span>}
                  {college.name}
                  {sel && <span style={{ fontSize: 11, marginLeft: 2 }}>✕</span>}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Comparison / Empty */}
        <AnimatePresence mode="wait">
          {selected.length < 2 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: "64px 24px", textAlign: "center", backdropFilter: "blur(12px)" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>{selected.length === 0 ? "🎓" : "➕"}</div>
              <p style={{ fontSize: 16, fontWeight: 600, color: C.textMuted, margin: 0 }}>
                {selected.length === 0 ? "Select 2 colleges above to start comparing" : `"${selected[0].name}" selected — pick one more`}
              </p>
              {selected.length === 1 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 12, marginTop: 20, padding: "12px 24px", background: C.chipSelA, border: `1px solid ${C.chipSelBorderA}`, borderRadius: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.avatarA, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>A</div>
                  <span style={{ fontWeight: 700, color: C.labelA, fontSize: 15 }}>{selected[0].name}</span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="comparison" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>

              {/* College header cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 72px 1fr", alignItems: "stretch", marginBottom: 0 }}>
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                  style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRight: "none", borderRadius: "20px 0 0 0", padding: "28px 24px 22px", textAlign: "center", backdropFilter: "blur(12px)" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: C.avatarA, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 6px 20px rgba(124,58,237,0.35)" }}>🎓</div>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: C.labelA, margin: "0 0 4px" }}>{selected[0].name}</h2>
                  <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 14px" }}>📍 {selected[0].location || "—"}</p>
                  <div style={{ display: "inline-block", background: C.avatarA, borderRadius: 12, padding: "8px 20px", fontSize: 22, fontWeight: 900, color: "#fff", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>{(selected[0].overallRating || 0).toFixed(1)}</div>
                </motion.div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff", boxShadow: "0 6px 20px rgba(124,58,237,0.4)", zIndex: 2 }}>VS</motion.div>
                </div>
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                  style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderLeft: "none", borderRadius: "0 20px 0 0", padding: "28px 24px 22px", textAlign: "center", backdropFilter: "blur(12px)" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: C.avatarB, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 6px 20px rgba(14,165,233,0.35)" }}>🏛️</div>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: C.labelB, margin: "0 0 4px" }}>{selected[1].name}</h2>
                  <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 14px" }}>📍 {selected[1].location || "—"}</p>
                  <div style={{ display: "inline-block", background: C.avatarB, borderRadius: 12, padding: "8px 20px", fontSize: 22, fontWeight: 900, color: "#fff", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" }}>{(selected[1].overallRating || 0).toFixed(1)}</div>
                </motion.div>
              </div>

              {/* Metric rows */}
              <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderTop: "none", borderRadius: "0 0 20px 20px", backdropFilter: "blur(12px)", overflow: "hidden" }}>
                {METRICS.map((metric, i) => {
                  const aVal = selected[0][metric.key] || 0; const bVal = selected[1][metric.key] || 0;
                  const winner = getWinner(metric.key); const aPct = (aVal / metric.max) * 100; const bPct = (bVal / metric.max) * 100;
                  const diff = Math.abs(aVal - bVal).toFixed(1);
                  return (
                    <motion.div key={metric.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}
                      style={{ padding: "20px 28px", borderBottom: i < METRICS.length - 1 ? `1px solid ${C.cardBorder}` : "none" }}>
                      <div style={{ textAlign: "center", marginBottom: 14 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: C.textMuted }}>{metric.icon} {metric.label}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 64px 1fr", alignItems: "center", gap: 10 }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            {winner === 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", background: "rgba(34,197,94,0.12)", padding: "2px 8px", borderRadius: 999 }}>WIN</span>}
                            <span style={{ fontSize: 20, fontWeight: 800, color: C.labelA }}>{aVal.toFixed(1)}</span>
                          </div>
                          <div style={{ height: 10, background: C.barTrack, borderRadius: 999, overflow: "hidden" }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${aPct}%` }} transition={{ delay: 0.25 + i * 0.07, duration: 0.8, ease: "easeOut" }}
                              style={{ height: "100%", borderRadius: 999, float: "right", background: winner === 0 ? "linear-gradient(90deg,#7c3aed,#a78bfa)" : "rgba(124,58,237,0.3)" }} />
                          </div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: winner !== -1 ? (winner === 0 ? C.labelA : C.labelB) : C.textMuted }}>{winner !== -1 ? diff : "—"}</div>
                          <div style={{ fontSize: 10, color: C.textFaint }}>{winner === -1 ? "TIE" : "diff"}</div>
                        </div>
                        <div>
                          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 20, fontWeight: 800, color: C.labelB }}>{bVal.toFixed(1)}</span>
                            {winner === 1 && <span style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", background: "rgba(34,197,94,0.12)", padding: "2px 8px", borderRadius: 999 }}>WIN</span>}
                          </div>
                          <div style={{ height: 10, background: C.barTrack, borderRadius: 999, overflow: "hidden" }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${bPct}%` }} transition={{ delay: 0.25 + i * 0.07, duration: 0.8, ease: "easeOut" }}
                              style={{ height: "100%", borderRadius: 999, background: winner === 1 ? "linear-gradient(90deg,#0ea5e9,#38bdf8)" : "rgba(14,165,233,0.3)" }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* ══ AI VERDICT PANEL (new) ══ */}
              <AIVerdictPanel collegeA={selected[0]} collegeB={selected[1]} C={C} />

              {/* Winner banner */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                style={{ marginTop: 24, background: isAWinner ? "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(124,58,237,0.04))" : !overallWinner ? C.cardBg : "linear-gradient(135deg,rgba(14,165,233,0.12),rgba(14,165,233,0.04))", border: `1px solid ${isAWinner ? "rgba(124,58,237,0.3)" : !overallWinner ? C.cardBorder : "rgba(14,165,233,0.3)"}`, borderRadius: 20, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, backdropFilter: "blur(12px)" }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: C.textMuted, margin: "0 0 6px" }}>Overall Result</p>
                  <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: overallWinner ? (isAWinner ? C.labelA : C.labelB) : C.text }}>
                    {overallWinner ? `🏆 ${overallWinner.name} leads` : "🤝 It's a tie!"}
                  </h3>
                  {overallWinner && <p style={{ fontSize: 13, color: C.textMuted, margin: "4px 0 0" }}>Wins {isAWinner ? aWins : bWins} of {METRICS.length} categories</p>}
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius: 14, padding: "12px 22px", textAlign: "center", boxShadow: "0 4px 16px rgba(124,58,237,0.3)", minWidth: 72 }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{aWins}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "1px", marginTop: 4 }}>{selected[0].name.split(" ")[0]}</div>
                  </div>
                  <div style={{ background: "linear-gradient(135deg,#0ea5e9,#06b6d4)", borderRadius: 14, padding: "12px 22px", textAlign: "center", boxShadow: "0 4px 16px rgba(14,165,233,0.3)", minWidth: 72 }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{bWins}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "1px", marginTop: 4 }}>{selected[1].name.split(" ")[0]}</div>
                  </div>
                </div>
              </motion.div>

              {/* Reset */}
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <motion.button onClick={() => setSelected([])} whileHover={{ borderColor: "#7c3aed", color: "#a78bfa" }} whileTap={{ scale: 0.97 }}
                  style={{ background: "transparent", border: `1.5px solid ${C.chipBorder}`, borderRadius: 12, padding: "10px 28px", fontSize: 13, fontWeight: 600, fontFamily: "inherit", color: C.textMuted, cursor: "pointer", transition: "all 0.2s" }}>
                  ↺ Reset comparison
                </motion.button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
