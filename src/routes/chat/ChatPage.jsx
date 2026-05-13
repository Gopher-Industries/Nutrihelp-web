// chat/ChatPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaStop, FaSpinner } from "react-icons/fa";
import BaseApi from "../../services/baseApi";
import "./ChatPage.css";

/* ---------------- Config ---------------- */
const AI_BASE_URL = process.env.REACT_APP_AI_API_BASE_URL || "http://localhost:8000";
const RAW_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://localhost:8443";

function normalizeApiBaseUrl(baseUrl) {
  return String(baseUrl || "").trim().replace(/\/+$/, "");
}

const API_BASE_URL = normalizeApiBaseUrl(RAW_API_BASE_URL);
const CHAT_ENDPOINT = `${API_BASE_URL}/api/chatbot/query`;
const CHAT_GREETING_ENDPOINT = `${API_BASE_URL}/api/chatbot/greeting`;
const DEFAULT_GREETING =
  "Hi! I'm your NutriHelp assistant. Ask me anything about nutrition, meals, or your health goals.";
const baseApi = new BaseApi();

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

function parseStoredJson(storage, key) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getCurrentUserId() {
  const storageKeys = [
    { storage: localStorage, key: "user" },
    { storage: localStorage, key: "user_session" },
    { storage: sessionStorage, key: "user_session" },
    { storage: sessionStorage, key: "user" },
  ];

  for (const { storage, key } of storageKeys) {
    const user = parseStoredJson(storage, key);
    const userId = user?.user_id || user?.id || user?.uid || user?.sub;
    if (userId) return userId;
  }
  return null;
}

function getAuthHeaders(includeContentType = true) {
  const token = baseApi.getAuthToken();
  return {
    ...(includeContentType && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/* ---------------- Page ---------------- */

export default function ChatPage() {
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef(null);

  // voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("nh-messages");
      return saved ? JSON.parse(saved) : [
        {
          id: uid(),
          side: "left",
          text: DEFAULT_GREETING,
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

  async function fetchPersonalizedGreeting() {
    const userId = getCurrentUserId();
    const headers = getAuthHeaders(false);
    if (!userId || !headers.Authorization) return DEFAULT_GREETING;

    try {
      const params = new URLSearchParams({ user_id: String(userId) });
      const response = await fetch(`${CHAT_GREETING_ENDPOINT}?${params.toString()}`, {
        headers,
      });
      if (!response.ok) return DEFAULT_GREETING;

      const data = await response.json();
      return data?.greeting || DEFAULT_GREETING;
    } catch (error) {
      console.warn("Unable to load personalised chatbot greeting:", error);
      return DEFAULT_GREETING;
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadGreeting() {
      const greeting = await fetchPersonalizedGreeting();
      if (cancelled) return;

      setMessages((prev) => {
        if (!prev.length) {
          return [{
            id: uid(),
            side: "left",
            text: greeting,
            time: formatTime(new Date()),
          }];
        }

        const first = prev[0];
        if (first.side !== "left" || first.text !== DEFAULT_GREETING) {
          return prev;
        }

        return [
          {
            ...first,
            text: greeting,
          },
          ...prev.slice(1),
        ];
      });
    }

    loadGreeting();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleStorageRefresh = async (event) => {
      if (event.key && !["user", "user_session", "auth_token", "jwt_token", "token"].includes(event.key)) {
        return;
      }

      const greeting = await fetchPersonalizedGreeting();
      if (greeting === DEFAULT_GREETING) return;

      setMessages((prev) => {
        if (!prev.length) {
          return [{
            id: uid(),
            side: "left",
            text: greeting,
            time: formatTime(new Date()),
          }];
        }

        const first = prev[0];
        if (first.side !== "left" || first.text !== DEFAULT_GREETING) {
          return prev;
        }

        return [
          {
            ...first,
            text: greeting,
          },
          ...prev.slice(1),
        ];
      });
    };

    window.addEventListener("storage", handleStorageRefresh);
    return () => window.removeEventListener("storage", handleStorageRefresh);
  }, []);

  async function callChatbot(userMessage) {
    const userId = getCurrentUserId();
    const response = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        user_id: userId,
        user_input: userMessage,
      }),
    });

    if (!response.ok) {
      const err = new Error("Backend error");
      err.type = "network";
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    const reply = data.response || data.msg || data.message || String(data);

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
    const greeting = await fetchPersonalizedGreeting();
    setMessages(
      [
        {
          id: uid(),
          side: "left",
          text: greeting,
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
              type="button"
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
