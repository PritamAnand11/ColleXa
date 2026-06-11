// frontend/src/components/Chatbot.jsx

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

/* =========================================================
   SUGGESTION CHIPS  (shown after greeting)
========================================================= */
const SUGGESTIONS = [
  "IIT JEE cutoffs for CSE ",
  "Compare IIT Bombay vs IIT Delhi ",
  "Best MBA colleges in India ",
  "IIM Ahmedabad admission process ",
  "BITS Pilani fees & placements ",
  "Top NITs for ECE branch ",
];

/* =========================================================
   TYPING DOTS
========================================================= */
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, padding: "2px 2px", alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          style={{
            display: "block", width: 8, height: 8,
            borderRadius: "50%", background: "#5b5fc7",
          }}
          animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.65, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

/* =========================================================
   INLINE BOLD PARSER  — turns **text** into <strong>
========================================================= */
function inlineBold(text) {
  // Also strip any stray leading * or # that aren't part of markdown syntax
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
}

/* =========================================================
   PARSE & RENDER AI TEXT  — full markdown-aware renderer
   Handles: headings (#), bold bullets (* **Heading:**),
   plain bullets (- / * / •), numbered lists, blank lines,
   inline bold/italic
========================================================= */
function BotText({ text }) {
  // Normalize: collapse 3+ newlines → 2
  const normalized = text.replace(/\n{3,}/g, "\n\n").trim();
  const lines = normalized.split("\n");

  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const raw  = lines[i];
    const line = raw.trim();

    // ── blank line → small spacer
    if (line === "") {
      elements.push(<div key={i} style={{ height: 6 }} />);
      i++;
      continue;
    }

    // ── heading: ### or ## or #
    if (/^#{1,3}\s/.test(line)) {
      const txt = line.replace(/^#{1,3}\s/, "");
      elements.push(
        <div key={i} style={{
          fontSize: 13, fontWeight: 800, color: "#3b3b9e",
          letterSpacing: "0.2px", margin: "10px 0 4px",
          borderBottom: "1.5px solid #e8e8f8", paddingBottom: 4,
        }}
          dangerouslySetInnerHTML={{ __html: inlineBold(txt) }}
        />
      );
      i++;
      continue;
    }

    // ── bullet line: starts with * , - , • (with optional leading spaces)
    if (/^(\s*)[\*\-•]\s/.test(raw)) {
      const indent = (raw.match(/^(\s*)/)?.[1]?.length || 0);
      const isNested = indent >= 2;
      const content  = line.replace(/^[\*\-•]\s+/, "");

      // detect "* **BoldHeading:**" pattern → render as section heading
      const headingMatch = content.match(/^\*\*(.+?)\*\*:?\s*(.*)$/);
      if (headingMatch && !isNested) {
        const heading  = headingMatch[1].replace(/:$/, "");
        const rest     = headingMatch[2];
        elements.push(
          <div key={i} style={{ margin: "8px 0 3px" }}>
            <span style={{
              display:      "inline-block",
              fontSize:     12.5,
              fontWeight:   800,
              color:        "#5b5fc7",
              background:   "rgba(91,95,199,0.1)",
              borderRadius: 6,
              padding:      "2px 8px",
              letterSpacing:"0.2px",
            }}>
              {heading}
            </span>
            {rest && (
              <span style={{ fontSize: 13.5, color: "#1e1e2e", marginLeft: 6 }}
                dangerouslySetInnerHTML={{ __html: inlineBold(rest) }}
              />
            )}
          </div>
        );
      } else {
        elements.push(
          <div key={i} style={{
            display:    "flex",
            gap:        8,
            marginBottom: 3,
            marginLeft: isNested ? 16 : 0,
            alignItems: "flex-start",
          }}>
            <span style={{
              color:      isNested ? "#a5b4fc" : "#5b5fc7",
              fontWeight: 700,
              fontSize:   isNested ? 10 : 14,
              lineHeight: 1.65,
              flexShrink: 0,
              marginTop:  isNested ? 4 : 0,
            }}>
              {isNested ? "◦" : "•"}
            </span>
            <span
              style={{ fontSize: 13.5, color: "#1e1e2e", lineHeight: 1.65 }}
              dangerouslySetInnerHTML={{ __html: inlineBold(content) }}
            />
          </div>
        );
      }
      i++;
      continue;
    }

    // ── numbered list:  1. or 1)
    const numMatch = line.match(/^(\d+)[.)]\s+(.+)$/);
    if (numMatch) {
      elements.push(
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 3, alignItems: "flex-start" }}>
          <span style={{
            minWidth:       20,
            height:         20,
            borderRadius:   "50%",
            background:     "#5b5fc7",
            color:          "#fff",
            fontSize:       11,
            fontWeight:     700,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
            marginTop:      2,
          }}>
            {numMatch[1]}
          </span>
          <span
            style={{ fontSize: 13.5, color: "#1e1e2e", lineHeight: 1.65 }}
            dangerouslySetInnerHTML={{ __html: inlineBold(numMatch[2]) }}
          />
        </div>
      );
      i++;
      continue;
    }

    // ── plain paragraph (strip any lone leading * that slipped through)
    const cleanLine = line.replace(/^\*+\s*/, "");
    elements.push(
      <p key={i} style={{ margin: "0 0 4px", fontSize: 13.5, color: "#1e1e2e", lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: inlineBold(cleanLine) }}
      />
    );
    i++;
  }

  return <div style={{ margin: 0 }}>{elements}</div>;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function Chatbot() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [unread,   setUnread]   = useState(0);
  const [showSugg, setShowSugg] = useState(true);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  /* scroll to bottom on new message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* focus + clear unread when opened */
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  /* greeting message on first open */
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "Hi 👋 I'm ColleXa AI!\n\nAsk me anything about Indian Colleges: Admissions, Placements, Cutoffs, Campus life, Fees, and More.",
        id: Date.now(),
      }]);
    }
  }, [open]);

  /* ── send message ── */
  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    // strip emoji suffix from suggestion chips
    const cleanMsg = msg.replace(/\s[\u{1F300}-\u{1FAFF}]/gu, "").trim();
    if (!cleanMsg || loading) return;

    setInput("");
    setShowSugg(false);

    const userMsg = { role: "user", content: cleanMsg, id: Date.now() };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const payload = history
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role, content: m.content }));

      const { data } = await axios.post("http://localhost:5000/api/chat", { messages: payload });

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.reply, id: Date.now() },
      ]);
      if (!open) setUnread(n => n + 1);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again!", id: Date.now(), err: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([]);
    setShowSugg(true);
    setTimeout(() => setMessages([{
      role: "assistant",
      content: "Hi 👋 I'm ColleXa AI!\n\nAsk me anything about Indian colleges — admissions, placements, cutoffs, campus life, fees, and more.",
      id: Date.now(),
    }]), 80);
  };

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <>
      {/* ════════════════════════════════
          CHAT WINDOW
      ════════════════════════════════ */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 28, scale: 0.94  }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            style={{
              position:      "fixed",
              bottom:        90,
              right:         24,
              width:         360,
              height:        570,
              borderRadius:  20,
              overflow:      "hidden",
              display:       "flex",
              flexDirection: "column",
              background:    "#ffffff",
              boxShadow:     "0 16px 56px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.08)",
              border:        "1px solid rgba(0,0,0,0.06)",
              zIndex:        9999,
              fontFamily:    "'DM Sans', 'Segoe UI', sans-serif",
            }}
          >

            {/* ══ HEADER with wave ══ */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              {/* gradient background */}
              <div style={{
                background:  "linear-gradient(135deg, #5b5fc7 0%, #3b82f6 100%)",
                padding:     "18px 18px 36px",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

                  {/* Avatar + name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{
                      width:          44,
                      height:         44,
                      borderRadius:   "50%",
                      background:     "rgba(255,255,255,0.22)",
                      border:         "2.5px solid rgba(255,255,255,0.55)",
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      fontSize:       21,
                      boxShadow:      "0 4px 14px rgba(0,0,0,0.18)",
                    }}>🎓</div>

                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.2px" }}>
                        ColleXa AI
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                        <span style={{
                          width: 7, height: 7, borderRadius: "50%",
                          background: "#4ade80",
                          boxShadow:  "0 0 5px #4ade80",
                          display:    "inline-block",
                        }} />
                        <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.82)", fontWeight: 500 }}>
                          Online · College Expert
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 7 }}>
                    {[
                      { icon: "🗑", title: "Clear chat", action: clearChat },
                      { icon: "✕", title: "Close",      action: () => setOpen(false) },
                    ].map(btn => (
                      <button
                        key={btn.title}
                        onClick={btn.action}
                        title={btn.title}
                        style={{
                          width:          32,
                          height:         32,
                          borderRadius:   "50%",
                          background:     "rgba(255,255,255,0.18)",
                          border:         "none",
                          cursor:         "pointer",
                          fontSize:       btn.icon === "✕" ? 14 : 15,
                          fontWeight:     700,
                          color:          "#fff",
                          display:        "flex",
                          alignItems:     "center",
                          justifyContent: "center",
                          transition:     "background 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.30)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
                      >
                        {btn.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Wave SVG */}
              <div style={{
                position:   "absolute",
                bottom:     0,
                left:       0,
                right:      0,
                lineHeight: 0,
              }}>
                <svg
                  viewBox="0 0 360 32"
                  preserveAspectRatio="none"
                  style={{ width: "100%", height: 32, display: "block" }}
                >
                  <path
                    d="M0,20 C60,36 120,4 180,20 C240,36 300,4 360,20 L360,32 L0,32 Z"
                    fill="#ffffff"
                  />
                </svg>
              </div>
            </div>


            {/* ══ MESSAGES AREA ══ */}
            <div
              className="collexa-chat-scroll"
              style={{
                flex:          1,
                overflowY:     "auto",
                padding:       "4px 16px 12px",
                display:       "flex",
                flexDirection: "column",
                gap:           10,
                background:    "#ffffff",
              }}
            >
              <style>{`
                .collexa-chat-scroll::-webkit-scrollbar { width: 4px; }
                .collexa-chat-scroll::-webkit-scrollbar-thumb { background: rgba(91,95,199,0.18); border-radius: 99px; }
                .collexa-chat-scroll::-webkit-scrollbar-track { background: transparent; }
              `}</style>

              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display:        "flex",
                    flexDirection:  msg.role === "user" ? "row-reverse" : "row",
                    alignItems:     "flex-end",
                    gap:            8,
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width:          28,
                    height:         28,
                    borderRadius:   "50%",
                    flexShrink:     0,
                    background:     msg.role === "user"
                      ? "linear-gradient(135deg,#f59e0b,#ef4444)"
                      : "linear-gradient(135deg,#5b5fc7,#3b82f6)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontSize:       13,
                    boxShadow:      msg.role === "user"
                      ? "0 2px 8px rgba(245,158,11,0.35)"
                      : "0 2px 8px rgba(91,95,199,0.35)",
                  }}>
                    {msg.role === "user" ? "🧑" : "🎓"}
                  </div>

                  {/* Bubble */}
                  <div style={{
                    maxWidth:     "76%",
                    padding:      "11px 15px",
                    borderRadius: msg.role === "user"
                      ? "18px 4px 18px 18px"
                      : "4px 18px 18px 18px",
                    background:   msg.role === "user"
                      ? "linear-gradient(135deg,#5b5fc7,#3b82f6)"
                      : "#f4f5ff",
                    boxShadow:    msg.role === "user"
                      ? "0 4px 16px rgba(91,95,199,0.38)"
                      : "0 2px 6px rgba(0,0,0,0.06)",
                    border:       msg.role === "user" ? "none" : "1px solid #e8e8f8",
                  }}>
                    {msg.role === "user" ? (
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "#fff" }}>
                        {msg.content}
                      </p>
                    ) : (
                      <BotText text={msg.content} />
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ display: "flex", alignItems: "flex-end", gap: 8 }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: "linear-gradient(135deg,#5b5fc7,#3b82f6)",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 13,
                      boxShadow: "0 2px 8px rgba(91,95,199,0.3)",
                      flexShrink: 0,
                    }}>🎓</div>
                    <div style={{
                      padding:      "11px 16px",
                      borderRadius: "4px 18px 18px 18px",
                      background:   "#f4f5ff",
                      border:       "1px solid #e8e8f8",
                      boxShadow:    "0 2px 6px rgba(0,0,0,0.06)",
                    }}>
                      <TypingDots />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Suggestion pill buttons */}
              {showSugg && messages.length <= 1 && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}
                >
                  <p style={{
                    fontSize: 11, color: "#9ca3af", textAlign: "center",
                    textTransform: "uppercase", letterSpacing: "0.8px",
                    fontWeight: 600, margin: "0 0 2px",
                  }}>
                    Quick questions
                  </p>
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={i}
                      onClick={() => sendMessage(s)}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 + i * 0.07 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        padding:      "9px 18px",
                        borderRadius: 999,
                        border:       "2px solid #d4d4f7",
                        background:   "#fff",
                        color:        "#5b5fc7",
                        fontSize:     13,
                        fontWeight:   600,
                        cursor:       "pointer",
                        fontFamily:   "inherit",
                        textAlign:    "left",
                        transition:   "all 0.15s",
                        boxShadow:    "0 1px 4px rgba(91,95,199,0.08)",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background    = "#eeeeff";
                        e.currentTarget.style.borderColor   = "#5b5fc7";
                        e.currentTarget.style.boxShadow     = "0 3px 12px rgba(91,95,199,0.18)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background    = "#fff";
                        e.currentTarget.style.borderColor   = "#d4d4f7";
                        e.currentTarget.style.boxShadow     = "0 1px 4px rgba(91,95,199,0.08)";
                      }}
                    >
                      {s}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>


            {/* ══ INPUT BAR ══ */}
            <div style={{
              padding:    "10px 16px 12px",
              background: "#fff",
              borderTop:  "1px solid #f0f0f8",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Enter your message..."
                  style={{
                    flex:         1,
                    height:       44,
                    padding:      "0 16px",
                    fontSize:     14,
                    fontFamily:   "inherit",
                    background:   "#f6f6fd",
                    border:       "1.5px solid #e0e0f4",
                    borderRadius: 999,
                    color:        "#1e1e2e",
                    outline:      "none",
                    transition:   "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "#5b5fc7";
                    e.target.style.boxShadow   = "0 0 0 3px rgba(91,95,199,0.12)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "#e0e0f4";
                    e.target.style.boxShadow   = "none";
                  }}
                />

                {/* Send button */}
                <motion.button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  whileHover={input.trim() && !loading ? { scale: 1.1  } : {}}
                  whileTap={  input.trim() && !loading ? { scale: 0.92 } : {}}
                  style={{
                    width:          44,
                    height:         44,
                    borderRadius:   "50%",
                    flexShrink:     0,
                    background:     input.trim() && !loading
                      ? "linear-gradient(135deg,#5b5fc7,#3b82f6)"
                      : "#e8e8f6",
                    border:         "none",
                    cursor:         input.trim() && !loading ? "pointer" : "not-allowed",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    boxShadow:      input.trim() && !loading
                      ? "0 4px 14px rgba(91,95,199,0.45)"
                      : "none",
                    transition:     "all 0.2s",
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
                      stroke={input.trim() && !loading ? "#fff" : "#b0b0d0"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
              </div>

              {/* Powered by */}
              <p style={{
                textAlign:  "center",
                marginTop:  8,
                marginBottom: 0,
                fontSize:   10.5,
                color:      "#c0c0d8",
                letterSpacing: "0.2px",
              }}>
                Powered by <strong style={{ color: "#5b5fc7" }}>ColleXa AI</strong>
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>


      {/* ════════════════════════════════
          FLOATING TOGGLE BUTTON
      ════════════════════════════════ */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{   scale: 0.92 }}
        animate={open ? {} : {
          y: [0, -6, 0],
          transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{
          position:       "fixed",
          bottom:         24,
          right:          24,
          width:          56,
          height:         56,
          borderRadius:   "50%",
          background:     "linear-gradient(135deg,#5b5fc7,#3b82f6)",
          border:         "none",
          cursor:         "pointer",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          boxShadow:      "0 8px 28px rgba(91,95,199,0.55)",
          zIndex:         10000,
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0,   opacity: 1, scale: 1   }}
              exit={{   rotate:  90,  opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
              style={{ fontSize: 18, color: "#fff", fontWeight: 800, lineHeight: 1 }}
            >✕</motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0,  opacity: 1, scale: 1   }}
              exit={{   rotate: -90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
              style={{ fontSize: 24 }}
            >💬</motion.span>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {unread > 0 && !open && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{   scale: 0 }}
              style={{
                position:       "absolute",
                top:            -3,
                right:          -3,
                width:          20,
                height:         20,
                borderRadius:   "50%",
                background:     "#ef4444",
                color:          "#fff",
                fontSize:       11,
                fontWeight:     700,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                border:         "2.5px solid #fff",
                fontFamily:     "inherit",
              }}
            >
              {unread}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
