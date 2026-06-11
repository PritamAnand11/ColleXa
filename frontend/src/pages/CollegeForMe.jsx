// ============================================================
// CollegeForMe.jsx
// Place at: frontend/src/pages/CollegeForMe.jsx
// Route:    /college-for-me   (add in App.jsx)
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

// ── Theme helper (same pattern used across ColleXa) ──────────
const getTheme = () =>
  document.documentElement.getAttribute("data-theme") === "dark" ||
  document.body.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";

// ── Quiz Steps Definition ─────────────────────────────────────
const STEPS = [
  {
    id: "interests",
    question: "What excites you the most?",
    subtitle: "Pick all areas that genuinely interest you.",
    type: "multi",
    options: [
      { value: "tech",      label: "💻 Technology & Coding" },
      { value: "finance",   label: "📊 Finance & Business" },
      { value: "creative",  label: "🎨 Creative Arts & Design" },
      { value: "healthcare",label: "🏥 Healthcare & Medicine" },
      { value: "science",   label: "🔬 Pure Science & Research" },
      { value: "law",       label: "⚖️ Law & Policy" },
      { value: "education", label: "📚 Teaching & Education" },
      { value: "social",    label: "🌍 Social Impact & NGO" },
    ],
  },
  {
    id: "strengths",
    question: "Which subjects are you strongest in?",
    subtitle: "Select up to 3 subjects where you truly excel.",
    type: "multi",
    max: 3,
    options: [
      { value: "math",      label: "📐 Mathematics" },
      { value: "physics",   label: "⚛️ Physics" },
      { value: "chemistry", label: "🧪 Chemistry" },
      { value: "biology",   label: "🧬 Biology" },
      { value: "cs",        label: "🖥️ Computer Science" },
      { value: "economics", label: "📈 Economics" },
      { value: "english",   label: "✍️ English & Literature" },
      { value: "history",   label: "🏛️ History & Social Science" },
    ],
  },
  {
    id: "environment",
    question: "What kind of work environment suits you?",
    subtitle: "Pick one that best describes where you see yourself.",
    type: "single",
    options: [
      { value: "product",    label: "🛠️ Building products / startups" },
      { value: "management", label: "👔 Management & leadership roles" },
      { value: "research",   label: "🔭 Research & academia" },
      { value: "fieldwork",  label: "🌱 Fieldwork & hands-on work" },
      { value: "creative_work", label: "🎭 Creative studio / media" },
      { value: "corporate",  label: "🏢 Corporate / MNC environment" },
    ],
  },
  {
    id: "exam",
    question: "Which entrance exam are you preparing for?",
    subtitle: "This helps us filter colleges you're actually eligible for.",
    type: "single",
    options: [
      { value: "jee",    label: "📝 JEE (Engineering)" },
      { value: "neet",   label: "🩺 NEET (Medical)" },
      { value: "cat",    label: "💼 CAT / MAT (Management)" },
      { value: "clat",   label: "⚖️ CLAT (Law)" },
      { value: "nid",    label: "🎨 NID / NIFT (Design)" },
      { value: "cuet",   label: "🎓 CUET (General UG)" },
      { value: "other",  label: "📋 Other / Not decided yet" },
    ],
  },
  {
    id: "priority",
    question: "What matters most to you in a college?",
    subtitle: "Pick your top priority.",
    type: "single",
    options: [
      { value: "placement",   label: "💰 Highest placement packages" },
      { value: "research_opp",label: "🔬 Research & innovation opportunities" },
      { value: "campus",      label: "🏫 Campus life & infrastructure" },
      { value: "fee",         label: "💵 Affordable fees" },
      { value: "location",    label: "📍 Location (metro city)" },
      { value: "brand",       label: "🏆 Brand name & prestige" },
    ],
  },
];

export default function CollegeForMe() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(getTheme());
  const [step, setStep] = useState(0);           // -1 = landing, 0..4 = quiz, 5 = loading, 6 = results
  const [phase, setPhase] = useState("landing"); // landing | quiz | loading | results
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const resultRef = useRef(null);

  // Theme observer
  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(getTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  // Scroll to results
  useEffect(() => {
    if (phase === "results" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [phase]);

  const d = theme === "dark";

  // ── Styles ────────────────────────────────────────────────────
  const S = {
    page: {
      minHeight: "100vh",
      background: d ? "#0F0E1A" : "#F5F3FF",
      color: d ? "#E8E6FF" : "#1E1B4B",
      fontFamily: "'DM Sans', Arial, sans-serif",
      paddingBottom: 80,
    },
    hero: {
      background: d
        ? "linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #4C1D95 100%)"
        : "linear-gradient(135deg, #4F46E5 0%, #7C3AED 60%, #6D28D9 100%)",
      padding: "72px 24px 80px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    },
    heroBadge: {
      display: "inline-block",
      background: "rgba(255,255,255,0.15)",
      border: "1px solid rgba(255,255,255,0.3)",
      borderRadius: 20,
      padding: "6px 18px",
      fontSize: 13,
      color: "#E0DDFF",
      marginBottom: 20,
      backdropFilter: "blur(8px)",
    },
    heroTitle: {
      fontSize: "clamp(28px, 5vw, 48px)",
      fontWeight: 800,
      color: "#fff",
      margin: "0 0 16px",
      lineHeight: 1.15,
    },
    heroSub: {
      fontSize: 16,
      color: "rgba(255,255,255,0.8)",
      maxWidth: 560,
      margin: "0 auto 36px",
      lineHeight: 1.7,
    },
    startBtn: {
      background: "#fff",
      color: "#4F46E5",
      border: "none",
      borderRadius: 12,
      padding: "14px 40px",
      fontSize: 16,
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      transition: "transform 0.2s, box-shadow 0.2s",
    },
    container: {
      maxWidth: 760,
      margin: "0 auto",
      padding: "40px 20px",
    },
    card: {
      background: d ? "#1A1830" : "#fff",
      borderRadius: 20,
      padding: "40px 36px",
      boxShadow: d
        ? "0 8px 40px rgba(0,0,0,0.4)"
        : "0 8px 40px rgba(79,70,229,0.10)",
      border: `1px solid ${d ? "#2D2B50" : "#EDE9FE"}`,
    },
    progressBar: {
      height: 6,
      background: d ? "#2D2B50" : "#EDE9FE",
      borderRadius: 99,
      marginBottom: 32,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      background: "linear-gradient(90deg, #4F46E5, #7C3AED)",
      borderRadius: 99,
      transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    stepLabel: {
      fontSize: 12,
      fontWeight: 700,
      color: "#7C3AED",
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    question: {
      fontSize: "clamp(18px, 3vw, 24px)",
      fontWeight: 800,
      color: d ? "#E8E6FF" : "#1E1B4B",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: d ? "#9694C0" : "#6B7280",
      marginBottom: 28,
    },
    optionsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: 12,
      marginBottom: 32,
    },
    option: (selected) => ({
      padding: "14px 16px",
      borderRadius: 12,
      border: `2px solid ${selected ? "#4F46E5" : d ? "#2D2B50" : "#E5E7EB"}`,
      background: selected
        ? d ? "#2D2B6B" : "#EEF2FF"
        : d ? "#12102A" : "#FAFAFA",
      color: selected ? (d ? "#A5B4FC" : "#4F46E5") : d ? "#9694C0" : "#374151",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: selected ? 700 : 400,
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      gap: 8,
    }),
    navRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    backBtn: {
      background: "transparent",
      border: `1px solid ${d ? "#2D2B50" : "#E5E7EB"}`,
      borderRadius: 10,
      padding: "11px 24px",
      fontSize: 14,
      color: d ? "#9694C0" : "#6B7280",
      cursor: "pointer",
    },
    nextBtn: (disabled) => ({
      background: disabled
        ? d ? "#2D2B50" : "#E5E7EB"
        : "linear-gradient(135deg, #4F46E5, #7C3AED)",
      color: disabled ? (d ? "#5D5B80" : "#9CA3AF") : "#fff",
      border: "none",
      borderRadius: 10,
      padding: "12px 32px",
      fontSize: 15,
      fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.2s",
      flex: 1,
      maxWidth: 220,
    }),
    // Loading
    loadingWrap: {
      textAlign: "center",
      padding: "60px 20px",
    },
    spinner: {
      width: 56,
      height: 56,
      border: `4px solid ${d ? "#2D2B50" : "#EDE9FE"}`,
      borderTop: "4px solid #7C3AED",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto 24px",
    },
    // Results
    resultSection: {
      marginTop: 8,
    },
    resultHeader: {
      textAlign: "center",
      marginBottom: 36,
    },
    successBadge: {
      display: "inline-block",
      background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
      color: "#fff",
      borderRadius: 20,
      padding: "6px 20px",
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 800,
      color: d ? "#E8E6FF" : "#1E1B4B",
      marginBottom: 6,
    },
    sectionSub: {
      fontSize: 14,
      color: d ? "#9694C0" : "#6B7280",
      marginBottom: 20,
    },
    roadmapBox: {
      background: d
        ? "linear-gradient(135deg, #1E1B4B, #2D2B6B)"
        : "linear-gradient(135deg, #EEF2FF, #F5F3FF)",
      border: `1px solid ${d ? "#4F46E5" : "#C7D2FE"}`,
      borderRadius: 16,
      padding: "28px 28px",
      marginBottom: 28,
    },
    roadmapTitle: {
      fontSize: 13,
      fontWeight: 700,
      color: "#7C3AED",
      letterSpacing: 1.2,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    roadmapText: {
      fontSize: 15,
      lineHeight: 1.8,
      color: d ? "#C4C2F0" : "#374151",
    },
    collegeCard: {
      background: d ? "#1A1830" : "#fff",
      border: `1px solid ${d ? "#2D2B50" : "#E5E7EB"}`,
      borderRadius: 16,
      padding: "24px 24px",
      marginBottom: 16,
      position: "relative",
      overflow: "hidden",
    },
    rankBadge: (i) => ({
      position: "absolute",
      top: 0,
      left: 0,
      background: ["#4F46E5", "#7C3AED", "#6D28D9", "#4338CA", "#5B21B6"][i] || "#4F46E5",
      color: "#fff",
      padding: "4px 14px",
      fontSize: 12,
      fontWeight: 700,
      borderBottomRightRadius: 10,
    }),
    collegeName: {
      fontSize: 18,
      fontWeight: 800,
      color: d ? "#E8E6FF" : "#1E1B4B",
      marginBottom: 4,
      marginTop: 24,
    },
    collegeMeta: {
      fontSize: 13,
      color: "#7C3AED",
      fontWeight: 600,
      marginBottom: 12,
    },
    whyBox: {
      background: d ? "#12102A" : "#F5F3FF",
      borderRadius: 10,
      padding: "12px 16px",
      fontSize: 14,
      color: d ? "#A5A3D0" : "#374151",
      lineHeight: 1.7,
      borderLeft: "3px solid #7C3AED",
    },
    tagsRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },
    tag: (color) => ({
      background: d ? `${color}22` : `${color}18`,
      color: color,
      border: `1px solid ${color}44`,
      borderRadius: 20,
      padding: "3px 12px",
      fontSize: 12,
      fontWeight: 600,
    }),
    restartBtn: {
      display: "block",
      margin: "36px auto 0",
      background: "transparent",
      border: "2px solid #4F46E5",
      color: "#4F46E5",
      borderRadius: 12,
      padding: "12px 32px",
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
    },
    errorBox: {
      background: d ? "#2D1B1B" : "#FEF2F2",
      border: "1px solid #EF4444",
      borderRadius: 12,
      padding: "16px 20px",
      color: "#EF4444",
      fontSize: 14,
      textAlign: "center",
      marginBottom: 20,
    },
  };

  // ── Handlers ──────────────────────────────────────────────────
  const currentStep = STEPS[step];
  const currentAnswer = answers[currentStep?.id] || (currentStep?.type === "multi" ? [] : "");

  const toggleOption = (value) => {
    const id = currentStep.id;
    if (currentStep.type === "single") {
      setAnswers((prev) => ({ ...prev, [id]: value }));
    } else {
      setAnswers((prev) => {
        const arr = prev[id] || [];
        const max = currentStep.max || 99;
        if (arr.includes(value)) return { ...prev, [id]: arr.filter((v) => v !== value) };
        if (arr.length >= max) return prev;
        return { ...prev, [id]: [...arr, value] };
      });
    }
  };

  const isAnswered = () => {
    if (!currentStep) return false;
    const a = answers[currentStep.id];
    if (currentStep.type === "single") return !!a;
    return Array.isArray(a) && a.length > 0;
  };

  const handleNext = async () => {
    if (!isAnswered()) return;
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      // Submit
      setPhase("loading");
      setError("");
      try {
        const res = await API.post("/college-for-me", { answers });
        setResult(res.data);
        setPhase("results");
      } catch (err) {
        setError("Something went wrong. Please try again.");
        setPhase("quiz");
      }
    }
  };

  const handleBack = () => {
    if (step === 0) setPhase("landing");
    else setStep((s) => s - 1);
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setResult(null);
    setPhase("landing");
    setError("");
  };

  // ── Render: Landing ───────────────────────────────────────────
  if (phase === "landing") {
    return (
      <div style={S.page}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes floatUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
          .cfm-start:hover { transform: translateY(-2px) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.25) !important; }
          .cfm-blob { position:absolute; border-radius:50%; filter:blur(60px); pointer-events:none; }
        `}</style>

        {/* Hero */}
        <div style={S.hero}>
          <div className="cfm-blob" style={{ width: 300, height: 300, background: "rgba(124,58,237,0.3)", top: -80, right: -60 }} />
          <div className="cfm-blob" style={{ width: 200, height: 200, background: "rgba(79,70,229,0.3)", bottom: -40, left: -40 }} />

          <div style={{ position: "relative", zIndex: 1, animation: "floatUp 0.6s ease" }}>
            <div style={S.heroBadge}>✨ New Feature — Powered by Groq AI</div>
            <h1 style={S.heroTitle}>College For Me</h1>
            <p style={S.heroSub}>
              Find your perfect match. Take our quiz to move beyond reviews and discover the institutions that truly align with your strengths, interests, and future career scope.
            </p>
            <button
              className="cfm-start"
              style={S.startBtn}
              onClick={() => { setPhase("quiz"); setStep(0); }}
            >
              Start My Discovery →
            </button>
          </div>
        </div>

        {/* How it works */}
        <div style={S.container}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: d ? "#E8E6FF" : "#1E1B4B", margin: 0 }}>
              How it works
            </h2>
            <p style={{ fontSize: 14, color: d ? "#9694C0" : "#6B7280", marginTop: 8 }}>
              5 quick questions. AI-powered matches.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
            {[
              { n: "01", icon: "🎯", title: "Share Your Interests", desc: "Tell us what excites you — tech, medicine, arts, finance, or more." },
              { n: "02", icon: "📚", title: "Your Academic Strengths", desc: "Pick the subjects where you naturally excel." },
              { n: "03", icon: "🏢", title: "Work Environment", desc: "Tell us if you're a builder, researcher, leader, or creative." },
              { n: "04", icon: "🤖", title: "AI Matches You", desc: "Groq AI analyses your profile and maps it to the best-fit colleges." },
            ].map((step) => (
              <div key={step.n} style={{ ...S.card, textAlign: "center", padding: "28px 20px" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{step.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", letterSpacing: 1.5, marginBottom: 6 }}>STEP {step.n}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: d ? "#E8E6FF" : "#1E1B4B", marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: d ? "#9694C0" : "#6B7280", lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Loading ───────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div style={S.page}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={S.container}>
          <div style={S.card}>
            <div style={S.loadingWrap}>
              <div style={S.spinner} />
              <h2 style={{ fontSize: 22, fontWeight: 800, color: d ? "#E8E6FF" : "#1E1B4B", marginBottom: 10 }}>
                Analysing your profile...
              </h2>
              <p style={{ fontSize: 14, color: d ? "#9694C0" : "#6B7280" }}>
                Groq AI is mapping your strengths, interests, and career goals to the best-fit colleges in India. This takes just a moment.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Results ───────────────────────────────────────────
  if (phase === "results" && result) {
    return (
      <div style={S.page} ref={resultRef}>
        <div style={{ ...S.hero, padding: "48px 24px 56px" }}>
          <div style={S.heroBadge}>✅ Your results are ready</div>
          <h1 style={{ ...S.heroTitle, fontSize: "clamp(22px, 4vw, 36px)" }}>
            Here's Your Personalised College Match
          </h1>
        </div>

        <div style={S.container}>
          {/* Career Roadmap */}
          <div style={S.roadmapBox}>
            <div style={S.roadmapTitle}>🗺️ Your Career Roadmap</div>
            <div style={S.roadmapText}>{result.careerRoadmap}</div>
          </div>

          {/* College List */}
          <div style={S.sectionTitle}>🎓 Your Curated College List</div>
          <div style={{ ...S.sectionSub, marginBottom: 24 }}>
            Based on your profile, here are the institutions that align most with your goals.
          </div>

          {result.colleges?.map((college, i) => (
            <div key={i} style={S.collegeCard}>
              <div style={S.rankBadge(i)}>#{i + 1} Match</div>
              <div style={S.collegeName}>{college.name}</div>
              <div style={S.collegeMeta}>{college.location} · {college.type}</div>
              <div style={S.whyBox}>
                <strong>Why this fits you:</strong> {college.whyItFits}
              </div>
              <div style={S.tagsRow}>
                {college.tags?.map((tag, ti) => (
                  <span key={ti} style={S.tag(["#4F46E5", "#7C3AED", "#059669", "#D97706"][ti % 4])}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Future Scope */}
          {result.futureScope && (
            <div style={{ ...S.roadmapBox, marginTop: 8 }}>
              <div style={S.roadmapTitle}>📈 Future Scope & Industry Trends</div>
              <div style={S.roadmapText}>{result.futureScope}</div>
            </div>
          )}

          <button style={S.restartBtn} onClick={restart}>
            ↩ Retake the Quiz
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Quiz ──────────────────────────────────────────────
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={S.container}>
        <div style={S.card}>
          {/* Progress */}
          <div style={S.progressBar}>
            <div style={{ ...S.progressFill, width: `${progress}%` }} />
          </div>
          <div style={S.stepLabel}>
            Question {step + 1} of {STEPS.length}
          </div>

          {/* Question */}
          <h2 style={S.question}>{currentStep.question}</h2>
          <p style={S.subtitle}>
            {currentStep.subtitle}
            {currentStep.max && ` (max ${currentStep.max})`}
          </p>

          {/* Options */}
          <div style={S.optionsGrid}>
            {currentStep.options.map((opt) => {
              const selected =
                currentStep.type === "single"
                  ? currentAnswer === opt.value
                  : Array.isArray(currentAnswer) && currentAnswer.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  style={S.option(selected)}
                  onClick={() => toggleOption(opt.value)}
                >
                  {selected && <span style={{ color: "#4F46E5" }}>✓</span>}
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && <div style={S.errorBox}>{error}</div>}

          {/* Navigation */}
          <div style={S.navRow}>
            <button style={S.backBtn} onClick={handleBack}>
              ← Back
            </button>
            <button
              style={S.nextBtn(!isAnswered())}
              disabled={!isAnswered()}
              onClick={handleNext}
            >
              {step === STEPS.length - 1 ? "Find My Colleges ✨" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
