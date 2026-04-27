import React, { useEffect } from "react";
import { Bot, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAssistant } from "../../context/assistant.context";
import AssistantPanel from "./AssistantPanel";
import "./AssistantWidget.css";

export default function AssistantWidget() {
  const { isOpen, openAssistant, closeAssistant } = useAssistant();
  const location = useLocation();
  const shouldHideWidget = location.pathname === "/chat";
  const hideFab = location.pathname === "/home";
  const panelId = "nutrihelp-assistant-panel";

  useEffect(() => {
    if (shouldHideWidget && isOpen) {
      closeAssistant();
    }
  }, [shouldHideWidget, isOpen, closeAssistant]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeAssistant();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeAssistant, isOpen]);

  if (shouldHideWidget) return null;

  return (
    <div className="assistant-widget-root" aria-live="polite">
      {isOpen ? (
        <>
          <button
            type="button"
            className="assistant-widget-overlay"
            aria-label="Close assistant"
            onClick={closeAssistant}
          />
          <div className="assistant-widget-panel-wrap">
            <AssistantPanel onClose={closeAssistant} panelId={panelId} />
          </div>
        </>
      ) : null}

      {!hideFab ? (
        <button
          type="button"
          className="assistant-widget-fab assistant-btn"
          onClick={isOpen ? closeAssistant : openAssistant}
          aria-label={isOpen ? "Close assistant" : "Open assistant"}
          aria-expanded={isOpen}
          aria-controls={panelId}
          title={isOpen ? "Close Assistant" : "Open Assistant"}
        >
          {isOpen ? <X size={20} aria-hidden="true" /> : <Bot size={20} aria-hidden="true" />}
          <span>{isOpen ? "Close" : "Assistant"}</span>
        </button>
      ) : null}
    </div>
  );
}
