// ============================================================
// frontend/src/pages/AddReview.jsx  — UPDATED
// Replace your existing AddReview.jsx with this file.
// Adds: Public vs Unfiltered Mode choice + VerificationModal
// ============================================================
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import VerificationModal from "../components/VerificationModal";

const getTheme = () =>
  document.documentElement.getAttribute("data-theme") === "dark" ||
  document.body.getAttribute("data-theme") === "dark" ? "dark" : "light";

function StarRating({ label, value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 8 }}>{label}</label>
      <div style={{ display: "flex", gap: 8 }}>
        {[1,2,3,4,5].map(i => (
          <span key={i} onClick={() => onChange(i)}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)}
            style={{ fontSize: 32, cursor: "pointer", color: i <= (hovered || value) ? "#F59E0B" : "#D1D5DB", transition: "color 0.15s" }}>
            ★
          </span>
        ))}
        {value > 0 && <span style={{ fontSize: 14, fontWeight: 700, color: "#F59E0B", alignSelf: "center" }}>{value}.0</span>}
      </div>
    </div>
  );
}

export default function AddReview() {
  const { id: collegeId } = useParams();
  const { user }          = useContext(AuthContext);
  const navigate          = useNavigate();
  const [theme, setTheme] = useState(getTheme());

  // Step: "type" | "verify" | "form" | "success"
  const [step,        setStep]        = useState("type");
  const [reviewType,  setReviewType]  = useState("public"); // "public" | "unfiltered"
  const [college,     setCollege]     = useState(null);
  const [showVerify,  setShowVerify]  = useState(false);
  const [verifyData,  setVerifyData]  = useState(null); // returned from VerificationModal

  // Form state
  const [ratings, setRatings] = useState({ overall: 0, faculty: 0, placement: 0, infra: 0, hostel: 0 });
  const [text,    setText]    = useState("");
  const [pros,    setPros]    = useState("");
  const [cons,    setCons]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [pendingApproval, setPendingApproval] = useState(false);

  const d = theme === "dark";

  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(getTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    obs.observe(document.body,            { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    API.get(`/colleges/${collegeId}`)
      .then(r => setCollege(r.data))
      .catch(() => {});
  }, [collegeId]);

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: d ? "#0F0E1A" : "#F5F3FF", fontFamily: "Arial" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <h2 style={{ color: d ? "#E8E6FF" : "#1E1B4B" }}>Please log in to write a review.</h2>
          <button onClick={() => navigate("/login")} style={{ marginTop: 16, padding: "12px 32px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            Log In
          </button>
        </div>
      </div>
    );
  }

  // ── Styles ─────────────────────────────────────────────────
  const S = {
    page: { minHeight: "100vh", background: d ? "#0F0E1A" : "#F5F3FF", fontFamily: "Arial, sans-serif", padding: "40px 20px 80px" },
    wrap: { maxWidth: 680, margin: "0 auto" },
    card: { background: d ? "#1A1830" : "#fff", borderRadius: 20, padding: "36px", boxShadow: "0 8px 40px rgba(79,70,229,0.10)", border: `1px solid ${d ? "#2D2B50" : "#EDE9FE"}` },
    h1: { fontSize: 26, fontWeight: 800, color: d ? "#E8E6FF" : "#1E1B4B", marginBottom: 6, marginTop: 0 },
    sub: { fontSize: 14, color: d ? "#9694C0" : "#6B7280", marginBottom: 28 },
    textarea: {
      width: "100%", padding: "14px 16px", borderRadius: 12, fontSize: 14, lineHeight: 1.7,
      background: d ? "#12102A" : "#F9F8FF", color: d ? "#E8E6FF" : "#1E1B4B",
      border: `1px solid ${d ? "#2D2B50" : "#DDD9F5"}`, outline: "none",
      fontFamily: "Arial", resize: "vertical", minHeight: 120, boxSizing: "border-box", marginBottom: 16,
    },
    label: { fontSize: 13, fontWeight: 700, color: d ? "#9694C0" : "#374151", display: "block", marginBottom: 6 },
    submitBtn: { width: "100%", padding: "14px", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8 },
    errBox: { background: d ? "#2D1010" : "#FEF2F2", border: "1px solid #EF4444", borderRadius: 10, padding: "12px 16px", color: "#EF4444", fontSize: 13, marginBottom: 16 },
    typeCard: (active, gradient) => ({
      border: `2.5px solid ${active ? "#4F46E5" : (d ? "#2D2B50" : "#E5E7EB")}`,
      background: active ? (d ? "#1E1B4B" : "#EEF2FF") : (d ? "#12102A" : "#FAFAFA"),
      borderRadius: 18, padding: "24px", cursor: "pointer", transition: "all 0.2s",
      position: "relative", overflow: "hidden",
    }),
  };

  // ── Handlers ───────────────────────────────────────────────
  const handleTypeSelect = (type) => {
    setReviewType(type);
    if (type === "public") {
      setVerifyData(null);
      setStep("form");
    } else {
      setStep("verify");
    }
  };

  const handleVerified = (data) => {
    setVerifyData(data);
    setShowVerify(false);
    setStep("form");
  };

  const handleSubmit = async () => {
    if (ratings.overall === 0) { setError("Please give an overall rating."); return; }
    if (text.trim().length < 20) { setError("Review must be at least 20 characters."); return; }
    setLoading(true); setError("");

    try {
      const payload = {
        collegeId, userId: user._id || user.id,
        overallRating: ratings.overall, facultyRating: ratings.faculty,
        placementRating: ratings.placement, infraRating: ratings.infra,
        hostelRating: ratings.hostel,
        review: text, pros, cons, reviewType,
        ...(verifyData || {}),
      };
      const res = await API.post("/reviews", payload);
      if (verifyData?.pendingApproval) setPendingApproval(true);
      setStep("success");
    } catch (e) {
      setError(e.response?.data?.error || "Submission failed. Please try again.");
    } finally { setLoading(false); }
  };

  // ── STEP: Type selection ────────────────────────────────────
  if (step === "type") return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.card}>
          <h1 style={S.h1}>Write a Review</h1>
          <p style={S.sub}>{college?.name || "Loading..."}</p>

          <p style={{ fontSize: 14, fontWeight: 700, color: d ? "#E8E6FF" : "#1E1B4B", marginBottom: 16 }}>
            Choose your review type:
          </p>

          {/* Public Review card */}
          <div style={S.typeCard(reviewType === "public")} onClick={() => handleTypeSelect("public")}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 36 }}>📝</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: d ? "#E8E6FF" : "#1E1B4B" }}>Public Review</div>
                <div style={{ fontSize: 12, color: d ? "#9694C0" : "#6B7280", marginTop: 3 }}>Open for everyone — students, alumni, parents, visitors</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["No verification needed","Appears immediately","Anyone can write"].map(t => (
                <span key={t} style={{ fontSize: 11, padding: "3px 10px", background: d ? "#2D2B50" : "#F3F4F6", color: d ? "#9694C0" : "#6B7280", borderRadius: 999 }}>{t}</span>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", margin: "16px 0", color: d ? "#6B7280" : "#9CA3AF", fontSize: 13, fontWeight: 700 }}>— OR —</div>

          {/* Unfiltered Mode card */}
          <div style={S.typeCard(reviewType === "unfiltered")} onClick={() => handleTypeSelect("unfiltered")}>
            {/* Premium gradient bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#4F46E5,#7C3AED,#EF4444)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 36 }}>🔥</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 17, fontWeight: 800, color: d ? "#E8E6FF" : "#1E1B4B" }}>Unfiltered Mode</span>
                  <span style={{ fontSize: 10, fontWeight: 700, background: "linear-gradient(135deg,#4F46E5,#7C3AED)", color: "#fff", padding: "2px 8px", borderRadius: 999 }}>EXCLUSIVE</span>
                </div>
                <div style={{ fontSize: 12, color: d ? "#9694C0" : "#6B7280", marginTop: 3 }}>Only for verified current students & alumni</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["✅ Verified badge","🔒 Trusted reviews","🏆 Exclusive section"].map(t => (
                <span key={t} style={{ fontSize: 11, padding: "3px 10px", background: "rgba(79,70,229,0.12)", color: "#7C3AED", borderRadius: 999, border: "1px solid rgba(79,70,229,0.2)" }}>{t}</span>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: d ? "#9694C0" : "#6B7280", fontStyle: "italic" }}>
              Verify via college email (instant) or ID card upload (admin verified within 24 hrs)
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── STEP: Verify (show VerificationModal) ───────────────────
  if (step === "verify") return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.card}>
          <h1 style={S.h1}>🔥 Unfiltered Mode</h1>
          <p style={S.sub}>Verify your identity to write an exclusive, trusted review.</p>
          <div style={{ background: d ? "#1E1B4B" : "#EEF2FF", borderRadius: 14, padding: "20px 24px", marginBottom: 20, border: `1px solid ${d ? "#4F46E5" : "#C7D2FE"}` }}>
            <p style={{ fontSize: 13, color: d ? "#C4C2F0" : "#374151", lineHeight: 1.7, margin: 0 }}>
              Your review will carry a <strong>Verified Student ✅</strong> or <strong>Verified Alumni ✅</strong> badge and appear in the exclusive Unfiltered Mode section — the most trusted reviews on ColleXa.
            </p>
          </div>
          <button
            onClick={() => setShowVerify(true)}
            style={{ ...S.submitBtn, marginTop: 0 }}>
            Start Verification →
          </button>
          <button onClick={() => setStep("type")} style={{ width: "100%", padding: "12px", background: "transparent", border: `1px solid ${d ? "#2D2B50" : "#E5E7EB"}`, borderRadius: 12, fontSize: 14, color: d ? "#9694C0" : "#6B7280", cursor: "pointer", marginTop: 10 }}>
            ← Go Back
          </button>
        </div>
      </div>

      {showVerify && college && (
        <VerificationModal
          college={college}
          userId={user._id || user.id}
          onVerified={handleVerified}
          onClose={() => { setShowVerify(false); setStep("type"); }}
        />
      )}
    </div>
  );

  // ── STEP: Form ──────────────────────────────────────────────
  if (step === "form") return (
    <div style={S.page}>
      <div style={S.wrap}>
        {/* Verified badge banner */}
        {reviewType === "unfiltered" && verifyData && (
          <div style={{
            background: verifyData.pendingApproval
              ? (d ? "#1A1500" : "#FFFBEB")
              : (d ? "#0A2A1A" : "#ECFDF5"),
            border: `1.5px solid ${verifyData.pendingApproval ? "#F59E0B" : "#10B981"}`,
            borderRadius: 14, padding: "14px 20px", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 24 }}>{verifyData.pendingApproval ? "⏳" : "✅"}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: verifyData.pendingApproval ? "#F59E0B" : "#10B981" }}>
                {verifyData.pendingApproval ? "Pending Admin Verification" : `Verified ${verifyData.studentType === "alumni" ? "Alumni" : "Student"}`}
              </div>
              <div style={{ fontSize: 12, color: d ? "#9694C0" : "#6B7280" }}>
                {verifyData.pendingApproval
                  ? "Your review will appear in Unfiltered Mode after admin approves your document (within 24 hrs)."
                  : `${verifyData.verificationMethod === "college_email" ? "📧 Email verified" : "🪪 ID verified"} · ${verifyData.collegeEmail || "Document uploaded"}`}
              </div>
            </div>
          </div>
        )}

        <div style={S.card}>
          {reviewType === "unfiltered" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid ${d ? "#2D2B50" : "#EEE"}` }}>
              <span style={{ fontSize: 22 }}>🔥</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#4F46E5" }}>Unfiltered Mode Review</span>
            </div>
          )}

          <h1 style={S.h1}>{college?.name}</h1>
          <p style={S.sub}>Be honest. Your review helps thousands of students make better decisions.</p>

          {error && <div style={S.errBox}>⚠️ {error}</div>}

          <StarRating label="⭐ Overall Rating *" value={ratings.overall} onChange={v => setRatings(p => ({ ...p, overall: v }))} />
          <StarRating label="👨‍🏫 Faculty"      value={ratings.faculty}   onChange={v => setRatings(p => ({ ...p, faculty: v }))} />
          <StarRating label="💼 Placements"    value={ratings.placement} onChange={v => setRatings(p => ({ ...p, placement: v }))} />
          <StarRating label="🏛️ Infrastructure" value={ratings.infra}     onChange={v => setRatings(p => ({ ...p, infra: v }))} />
          <StarRating label="🏠 Hostel"        value={ratings.hostel}    onChange={v => setRatings(p => ({ ...p, hostel: v }))} />

          <label style={S.label}>✍️ Your Review *</label>
          <textarea style={S.textarea} placeholder="Share your honest experience — academics, campus life, placements, hostel, faculty..." value={text} onChange={e => setText(e.target.value)} rows={5} />

          <label style={S.label}>✅ Pros (What's genuinely good?)</label>
          <textarea style={{ ...S.textarea, minHeight: 70 }} placeholder="e.g. Strong placement cell, excellent faculty in CS department..." value={pros} onChange={e => setPros(e.target.value)} rows={2} />

          <label style={S.label}>⚠️ Cons (What needs improvement?)</label>
          <textarea style={{ ...S.textarea, minHeight: 70 }} placeholder="e.g. Hostel food quality, limited extra-curricular activities..." value={cons} onChange={e => setCons(e.target.value)} rows={2} />

          <button style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1 }} disabled={loading} onClick={handleSubmit}>
            {loading ? "Submitting..." : reviewType === "unfiltered" ? "🔥 Submit Unfiltered Review" : "Submit Review"}
          </button>
          <button onClick={() => setStep("type")} style={{ width: "100%", padding: "12px", background: "transparent", border: `1px solid ${d ? "#2D2B50" : "#E5E7EB"}`, borderRadius: 12, fontSize: 14, color: d ? "#9694C0" : "#6B7280", cursor: "pointer", marginTop: 10 }}>
            ← Change Review Type
          </button>
        </div>
      </div>
    </div>
  );

  // ── STEP: Success ───────────────────────────────────────────
  if (step === "success") return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={{ ...S.card, textAlign: "center", padding: "48px 36px" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{pendingApproval ? "⏳" : "🎉"}</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: d ? "#E8E6FF" : "#1E1B4B", marginBottom: 8 }}>
            {pendingApproval ? "Review Submitted — Pending Verification" : "Review Submitted!"}
          </h2>
          <p style={{ fontSize: 14, color: d ? "#9694C0" : "#6B7280", marginBottom: 28, lineHeight: 1.7 }}>
            {pendingApproval
              ? "Your document has been sent to our admin team. Your Unfiltered Mode review will appear within 24 hours after verification."
              : reviewType === "unfiltered"
                ? "Your verified review is now live in the 🔥 Unfiltered Mode section. Thank you for keeping it real!"
                : "Your review is now live. Thank you for helping other students!"}
          </p>
          <button onClick={() => navigate(`/college/${collegeId}`)}
            style={{ padding: "14px 36px", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            View College Page
          </button>
        </div>
      </div>
    </div>
  );
}
