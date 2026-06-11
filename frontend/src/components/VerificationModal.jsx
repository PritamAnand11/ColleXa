import React, { useState, useEffect } from "react";
import API from "../services/api";

const getTheme = () =>
  document.documentElement.getAttribute("data-theme") === "dark" ||
  document.body.getAttribute("data-theme") === "dark" ? "dark" : "light";

export default function VerificationModal({ college, userId, onVerified, onClose }) {
  const [theme,   setTheme]   = useState(getTheme());
  const [method,  setMethod]  = useState(null); // "email" | "upload"
  const [step,    setStep]    = useState(1);     // 1=choose method, 2=enter details, 3=otp, 4=done
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Email flow state
  const [collegeEmail,  setCollegeEmail]  = useState("");
  const [otpCode,       setOtpCode]       = useState("");
  const [otpSent,       setOtpSent]       = useState(false);

  // ID upload state
  const [file,     setFile]    = useState(null);
  const [fileErr,  setFileErr] = useState("");

  // Shared
  const [studentType,     setStudentType]     = useState("student");
  const [department,      setDepartment]      = useState("");
  const [graduationYear,  setGraduationYear]  = useState("");
  const [isAnonymous,     setIsAnonymous]     = useState(false);

  const d = theme === "dark";
  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(getTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    obs.observe(document.body,            { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  // ── Styles ─────────────────────────────────────────────────
  const overlay = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
    zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
    padding: 20, backdropFilter: "blur(4px)",
  };
  const modal = {
    background: d ? "#12102A" : "#fff",
    borderRadius: 20, width: "100%", maxWidth: 500,
    maxHeight: "90vh", overflowY: "auto",
    boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
    border: `1.5px solid ${d ? "#2D2B50" : "#EDE9FE"}`,
    fontFamily: "Arial, sans-serif",
  };
  const header = {
    background: "linear-gradient(135deg, #1E1B4B, #4F46E5)",
    padding: "22px 28px", borderRadius: "18px 18px 0 0",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  };
  const body = { padding: "28px" };
  const label = { fontSize: 12, fontWeight: 700, color: d ? "#9694C0" : "#374151", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 0.8 };
  const input = {
    width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14,
    background: d ? "#1A1830" : "#F9F8FF", color: d ? "#E8E6FF" : "#1E1B4B",
    border: `1px solid ${d ? "#2D2B50" : "#DDD9F5"}`, outline: "none",
    fontFamily: "Arial", boxSizing: "border-box", marginBottom: 14,
  };
  const btn = (primary = true) => ({
    padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700,
    cursor: "pointer", border: "none", fontFamily: "Arial", transition: "all 0.2s",
    background: primary ? "linear-gradient(135deg,#4F46E5,#7C3AED)" : (d ? "#1A1830" : "#F3F4F6"),
    color: primary ? "#fff" : (d ? "#9694C0" : "#374151"),
    border: primary ? "none" : `1px solid ${d ? "#2D2B50" : "#E5E7EB"}`,
  });
  const errBox = { background: d ? "#2D1010" : "#FEF2F2", border: "1px solid #EF4444", borderRadius: 10, padding: "10px 14px", color: "#EF4444", fontSize: 13, marginBottom: 14 };
  const methodCard = (active) => ({
    border: `2px solid ${active ? "#4F46E5" : (d ? "#2D2B50" : "#E5E7EB")}`,
    background: active ? (d ? "#1E1B4B" : "#EEF2FF") : (d ? "#1A1830" : "#F9F8FF"),
    borderRadius: 14, padding: "18px 20px", cursor: "pointer",
    transition: "all 0.2s", marginBottom: 12,
    display: "flex", alignItems: "center", gap: 14,
  });

  // ── Handlers ───────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!collegeEmail.includes("@")) { setError("Enter a valid college email."); return; }
    setLoading(true); setError("");
    try {
      await API.post("/verify/send-otp", { collegeId: college._id, collegeEmail, userId });
      setOtpSent(true); setStep(3);
    } catch (e) { setError(e.response?.data?.error || "Failed to send OTP."); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) { setError("Enter the 6-digit OTP."); return; }
    setLoading(true); setError("");
    try {
      const res = await API.post("/verify/verify-otp", {
        userId, collegeId: college._id, collegeEmail, otp: otpCode,
        studentType, department, graduationYear,
      });
      onVerified({
        verificationMethod: "college_email", emailVerified: true,
        collegeEmail, studentType, department, graduationYear,
        isAnonymous, isVerified: true,
      });
    } catch (e) { setError(e.response?.data?.error || "OTP verification failed."); }
    finally { setLoading(false); }
  };

  const handleUploadSubmit = async () => {
    if (!file) { setError("Please select a file."); return; }
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("proofDocument", file);
      formData.append("studentType",   studentType);
      formData.append("department",    department);
      formData.append("graduationYear",graduationYear);
      const res = await API.post("/verify/upload-id", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onVerified({
        verificationMethod:  "id_upload",
        proofDocumentPath:   res.data.proofDocumentPath,
        proofDocumentName:   res.data.proofDocumentName,
        studentType, department, graduationYear, isAnonymous,
        isVerified: false, // pending admin
        pendingApproval: true,
      });
    } catch (e) { setError(e.response?.data?.error || "Upload failed."); }
    finally { setLoading(false); }
  };

  const studentDetails = (
    <>
      <div>
        <label style={label}>I am a</label>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {["student","alumni"].map(t => (
            <button key={t} onClick={() => setStudentType(t)} style={{
              ...btn(studentType === t), padding: "9px 20px", fontSize: 13,
            }}>
              {t === "student" ? "🎓 Current Student" : "🏆 Alumni"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label style={label}>Department / Branch</label>
        <input style={input} placeholder="e.g. Computer Science, MBA, Mechanical..." value={department} onChange={e => setDepartment(e.target.value)} />
      </div>
      <div>
        <label style={label}>{studentType === "alumni" ? "Graduation Year" : "Expected Graduation Year"}</label>
        <input style={input} placeholder="e.g. 2024" value={graduationYear} onChange={e => setGraduationYear(e.target.value)} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <input type="checkbox" id="anon" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)}
          style={{ width: 16, height: 16, cursor: "pointer" }} />
        <label htmlFor="anon" style={{ fontSize: 13, color: d ? "#9694C0" : "#374151", cursor: "pointer" }}>
          Post anonymously <span style={{ color: "#7C3AED", fontSize: 11 }}>(your verification is still real — name is hidden)</span>
        </label>
      </div>
    </>
  );

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modal}>
        {/* Header */}
        <div style={header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 28 }}>🔥</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>Unfiltered Mode Verification</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{college?.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 22, cursor: "pointer", padding: "4px 8px" }}>✕</button>
        </div>

        <div style={body}>
          {/* Progress dots */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
            {[1,2,3].map(n => (
              <div key={n} style={{ width: n <= step ? 28 : 8, height: 8, borderRadius: 99,
                background: n <= step ? "#4F46E5" : (d ? "#2D2B50" : "#E5E7EB"), transition: "all 0.3s" }} />
            ))}
          </div>

          {error && <div style={errBox}>⚠️ {error}</div>}

          {/* STEP 1: Choose method */}
          {step === 1 && (
            <>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: d ? "#E8E6FF" : "#1E1B4B", marginBottom: 6, marginTop: 0 }}>
                Verify Your Identity
              </h3>
              <p style={{ fontSize: 13, color: d ? "#9694C0" : "#6B7280", marginBottom: 20 }}>
                Choose how you'd like to prove you're a real student or alumni of <strong>{college?.name}</strong>.
              </p>
              <div style={methodCard(method === "email")} onClick={() => setMethod("email")}>
                <div style={{ fontSize: 32 }}>📧</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: d ? "#E8E6FF" : "#1E1B4B" }}>College Email Verification</div>
                  <div style={{ fontSize: 12, color: d ? "#9694C0" : "#6B7280", marginTop: 3 }}>
                    Enter your official college email (e.g. student@iitb.ac.in). We'll send a 6-digit OTP. <span style={{ color: "#10B981", fontWeight: 600 }}>Instant verification.</span>
                  </div>
                </div>
              </div>
              <div style={methodCard(method === "upload")} onClick={() => setMethod("upload")}>
                <div style={{ fontSize: 32 }}>🪪</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: d ? "#E8E6FF" : "#1E1B4B" }}>Upload ID / Proof Document</div>
                  <div style={{ fontSize: 12, color: d ? "#9694C0" : "#6B7280", marginTop: 3 }}>
                    Upload College ID, Alumni card, Degree, Bonafide or Fee receipt. Admin verifies within 24 hrs.
                  </div>
                </div>
              </div>
              <button style={{ ...btn(true), width: "100%", marginTop: 8, opacity: method ? 1 : 0.5 }}
                disabled={!method} onClick={() => method && setStep(2)}>
                Continue →
              </button>
            </>
          )}

          {/* STEP 2: Student details + method input */}
          {step === 2 && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: d ? "#E8E6FF" : "#1E1B4B", marginBottom: 16, marginTop: 0 }}>
                {method === "email" ? "📧 Enter Your College Email" : "🪪 Upload Your Proof Document"}
              </h3>

              {studentDetails}

              {method === "email" && (
                <>
                  <label style={label}>Official College Email</label>
                  <input style={input} type="email" placeholder={`student@${college?.name?.toLowerCase().replace(/\s/g,"")}.ac.in`}
                    value={collegeEmail} onChange={e => { setCollegeEmail(e.target.value); setError(""); }} />
                  <div style={{ fontSize: 11, color: d ? "#6B7280" : "#9CA3AF", marginBottom: 16 }}>
                    ℹ️ Your personal/Gmail accounts won't work. Only official college email domains are accepted.
                  </div>
                </>
              )}

              {method === "upload" && (
                <>
                  <label style={label}>Upload Document (JPG, PNG or PDF — max 5MB)</label>
                  <div style={{
                    border: `2px dashed ${d ? "#2D2B50" : "#DDD9F5"}`, borderRadius: 12, padding: "20px",
                    textAlign: "center", marginBottom: 14, cursor: "pointer", transition: "all 0.2s",
                    background: file ? (d ? "#1E1B4B" : "#EEF2FF") : "transparent",
                  }}
                    onClick={() => document.getElementById("proof-upload").click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setFile(f); setFileErr(""); } }}
                  >
                    <input id="proof-upload" type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }}
                      onChange={e => { const f = e.target.files[0]; if (f) { setFile(f); setFileErr(""); } }} />
                    {file ? (
                      <div>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#10B981" }}>{file.name}</div>
                        <div style={{ fontSize: 11, color: d ? "#9694C0" : "#6B7280", marginTop: 3 }}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>📎</div>
                        <div style={{ fontSize: 13, color: d ? "#9694C0" : "#6B7280" }}>Click or drag your document here</div>
                        <div style={{ fontSize: 11, color: d ? "#6B7280" : "#9CA3AF", marginTop: 4 }}>
                          College ID · Alumni card · Degree · Bonafide · Fee receipt
                        </div>
                      </div>
                    )}
                  </div>
                  {fileErr && <div style={{ color: "#EF4444", fontSize: 12, marginBottom: 10 }}>{fileErr}</div>}
                </>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ ...btn(false), flex: 1 }} onClick={() => { setStep(1); setError(""); }}>← Back</button>
                <button style={{ ...btn(true), flex: 2 }} disabled={loading}
                  onClick={method === "email" ? handleSendOTP : handleUploadSubmit}>
                  {loading ? "Please wait..." : method === "email" ? "Send OTP →" : "Submit for Verification →"}
                </button>
              </div>
            </>
          )}

          {/* STEP 3: OTP entry (email only) */}
          {step === 3 && method === "email" && (
            <>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📬</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: d ? "#E8E6FF" : "#1E1B4B", margin: "0 0 8px" }}>
                  Check Your College Email
                </h3>
                <p style={{ fontSize: 13, color: d ? "#9694C0" : "#6B7280", margin: 0 }}>
                  We sent a 6-digit code to <strong style={{ color: "#4F46E5" }}>{collegeEmail}</strong>
                </p>
              </div>

              <label style={label}>Enter 6-Digit OTP</label>
              <input style={{ ...input, fontSize: 28, fontWeight: 900, textAlign: "center", letterSpacing: 12 }}
                type="text" maxLength={6} placeholder="——————"
                value={otpCode} onChange={e => { setOtpCode(e.target.value.replace(/\D/g,"")); setError(""); }} />

              <button style={{ ...btn(true), width: "100%", marginBottom: 12 }}
                disabled={loading || otpCode.length !== 6} onClick={handleVerifyOTP}>
                {loading ? "Verifying..." : "Verify & Continue ✓"}
              </button>

              <button style={{ background: "none", border: "none", color: "#4F46E5", fontSize: 13, cursor: "pointer", width: "100%", textAlign: "center" }}
                onClick={() => { setOtpCode(""); setStep(2); setOtpSent(false); }}>
                ← Re-enter email / Resend OTP
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
