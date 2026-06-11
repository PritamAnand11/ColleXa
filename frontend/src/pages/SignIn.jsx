// frontend/src/pages/SignIn.jsx
// (also works as Login.jsx — just rename if needed)

import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

/* =========================================================
   STYLES — mirrors Register.jsx design exactly
========================================================= */
const S = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#f0f2ff",
  },

  /* ── Left panel ── */
  left: {
    flex: "0 0 48%",
    background: "linear-gradient(145deg, #5b4ff5 0%, #7c3aed 50%, #4f46e5 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "60px 56px",
    position: "relative",
    overflow: "hidden",
  },
  leftBlob1: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.07)",
    pointerEvents: "none",
  },
  leftBlob2: {
    position: "absolute",
    bottom: -60,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.05)",
    pointerEvents: "none",
  },
  leftBlob3: {
    position: "absolute",
    top: "40%",
    right: "10%",
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    pointerEvents: "none",
  },
  waveLine: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0.06,
    backgroundImage: `repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 20px,
      rgba(255,255,255,0.8) 20px,
      rgba(255,255,255,0.8) 21px
    )`,
    pointerEvents: "none",
  },
  brand: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 40,
    zIndex: 1,
  },
  leftHeading: {
    fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
    fontWeight: 800,
    color: "#ffffff",
    lineHeight: 1.15,
    letterSpacing: "-1px",
    margin: "0 0 20px 0",
    zIndex: 1,
  },
  leftSub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.7,
    maxWidth: 340,
    margin: "0 0 48px 0",
    zIndex: 1,
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    zIndex: 1,
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  featureDot: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    flexShrink: 0,
  },
  featureText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: 500,
  },

  /* ── Right panel ── */
  right: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 32px",
    background: "#ffffff",
  },
  formWrap: {
    width: "100%",
    maxWidth: 400,
  },
  topLabel: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#a78bfa",
    marginBottom: 10,
  },
  heading: {
    fontSize: "clamp(1.6rem, 2.5vw, 2rem)",
    fontWeight: 800,
    color: "#0f0f1a",
    letterSpacing: "-0.8px",
    margin: "0 0 6px 0",
  },
  subheading: {
    fontSize: 14,
    color: "#9191a8",
    margin: "0 0 36px 0",
    lineHeight: 1.6,
  },

  /* ── Input group ── */
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    color: "#555570",
    marginBottom: 7,
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    fontSize: 16,
    color: "#c0c0d8",
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "13px 14px 13px 42px",
    fontSize: 14,
    fontFamily: "inherit",
    background: "#f8f8ff",
    border: "1.5px solid #e8e8f5",
    borderRadius: 12,
    color: "#0f0f1a",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },

  /* ── Submit button ── */
  btn: {
    width: "100%",
    padding: "14px",
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "inherit",
    letterSpacing: "0.3px",
    color: "#ffffff",
    background: "linear-gradient(135deg, #5b4ff5, #7c3aed)",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    marginTop: 8,
    boxShadow: "0 6px 24px rgba(91,79,245,0.35)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },

  /* ── Divider ── */
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "22px 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "#ebebf5",
  },
  dividerText: {
    fontSize: 12,
    color: "#b0b0c8",
    fontWeight: 500,
    letterSpacing: "0.5px",
  },

  /* ── Footer ── */
  footer: {
    marginTop: 28,
    textAlign: "center",
    fontSize: 13,
    color: "#9191a8",
  },
  link: {
    color: "#5b4ff5",
    fontWeight: 600,
    textDecoration: "none",
  },

  /* ── Error ── */
  errorBox: {
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 13,
    color: "#ef4444",
    marginBottom: 18,
  },
};

const FEATURES = [
  { icon: "🎓", text: "Explore 500+ colleges across India" },
  { icon: "⭐", text: "Read verified student reviews" },
  { icon: "🤖", text: "AI-powered college insights" },
  { icon: "📊", text: "Compare colleges side by side" },
];

/* =========================================================
   COMPONENT
========================================================= */
export default function SignIn() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = "#5b4ff5";
    e.target.style.boxShadow = "0 0 0 3px rgba(91,79,245,0.12)";
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = "#e8e8f5";
    e.target.style.boxShadow = "none";
  };

  return (
    <div style={S.page}>

      {/* ════ LEFT PANEL ════ */}
      <motion.div
        style={S.left}
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Decorative blobs */}
        <div style={S.leftBlob1} />
        <div style={S.leftBlob2} />
        <div style={S.leftBlob3} />
        <div style={S.waveLine} />

        <div style={S.brand}>Collexa</div>

        <h1 style={S.leftHeading}>
          Welcome back.<br />Good to see you.
        </h1>

        <p style={S.leftSub}>
          Sign in to access your saved colleges,
          reviews, and personalized AI recommendations.
        </p>

        <div style={S.featureList}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              style={S.featureItem}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <div style={S.featureDot}>{f.icon}</div>
              <span style={S.featureText}>{f.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>


      {/* ════ RIGHT PANEL ════ */}
      <div style={S.right}>
        <motion.div
          style={S.formWrap}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.45 }}
        >
          <p style={S.topLabel}>Welcome back</p>
          <h2 style={S.heading}>Log in to Collexa</h2>
          <p style={S.subheading}>
            Enter your credentials to continue.
          </p>

          {/* Error */}
          {error && (
            <motion.div
              style={S.errorBox}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} autoComplete="off">

            {/* Email */}
            <div style={S.inputGroup}>
              <label style={S.label}>Email Address</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>✉️</span>
                <input
                  style={S.input}
                  type="email"
                  // placeholder="aarav@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </div>

            {/* Password */}
            <div style={S.inputGroup}>
              <label style={S.label}>Password</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>🔒</span>
                <input
                  style={S.input}
                  type="password"
                  // placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              style={{
                ...S.btn,
                opacity: loading ? 0.75 : 1,
              }}
              disabled={loading}
              whileHover={{
                translateY: -2,
                boxShadow: "0 10px 32px rgba(91,79,245,0.45)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Signing in…" : "Log In →"}
            </motion.button>

          </form>

          {/* Divider */}
          <div style={S.divider}>
            <div style={S.dividerLine} />
            <span style={S.dividerText}>OR</span>
            <div style={S.dividerLine} />
          </div>

          {/* Footer */}
          <div style={S.footer}>
            Don't have an account?{" "}
            <Link to="/register" style={S.link}>
              Create one
            </Link>
          </div>

        </motion.div>
      </div>

    </div>
  );
}
