import React, { useState } from "react";

const getTheme = () =>
  document.documentElement.getAttribute("data-theme") === "dark" ||
  document.body.getAttribute("data-theme") === "dark" ? "dark" : "light";

// Star rating display
function Stars({ rating, size = 14 }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#F59E0B" : "#D1D5DB", fontSize: size }}>★</span>
      ))}
    </span>
  );
}

// Verification badge
function VerifiedBadge({ studentType, verificationMethod, department, graduationYear }) {
  const isAlumni  = studentType === "alumni";
  const isEmail   = verificationMethod === "college_email";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: isAlumni ? "linear-gradient(135deg,#7C3AED,#4F46E5)" : "linear-gradient(135deg,#059669,#0891B2)",
        color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999,
        boxShadow: isAlumni ? "0 2px 8px rgba(124,58,237,0.4)" : "0 2px 8px rgba(5,150,105,0.4)",
      }}>
        ✅ {isAlumni ? "Verified Alumni" : "Verified Student"}
      </span>
      {isEmail && (
        <span style={{ fontSize: 10, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "3px 8px", borderRadius: 999, border: "1px solid rgba(16,185,129,0.3)" }}>
          📧 Email Verified
        </span>
      )}
      {!isEmail && (
        <span style={{ fontSize: 10, color: "#3B82F6", background: "rgba(59,130,246,0.1)", padding: "3px 8px", borderRadius: 999, border: "1px solid rgba(59,130,246,0.3)" }}>
          🪪 ID Verified
        </span>
      )}
      {(department || graduationYear) && (
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>
          {[department, graduationYear].filter(Boolean).join(" · ")}
        </span>
      )}
    </div>
  );
}

export default function UnfilteredReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const d = document.documentElement.getAttribute("data-theme") === "dark" ||
            document.body.getAttribute("data-theme") === "dark";

  const authorName = review.isAnonymous
    ? `Anonymous ${review.studentType === "alumni" ? "Alumni" : "Student"}`
    : (review.userId?.name || "Student");

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days  = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30)  return `${days}d ago`;
    if (days < 365) return `${Math.floor(days/30)}mo ago`;
    return `${Math.floor(days/365)}y ago`;
  };

  const text = review.review || "";
  const isLong = text.length > 220;
  const displayText = isLong && !expanded ? text.slice(0, 220) + "…" : text;

  return (
    <div style={{
      background: d ? "#0D1035" : "#FAFBFF",
      border: "1.5px solid",
      borderColor: d ? "#2D2B50" : "#E0E7FF",
      borderRadius: 18,
      padding: "22px 24px",
      marginBottom: 16,
      fontFamily: "Arial, sans-serif",
      position: "relative",
      boxShadow: d
        ? "0 4px 20px rgba(79,70,229,0.08)"
        : "0 4px 20px rgba(79,70,229,0.06)",
    }}>
      {/* Gradient top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "18px 18px 0 0",
        background: "linear-gradient(90deg, #4F46E5, #7C3AED, #0891B2)",
      }} />

      {/* Top row: author + rating + date */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: review.studentType === "alumni"
                ? "linear-gradient(135deg,#7C3AED,#4F46E5)"
                : "linear-gradient(135deg,#059669,#0891B2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0,
            }}>
              {review.isAnonymous ? "?" : (authorName[0] || "S").toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: d ? "#E8E6FF" : "#1E1B4B" }}>
                {authorName}
              </div>
              <div style={{ fontSize: 11, color: d ? "#9694C0" : "#9CA3AF" }}>
                {timeAgo(review.createdAt)}
              </div>
            </div>
          </div>
          <VerifiedBadge
            studentType={review.studentType}
            verificationMethod={review.verificationMethod}
            department={review.department}
            graduationYear={review.graduationYear}
          />
        </div>
        <div style={{ textAlign: "right" }}>
          <Stars rating={review.overallRating} size={16} />
          <div style={{ fontSize: 20, fontWeight: 900, color: "#F59E0B", lineHeight: 1.2 }}>
            {review.overallRating?.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Review text */}
      <p style={{ fontSize: 14, lineHeight: 1.75, color: d ? "#D4D2F0" : "#374151", margin: "14px 0", fontStyle: "italic" }}>
        "{displayText}"
      </p>
      {isLong && (
        <button onClick={() => setExpanded(!expanded)}
          style={{ background: "none", border: "none", color: "#4F46E5", fontSize: 12, cursor: "pointer", fontWeight: 700, padding: 0, marginBottom: 10 }}>
          {expanded ? "Show less ↑" : "Read more ↓"}
        </button>
      )}

      {/* Pros / Cons */}
      {(review.pros || review.cons) && (
        <div style={{ display: "grid", gridTemplateColumns: review.pros && review.cons ? "1fr 1fr" : "1fr", gap: 10, marginTop: 12 }}>
          {review.pros && (
            <div style={{ background: d ? "#0F2A1E" : "#ECFDF5", borderRadius: 10, padding: "10px 14px", border: `1px solid ${d ? "#1A4A30" : "#A7F3D0"}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#10B981", marginBottom: 4 }}>✅ PROS</div>
              <div style={{ fontSize: 12, color: d ? "#D1FAE5" : "#065F46", lineHeight: 1.6 }}>{review.pros}</div>
            </div>
          )}
          {review.cons && (
            <div style={{ background: d ? "#2A1010" : "#FEF2F2", borderRadius: 10, padding: "10px 14px", border: `1px solid ${d ? "#4A1A1A" : "#FECACA"}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#EF4444", marginBottom: 4 }}>⚠️ CONS</div>
              <div style={{ fontSize: 12, color: d ? "#FEE2E2" : "#991B1B", lineHeight: 1.6 }}>{review.cons}</div>
            </div>
          )}
        </div>
      )}

      {/* Sub-ratings */}
      {(review.facultyRating || review.placementRating || review.infraRating || review.hostelRating) && (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14, paddingTop: 12, borderTop: `1px solid ${d ? "#2D2B50" : "#EEE"}` }}>
          {[
            { label: "Faculty",    val: review.facultyRating,   color: "#4F46E5" },
            { label: "Placement",  val: review.placementRating, color: "#059669" },
            { label: "Infra",      val: review.infraRating,     color: "#0891B2" },
            { label: "Hostel",     val: review.hostelRating,    color: "#D97706" },
          ].filter(r => r.val > 0).map(r => (
            <div key={r.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: r.color }}>{r.val.toFixed(1)}</div>
              <div style={{ fontSize: 10, color: d ? "#9694C0" : "#9CA3AF" }}>{r.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
