import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { UserContext } from "./user.context";
import { AssistantApiError, assistantApi } from "../services/assistantApi";

const STORAGE_PREFIX = "nutrihelp-assistant-history";
const MOCK_STORAGE_USER = "mock-local-user";
const MOCK_RESPONSE_DELAY_MS = 650;

function parseMockModeFlag(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["false", "0", "off", "no"].includes(normalized)) return false;
  if (["true", "1", "on", "yes"].includes(normalized)) return true;
  return true;
}

const MOCK_MODE_ENABLED = parseMockModeFlag(process.env.REACT_APP_ASSISTANT_MOCK_MODE);

const DEFAULT_STATE = {
  isOpen: false,
  openAssistant: () => {},
  closeAssistant: () => {},
  toggleAssistant: () => {},
  messages: [],
  isHistoryLoading: false,
  isSending: false,
  historyError: "",
  bannerMessage: "",
  inputError: "",
  sendMessage: async () => false,
  retryMessage: async () => false,
  clearHistory: async () => false,
  dismissBanner: () => {},
  clearInputError: () => {},
  loadHistory: async () => {},
  userId: null,
  isMockMode: false
};

export const AssistantContext = createContext(DEFAULT_STATE);

const USER_ID_FIELDS = ["id", "user_id", "uid", "sub"];

function resolveUserId(user) {
  if (!user || typeof user !== "object") return null;
  for (const key of USER_ID_FIELDS) {
    if (user[key] !== undefined && user[key] !== null && user[key] !== "") {
      return String(user[key]);
    }
  }
  return null;
}

function createMessage({
  id,
  role = "assistant",
  text = "",
  createdAt,
  status = "ready",
  retryQuery = "",
  isRetryable = false
}) {
  return {
    id: id || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    text,
    createdAt: createdAt || new Date().toISOString(),
    status,
    retryQuery,
    isRetryable
  };
}

function storageKeyForUser(userId) {
  return `${STORAGE_PREFIX}:${userId || "guest"}`;
}

function readLocalHistory(userId) {
  try {
    const stored = localStorage.getItem(storageKeyForUser(userId));
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalHistory(userId, messages) {
  try {
    localStorage.setItem(storageKeyForUser(userId), JSON.stringify(messages));
  } catch (_error) {
    // no-op
  }
}

function extractText(item) {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return "";
  return (
    item.text ||
    item.message ||
    item.content ||
    item.reply ||
    item.response ||
    item.answer ||
    item.msg ||
    ""
  );
}

function extractAssistantReply(payload) {
  if (payload === null || payload === undefined) return "";
  if (typeof payload === "string") return payload;

  if (typeof payload === "object") {
    if (typeof payload.reply === "string") return payload.reply;
    if (typeof payload.response === "string") return payload.response;
    if (typeof payload.message === "string") return payload.message;
    if (typeof payload.msg === "string") return payload.msg;
    if (typeof payload.answer === "string") return payload.answer;
    if (typeof payload.output === "string") return payload.output;
    if (typeof payload.text === "string") return payload.text;
  }

  return "";
}

function normalizeHistoryResponse(payload) {
  const rawItems = Array.isArray(payload)
    ? payload
    : payload?.history || payload?.messages || payload?.data || payload?.items || [];

  if (!Array.isArray(rawItems)) return [];

  const normalized = [];

  rawItems.forEach((item, index) => {
    if (typeof item === "string") {
      normalized.push(
        createMessage({
          id: `history-assistant-${index}`,
          role: "assistant",
          text: item
        })
      );
      return;
    }

    if (!item || typeof item !== "object") return;

    const timestamp =
      item.created_at ||
      item.createdAt ||
      item.timestamp ||
      item.time ||
      new Date().toISOString();

    if (item.query && (item.response || item.answer || item.reply || item.message)) {
      normalized.push(
        createMessage({
          id: item.query_id || item.queryId || `history-user-${index}`,
          role: "user",
          text: String(item.query),
          createdAt: timestamp
        })
      );
      normalized.push(
        createMessage({
          id: item.response_id || item.responseId || `history-assistant-${index}`,
          role: "assistant",
          text: extractText(item.response || item.answer || item.reply || item.message),
          createdAt: item.response_time || item.responseTime || timestamp
        })
      );
      return;
    }

    const roleRaw = String(item.role || item.sender || item.type || "assistant").toLowerCase();
    const role =
      roleRaw === "user" || roleRaw === "human" || roleRaw === "client"
        ? "user"
        : "assistant";

    const text = extractText(item);
    if (!text) return;

    normalized.push(
      createMessage({
        id: item.id || `history-${role}-${index}`,
        role,
        text,
        createdAt: timestamp
      })
    );
  });

  return normalized;
}

function mapError(error) {
  const status = error?.status || 0;
  const payload = error?.payload || null;
  const details =
    payload?.detail || payload?.message || payload?.error || payload?.msg || error?.message || "";

  if (status === 400) {
    return {
      inputError: details || "Please check your message and try again.",
      assistantMessage: "I could not process that input. Please edit your message and send again.",
      bannerMessage: ""
    };
  }

  if (status === 429) {
    return {
      inputError: "",
      assistantMessage:
        "Assistant service is temporarily unavailable due to rate limits or quota. Please retry shortly.",
      bannerMessage:
        "Assistant is temporarily unavailable because the service has reached quota/rate limits."
    };
  }

  if (status === 502 || status === 503) {
    return {
      inputError: "",
      assistantMessage:
        "Assistant service is temporarily unavailable. Please try again in a moment.",
      bannerMessage:
        "The AI service is temporarily unavailable (502/503). You can retry your last message."
    };
  }

  return {
    inputError: "",
    assistantMessage: "Something went wrong while contacting Assistant. Please try again.",
    bannerMessage: details || "Assistant request failed. Please try again."
  };
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function buildMockAssistantReply(query) {
  const text = String(query || "").toLowerCase();

  if (text.includes("breakfast")) {
    return [
      "Here are 3 quick breakfast ideas:",
      "1. Greek yogurt + berries + chia seeds",
      "2. Oats + banana + peanut butter",
      "3. Eggs + whole-grain toast + avocado"
    ].join("\n");
  }

  if (text.includes("sugar")) {
    return [
      "Easy sugar-cut strategy:",
      "1. Replace sweet drinks with water or unsweetened tea",
      "2. Pick plain yogurt and add fruit instead of flavored packs",
      "3. Check labels and keep added sugar lower per serving"
    ].join("\n");
  }

  if (text.includes("protein") || text.includes("snack")) {
    return [
      "High-protein snack options:",
      "- Boiled eggs",
      "- Cottage cheese and cucumber",
      "- Roasted chickpeas",
      "- Greek yogurt with nuts"
    ].join("\n");
  }

  if (text.includes("meal plan") || text.includes("diet plan")) {
    return [
      "Simple daily meal structure:",
      "Breakfast: protein + fiber",
      "Lunch: lean protein + vegetables + whole grain",
      "Dinner: lighter balanced plate + hydration",
      "Snack: fruit + nuts"
    ].join("\n");
  }

  return [
    "Mock mode is active, so this is a local demo response.",
    `You asked: "${query}".`,
    "I can still help with meal ideas, calorie-friendly swaps, and macro-balanced suggestions."
  ].join("\n");
}

export const AssistantProvider = ({ children }) => {
  const { currentUser } = useContext(UserContext);
  const userId = useMemo(() => resolveUserId(currentUser), [currentUser]);
  const isMockMode = MOCK_MODE_ENABLED;
  const effectiveUserId = isMockMode ? userId || MOCK_STORAGE_USER : userId;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => readLocalHistory(effectiveUserId));
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");
  const [inputError, setInputError] = useState("");

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setMessages(readLocalHistory(effectiveUserId));
    setHistoryError("");
    setBannerMessage("");
    setInputError("");
  }, [effectiveUserId]);

  useEffect(() => {
    writeLocalHistory(effectiveUserId, messages);
  }, [messages, effectiveUserId]);

  const loadHistory = useCallback(async () => {
    if (isMockMode) {
      setMessages(readLocalHistory(effectiveUserId));
      setHistoryError("");
      return;
    }

    if (!effectiveUserId) {
      setHistoryError("");
      return;
    }

    setIsHistoryLoading(true);
    setHistoryError("");

    try {
      const payload = await assistantApi.history({ userId: effectiveUserId });
      const normalized = normalizeHistoryResponse(payload);
      if (!mountedRef.current) return;
      setMessages(normalized);
      setBannerMessage("");
    } catch (error) {
      if (!mountedRef.current) return;
      const fallback = readLocalHistory(effectiveUserId);
      if (fallback.length > 0) {
        setMessages(fallback);
      }
      setHistoryError(
        error instanceof AssistantApiError
          ? "Unable to load full chat history right now. Showing latest saved copy."
          : "Unable to load chat history right now."
      );
    } finally {
      if (mountedRef.current) {
        setIsHistoryLoading(false);
      }
    }
  }, [effectiveUserId, isMockMode]);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, loadHistory]);

  const openAssistant = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleAssistant = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const dismissBanner = useCallback(() => {
    setBannerMessage("");
  }, []);

  const clearInputError = useCallback(() => {
    setInputError("");
  }, []);

  const sendMessage = useCallback(
    async (rawText, options = {}) => {
      const text = String(rawText || "").trim();
      if (!text || isSending) return false;

      setInputError("");
      setHistoryError("");

      if (!effectiveUserId) {
        setInputError("Please sign in to send messages with Assistant.");
        return false;
      }

      const userMessage = createMessage({
        role: "user",
        text
      });

      const assistantLoading = createMessage({
        role: "assistant",
        text: "",
        status: "loading",
        retryQuery: text
      });

      setMessages((prev) => {
        const withoutRetriedMessage = options.retryMessageId
          ? prev.filter((message) => message.id !== options.retryMessageId)
          : prev;
        return [...withoutRetriedMessage, userMessage, assistantLoading];
      });

      setIsSending(true);
      setBannerMessage("");

      try {
        let reply = "";
        if (isMockMode) {
          await delay(MOCK_RESPONSE_DELAY_MS);
          reply = buildMockAssistantReply(text);
        } else {
          const payload = await assistantApi.query({
            userId: effectiveUserId,
            query: text
          });
          reply = extractAssistantReply(payload);
        }

        const fallbackReply =
          reply && reply.trim() !== ""
            ? reply.trim()
            : "Assistant returned an empty response. Please try again.";

        if (!mountedRef.current) return false;

        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantLoading.id
              ? {
                  ...message,
                  text: fallbackReply,
                  status: "ready",
                  isRetryable: false
                }
              : message
          )
        );

        return true;
      } catch (error) {
        if (!mountedRef.current) return false;

        const mapped = mapError(error);
        if (mapped.inputError) {
          setInputError(mapped.inputError);
        }
        if (mapped.bannerMessage) {
          setBannerMessage(mapped.bannerMessage);
        }

        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantLoading.id
              ? {
                  ...message,
                  text: mapped.assistantMessage,
                  status: "error",
                  isRetryable: true,
                  retryQuery: text
                }
              : message
          )
        );
        return false;
      } finally {
        if (mountedRef.current) {
          setIsSending(false);
        }
      }
    },
    [effectiveUserId, isMockMode, isSending]
  );

  const retryMessage = useCallback(
    async (messageId) => {
      const failed = messages.find((message) => message.id === messageId);
      if (!failed || !failed.retryQuery) return false;
      return sendMessage(failed.retryQuery, { retryMessageId: messageId });
    },
    [messages, sendMessage]
  );

  const clearHistory = useCallback(async () => {
    setInputError("");
    setHistoryError("");
    setBannerMessage("");

    if (isMockMode || !effectiveUserId) {
      setMessages([]);
      writeLocalHistory(effectiveUserId, []);
      return true;
    }

    try {
      await assistantApi.clearHistory({ userId: effectiveUserId });
      if (!mountedRef.current) return false;
      setMessages([]);
      writeLocalHistory(effectiveUserId, []);
      return true;
    } catch (error) {
      if (!mountedRef.current) return false;
      const mapped = mapError(error);
      setBannerMessage(mapped.bannerMessage || "Unable to clear chat history.");
      return false;
    }
  }, [effectiveUserId, isMockMode]);

  const value = useMemo(
    () => ({
      isOpen,
      openAssistant,
      closeAssistant,
      toggleAssistant,
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
      loadHistory,
      userId: effectiveUserId,
      isMockMode
    }),
    [
      isOpen,
      openAssistant,
      closeAssistant,
      toggleAssistant,
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
      loadHistory,
      effectiveUserId,
      isMockMode
    ]
  );

  return (
    <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
  );
};

export const useAssistant = () => useContext(AssistantContext);
