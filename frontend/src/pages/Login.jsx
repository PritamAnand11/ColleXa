// frontend/src/pages/Login.jsx

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/* =========================================================
   STYLES
========================================================= */
const S = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },

  /* ── Left: Form panel ── */
  left: {
    flex: "0 0 52%",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "60px 72px",
    position: "relative",
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 56,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg, #5b4ff5, #7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1a1a2e",
    letterSpacing: "-0.5px",
  },

  heading: {
    fontSize: "clamp(1.8rem, 2.8vw, 2.4rem)",
    fontWeight: 800,
    color: "#1a1a2e",
    letterSpacing: "-1px",
    margin: "0 0 8px 0",
    lineHeight: 1.15,
  },
  subheading: {
    fontSize: 15,
    color: "#9191a8",
    margin: "0 0 40px 0",
    lineHeight: 1.6,
  },

  /* ── Google button ── */
  googleBtn: {
    width: "100%",
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    background: "#ffffff",
    border: "1.5px solid #e0e0f0",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "inherit",
    color: "#1a1a2e",
    cursor: "pointer",
    marginBottom: 16,
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },

  /* ── Divider ── */
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    margin: "6px 0 20px",
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

  /* ── Email button ── */
  emailBtn: {
    width: "100%",
    padding: "14px 20px",
    background: "linear-gradient(135deg, #5b4ff5, #7c3aed)",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "inherit",
    color: "#ffffff",
    cursor: "pointer",
    letterSpacing: "0.2px",
    boxShadow: "0 6px 24px rgba(91,79,245,0.35)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },

  /* ── Footer ── */
  footer: {
    marginTop: 32,
    fontSize: 14,
    color: "#9191a8",
    textAlign: "center",
  },
  footerLink: {
    color: "#5b4ff5",
    fontWeight: 700,
    textDecoration: "none",
    marginLeft: 4,
  },

  /* ── Right: Illustration panel ── */
  right: {
    flex: 1,
    background: "linear-gradient(145deg, #7c3aed 0%, #5b4ff5 40%, #8b5cf6 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "60px 48px",
    position: "relative",
    overflow: "hidden",
  },

  /* decorative circles */
  circle1: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 350,
    height: 350,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.07)",
    pointerEvents: "none",
  },
  circle2: {
    position: "absolute",
    bottom: -100,
    left: -60,
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.05)",
    pointerEvents: "none",
  },
  circle3: {
    position: "absolute",
    top: "35%",
    left: "10%",
    width: 140,
    height: 140,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.04)",
    pointerEvents: "none",
  },

  /* floating icon grid */
  iconGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
    marginBottom: 40,
    zIndex: 1,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
  },

  rightHeading: {
    fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
    fontWeight: 800,
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: "-0.8px",
    margin: "0 0 14px 0",
    lineHeight: 1.2,
    zIndex: 1,
  },
  rightSub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 1.7,
    maxWidth: 300,
    zIndex: 1,
  },

  /* stat row */
  statRow: {
    display: "flex",
    gap: 24,
    marginTop: 40,
    zIndex: 1,
  },
  statBox: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: "16px 22px",
    textAlign: "center",
    backdropFilter: "blur(8px)",
  },
  statNum: {
    fontSize: 22,
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: "-1px",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: "0.5px",
    marginTop: 2,
  },
};

const ICONS = ["🎓", "⭐", "🤖", "📊", "🏛️", "📝"];

const STATS = [
  { num: "500+", label: "Colleges" },
  { num: "10K+", label: "Reviews" },
  { num: "4.8★", label: "Rated" },
];

/* =========================================================
   COMPONENT
========================================================= */
export default function Login() {
  return (
    <div style={S.page}>

      {/* ════ LEFT: Form ════ */}
      <motion.div
        style={S.left}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Brand */}
        <div style={S.brandRow}>
          <div style={S.brandIcon}>🎓</div>
          <span style={S.brandName}>Collexa</span>
        </div>

        {/* Heading */}
        <motion.h1
          style={S.heading}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Welcome back
        </motion.h1>
        <motion.p
          style={S.subheading}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Please enter your details to continue.
        </motion.p>

        {/* Google button */}
        <motion.button
          style={S.googleBtn}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ borderColor: "#5b4ff5", boxShadow: "0 4px 16px rgba(91,79,245,0.15)" }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Google G icon */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Sign in with Google
        </motion.button>

        {/* Divider */}
        <motion.div
          style={S.divider}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div style={S.dividerLine} />
          <span style={S.dividerText}>OR</span>
          <div style={S.dividerLine} />
        </motion.div>

        {/* Email / Sign in button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Link to="/signin" style={{ textDecoration: "none", display: "block" }}>
            <motion.button
              style={S.emailBtn}
              whileHover={{ translateY: -2, boxShadow: "0 10px 32px rgba(91,79,245,0.45)" }}
              whileTap={{ scale: 0.98 }}
            >
              Sign in with Email →
            </motion.button>
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          style={S.footer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          Don't have an account?
          <Link to="/register" style={S.footerLink}>
            Sign up
          </Link>
        </motion.div>
      </motion.div>


      {/* ════ RIGHT: Illustration ════ */}
      <motion.div
        style={S.right}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Decorative blobs */}
        <div style={S.circle1} />
        <div style={S.circle2} />
        <div style={S.circle3} />

        {/* Floating icon grid */}
        <div style={S.iconGrid}>
          {ICONS.map((icon, i) => (
            <motion.div
              key={i}
              style={S.iconBox}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              whileHover={{ scale: 1.08, background: "rgba(255,255,255,0.2)" }}
            >
              {icon}
            </motion.div>
          ))}
        </div>

        {/* Heading */}
        <motion.h2
          style={S.rightHeading}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Find your perfect<br />college match
        </motion.h2>
        <motion.p
          style={S.rightSub}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Real reviews from real students, powered
          by AI insights to help you decide smarter.
        </motion.p>

        {/* Stats */}
        <motion.div
          style={S.statRow}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          {STATS.map((s, i) => (
            <div key={i} style={S.statBox}>
              <div style={S.statNum}>{s.num}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

    </div>
  );
}
