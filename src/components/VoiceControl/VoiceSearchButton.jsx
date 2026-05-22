import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import "./VoiceSearchButton.css";

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function VoiceSearchButton({
  onTranscript,
  language,
  disabled = false,
  className = "",
  ariaLabel = "Search with voice",
}) {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  const recognitionConstructor = useMemo(
    () => getSpeechRecognitionConstructor(),
    []
  );
  const isSupported = Boolean(recognitionConstructor);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.stop();
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionConstructor || disabled || typeof onTranscript !== "function") {
      return;
    }

    const recognition = new recognitionConstructor();
    recognition.lang = language || (typeof navigator !== "undefined" ? navigator.language : "en-US");
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }

      const nextValue = transcript.trim();
      if (nextValue) {
        onTranscript(nextValue);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  }, [disabled, language, onTranscript, recognitionConstructor]);

  const toggleListening = useCallback(() => {
    if (!isSupported || disabled) return;

    if (isListening) {
      stopListening();
      return;
    }

    startListening();
  }, [disabled, isListening, isSupported, startListening, stopListening]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  const buttonTitle = !isSupported
    ? "Voice search is not supported in this browser"
    : isListening
      ? "Stop voice search"
      : "Start voice search";

  return (
    <button
      type="button"
      className={`nh-voice-search-button ${isListening ? "is-listening" : ""} ${className}`.trim()}
      aria-label={isListening ? "Stop voice search" : ariaLabel}
      aria-pressed={isListening}
      title={buttonTitle}
      onClick={toggleListening}
      disabled={disabled || !isSupported}
    >
      {isListening ? <MicOff size={24} /> : <Mic size={24} />}
    </button>
  );
}

export default VoiceSearchButton;
