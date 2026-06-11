// ============================================================
// frontend/src/components/AdminVerification.jsx  — NEW
// Add inside your AdminDashboard.jsx:
//   import AdminVerification from "./AdminVerification";
//   <AdminVerification />
// ============================================================
import React, { useState, useEffect } from "react";
import API from "../services/api";

const getTheme = () =>
  document.documentElement.getAttribute("data-theme") === "dark" ||
  document.body.getAttribute("data-theme") === "dark" ? "dark" : "light";

// Status badge
function StatusBadge({ status }) {
  const map = {
    pending:  { color: "#F59E0B", bg: "#FEF3C7", label: "⏳ Pending"  },
    approved: { color: "#10B981", bg: "#D1FAE5", label: "✅ Approved" },
    rejected: { color: "#EF4444", bg: "#FEE2E2", label: "❌ Rejected" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 10px",
      background: s.bg, color: s.color, borderRadius: 999,
      border: `1px solid ${s.color}44`,
    }}>
      {s.label}
    </span>
  );
}

export default function AdminVerification() {
  const [theme,    setTheme]    = useState(getTheme());
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null); // currently viewed review
  const [note,     setNote]     = useState("");
  const [working,  setWorking]  = useState(false);
  const [message,  setMessage]  = useState("");
  const [filter,   setFilter]   = useState("pending"); // pending | approved | rejected | all

  const d = theme === "dark";

  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(getTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    obs.observe(document.body,            { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await API.get("/verify/admin/pending");
      setReviews(res.data || []);
    } catch { setReviews([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (reviewId) => {
    setWorking(true); setMessage("");
    try {
      await API.post(`/verify/admin/${reviewId}/approve`, { adminNote: note });
      setMessage("✅ Review approved! It is now live in Unfiltered Mode.");
      setSelected(null); setNote("");
      fetchPending();
    } catch { setMessage("❌ Failed to approve."); }
    finally { setWorking(false); }
  };

  const handleReject = async (reviewId) => {
    if (!note.trim()) { setMessage("Please add a rejection reason."); return; }
    setWorking(true); setMessage("");
    try {
      await API.post(`/verify/admin/${reviewId}/reject`, { adminNote: note });
      setMessage("Review rejected and moved to public section.");
      setSelected(null); setNote("");
      fetchPending();
    } catch { setMessage("❌ Failed to reject."); }
    finally { setWorking(false); }
  };

  // ── Styles ─────────────────────────────────────────────────
  const S = {
    wrap: { fontFamily: "Arial, sans-serif" },
    header: {
      background: d ? "linear-gradient(135deg,#0D0B2E,#1E1B4B)" : "linear-gradient(135deg,#1E1B4B,#4F46E5)",
      borderRadius: 18, padding: "24px 28px", marginBottom: 24,
      display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
    },
    row: {
      background: d ? "#1A1830" : "#fff",
      border: `1px solid ${d ? "#2D2B50" : "#E5E7EB"}`,
      borderRadius: 14, padding: "18px 20px", marginBottom: 12,
      cursor: "pointer", transition: "all 0.2s",
    },
    rowMeta: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 8 },
    label: { fontSize: 11, fontWeight: 700, color: d ? "#9694C0" : "#6B7280", textTransform: "uppercase", letterSpacing: 0.8 },
    val:   { fontSize: 13, color: d ? "#E8E6FF" : "#1E1B4B" },
    overlay: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, backdropFilter: "blur(4px)",
    },
    modal: {
      background: d ? "#12102A" : "#fff", borderRadius: 20, width: "100%", maxWidth: 640,
      maxHeight: "90vh", overflowY: "auto",
      boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      border: `1.5px solid ${d ? "#2D2B50" : "#EDE9FE"}`,
    },
    mHeader: {
      background: "linear-gradient(135deg,#1E1B4B,#4F46E5)",
      padding: "20px 24px", borderRadius: "18px 18px 0 0",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    },
    mBody: { padding: "24px" },
    textarea: {
      width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 13,
      background: d ? "#1A1830" : "#F9F8FF", color: d ? "#E8E6FF" : "#1E1B4B",
      border: `1px solid ${d ? "#2D2B50" : "#DDD9F5"}`, outline: "none",
      fontFamily: "Arial", resize: "vertical", minHeight: 80, boxSizing: "border-box",
    },
    approveBtn: {
      padding: "11px 24px", background: "linear-gradient(135deg,#059669,#0891B2)",
      color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
      cursor: working ? "not-allowed" : "pointer", fontFamily: "Arial",
    },
    rejectBtn: {
      padding: "11px 24px", background: "linear-gradient(135deg,#EF4444,#DC2626)",
      color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
      cursor: working ? "not-allowed" : "pointer", fontFamily: "Arial",
    },
    filterTab: (active) => ({
      padding: "7px 18px", borderRadius: 999, fontSize: 12, fontWeight: 700,
      cursor: "pointer", border: "none", fontFamily: "Arial",
      background: active ? "#4F46E5" : (d ? "#1A1830" : "#F3F4F6"),
      color: active ? "#fff" : (d ? "#9694C0" : "#6B7280"),
    }),
    infoGrid: {
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16,
    },
    infoBox: {
      background: d ? "#1A1830" : "#F9F8FF",
      border: `1px solid ${d ? "#2D2B50" : "#E5E7EB"}`,
      borderRadius: 10, padding: "12px 14px",
    },
    reviewText: {
      background: d ? "#0D1035" : "#EEF2FF",
      border: `1px solid ${d ? "#2D2B50" : "#C7D2FE"}`,
      borderRadius: 10, padding: "14px 16px",
      fontSize: 13, color: d ? "#C4C2F0" : "#374151",
      lineHeight: 1.7, fontStyle: "italic", marginBottom: 16,
    },
    documentBox: {
      background: d ? "#1E1B4B" : "#EEF2FF",
      border: `1.5px dashed ${d ? "#4F46E5" : "#C7D2FE"}`,
      borderRadius: 12, padding: "16px 20px", marginBottom: 16,
      display: "flex", alignItems: "center", gap: 12,
    },
  };

  const filtered = reviews; // API already returns pending only — filter UI is for future use

  return (
    <div style={S.wrap}>

      {/* Header */}
      <div style={S.header}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: 0 }}>
            🔥 Unfiltered Mode — Verification Queue
          </h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: "4px 0 0" }}>
            Review uploaded ID cards and approve / reject Unfiltered Mode access
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            background: reviews.length > 0 ? "#EF4444" : "#10B981",
            color: "#fff", fontSize: 13, fontWeight: 700,
            padding: "6px 16px", borderRadius: 999,
          }}>
            {reviews.length} Pending
          </div>
          <button onClick={fetchPending} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", padding: "7px 16px", borderRadius: 10, cursor: "pointer", fontSize: 12, fontFamily: "Arial" }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Success/Error message */}
      {message && (
        <div style={{ background: message.startsWith("✅") ? "#D1FAE5" : "#FEF2F2", border: `1px solid ${message.startsWith("✅") ? "#10B981" : "#EF4444"}`, borderRadius: 10, padding: "12px 16px", color: message.startsWith("✅") ? "#065F46" : "#991B1B", fontSize: 13, marginBottom: 16 }}>
          {message}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px", color: d ? "#9694C0" : "#6B7280" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
          Loading pending verifications...
        </div>
      )}

      {/* Empty */}
      {!loading && reviews.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: d ? "#E8E6FF" : "#1E1B4B" }}>
            All caught up!
          </h3>
          <p style={{ fontSize: 13, color: d ? "#9694C0" : "#6B7280" }}>
            No pending ID verifications. Check back later.
          </p>
        </div>
      )}

      {/* Review rows */}
      {!loading && reviews.map((r, i) => (
        <div key={r._id} style={S.row} onClick={() => { setSelected(r); setNote(""); setMessage(""); }}>
          <div style={S.rowMeta}>
            <StatusBadge status={r.verificationStatus} />
            <span style={{ fontSize: 11, color: d ? "#9694C0" : "#9CA3AF" }}>
              {r.studentType === "alumni" ? "🏆 Alumni" : "🎓 Student"}
            </span>
            {r.department && <span style={{ fontSize: 11, color: d ? "#9694C0" : "#9CA3AF" }}>· {r.department}</span>}
            {r.graduationYear && <span style={{ fontSize: 11, color: d ? "#9694C0" : "#9CA3AF" }}>· {r.graduationYear}</span>}
            <span style={{ fontSize: 11, color: d ? "#6B7280" : "#9CA3AF", marginLeft: "auto" }}>
              {new Date(r.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
            </span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: d ? "#E8E6FF" : "#1E1B4B", marginBottom: 4 }}>
            {r.userId?.name || "Unknown Student"}
            <span style={{ fontSize: 12, fontWeight: 400, color: d ? "#9694C0" : "#6B7280", marginLeft: 8 }}>
              {r.userId?.email}
            </span>
          </div>
          <div style={{ fontSize: 12, color: d ? "#9694C0" : "#6B7280" }}>
            {r.collegeId?.name || "College"} · "{(r.review || "").slice(0, 80)}..."
          </div>
          <div style={{ fontSize: 12, color: "#4F46E5", fontWeight: 600, marginTop: 6 }}>
            📎 {r.proofDocumentName || "Document uploaded"} — Click to review →
          </div>
        </div>
      ))}

      {/* ── Detail Modal ── */}
      {selected && (
        <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={S.modal}>
            <div style={S.mHeader}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>
                  Review Verification — {selected.userId?.name || "Student"}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                  {selected.collegeId?.name}
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 22, cursor: "pointer" }}>✕</button>
            </div>

            <div style={S.mBody}>

              {/* Student info grid */}
              <div style={S.infoGrid}>
                {[
                  ["👤 Name",       selected.userId?.name       || "—"],
                  ["📧 Email",      selected.userId?.email      || "—"],
                  ["🎓 Type",       selected.studentType === "alumni" ? "Alumni" : "Student"],
                  ["📚 Department", selected.department         || "—"],
                  ["🎉 Year",       selected.graduationYear     || "—"],
                  ["🏫 College",    selected.collegeId?.name    || "—"],
                ].map(([label, val]) => (
                  <div key={label} style={S.infoBox}>
                    <div style={S.label}>{label}</div>
                    <div style={S.val}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Uploaded document */}
              <div style={S.documentBox}>
                <span style={{ fontSize: 28 }}>📎</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: d ? "#E8E6FF" : "#1E1B4B", marginBottom: 4 }}>
                    Uploaded Document
                  </div>
                  <div style={{ fontSize: 12, color: d ? "#9694C0" : "#6B7280" }}>
                    {selected.proofDocumentName || "Document"}
                  </div>
                  {selected.proofDocumentPath && (
                    <a
                      href={`http://localhost:5000/${selected.proofDocumentPath}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 12, color: "#4F46E5", fontWeight: 700, marginTop: 4, display: "block" }}
                    >
                      👁️ View Document →
                    </a>
                  )}
                </div>
              </div>

              {/* Review text */}
              <div style={{ fontSize: 12, fontWeight: 700, color: d ? "#9694C0" : "#6B7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Review Content</div>
              <div style={S.reviewText}>"{selected.review}"</div>

              {/* Rating */}
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                {[
                  ["Overall", selected.overallRating],
                  ["Faculty", selected.facultyRating],
                  ["Placement", selected.placementRating],
                  ["Infra", selected.infraRating],
                  ["Hostel", selected.hostelRating],
                ].filter(([,v]) => v > 0).map(([l, v]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#F59E0B" }}>{v?.toFixed(1)}</div>
                    <div style={{ fontSize: 10, color: d ? "#9694C0" : "#9CA3AF" }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Admin note */}
              <div style={{ fontSize: 12, fontWeight: 700, color: d ? "#9694C0" : "#6B7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Admin Note</div>
              <textarea
                style={S.textarea}
                placeholder="Add an optional note (required for rejection)..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />

              {/* Error/success */}
              {message && (
                <div style={{ fontSize: 13, color: message.startsWith("✅") ? "#10B981" : "#EF4444", marginBottom: 12 }}>{message}</div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button style={S.rejectBtn} disabled={working} onClick={() => handleReject(selected._id)}>
                  {working ? "..." : "❌ Reject"}
                </button>
                <button style={{ ...S.approveBtn, flex: 1 }} disabled={working} onClick={() => handleApprove(selected._id)}>
                  {working ? "Processing..." : "✅ Approve — Publish to Unfiltered Mode"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
