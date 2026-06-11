// frontend/src/components/StudentProfile.jsx

import React, { useState, useEffect, useContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

/* =========================================================
   THEME
========================================================= */
const getTheme = () =>
  document.documentElement.getAttribute("data-theme") === "dark" ||
  document.body.getAttribute("data-theme") === "dark"
    ? "dark" : "light";

const T = {
  dark: {
    overlay:      "rgba(0,0,0,0.55)",
    panel:        "#13132a",
    panelBorder:  "rgba(255,255,255,0.07)",
    header:       "linear-gradient(135deg,#1e1b4b,#312e81)",
    cardBg:       "rgba(255,255,255,0.04)",
    cardBorder:   "rgba(255,255,255,0.08)",
    text:         "#e8e8f0",
    textMuted:    "#7c7c9a",
    textFaint:    "#3a3a55",
    inputBg:      "rgba(255,255,255,0.06)",
    inputBorder:  "rgba(255,255,255,0.12)",
    inputText:    "#e8e8f0",
    labelColor:   "#a78bfa",
    divider:      "rgba(255,255,255,0.06)",
    statBg:       "rgba(124,58,237,0.12)",
    statBorder:   "rgba(124,58,237,0.2)",
    badgeBg:      "rgba(124,58,237,0.15)",
    badgeBorder:  "rgba(124,58,237,0.3)",
    badgeColor:   "#a78bfa",
    saveBg:       "linear-gradient(135deg,#7c3aed,#4f46e5)",
    scrollbar:    "rgba(124,58,237,0.2)",
  },
  light: {
    overlay:      "rgba(0,0,0,0.35)",
    panel:        "#ffffff",
    panelBorder:  "rgba(0,0,0,0.08)",
    header:       "linear-gradient(135deg,#5b5fc7,#3b82f6)",
    cardBg:       "#f8f8ff",
    cardBorder:   "rgba(0,0,0,0.07)",
    text:         "#1a1a2e",
    textMuted:    "#666",
    textFaint:    "#ccc",
    inputBg:      "#f4f4ff",
    inputBorder:  "#ddddf0",
    inputText:    "#1a1a2e",
    labelColor:   "#5b5fc7",
    divider:      "rgba(0,0,0,0.06)",
    statBg:       "rgba(91,95,199,0.08)",
    statBorder:   "rgba(91,95,199,0.18)",
    badgeBg:      "rgba(91,95,199,0.1)",
    badgeBorder:  "rgba(91,95,199,0.25)",
    badgeColor:   "#5b5fc7",
    saveBg:       "linear-gradient(135deg,#5b5fc7,#3b82f6)",
    scrollbar:    "rgba(91,95,199,0.2)",
  },
};

/* =========================================================
   AVATAR COMPONENT
========================================================= */
function AvatarCircle({ src, name, size = 88, editable = false, onUpload }) {
  const inputRef = useRef(null);
  const initials = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width:          size,
        height:         size,
        borderRadius:   "50%",
        overflow:       "hidden",
        border:         "3px solid rgba(255,255,255,0.4)",
        boxShadow:      "0 6px 24px rgba(0,0,0,0.25)",
        background:     src ? "transparent" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       size * 0.32,
        fontWeight:     700,
        color:          "#fff",
        cursor:         editable ? "pointer" : "default",
      }}
        onClick={() => editable && inputRef.current?.click()}
      >
        {src
          ? <img src={src} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : initials
        }
      </div>

      {/* Edit badge */}
      {editable && (
        <motion.div
          whileHover={{ scale: 1.15 }}
          onClick={() => inputRef.current?.click()}
          style={{
            position:       "absolute",
            bottom:         2,
            right:          2,
            width:          26,
            height:         26,
            borderRadius:   "50%",
            background:     "linear-gradient(135deg,#7c3aed,#4f46e5)",
            border:         "2.5px solid #fff",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            cursor:         "pointer",
            fontSize:       12,
            boxShadow:      "0 2px 8px rgba(124,58,237,0.4)",
          }}
        >
          📷
        </motion.div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => onUpload?.(ev.target.result);
          reader.readAsDataURL(file);
        }}
      />
    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */
function InfoRow({ icon, label, value, C }) {
  return (
    <div style={{
      display:      "flex",
      alignItems:   "center",
      gap:          12,
      padding:      "10px 0",
      borderBottom: `1px solid ${C.divider}`,
    }}>
      <div style={{
        width:          34,
        height:         34,
        borderRadius:   10,
        background:     C.statBg,
        border:         `1px solid ${C.statBorder}`,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       16,
        flexShrink:     0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10.5, color: C.textMuted, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 1 }}>
          {label}
        </div>
        <div style={{ fontSize: 13.5, color: C.text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || <span style={{ color: C.textFaint, fontWeight: 400 }}>Not set</span>}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EDITABLE FIELD
========================================================= */
function EditField({ label, value, onChange, type = "text", placeholder, C }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: C.labelColor, marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:        "100%",
          padding:      "10px 14px",
          fontSize:     14,
          fontFamily:   "inherit",
          background:   C.inputBg,
          border:       `1.5px solid ${C.inputBorder}`,
          borderRadius: 10,
          color:        C.inputText,
          outline:      "none",
          boxSizing:    "border-box",
          transition:   "border-color 0.2s, box-shadow 0.2s",
        }}
        onFocus={e => {
          e.target.style.borderColor = "#7c3aed";
          e.target.style.boxShadow   = "0 0 0 3px rgba(124,58,237,0.12)";
        }}
        onBlur={e => {
          e.target.style.borderColor = C.inputBorder;
          e.target.style.boxShadow   = "none";
        }}
      />
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function StudentProfile({ open, onClose }) {
  const { user, logout } = useContext(AuthContext);
  const [theme,    setTheme]    = useState(getTheme);
  const [tab,      setTab]      = useState("profile"); // "profile" | "edit"
  const [avatar,   setAvatar]   = useState(() => localStorage.getItem("collexa_avatar") || "");
  const [saved,    setSaved]    = useState(false);

  // Editable fields
  const [name,     setName]     = useState(user?.name     || "");
  const [email,    setEmail]    = useState(user?.email    || "");
  const [age,      setAge]      = useState(user?.age      || "");
  const [phone,    setPhone]    = useState(user?.phone    || "");
  const [college,  setCollege]  = useState(user?.college  || "");
  const [course,   setCourse]   = useState(user?.course   || "");
  const [bio,      setBio]      = useState(user?.bio      || "");

  /* theme observer */
  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(getTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    obs.observe(document.body,            { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  /* load stored profile data */
  useEffect(() => {
    const stored = localStorage.getItem("collexa_profile");
    if (stored) {
      const p = JSON.parse(stored);
      if (p.name)    setName(p.name);
      if (p.email)   setEmail(p.email);
      if (p.age)     setAge(p.age);
      if (p.phone)   setPhone(p.phone);
      if (p.college) setCollege(p.college);
      if (p.course)  setCourse(p.course);
      if (p.bio)     setBio(p.bio);
    } else if (user) {
      setName(user.name   || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const C = T[theme];

  const handleAvatarUpload = (dataUrl) => {
    setAvatar(dataUrl);
    localStorage.setItem("collexa_avatar", dataUrl);
  };

  const handleSave = () => {
    const profile = { name, email, age, phone, college, course, bio };
    localStorage.setItem("collexa_profile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => { setSaved(false); setTab("profile"); }, 1400);
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "Recently joined";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Overlay ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0,
              background: C.overlay,
              zIndex: 10001,
              backdropFilter: "blur(2px)",
            }}
          />

          {/* ── Panel ── */}
          <motion.div
            initial={{ x: -380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -380, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            style={{
              position:      "fixed",
              top:           0,
              left:          0,
              width:         360,
              height:        "100vh",
              background:    C.panel,
              border:        `1px solid ${C.panelBorder}`,
              borderLeft:    "none",
              zIndex:        10002,
              display:       "flex",
              flexDirection: "column",
              overflow:      "hidden",
              fontFamily:    "'DM Sans','Segoe UI',sans-serif",
              boxShadow:     "8px 0 40px rgba(0,0,0,0.25)",
            }}
          >

            {/* ══ HEADER ══ */}
            <div style={{
              background:   C.header,
              padding:      "28px 24px 52px",
              position:     "relative",
              overflow:     "hidden",
              flexShrink:   0,
            }}>
              {/* Decorative blobs */}
              <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

              {/* Close */}
              <button
                onClick={onClose}
                style={{
                  position:       "absolute", top: 16, right: 16,
                  width:          30, height: 30, borderRadius: "50%",
                  background:     "rgba(255,255,255,0.18)",
                  border:         "none", cursor: "pointer",
                  color:          "#fff", fontSize: 14, fontWeight: 700,
                  display:        "flex", alignItems: "center",
                  justifyContent: "center",
                  transition:     "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.3)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
              >
                ✕
              </button>

              {/* Avatar + name */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <AvatarCircle
                  src={avatar}
                  name={name || user?.name}
                  size={88}
                  editable
                  onUpload={handleAvatarUpload}
                />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>
                    {name || user?.name || "Student"}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 3 }}>
                    {email || user?.email || ""}
                  </div>
                </div>
              </div>

              {/* Wave bottom */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
                <svg viewBox="0 0 360 28" preserveAspectRatio="none" style={{ width: "100%", height: 28, display: "block" }}>
                  <path d="M0,16 C90,28 180,4 270,16 C315,22 340,10 360,16 L360,28 L0,28 Z" fill={C.panel} />
                </svg>
              </div>
            </div>


            {/* ══ TABS ══ */}
            <div style={{
              display:     "flex",
              gap:         0,
              padding:     "0 20px",
              marginTop:   8,
              marginBottom: 4,
              flexShrink:  0,
            }}>
              {[
                { key: "profile", label: "👤 Profile" },
                { key: "edit",    label: "✏️ Edit" },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    flex:         1,
                    padding:      "9px 0",
                    fontSize:     13,
                    fontWeight:   tab === t.key ? 700 : 500,
                    fontFamily:   "inherit",
                    background:   "none",
                    border:       "none",
                    borderBottom: `2.5px solid ${tab === t.key ? "#7c3aed" : "transparent"}`,
                    color:        tab === t.key ? "#7c3aed" : C.textMuted,
                    cursor:       "pointer",
                    transition:   "all 0.2s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>


            {/* ══ CONTENT ══ */}
            <div style={{
              flex:      1,
              overflowY: "auto",
              padding:   "12px 20px 24px",
            }}>
              <style>{`
                .sp-scroll::-webkit-scrollbar { width: 4px; }
                .sp-scroll::-webkit-scrollbar-thumb { background: ${C.scrollbar}; border-radius: 99px; }
              `}</style>

              <AnimatePresence mode="wait">

                {/* ─── PROFILE TAB ─── */}
                {tab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.22 }}
                  >
                    {/* Stats row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                      {[
                        { icon: "📝", label: "Reviews",  value: "—" },
                        { icon: "🎓", label: "Saved",    value: "—" },
                      ].map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.07 }}
                          style={{
                            background:   C.statBg,
                            border:       `1px solid ${C.statBorder}`,
                            borderRadius: 14,
                            padding:      "14px 16px",
                            textAlign:    "center",
                          }}
                        >
                          <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{s.value}</div>
                          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 500 }}>{s.label}</div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Info rows */}
                    <div style={{
                      background:   C.cardBg,
                      border:       `1px solid ${C.cardBorder}`,
                      borderRadius: 16,
                      padding:      "6px 16px 2px",
                      marginBottom: 16,
                    }}>
                      <InfoRow icon="👤" label="Full Name"  value={name    || user?.name}  C={C} />
                      <InfoRow icon="✉️" label="Email"      value={email   || user?.email} C={C} />
                      <InfoRow icon="🎂" label="Age"        value={age ? `${age} years` : null} C={C} />
                      <InfoRow icon="📱" label="Phone"      value={phone}  C={C} />
                      <InfoRow icon="🏛️" label="College"    value={college} C={C} />
                      <InfoRow icon="📚" label="Course"     value={course}  C={C} />
                    </div>

                    {/* Bio */}
                    {bio && (
                      <div style={{
                        background:   C.cardBg,
                        border:       `1px solid ${C.cardBorder}`,
                        borderRadius: 16,
                        padding:      "14px 16px",
                        marginBottom: 16,
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: C.textMuted, marginBottom: 8 }}>
                          About Me
                        </div>
                        <p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.7, margin: 0 }}>
                          {bio}
                        </p>
                      </div>
                    )}

                    {/* Member since badge */}
                    <div style={{
                      display:        "flex",
                      alignItems:     "center",
                      gap:            8,
                      padding:        "10px 14px",
                      background:     C.badgeBg,
                      border:         `1px solid ${C.badgeBorder}`,
                      borderRadius:   12,
                      marginBottom:   16,
                    }}>
                      <span style={{ fontSize: 16 }}>🗓️</span>
                      <span style={{ fontSize: 12.5, color: C.badgeColor, fontWeight: 600 }}>
                        Member since {memberSince}
                      </span>
                    </div>

                    {/* Logout button */}
                    <motion.button
                      onClick={() => { logout?.(); onClose(); }}
                      whileHover={{ translateY: -2 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        width:        "100%",
                        padding:      "11px",
                        background:   "rgba(239,68,68,0.08)",
                        border:       "1.5px solid rgba(239,68,68,0.2)",
                        borderRadius: 12,
                        color:        "#ef4444",
                        fontSize:     14,
                        fontWeight:   700,
                        fontFamily:   "inherit",
                        cursor:       "pointer",
                        transition:   "all 0.2s",
                        display:      "flex",
                        alignItems:   "center",
                        justifyContent: "center",
                        gap:          8,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.14)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                    >
                      🚪 Log Out
                    </motion.button>
                  </motion.div>
                )}

                {/* ─── EDIT TAB ─── */}
                {tab === "edit" && (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.22 }}
                  >
                    {/* Avatar re-upload prompt */}
                    <div style={{
                      display:        "flex",
                      alignItems:     "center",
                      gap:            14,
                      padding:        "14px 16px",
                      background:     C.cardBg,
                      border:         `1px solid ${C.cardBorder}`,
                      borderRadius:   16,
                      marginBottom:   18,
                    }}>
                      <AvatarCircle
                        src={avatar}
                        name={name || user?.name}
                        size={54}
                        editable
                        onUpload={handleAvatarUpload}
                      />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>
                          Profile Photo
                        </div>
                        <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>
                          Click the photo or 📷 icon to upload
                        </div>
                      </div>
                    </div>

                    <EditField label="Full Name"    value={name}    onChange={setName}    placeholder="Your full name"         C={C} />
                    <EditField label="Email"        value={email}   onChange={setEmail}   placeholder="you@example.com" type="email" C={C} />
                    <EditField label="Age"          value={age}     onChange={setAge}     placeholder="e.g. 20"  type="number"   C={C} />
                    <EditField label="Phone Number" value={phone}   onChange={setPhone}   placeholder="+91 XXXXX XXXXX"       C={C} />
                    <EditField label="College"      value={college} onChange={setCollege} placeholder="Your college name"      C={C} />
                    <EditField label="Course"       value={course}  onChange={setCourse}  placeholder="e.g. B.Tech CSE"       C={C} />

                    {/* Bio textarea */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: C.labelColor, marginBottom: 6 }}>
                        About Me
                      </label>
                      <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="A short bio about yourself..."
                        rows={3}
                        style={{
                          width:        "100%",
                          padding:      "10px 14px",
                          fontSize:     14,
                          fontFamily:   "inherit",
                          background:   C.inputBg,
                          border:       `1.5px solid ${C.inputBorder}`,
                          borderRadius: 10,
                          color:        C.inputText,
                          outline:      "none",
                          boxSizing:    "border-box",
                          resize:       "vertical",
                          transition:   "border-color 0.2s, box-shadow 0.2s",
                          minHeight:    80,
                        }}
                        onFocus={e => {
                          e.target.style.borderColor = "#7c3aed";
                          e.target.style.boxShadow   = "0 0 0 3px rgba(124,58,237,0.12)";
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = C.inputBorder;
                          e.target.style.boxShadow   = "none";
                        }}
                      />
                    </div>

                    {/* Save button */}
                    <motion.button
                      onClick={handleSave}
                      whileHover={{ translateY: -2, boxShadow: "0 8px 24px rgba(124,58,237,0.4)" }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        width:        "100%",
                        padding:      "13px",
                        background:   saved ? "linear-gradient(135deg,#22c55e,#16a34a)" : C.saveBg,
                        border:       "none",
                        borderRadius: 12,
                        color:        "#fff",
                        fontSize:     14,
                        fontWeight:   700,
                        fontFamily:   "inherit",
                        cursor:       "pointer",
                        boxShadow:    "0 4px 16px rgba(124,58,237,0.3)",
                        transition:   "background 0.3s",
                        display:      "flex",
                        alignItems:   "center",
                        justifyContent: "center",
                        gap:          6,
                      }}
                    >
                      {saved ? "✓ Saved!" : "💾 Save Changes"}
                    </motion.button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
