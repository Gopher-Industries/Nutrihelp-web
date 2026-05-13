import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaForward, FaPause, FaPlay, FaRedoAlt, FaVolumeUp } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import {
  applyVoiceSettings,
  getVoiceSettings,
  hasSpeechSynthesisSupport,
  VOICE_SETTINGS_CHANGED_EVENT,
  VOICE_SETTINGS_STORAGE_KEY,
} from "../../utils/voiceSettingsManager";
import { isAuthPath } from "../../utils/ttsRouteUtils";
import { collectReadablePageText } from "../../utils/ttsTextCollector";

const PLAYBACK_STATE = {
  IDLE: "idle",
  PLAYING: "playing",
  PAUSED: "paused",
  ENDED: "ended",
  ERROR: "error",
};

const DEFAULT_FLOATING_BOTTOM = 18;
const FLOATING_STACK_GAP = 12;

const statusLabelMap = {
  [PLAYBACK_STATE.IDLE]: "Idle",
  [PLAYBACK_STATE.PLAYING]: "Playing",
  [PLAYBACK_STATE.PAUSED]: "Paused",
  [PLAYBACK_STATE.ENDED]: "Finished",
  [PLAYBACK_STATE.ERROR]: "Error",
};

const baseControlStyle = {
  width: "38px",
  height: "38px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  color: "#fff",
  background: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "opacity 0.2s ease",
};

const getControlStyle = (disabled) => ({
  ...baseControlStyle,
  opacity: disabled ? 0.45 : 1,
  cursor: disabled ? "not-allowed" : "pointer",
});

const statusStyleMap = {
  [PLAYBACK_STATE.IDLE]: { background: "#e5e7eb", color: "#374151" },
  [PLAYBACK_STATE.PLAYING]: { background: "#dcfce7", color: "#166534" },
  [PLAYBACK_STATE.PAUSED]: { background: "#fef3c7", color: "#92400e" },
  [PLAYBACK_STATE.ENDED]: { background: "#dbeafe", color: "#1d4ed8" },
  [PLAYBACK_STATE.ERROR]: { background: "#fee2e2", color: "#991b1b" },
};

const TextToSpeechControl = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [voices, setVoices] = useState([]);
  const [voiceSettings, setVoiceSettings] = useState(getVoiceSettings());
  const [isSpeechSupported, setIsSpeechSupported] = useState(() =>
    hasSpeechSynthesisSupport()
  );
  const [playbackState, setPlaybackState] = useState(PLAYBACK_STATE.IDLE);
  const [runtimeMessage, setRuntimeMessage] = useState("");
  const [floatingBottom, setFloatingBottom] = useState(DEFAULT_FLOATING_BOTTOM);

  const utteranceRef = useRef(null);
  const utteranceIdRef = useRef(0);
  const autoPlayTimerRef = useRef(null);
  const lastReadableTextRef = useRef("");
  const latestSettingsRef = useRef(voiceSettings);
  const latestVoicesRef = useRef(voices);

  useEffect(() => {
    latestSettingsRef.current = voiceSettings;
  }, [voiceSettings]);

  useEffect(() => {
    latestVoicesRef.current = voices;
  }, [voices]);

  const cancelCurrentSpeech = useCallback((nextState = PLAYBACK_STATE.IDLE) => {
    if (!hasSpeechSynthesisSupport()) return;

    utteranceIdRef.current += 1;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setPlaybackState(nextState);
  }, []);

  const startSpeech = useCallback(
    (textOverride = "") => {
      if (!hasSpeechSynthesisSupport()) {
        setRuntimeMessage("Text-to-speech is not supported in this browser.");
        setPlaybackState(PLAYBACK_STATE.ERROR);
        return false;
      }

      const currentSettings = latestSettingsRef.current;
      if (!currentSettings.enabled) {
        setRuntimeMessage("Text-to-speech is disabled in Settings.");
        setPlaybackState(PLAYBACK_STATE.IDLE);
        return false;
      }

      const text = (textOverride || collectReadablePageText(document.body)).trim();
      if (!text) {
        setRuntimeMessage("No readable content found on this page.");
        setPlaybackState(PLAYBACK_STATE.ERROR);
        return false;
      }

      lastReadableTextRef.current = text;
      setRuntimeMessage("");

      cancelCurrentSpeech(PLAYBACK_STATE.IDLE);

      const utterance = new window.SpeechSynthesisUtterance(text);
      const settingsApplied = applyVoiceSettings(
        utterance,
        currentSettings,
        latestVoicesRef.current
      );

      if (!settingsApplied) {
        setRuntimeMessage("Unable to apply current voice settings.");
        setPlaybackState(PLAYBACK_STATE.ERROR);
        return false;
      }

      const utteranceId = utteranceIdRef.current + 1;
      utteranceIdRef.current = utteranceId;
      utteranceRef.current = utterance;

      utterance.onstart = () => {
        if (utteranceIdRef.current !== utteranceId) return;
        setPlaybackState(PLAYBACK_STATE.PLAYING);
      };

      utterance.onpause = () => {
        if (utteranceIdRef.current !== utteranceId) return;
        setPlaybackState(PLAYBACK_STATE.PAUSED);
      };

      utterance.onresume = () => {
        if (utteranceIdRef.current !== utteranceId) return;
        setPlaybackState(PLAYBACK_STATE.PLAYING);
      };

      utterance.onend = () => {
        if (utteranceIdRef.current !== utteranceId) return;
        utteranceRef.current = null;
        setPlaybackState(PLAYBACK_STATE.ENDED);
      };

      utterance.onerror = (event) => {
        if (utteranceIdRef.current !== utteranceId) return;
        utteranceRef.current = null;
        setPlaybackState(PLAYBACK_STATE.ERROR);
        setRuntimeMessage(
          event?.error
            ? `Speech failed: ${event.error}`
            : "Speech failed for this page."
        );
      };

      window.speechSynthesis.speak(utterance);
      return true;
    },
    [cancelCurrentSpeech]
  );

  const loadVoices = useCallback(() => {
    const supported = hasSpeechSynthesisSupport();
    setIsSpeechSupported(supported);

    if (!supported) {
      setVoices([]);
      return;
    }

    const loaded = window.speechSynthesis.getVoices() || [];
    setVoices(loaded);
  }, []);

  useEffect(() => {
    loadVoices();

    if (!hasSpeechSynthesisSupport()) return undefined;

    const speechSynthesisRef = window.speechSynthesis;
    if (typeof speechSynthesisRef.addEventListener === "function") {
      speechSynthesisRef.addEventListener("voiceschanged", loadVoices);
    } else {
      speechSynthesisRef.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof speechSynthesisRef.removeEventListener === "function") {
        speechSynthesisRef.removeEventListener("voiceschanged", loadVoices);
      } else if (speechSynthesisRef.onvoiceschanged === loadVoices) {
        speechSynthesisRef.onvoiceschanged = null;
      }
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
      cancelCurrentSpeech();
    };
  }, [cancelCurrentSpeech, loadVoices]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === VOICE_SETTINGS_STORAGE_KEY) {
        setVoiceSettings(getVoiceSettings());
      }
    };

    const handleRuntimeSettingsChange = (event) => {
      setVoiceSettings(event.detail || getVoiceSettings());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      VOICE_SETTINGS_CHANGED_EVENT,
      handleRuntimeSettingsChange
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        VOICE_SETTINGS_CHANGED_EVENT,
        handleRuntimeSettingsChange
      );
    };
  }, []);

  useEffect(() => {
    if (!isSpeechSupported) return;

    const speech = window.speechSynthesis;
    if (!voiceSettings.enabled) {
      if (speech.speaking || speech.paused) {
        cancelCurrentSpeech(PLAYBACK_STATE.IDLE);
      }
      return;
    }

    // When runtime voice settings change, restart current speech with new config.
    if (speech.speaking || speech.paused) {
      const currentText =
        lastReadableTextRef.current || collectReadablePageText(document.body);
      if (currentText) {
        startSpeech(currentText);
      }
    }
  }, [cancelCurrentSpeech, isSpeechSupported, startSpeech, voiceSettings]);

  const routeKey = `${location.pathname}${location.search}${location.hash}`;

  const syncFloatingBottomOffset = useCallback(() => {
    const assistantButton = document.querySelector(".assistant-btn");
    if (!assistantButton) {
      setFloatingBottom(DEFAULT_FLOATING_BOTTOM);
      return;
    }

    const computedStyle = window.getComputedStyle(assistantButton);
    if (
      computedStyle.display === "none" ||
      computedStyle.visibility === "hidden" ||
      computedStyle.opacity === "0"
    ) {
      setFloatingBottom(DEFAULT_FLOATING_BOTTOM);
      return;
    }

    const assistantBottom = Number.parseFloat(computedStyle.bottom) || 0;
    const assistantHeight = assistantButton.getBoundingClientRect().height || 0;
    const nextOffset = assistantBottom + assistantHeight + FLOATING_STACK_GAP;
    setFloatingBottom(Math.max(DEFAULT_FLOATING_BOTTOM, Math.ceil(nextOffset)));
  }, []);

  useEffect(() => {
    syncFloatingBottomOffset();

    const assistantButton = document.querySelector(".assistant-btn");
    const hasResizeObserver = typeof ResizeObserver !== "undefined";
    const resizeObserver =
      hasResizeObserver && assistantButton
        ? new ResizeObserver(() => {
            syncFloatingBottomOffset();
          })
        : null;

    if (resizeObserver && assistantButton) {
      resizeObserver.observe(assistantButton);
    }

    const mutationObserver =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(() => {
            syncFloatingBottomOffset();
          })
        : null;

    if (mutationObserver) {
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    window.addEventListener("resize", syncFloatingBottomOffset);

    return () => {
      window.removeEventListener("resize", syncFloatingBottomOffset);
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [routeKey, syncFloatingBottomOffset]);

  useEffect(() => {
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }

    cancelCurrentSpeech(PLAYBACK_STATE.IDLE);
    setRuntimeMessage("");

    const currentSettings = latestSettingsRef.current;
    if (!isSpeechSupported) return undefined;
    if (isAuthPath(location.pathname)) return undefined;
    if (!currentSettings.enabled || !currentSettings.autoPlay) return undefined;

    autoPlayTimerRef.current = window.setTimeout(() => {
      startSpeech();
    }, 350);

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [
    cancelCurrentSpeech,
    isSpeechSupported,
    location.pathname,
    routeKey,
    startSpeech,
  ]);

  const handlePlay = () => {
    startSpeech();
  };

  const handlePause = () => {
    if (!isSpeechSupported) return;
    if (!window.speechSynthesis.speaking || window.speechSynthesis.paused) return;

    window.speechSynthesis.pause();
    setPlaybackState(PLAYBACK_STATE.PAUSED);
  };

  const handleResume = () => {
    if (!isSpeechSupported) return;
    if (!window.speechSynthesis.paused) return;

    window.speechSynthesis.resume();
    setPlaybackState(PLAYBACK_STATE.PLAYING);
  };

  const handleReplay = () => {
    const replayText =
      lastReadableTextRef.current || collectReadablePageText(document.body);
    startSpeech(replayText);
  };

  const canSpeak = isSpeechSupported && voiceSettings.enabled;
  const disablePlay =
    !canSpeak ||
    playbackState === PLAYBACK_STATE.PLAYING ||
    playbackState === PLAYBACK_STATE.PAUSED;
  const disablePause = !canSpeak || playbackState !== PLAYBACK_STATE.PLAYING;
  const disableResume = !canSpeak || playbackState !== PLAYBACK_STATE.PAUSED;
  const disableReplay = !canSpeak;

  const statusStyle = statusStyleMap[playbackState] || statusStyleMap.idle;

  return (
    <div
      className="tts-ignore"
      data-tts-ignore="true"
      style={{
        position: "fixed",
        right: "18px",
        bottom: `${floatingBottom}px`,
        zIndex: 1300,
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Text-to-Speech"
        aria-label="Open Text-to-Speech controls"
        style={{
          width: "48px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 0,
          borderRadius: "999px",
          border: "none",
          cursor: "pointer",
          color: "#fff",
          background: canSpeak ? "#2563eb" : "#6b7280",
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
        }}
      >
        <FaVolumeUp size={20} />
      </button>

      {isOpen && (
        <div
          style={{
            marginTop: "10px",
            width: "300px",
            background: "#f9fafb",
            border: "1px solid #d1d5db",
            borderRadius: "12px",
            boxShadow: "0 10px 28px rgba(0,0,0,0.2)",
            padding: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <strong style={{ fontSize: "14px" }}>Text to Speech</strong>
            <span
              style={{
                ...statusStyle,
                fontSize: "12px",
                borderRadius: "999px",
                padding: "2px 8px",
                fontWeight: 600,
              }}
            >
              {statusLabelMap[playbackState]}
            </span>
          </div>

          {!isSpeechSupported && (
            <p style={{ margin: 0, fontSize: "13px", color: "#92400e" }}>
              Your browser does not support speech synthesis.
            </p>
          )}

          {isSpeechSupported && !voiceSettings.enabled && (
            <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>
              Text-to-speech is turned off in Settings.
            </p>
          )}

          {canSpeak && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <button
                type="button"
                onClick={handlePlay}
                disabled={disablePlay}
                title="Play"
                style={getControlStyle(disablePlay)}
              >
                <FaPlay size={14} />
              </button>
              <button
                type="button"
                onClick={handlePause}
                disabled={disablePause}
                title="Pause"
                style={getControlStyle(disablePause)}
              >
                <FaPause size={14} />
              </button>
              <button
                type="button"
                onClick={handleResume}
                disabled={disableResume}
                title="Resume"
                style={getControlStyle(disableResume)}
              >
                <FaForward size={14} />
              </button>
              <button
                type="button"
                onClick={handleReplay}
                disabled={disableReplay}
                title="Replay"
                style={getControlStyle(disableReplay)}
              >
                <FaRedoAlt size={14} />
              </button>
            </div>
          )}

          {runtimeMessage && (
            <p style={{ margin: 0, fontSize: "12px", color: "#b91c1c" }}>
              {runtimeMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TextToSpeechControl;
