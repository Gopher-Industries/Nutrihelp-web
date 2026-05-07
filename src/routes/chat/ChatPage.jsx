// chat/ChatPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaMicrophone, FaStop, FaSpinner } from "react-icons/fa";
import "./ChatPage.css";

/* ---------------- Config ---------------- */
const AI_BASE_URL = "http://localhost:8000";

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
  const [useRag, setUseRag] = useState(false);
  const messagesRef = useRef(null);

  // voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

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

  const [messages, setMessages] = useState(() => [
    {
      id: uid(),
      side: "left",
      text: "Hi! I'm your NutriHelp assistant. Ask me anything about nutrition, meals, or your health goals.",
      time: formatTime(new Date()),
    },
  ]);

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
    const endpoint = useRag
      ? `${AI_BASE_URL}/ai-model/chatbot/chat_with_rag`
      : `${AI_BASE_URL}/ai-model/chatbot/chat`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userMessage }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return data.msg || data.message || String(data);
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
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          side: "left",
          text: `Sorry, I couldn't reach the assistant right now. (${err.message})`,
          time: formatTime(new Date()),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  // AI013: start recording voice from mic
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await handleVoiceMessage(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Please allow microphone access to use voice input.");
    }
  }

  // AI013: stop recording voice
  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  // AI013: send audio to /transcribe, get text, then send text to chatbot
  async function handleVoiceMessage(audioBlob) {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const transcribeRes = await fetch(`${AI_BASE_URL}/ai-model/chatbot/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (!transcribeRes.ok) throw new Error("Transcription failed");
      const { transcript } = await transcribeRes.json();

      const userMsg = {
        id: uid(),
        side: "right",
        text: transcript,
        time: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTranscribing(false);
      setIsLoading(true);

      const botReply = await callChatbot(transcript);
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
      console.error("Voice chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          side: "left",
          text: `Voice input failed: ${err.message}`,
          time: formatTime(new Date()),
        },
      ]);
    } finally {
      setIsTranscribing(false);
      setIsLoading(false);
    }
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
          <div className="nh-chatHeader" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
  <h2 style={{ margin: 0 }}>NutriHelp Assistant</h2>
  <label style={{ fontSize: "0.8rem", cursor: "pointer", color: "#666", display: "flex", alignItems: "center", gap: "6px" }}>
    <input
      type="checkbox"
      checked={useRag}
      onChange={(e) => setUseRag(e.target.checked)}
    />
    Use knowledge base (RAG)
  </label>
</div>

          <div className="nh-messages" ref={messagesRef}>
            {messages.map((m) => (
              <div key={m.id} className={`nh-msgRow ${m.side}`}>
                <div className="nh-msgWrap">
                  <div className={`nh-bubble ${m.side}`}>{m.text}</div>
                  <div className={`nh-meta ${m.side}`}>{m.time}</div>
                </div>
              </div>
            ))}

            {/* AI013: show transcribing status */}
            {isTranscribing && (
              <div className="nh-msgRow left">
                <div className="nh-msgWrap">
                  <div className="nh-bubble left">Listening...</div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="nh-msgRow left">
                <div className="nh-msgWrap">
                  <div className="nh-bubble left">Typing...</div>
                </div>
              </div>
            )}
          </div>

          <form className="nh-composer" onSubmit={sendMessage}>
            <div className="nh-inputWrap">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your message here..."
                rows={1}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
            </div>

            {/* AI013: mic button */}
            <button
              type="button"
              className="nh-sendBtn"
              disabled={isLoading || isTranscribing}
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                backgroundColor: isRecording ? "#ef4444" : isTranscribing ? "#9ca3af" : "#4b0fa8",
                animation: isRecording ? "pulse 1.5s infinite" : "none",
              }}
            >
              {isTranscribing ? <FaSpinner /> : isRecording ? <FaStop /> : <FaMicrophone />}
            </button>

            <button className="nh-sendBtn" type="submit" disabled={isLoading}>
              ➤
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}