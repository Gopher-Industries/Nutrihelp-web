import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  RotateCcw,
  SendHorizontal,
  Trash2,
  X
} from "lucide-react";
import { useAssistant } from "../../context/assistant.context";

const QUICK_PROMPTS = [
  "Suggest healthy breakfast ideas",
  "How can I reduce sugar intake?",
  "Give me a high-protein snack list"
];

function formatTime(dateString) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(dateString));
}

function formatDayLabel(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const entryDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - entryDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export default function AssistantPanel({
  onClose,
  fullscreen = false,
  autoFocusInput = true,
  headerTitle = "NutriHelp Assistant",
  panelId
}) {
  const {
    messages,
    isHistoryLoading,
    isSending,
    historyError,
    bannerMessage,
    inputError,
    sendMessage,
    retryMessage,
    clearHistory,
    dismissBanner,
    clearInputError,
    userId,
    isMockMode
  } = useAssistant();

  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (autoFocusInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocusInput]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending, isHistoryLoading]);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 140)}px`;
  }, [draft]);

  const timeline = useMemo(() => {
    const rows = [];
    let lastDay = "";

    messages.forEach((message) => {
      const day = formatDayLabel(message.createdAt);
      if (day !== lastDay) {
        rows.push({ type: "divider", id: `divider-${day}-${message.id}`, label: day });
        lastDay = day;
      }
      rows.push({ type: "message", ...message });
    });

    return rows;
  }, [messages]);

  const canSend = Boolean(draft.trim()) && !isSending && (Boolean(userId) || isMockMode);
  const subtitle = isMockMode
    ? "Mock mode: local demo responses"
    : userId
      ? "Online nutrition guide"
      : "Sign in to send messages";

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const sent = await sendMessage(text);
    if (sent) {
      setDraft("");
    }
  };

  const handleClear = async () => {
    const accepted = window.confirm("Clear your complete assistant chat history?");
    if (!accepted) return;
    await clearHistory();
  };

  return (
    <section
      id={panelId}
      className={`assistant-panel ${fullscreen ? "assistant-panel-page" : ""}`}
      aria-label="NutriHelp Assistant"
    >
      <header className="assistant-panel-header">
        <div className="assistant-panel-title">
          <div className="assistant-panel-icon" aria-hidden="true">
            <Bot size={16} />
          </div>
          <div>
            <h2>{headerTitle}</h2>
            <p>{subtitle}</p>
          </div>
        </div>

        <div className="assistant-panel-actions">
          <button
            type="button"
            className="assistant-header-btn"
            onClick={handleClear}
            title="Clear chat history"
            aria-label="Clear chat history"
            disabled={!hasMessages || isSending || isHistoryLoading}
          >
            <Trash2 size={15} />
          </button>
          {onClose ? (
            <button
              type="button"
              className="assistant-header-btn"
              onClick={onClose}
              title="Close assistant"
              aria-label="Close assistant"
            >
              <X size={15} />
            </button>
          ) : null}
        </div>
      </header>

      {!userId && !isMockMode ? (
        <div className="assistant-inline-warning">
          <AlertTriangle size={16} />
          Please sign in to use Assistant responses and persistent history.
        </div>
      ) : null}

      {historyError ? (
        <div className="assistant-inline-warning">
          <AlertTriangle size={16} />
          {historyError}
        </div>
      ) : null}

      {bannerMessage ? (
        <div className="assistant-inline-warning">
          <AlertTriangle size={16} />
          <span>{bannerMessage}</span>
          <button type="button" className="assistant-inline-dismiss" onClick={dismissBanner}>
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="assistant-quick-prompts-wrap">
        <p className="assistant-section-label">Quick prompts</p>
        <div className="assistant-quick-prompts">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setDraft(prompt);
                clearInputError();
                if (inputRef.current) inputRef.current.focus();
              }}
              className="assistant-chip"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div
        className="assistant-log"
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-busy={isSending || isHistoryLoading}
      >
        {isHistoryLoading ? (
          <div className="assistant-empty-state assistant-empty-loading">
            <Bot size={18} />
            Loading chat history...
          </div>
        ) : null}

        {!isHistoryLoading && timeline.length === 0 ? (
          <div className="assistant-empty-state">
            <Bot size={18} />
            Start a conversation with NutriHelp Assistant.
          </div>
        ) : null}

        {timeline.map((item) => {
          if (item.type === "divider") {
            return (
              <div className="assistant-day-divider" key={item.id}>
                <span>{item.label}</span>
              </div>
            );
          }

          const rowClass = `assistant-message-row ${item.role}`;
          const bubbleClass = `assistant-message-bubble ${item.role} ${item.status || "ready"}`;

          return (
            <article key={item.id} className={rowClass}>
              {item.role === "assistant" ? (
                <div className="assistant-avatar assistant" aria-hidden="true">
                  <Bot size={14} />
                </div>
              ) : null}

              <div className="assistant-message-wrap">
                <div className={bubbleClass}>
                  {item.status === "loading" ? (
                    <div className="assistant-typing-dots" aria-label="Assistant is typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  ) : (
                    item.text
                  )}
                </div>

                {item.status === "error" && item.isRetryable ? (
                  <button
                    type="button"
                    className="assistant-retry-btn"
                    onClick={() => retryMessage(item.id)}
                  >
                    <RotateCcw size={14} />
                    Retry
                  </button>
                ) : null}

                <time className={`assistant-time ${item.role}`}>{formatTime(item.createdAt)}</time>
              </div>

              {item.role === "user" ? (
                <div className="assistant-avatar user" aria-hidden="true">
                  You
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <form className="assistant-composer" onSubmit={handleSubmit}>
        <label htmlFor="assistant-input" className="sr-only">
          Message assistant
        </label>
        <div className="assistant-composer-shell">
          <textarea
            id="assistant-input"
            ref={inputRef}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              if (inputError) clearInputError();
            }}
            placeholder={
              userId || isMockMode
                ? "Ask anything about nutrition..."
                : "Sign in to chat with Assistant"
            }
            rows={1}
            disabled={!userId && !isMockMode}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit(event);
              }
            }}
          />

          <button
            type="submit"
            className="assistant-send-btn"
            disabled={!canSend}
            aria-label="Send message"
            title="Send"
          >
            <SendHorizontal size={16} />
          </button>
        </div>

        <p className="assistant-composer-hint">Enter to send, Shift+Enter for a new line</p>
      </form>

      {inputError ? <p className="assistant-input-error">{inputError}</p> : null}
    </section>
  );
}
