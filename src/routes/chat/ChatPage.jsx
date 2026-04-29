// chat/ChatPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./ChatPage.css";

/* ---------------- Config ---------------- */
const AI_BASE_URL = "http://localhost:8000";
const CHAT_ENDPOINT = `${AI_BASE_URL}/ai-model/chatbot/chat`;

/* ---------------- Utils ---------------- */

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatTime(d) {
  const h24 = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h24 >= 12 ? "pm" : "am";
  const h12 = ((h24 + 11) % 12) + 1;
  return `Today, ${h12}:${m}${ampm}`;
}

/* ---------------- Page ---------------- */

export default function ChatPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef(null);

  const navLinks = useMemo(
    () => [
      "Home",
      "Menu",
      "Meal Planning",
      "Edit Daily Plan",
      "Health News",
      "Fitness Roadmap",
      "Community",
      "Health FAQ",
      "Recipes",
      "Scan Products",
      "Allergies & Intolerances",
      "Symptom Assessment",
      "Health Tools",
      "Settings",
    ],
    []
  );

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("nh-messages");
      return saved ? JSON.parse(saved) : [
        {
          id: uid(),
          side: "left",
          text: "Hi! I'm your NutriHelp assistant. Ask me anything about nutrition, meals, or your health goals.",
          time: formatTime(new Date()),
        },
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("nh-messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  async function callChatbot(userMessage) {
    const response = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userMessage }),
    });

    if (!response.ok) {
      const err = new Error("Backend error");
      err.type = "network";
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    const reply = data.msg || data.message || String(data);

    if (!reply || reply.trim() === "") {
      const err = new Error("Empty response");
      err.type = "empty";
      throw err;
    }

    return reply;
  }

  async function sendMessage(e) {
    if (e) e.preventDefault();
    const text = draft.trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: uid(),
      side: "right",
      text,
      time: formatTime(new Date()),
    };
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    const ta = document.querySelector(".nh-inputWrap textarea");
    if (ta) ta.style.height = "auto";
    setIsLoading(true);

    try {
      const botReply = await callChatbot(text);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          side: "left",
          text: botReply,
          time: formatTime(new Date()),
        },
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);

      const errorText = err.type === "empty"
        ? "The assistant returned an empty response. Please try again."
        : err.type === "network"
        ? `Connection failed (${err.status ?? "no response"}). Check your server.`
        : "Something went wrong. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          side: "left",
          text: errorText,
          time: formatTime(new Date()),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function clearHistory() {
    localStorage.removeItem("nh-messages");
    setMessages(
      [
        {
          id: uid(),
          side: "left",
          text: "Hi! I'm your NutriHelp assistant. Ask me anything about nutrition, meals, or your health goals.",
          time: formatTime(new Date()),
        },
      ]
    );
  }

  function formatText(text) {
    return text.split(/\*\*(.*?)\*\*/g).flatMap((part, i) => {
      if (i % 2 === 1) return [<strong key={`b${i}`}>{part}</strong>];
        return part.split(/\*(.*?)\*/g).map((p, j) =>
          j % 2 === 1 ? <em key={`e${i}-${j}`}>{p}</em> : p
        );
    });
  }

  return (
    <div className="nh-root">
      {/* ---------- Topbar ---------- */}
      <header className="nh-topbar">
        <button
          className="nh-hamburger"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className="nh-brand">
          <div className="nh-logo">🍃</div>
          <b>NutriHelp</b>
        </div>

        <div className="nh-rightlinks">
          <span>Account</span>
          <span>Log out</span>
        </div>
      </header>

      {/* ---------- Drawer ---------- */}
      <div
        className={`nh-drawerOverlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      <aside className={`nh-drawer ${menuOpen ? "open" : ""}`}>
        <button className="nh-drawerClose" onClick={() => setMenuOpen(false)}>
          ×
        </button>

        <nav className="nh-drawerNav">
          {navLinks.map((t) => (
            <a key={t} href="#" className="nh-drawerLink">
              {t}
            </a>
          ))}
        </nav>
      </aside>

      {/* ---------- Chat ---------- */}
      <main className="nh-app">
        <section className="nh-chatCard">
          <div className="nh-chatHeader">
            <h2 className="nh-chatTitle">NutriHelp Assistant</h2>
          </div>

          <div className="nh-messages" ref={messagesRef}>
            {messages.map((m) => (
              <div key={m.id} className={`nh-msgRow ${m.side}`}>
                <div className="nh-msgWrap">

                  <div className={`nh-bubble ${m.side} ${m.isError ? "nh-bubble--error" : ""}`}>
                    {formatText(m.text)}
                  </div>

                  <div className={`nh-meta ${m.side}`}>{m.time}</div>

                </div>
              </div>
            ))}

            {isLoading && (
              <div className="nh-msgRow left">
                <div className="nh-msgWrap">

                  <div className="nh-bubble left nh-typing">
                    <span /><span /><span />
                  </div>

                  <div className="nh-meta left" style={{ marginTop: "4px", fontStyle: "italic" }}>
                    Thinking...
                  </div>

                </div>
              </div>
            )}
          </div>

          <form className="nh-composer" onSubmit={sendMessage}>

            <button 
              className="nh-clearBtn"
              disabled={isLoading}
              onClick={clearHistory}
            >
              Clear History
            </button>

            <div className="nh-inputWrap">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                placeholder="Type your message here..."
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
            </div>

            <button className="nh-sendBtn" type="submit" disabled={isLoading}>
              ➤
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
