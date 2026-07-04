import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

import { Link } from "react-router-dom";

/* =========================================================
   THEME
========================================================= */
const getTheme = () =>
  document.documentElement.getAttribute("data-theme") === "dark" ||
  document.body.getAttribute("data-theme") === "dark"
    ? "dark" : "light";

const T = {
  dark: {
    bg:           "#0f0f1f",
    border:       "rgba(255,255,255,0.07)",
    iconRail:     "#13132a",
    iconRailBdr:  "rgba(255,255,255,0.05)",
    text:         "#e8e8f0",
    textMuted:    "#6868a0",
    textFaint:    "#3a3a55",
    itemHover:    "rgba(108,99,255,0.12)",
    itemActive:   "rgba(108,99,255,0.22)",
    activeColor:  "#a78bfa",
    activeBorder: "rgba(108,99,255,0.5)",
    divider:      "rgba(255,255,255,0.06)",
    inputBg:      "rgba(255,255,255,0.05)",
    inputBorder:  "rgba(255,255,255,0.1)",
    historyBg:    "rgba(255,255,255,0.03)",
    historyHover: "rgba(108,99,255,0.1)",
    badgeBg:      "rgba(108,99,255,0.18)",
    badgeColor:   "#a78bfa",
    userBg:       "rgba(255,255,255,0.04)",
    userBorder:   "rgba(255,255,255,0.08)",
    scrollbar:    "rgba(108,99,255,0.2)",
    overlay:      "rgba(0,0,0,0.5)",
    shadow:       "8px 0 48px rgba(0,0,0,0.5)",
    aboutBg:      "rgba(108,99,255,0.06)",
    aboutBorder:  "rgba(108,99,255,0.15)",
  },
  light: {
    bg:           "#ffffff",
    border:       "rgba(0,0,0,0.07)",
    iconRail:     "#f5f5ff",
    iconRailBdr:  "rgba(0,0,0,0.06)",
    text:         "#1a1a2e",
    textMuted:    "#888",
    textFaint:    "#ccc",
    itemHover:    "rgba(108,99,255,0.08)",
    itemActive:   "rgba(108,99,255,0.14)",
    activeColor:  "#5b5fc7",
    activeBorder: "rgba(91,95,199,0.4)",
    divider:      "rgba(0,0,0,0.06)",
    inputBg:      "#f4f4ff",
    inputBorder:  "#dde0ff",
    historyBg:    "#f8f8ff",
    historyHover: "rgba(108,99,255,0.07)",
    badgeBg:      "rgba(108,99,255,0.1)",
    badgeColor:   "#5b5fc7",
    userBg:       "#f8f8ff",
    userBorder:   "rgba(0,0,0,0.07)",
    scrollbar:    "rgba(91,95,199,0.2)",
    overlay:      "rgba(0,0,0,0.25)",
    shadow:       "8px 0 48px rgba(0,0,0,0.12)",
    aboutBg:      "rgba(91,95,199,0.05)",
    aboutBorder:  "rgba(91,95,199,0.15)",
  },
};

/* =========================================================
   NAV ITEMS CONFIG
   ✅ FIX: Every item now has a proper `key` property
   ✅ FIX: College For Me added correctly with key="collegeforme"
========================================================= */
const NAV_ITEMS = [
  { key: "search",       icon: "🔍", label: "New Search"        },
  { key: "history",      icon: "🕐", label: "Search History"    },
  { key: "compare",      icon: "⚖️",  label: "Compare Colleges" },
  { key: "trends",       icon: "📈", label: "Placement Trends"  },
  { key: "shortlist",    icon: "❤️", label: "My Shortlist"      },
  { key: "divider1" },
  { key: "collegeforme", icon: "🎯", label: "College For Me"    }, // ✅ NEW — properly keyed
  { key: "ai",           icon: "🤖", label: "Ask ColleXa AI"    },
  { key: "reviews",      icon: "✏️",  label: "Write a Review"   },

  { key: "admin",        icon: "🛠️", label: "Admin Dashboard" },

  { key: "divider2" },
  { key: "about",        icon: "ℹ️",  label: "About Us"         },
  { key: "help",         icon: "❓", label: "Help & FAQ"        },
];




/* =========================================================
   ABOUT US CONTENT
========================================================= */
const ABOUT_CONTENT = `ColleXa is India's smartest college discovery platform, built by students, for students.

We combine real peer reviews, AI-powered insights, and verified placement data to help you make the most important decision of your life — choosing the right college.

🎯 Our Mission: Make quality college information accessible to every student in India, regardless of background or location.

Built with ❤️ using React, Node.js, MongoDB and Groq AI.`;

/* =========================================================
   HELP FAQ
========================================================= */
const FAQS = [
  { q: "How do I search for a college?",  a: "Use the search bar on the homepage. Type the college name or location and press Search." },
  { q: "Are the reviews verified?",        a: "Reviews are submitted by registered students. Verified badge is given to students who confirm their college email." },
  { q: "How does the AI analysis work?",   a: "ColleXa AI uses Groq's Llama 3.3 model to analyze all student reviews and generate pros, cons, and a neutral summary." },
  { q: "Can I compare colleges?",          a: "Yes! Go to Compare from the navbar or sidebar and select up to 2 colleges to compare side by side." },
  { q: "How do I write a review?",         a: "Visit any college page and click the '✏️ Write Review' button. You need to be logged in." },
];

/* =========================================================
   PLACEMENT TRENDS MINI CHART
========================================================= */
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

const TREND_DATA = {
  "IIT Bombay":   [{ y:"2020",v:22 },{ y:"2021",v:25 },{ y:"2022",v:28 },{ y:"2023",v:35 },{ y:"2024",v:42 }],
  "IIT Delhi":    [{ y:"2020",v:20 },{ y:"2021",v:24 },{ y:"2022",v:27 },{ y:"2023",v:33 },{ y:"2024",v:40 }],
  "IIM Ahmedabad":[{ y:"2020",v:32 },{ y:"2021",v:36 },{ y:"2022",v:40 },{ y:"2023",v:48 },{ y:"2024",v:55 }],
  "BITS Pilani":  [{ y:"2020",v:14 },{ y:"2021",v:17 },{ y:"2022",v:20 },{ y:"2023",v:25 },{ y:"2024",v:30 }],
  "NIT Trichy":   [{ y:"2020",v:10 },{ y:"2021",v:12 },{ y:"2022",v:15 },{ y:"2023",v:18 },{ y:"2024",v:22 }],
};

function PlacementTrends({ C }) {
  const [selected, setSelected] = useState("IIT Bombay");
  const data = TREND_DATA[selected];

  return (
    <div>
      <p style={{ fontSize:11, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:C.textMuted, margin:"0 0 12px" }}>
        Avg Package (LPA)
      </p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
        {Object.keys(TREND_DATA).map(name => (
          <button key={name} onClick={() => setSelected(name)} style={{ padding:"4px 10px", fontSize:11, fontWeight: selected===name ? 700 : 500, fontFamily:"inherit", borderRadius:999, border:`1.5px solid ${selected===name ? C.activeBorder : C.divider}`, background: selected===name ? C.itemActive : "transparent", color: selected===name ? C.activeColor : C.textMuted, cursor:"pointer", transition:"all 0.15s" }}>
            {name.split(" ")[0]} {name.split(" ")[1]?.[0]}.
          </button>
        ))}
      </div>
      <div style={{ background:C.historyBg, border:`1px solid ${C.divider}`, borderRadius:14, padding:"12px 8px 4px" }}>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top:4, right:8, bottom:0, left:-20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.divider} />
            <XAxis dataKey="y" tick={{ fill:C.textMuted, fontSize:10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:C.textMuted, fontSize:10 }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v) => [`₹${v} LPA`, "Avg Package"]}
              contentStyle={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, fontSize:12, color:C.text, boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }}
              cursor={{ stroke:C.activeBorder, strokeWidth:1 }}
            />
            <Line type="monotone" dataKey="v" stroke="#6c63ff" strokeWidth={2.5} dot={{ fill:"#6c63ff", r:4, strokeWidth:0 }} activeDot={{ r:6, fill:"#a78bfa" }} />
          </LineChart>
        </ResponsiveContainer>
        <p style={{ textAlign:"center", fontSize:10.5, color:C.textFaint, margin:"4px 0 0" }}>
          {selected} · 2020–2024
        </p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:12 }}>
        {[
          { label:"2024 Avg",  value:`₹${data[data.length-1].v} LPA` },
          { label:"5yr Growth",value:`+${data[data.length-1].v - data[0].v} LPA` },
        ].map((s, i) => (
          <div key={i} style={{ background:C.itemActive, border:`1px solid ${C.activeBorder}`, borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
            <div style={{ fontSize:15, fontWeight:800, color:C.activeColor }}>{s.value}</div>
            <div style={{ fontSize:10, color:C.textMuted, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN SIDEBAR COMPONENT
========================================================= */
export default function Sidebar({ open, setOpen }) {
  const { user }  = useContext(AuthContext);
  const navigate  = useNavigate();
  const [theme,       setTheme]       = useState(getTheme);
  const [activeKey,   setActiveKey]   = useState(null);
  const [expandedKey, setExpandedKey] = useState(null);
  const [history,     setHistory]     = useState(() => {
    try { return JSON.parse(localStorage.getItem("collexa_search_history") || "[]"); }
    catch { return []; }
  });
  const [openFaq, setOpenFaq] = useState(null);

  const storedProfile = (() => {
    try { return JSON.parse(localStorage.getItem("collexa_profile") || "{}"); } catch { return {}; }
  })();
  const avatar       = localStorage.getItem("collexa_avatar") || "";
  const displayName  = storedProfile.name  || user?.name  || "Student";
  const displayEmail = storedProfile.email || user?.email || "";

  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(getTheme()));
    obs.observe(document.documentElement, { attributes:true, attributeFilter:["data-theme"] });
    obs.observe(document.body,            { attributes:true, attributeFilter:["data-theme"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (open) {
      try { setHistory(JSON.parse(localStorage.getItem("collexa_search_history") || "[]")); }
      catch {}
    }
  }, [open]);

  const C = T[theme];

  /* ── Nav handler ── */
  const handleNav = (key) => {
    setActiveKey(key);
    setExpandedKey(expandedKey === key ? null : key);

    if (key === "search") {
      setOpen(false);
      window.scrollTo({ top:0, behavior:"smooth" });
      setTimeout(() => document.querySelector(".search-box")?.focus(), 400);
      return;
    }
    if (key === "compare")      { setOpen(false); navigate("/compare");        return; }
    if (key === "reviews")      { setOpen(false); navigate("/");               return; }
    if (key === "collegeforme") { setOpen(false); navigate("/college-for-me"); return; } // ✅ NEW
    if (key === "ai") {
      setOpen(false);
      setTimeout(() => document.querySelector(".collexa-fab")?.click(), 300);
      return;
    }
  };

  const clearHistory = () => {
    localStorage.removeItem("collexa_search_history");
    setHistory([]);
  };

  const removeHistoryItem = (idx) => {
    const updated = history.filter((_, i) => i !== idx);
    localStorage.setItem("collexa_search_history", JSON.stringify(updated));
    setHistory(updated);
  };

  /* ── Expandable section renderer ── */
  const renderExpanded = (key) => {
    if (expandedKey !== key) return null;

    if (key === "history") {
      return (
        <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }} style={{ overflow:"hidden" }}>
          <div style={{ padding:"8px 16px 12px" }}>
            {history.length === 0 ? (
              <p style={{ fontSize:12, color:C.textFaint, textAlign:"center", padding:"12px 0", margin:0 }}>No search history yet</p>
            ) : (
              <>
                {history.slice(0, 8).map((item, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", borderRadius:8, cursor:"pointer", marginBottom:3, background:C.historyBg, transition:"background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.historyHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = C.historyBg)}
                  >
                    <span style={{ fontSize:13 }}>🔍</span>
                    <span style={{ flex:1, fontSize:12.5, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
                      onClick={() => { setOpen(false); navigate(`/?q=${encodeURIComponent(item)}`); }}>
                      {item}
                    </span>
                    <button onClick={() => removeHistoryItem(i)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:C.textFaint, padding:0, lineHeight:1 }}
                      onMouseEnter={e => (e.target.style.color = "#ef4444")}
                      onMouseLeave={e => (e.target.style.color = C.textFaint)}>×</button>
                  </div>
                ))}
                <button onClick={clearHistory} style={{ marginTop:8, width:"100%", padding:"7px", fontSize:11, fontWeight:600, fontFamily:"inherit", background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)", borderRadius:8, color:"#ef4444", cursor:"pointer" }}>
                  Clear All History
                </button>
              </>
            )}
          </div>
        </motion.div>
      );
    }

    if (key === "trends") {
      return (
        <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }} style={{ overflow:"hidden" }}>
          <div style={{ padding:"8px 16px 16px" }}><PlacementTrends C={C} /></div>
        </motion.div>
      );
    }

    if (key === "admin") {
    setOpen(false);
    navigate("/admin");
    return;
  }

    if (key === "shortlist") {
      const shortlist = (() => {
        try { return JSON.parse(localStorage.getItem("collexa_shortlist") || "[]"); } catch { return []; }
      })();
      return (
        <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }} style={{ overflow:"hidden" }}>
          <div style={{ padding:"8px 16px 12px" }}>
            {shortlist.length === 0 ? (
              <p style={{ fontSize:12, color:C.textFaint, textAlign:"center", padding:"12px 0", margin:0 }}>No colleges saved yet. Click ❤️ on any college card!</p>
            ) : shortlist.map((c, i) => (
              <div key={i} style={{ display:"flex", gap:8, alignItems:"center", padding:"8px 10px", borderRadius:8, background:C.historyBg, marginBottom:4, cursor:"pointer" }}
                onClick={() => { setOpen(false); navigate(`/college/${c.id}`); }}
                onMouseEnter={e => (e.currentTarget.style.background = C.historyHover)}
                onMouseLeave={e => (e.currentTarget.style.background = C.historyBg)}
              >
                <span style={{ fontSize:14 }}>🏛️</span>
                <span style={{ fontSize:12.5, color:C.text, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      );
    }

    if (key === "about") {
      return (
        <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }} style={{ overflow:"hidden" }}>
          <div style={{ padding:"8px 16px 16px" }}>
            <div style={{ background:C.aboutBg, border:`1px solid ${C.aboutBorder}`, borderRadius:14, padding:"16px" }}>
              <div style={{ fontSize:28, textAlign:"center", marginBottom:10 }}>🎓</div>
              <h3 style={{ fontSize:14, fontWeight:800, color:C.text, margin:"0 0 10px", textAlign:"center" }}>About ColleXa</h3>
              {ABOUT_CONTENT.split("\n\n").map((para, i) => (
                <p key={i} style={{ fontSize:12.5, color:C.textMuted, lineHeight:1.7, margin:"0 0 10px" }}>{para}</p>
              ))}
              <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginTop:10 }}>
                {["React","Node.js","MongoDB","Groq AI","Recharts"].map(tag => (
                  <span key={tag} style={{ fontSize:10.5, padding:"3px 10px", background:C.badgeBg, color:C.badgeColor, borderRadius:999, fontWeight:600, border:`1px solid ${C.activeBorder}` }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      );
    }
    

    if (key === "help") {
      return (
        <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }} style={{ overflow:"hidden" }}>
          <div style={{ padding:"8px 16px 16px" }}>
            <button
              onClick={() => { setOpen(false); setTimeout(() => document.querySelector(".collexa-fab")?.click(), 300); }}
              style={{ width:"100%", padding:"11px", marginBottom:14, background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:12, color:"#fff", fontSize:13, fontWeight:700, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 14px rgba(108,99,255,0.35)" }}
            >
              🤖 Chat with ColleXa AI
            </button>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", color:C.textMuted, margin:"0 0 10px" }}>Frequently Asked</p>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ marginBottom:6 }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width:"100%", padding:"9px 12px", background: openFaq===i ? C.itemActive : C.historyBg, border:`1px solid ${openFaq===i ? C.activeBorder : C.divider}`, borderRadius:10, color: openFaq===i ? C.activeColor : C.text, fontSize:12.5, fontWeight:600, fontFamily:"inherit", cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, transition:"all 0.2s" }}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize:10, flexShrink:0, transition:"transform 0.2s", transform: openFaq===i ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }} style={{ overflow:"hidden" }}>
                      <p style={{ fontSize:12, color:C.textMuted, lineHeight:1.65, margin:0, padding:"8px 12px 4px", borderLeft:`2px solid ${C.activeBorder}`, marginLeft:6, marginTop:4 }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      );
    }

    return null;
  };

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setOpen(false)}
            style={{ position:"fixed", inset:0, background:C.overlay, zIndex:998, backdropFilter:"blur(2px)" }}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{ x: open ? 0 : -300 }}
        transition={{ type:"spring", stiffness:320, damping:32 }}
        style={{ position:"fixed", top:0, left:0, width:300, height:"100vh", background:C.bg, borderRight:`1px solid ${C.border}`, boxShadow: open ? C.shadow : "none", zIndex:999, display:"flex", flexDirection:"column", overflow:"hidden", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}
      >
        {/* ══ HEADER ══ */}
        <div style={{ padding:"20px 20px 16px", borderBottom:`1px solid ${C.divider}`, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#6c63ff,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:"0 4px 12px rgba(108,99,255,0.4)" }}>🎓</div>
              <span style={{ fontSize:17, fontWeight:800, color:C.text, letterSpacing:"-0.3px" }}>ColleXa</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ width:28, height:28, borderRadius:"50%", background:C.historyBg, border:`1px solid ${C.divider}`, cursor:"pointer", fontSize:12, color:C.textMuted, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>

          {user && (
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:C.userBg, border:`1px solid ${C.userBorder}`, borderRadius:14 }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background: avatar ? "transparent" : "linear-gradient(135deg,#6c63ff,#4f46e5)", border:"2px solid rgba(108,99,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, overflow:"hidden", flexShrink:0 }}>
                {avatar ? <img src={avatar} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" /> : (displayName[0] || "S").toUpperCase()}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{displayName}</div>
                <div style={{ fontSize:11, color:C.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{displayEmail}</div>
              </div>
              <span style={{ marginLeft:"auto", fontSize:10.5, padding:"2px 8px", background:C.badgeBg, color:C.badgeColor, borderRadius:999, fontWeight:700, flexShrink:0 }}>{user?.role === "admin" ? "Admin" : "Student"}</span>
            </div>
          )}
        </div>

        {/* ══ NAV ITEMS ══ */}
        <div className="sb-scroll" style={{ flex:1, overflowY:"auto", padding:"10px 12px" }}>
          <style>{`
            .sb-scroll::-webkit-scrollbar { width: 4px; }
            .sb-scroll::-webkit-scrollbar-thumb { background: ${C.scrollbar}; border-radius: 99px; }
          `}</style>

          {NAV_ITEMS.map((item, idx) => {

            // ✅ SAFETY GUARD — skip any item without a key
            if (!item.key) return null;

            // Dividers
            if (item.key.startsWith("divider")) {
              return <div key={idx} style={{ height:1, background:C.divider, margin:"8px 4px" }} />;
            }

            const isActive   = activeKey   === item.key;
            const isExpanded = expandedKey === item.key;
            const expandableKeys = ["history","trends","shortlist","about","help"];

            return (
              <div key={item.key}>
                <motion.button
                  onClick={() => handleNav(item.key)}
                  whileTap={{ scale:0.97 }}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:12, border:`1px solid ${isActive ? C.activeBorder : "transparent"}`, background: isActive ? C.itemActive : "transparent", cursor:"pointer", fontFamily:"inherit", marginBottom:2, transition:"all 0.15s" }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.itemHover; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ width:34, height:34, borderRadius:10, background: isActive ? C.itemActive : C.historyBg, border:`1px solid ${isActive ? C.activeBorder : C.divider}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, transition:"all 0.15s" }}>
                    {item.icon}
                  </span>
                  <span style={{ flex:1, fontSize:13.5, fontWeight: isActive ? 700 : 500, color: isActive ? C.activeColor : C.text, textAlign:"left", transition:"color 0.15s" }}>
                    {item.label}
                  </span>

                  {/* NEW badge only for College For Me */}
                  {item.key === "collegeforme" && (
                    <span style={{ fontSize:9.5, padding:"2px 7px", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", color:"#fff", borderRadius:999, fontWeight:700, flexShrink:0 }}>
                      NEW
                    </span>
                  )}

                  {/* Chevron for expandable items */}
                  {expandableKeys.includes(item.key) && (
                    <span style={{ fontSize:10, color:C.textMuted, transition:"transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {renderExpanded(item.key)}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* ══ FOOTER ══ */}
        <div style={{ padding:"14px 20px", borderTop:`1px solid ${C.divider}`, flexShrink:0 }}>
          <p style={{ margin:0, fontSize:10.5, color:C.textFaint, textAlign:"center", lineHeight:1.6 }}>
            ColleXa v1.0<br />
            <span style={{ color:C.textMuted }}>Powered by Groq Llama 3.3</span>
          </p>
        </div>
      </motion.div>
    </>
  );
}
