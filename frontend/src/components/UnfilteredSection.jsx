// ============================================================
// frontend/src/components/UnfilteredSection.jsx  — NEW
// Add inside CollegeDetail.jsx:
//   import UnfilteredSection from "../components/UnfilteredSection";
//   <UnfilteredSection collegeId={college._id} />
// ============================================================
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import UnfilteredReviewCard from "./UnfilteredReviewCard";

const getTheme = () =>
  document.documentElement.getAttribute("data-theme") === "dark" ||
  document.body.getAttribute("data-theme") === "dark" ? "dark" : "light";

// ── Stat pill ────────────────────────────────────────────────
function StatPill({ icon, label, value, color }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "14px 20px", borderRadius: 14, minWidth: 90,
      background: `${color}18`, border: `1.5px solid ${color}44`,
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1.2, marginTop: 4 }}>{value}</span>
      <span style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2, textAlign: "center" }}>{label}</span>
    </div>
  );
}

export default function UnfilteredSection({ collegeId }) {
  const navigate = useNavigate();
  const [theme,    setTheme]    = useState(getTheme());
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(false);

  const d = theme === "dark";

  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(getTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    obs.observe(document.body,            { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!collegeId) return;
    setLoading(true);
    API.get(`/reviews/${collegeId}/unfiltered`)
      .then(r => setReviews(r.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [collegeId]);

  // ── Derived stats ─────────────────────────────────────────
  const count    = reviews.length;
  const avgRating = count
    ? (reviews.reduce((s, r) => s + (r.overallRating || 0), 0) / count).toFixed(1)
    : "—";
  const studentCount = reviews.filter(r => r.studentType === "student").length;
  const alumniCount  = reviews.filter(r => r.studentType === "alumni").length;
  const emailVerified = reviews.filter(r => r.verificationMethod === "college_email").length;

  const displayedReviews = expanded ? reviews : reviews.slice(0, 3);

  // ── Styles ────────────────────────────────────────────────
  const S = {
    wrap: {
      marginTop: 36,
      borderRadius: 22,
      overflow: "hidden",
      border: `2px solid ${d ? "#2D2B50" : "#E0E7FF"}`,
      fontFamily: "Arial, sans-serif",
    },
    header: {
      background: d
        ? "linear-gradient(135deg, #0D0B2E 0%, #1E1B4B 50%, #2D2B6B 100%)"
        : "linear-gradient(135deg, #1E1B4B 0%, #3730A3 60%, #4F46E5 100%)",
      padding: "28px 32px",
    },
    topRow: {
      display: "flex", alignItems: "center",
      justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 20,
    },
    badge: {
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: 999, padding: "5px 14px",
      fontSize: 12, fontWeight: 700, color: "#fff",
    },
    writeBtn: {
      padding: "11px 22px",
      background: "linear-gradient(135deg, #EF4444, #DC2626)",
      color: "#fff", border: "none", borderRadius: 12,
      fontSize: 13, fontWeight: 700, cursor: "pointer",
      boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
      fontFamily: "Arial",
    },
    title: {
      fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 6px",
      display: "flex", alignItems: "center", gap: 10,
    },
    subtitle: {
      fontSize: 13, color: "rgba(255,255,255,0.65)", margin: 0,
    },
    statsRow: {
      display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20,
    },
    body: {
      padding: "28px 28px",
      background: d ? "#0F0E1A" : "#F5F3FF",
    },
    emptyBox: {
      textAlign: "center", padding: "48px 24px",
    },
    shimmer: {
      height: 120, borderRadius: 16,
      background: d ? "#1A1830" : "#E8E5FF",
      marginBottom: 14, animation: "ufShimmer 1.5s infinite ease",
    },
    seeMoreBtn: {
      width: "100%", padding: "12px",
      background: "transparent",
      border: `1.5px solid ${d ? "#2D2B50" : "#C7D2FE"}`,
      borderRadius: 12, fontSize: 14, fontWeight: 700,
      color: d ? "#A5B4FC" : "#4F46E5", cursor: "pointer",
      marginTop: 8, fontFamily: "Arial",
    },
    trustNote: {
      background: d ? "#0D1035" : "#EEF2FF",
      border: `1px solid ${d ? "#2D2B50" : "#C7D2FE"}`,
      borderRadius: 12, padding: "14px 18px", marginBottom: 22,
      display: "flex", alignItems: "center", gap: 12,
    },
  };

  return (
    <div style={S.wrap}>
      <style>{`
        @keyframes ufShimmer {
          0%   { opacity: 1; }
          50%  { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={S.header}>
        <div style={S.topRow}>
          <div>
            <h2 style={S.title}>
              🔥 Unfiltered Mode
              <span style={{ ...S.badge, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", fontSize: 10 }}>
                EXCLUSIVE
              </span>
            </h2>
            <p style={S.subtitle}>
              Only verified current students & alumni — raw, honest, unfiltered truth
            </p>
          </div>
          <button style={S.writeBtn} onClick={() => navigate(`/college/${collegeId}/review`)}>
            🔥 Write Unfiltered Review
          </button>
        </div>

        {/* Stats row */}
        <div style={S.statsRow}>
          <StatPill icon="📝" label="Verified Reviews" value={count}         color="#A78BFA" />
          <StatPill icon="⭐" label="Avg Rating"       value={avgRating}     color="#F59E0B" />
          <StatPill icon="🎓" label="Students"         value={studentCount}  color="#60A5FA" />
          <StatPill icon="🏆" label="Alumni"           value={alumniCount}   color="#34D399" />
          <StatPill icon="📧" label="Email Verified"   value={emailVerified} color="#F472B6" />
        </div>
      </div>

      {/* ── Body ── */}
      <div style={S.body}>

        {/* Trust note */}
        {count > 0 && (
          <div style={S.trustNote}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>🛡️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: d ? "#E8E6FF" : "#1E1B4B" }}>
                Why trust these reviews?
              </div>
              <div style={{ fontSize: 12, color: d ? "#9694C0" : "#6B7280", marginTop: 2 }}>
                Every review here is posted by a <strong>verified student or alumni</strong> of this college —
                verified via official college email or admin-approved ID card. No fake reviews, no anonymous trolls.
              </div>
            </div>
          </div>
        )}

        {/* Loading shimmer */}
        {loading && (
          <>
            <div style={S.shimmer} />
            <div style={{ ...S.shimmer, opacity: 0.7 }} />
            <div style={{ ...S.shimmer, opacity: 0.5 }} />
          </>
        )}

        {/* Empty state */}
        {!loading && count === 0 && (
          <div style={S.emptyBox}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🔒</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: d ? "#E8E6FF" : "#1E1B4B", margin: "0 0 8px" }}>
              No Unfiltered Reviews Yet
            </h3>
            <p style={{ fontSize: 13, color: d ? "#9694C0" : "#6B7280", maxWidth: 340, margin: "0 auto 20px", lineHeight: 1.7 }}>
              Be the first verified student or alumni to post an unfiltered review for this college. Your honest experience matters.
            </p>
            <button
              style={{ padding: "12px 32px", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              onClick={() => navigate(`/college/${collegeId}/review`)}
            >
              🔥 Be the First — Write Unfiltered Review
            </button>
          </div>
        )}

        {/* Reviews */}
        {!loading && count > 0 && (
          <>
            {displayedReviews.map((r, i) => (
              <UnfilteredReviewCard key={r._id || i} review={r} />
            ))}

            {count > 3 && (
              <button style={S.seeMoreBtn} onClick={() => setExpanded(!expanded)}>
                {expanded
                  ? `↑ Show Less`
                  : `↓ See All ${count} Unfiltered Reviews`}
              </button>
            )}
          </>
        )}

        {/* Bottom disclaimer */}
        <div style={{ marginTop: 20, fontSize: 11, color: d ? "#6B7280" : "#9CA3AF", textAlign: "center" }}>
          🔥 Unfiltered Mode is ColleXa's verified-only review section — powered by email domain verification & admin-approved ID checks.
        </div>
      </div>
    </div>
  );
}
