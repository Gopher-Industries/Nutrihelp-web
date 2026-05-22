import React, { useEffect, useState } from "react";
import {
  getSeniorModeEnabled,
  SENIOR_MODE_CHANGED_EVENT,
  SENIOR_MODE_STORAGE_KEY,
  setSeniorModeEnabled,
} from "../../utils/seniorModeManager";
import "./SeniorModeToggle.css";

function SeniorModeToggle() {
  const [enabled, setEnabled] = useState(() => getSeniorModeEnabled());

  useEffect(() => {
    const handleSeniorModeChanged = (event) => {
      const nextEnabled = Boolean(event?.detail?.enabled);
      setEnabled(nextEnabled);
    };

    const handleStorageChange = (event) => {
      if (event.key && event.key !== SENIOR_MODE_STORAGE_KEY) return;
      setEnabled(getSeniorModeEnabled());
    };

    window.addEventListener(SENIOR_MODE_CHANGED_EVENT, handleSeniorModeChanged);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener(SENIOR_MODE_CHANGED_EVENT, handleSeniorModeChanged);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleToggle = () => {
    const nextEnabled = setSeniorModeEnabled(!enabled);
    setEnabled(nextEnabled);
  };

  return (
    <div className="senior-mode-toggle-wrap tts-ignore" data-tts-ignore="true">
      <button
        type="button"
        className={`senior-mode-toggle ${enabled ? "active" : ""}`}
        aria-pressed={enabled}
        aria-label={enabled ? "Disable Senior Mode" : "Enable Senior Mode"}
        onClick={handleToggle}
      >
        <span className="senior-mode-emoji" aria-hidden="true">🧓🏻</span>
        <span className="senior-mode-text">{enabled ? "Senior ON" : "Senior Mode"}</span>
      </button>
    </div>
  );
}

export default SeniorModeToggle;
