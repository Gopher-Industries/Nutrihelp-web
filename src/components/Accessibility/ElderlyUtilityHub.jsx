import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSeniorModeEnabled,
  SENIOR_MODE_CHANGED_EVENT,
  setSeniorModeEnabled,
} from "../../utils/seniorModeManager";
import {
  EMERGENCY_CONTACT_CHANGED_EVENT,
  hasEmergencyContact,
  isEmergencyPhoneValid,
  normalizeEmergencyContactUserKey,
  readEmergencyContact,
  saveEmergencyContact,
  toEmergencyTelHref,
} from "../../utils/emergencyContactManager";
import "./ElderlyUtilityHub.css";

const DEFAULT_FLOATING_BOTTOM = 18;
const FLOATING_STACK_GAP = 12;

function ElderlyUtilityHub({ userKey = "", profilePath = "/userProfile" }) {
  const navigate = useNavigate();
  const resolvedUserKey = useMemo(
    () => normalizeEmergencyContactUserKey(userKey),
    [userKey]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [seniorEnabled, setSeniorEnabledState] = useState(() => getSeniorModeEnabled());
  const [contact, setContact] = useState(() => readEmergencyContact(resolvedUserKey));
  const [isSosEditorOpen, setIsSosEditorOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftPhone, setDraftPhone] = useState("");
  const [error, setError] = useState("");
  const [floatingBottom, setFloatingBottom] = useState(DEFAULT_FLOATING_BOTTOM);

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
  }, [syncFloatingBottomOffset]);

  useEffect(() => {
    const onSeniorModeChanged = (event) => {
      setSeniorEnabledState(Boolean(event?.detail?.enabled));
    };

    window.addEventListener(SENIOR_MODE_CHANGED_EVENT, onSeniorModeChanged);
    return () => window.removeEventListener(SENIOR_MODE_CHANGED_EVENT, onSeniorModeChanged);
  }, []);

  useEffect(() => {
    setContact(readEmergencyContact(resolvedUserKey));
  }, [resolvedUserKey]);

  useEffect(() => {
    const onEmergencyContactChanged = (event) => {
      const changedUserKey = normalizeEmergencyContactUserKey(event?.detail?.userKey || "");
      if (changedUserKey !== resolvedUserKey) return;
      setContact(readEmergencyContact(resolvedUserKey));
    };

    window.addEventListener(EMERGENCY_CONTACT_CHANGED_EVENT, onEmergencyContactChanged);
    return () => {
      window.removeEventListener(EMERGENCY_CONTACT_CHANGED_EVENT, onEmergencyContactChanged);
    };
  }, [resolvedUserKey]);

  const closeSosEditor = () => {
    setIsSosEditorOpen(false);
    setError("");
  };

  const openSosEditor = () => {
    const latest = readEmergencyContact(resolvedUserKey);
    setDraftName(latest.name || "");
    setDraftPhone(latest.phone || "");
    setError("");
    setIsSosEditorOpen(true);
    setIsOpen(false);
  };

  const handleToggleSeniorMode = () => {
    const next = setSeniorModeEnabled(!seniorEnabled);
    setSeniorEnabledState(next);
  };

  const handleOpenTtsControls = () => {
    window.dispatchEvent(new CustomEvent("nutrihelp:tts-open-panel"));
    setIsOpen(false);
  };

  const handleSosAction = () => {
    if (!hasEmergencyContact(contact)) {
      openSosEditor();
      return;
    }

    const telHref = toEmergencyTelHref(contact.phone);
    if (!telHref) {
      openSosEditor();
      return;
    }

    window.location.href = telHref;
    setIsOpen(false);
  };

  const handleSaveSosContact = (event) => {
    event.preventDefault();

    if (!isEmergencyPhoneValid(draftPhone)) {
      setError("Please enter a valid phone number (8-15 digits).");
      return;
    }

    const savedContact = saveEmergencyContact(resolvedUserKey, {
      name: draftName,
      phone: draftPhone,
    });

    setContact(savedContact);
    setIsSosEditorOpen(false);
    setError("");
  };

  const callReady = hasEmergencyContact(contact);

  return (
    <div
      className="elderly-utility-hub tts-ignore"
      data-tts-ignore="true"
      style={{ bottom: `${floatingBottom}px` }}
    >
      {isSosEditorOpen ? (
        <form className="elderly-sos-editor" onSubmit={handleSaveSosContact}>
          <h3>Emergency Contact</h3>
          <p>Save contact once. Next time, SOS is one tap to call.</p>

          <label>
            Name
            <input
              type="text"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Family member name"
              maxLength={80}
            />
          </label>

          <label>
            Phone
            <input
              type="tel"
              value={draftPhone}
              onChange={(event) => setDraftPhone(event.target.value)}
              placeholder="e.g. 0412345678"
              inputMode="tel"
            />
          </label>

          {error ? <div className="elderly-sos-error">{error}</div> : null}

          <div className="elderly-sos-actions">
            <button type="submit" className="elderly-sos-save">Save</button>
            <button type="button" className="elderly-sos-cancel" onClick={closeSosEditor}>Cancel</button>
            <button
              type="button"
              className="elderly-sos-profile"
              onClick={() => {
                closeSosEditor();
                navigate(profilePath);
              }}
            >
              Edit in Profile
            </button>
          </div>
        </form>
      ) : null}

      {isOpen ? (
        <div className="elderly-utility-menu">
          <button
            type="button"
            className={`elderly-utility-action ${seniorEnabled ? "active" : ""}`}
            onClick={handleToggleSeniorMode}
          >
            <span className="icon" aria-hidden="true">🧓🏻</span>
            <span>Senior Mode {seniorEnabled ? "ON" : "OFF"}</span>
          </button>

          <button
            type="button"
            className={`elderly-utility-action sos ${callReady ? "ready" : ""}`}
            onClick={handleSosAction}
          >
            <span className="icon" aria-hidden="true">🚨</span>
            <span>{callReady ? "SOS Call" : "Add SOS Contact"}</span>
          </button>

          <button
            type="button"
            className="elderly-utility-action"
            onClick={handleOpenTtsControls}
          >
            <span className="icon" aria-hidden="true">🔊</span>
            <span>Text To Speech</span>
          </button>
        </div>
      ) : null}

      <button
        type="button"
        className={`elderly-utility-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close elderly utility menu" : "Open elderly utility menu"}
        aria-expanded={isOpen}
      >
        <span className="elderly-trigger-emoji" aria-hidden="true">🧓🏻</span>
        <span className="elderly-trigger-text">Eco Senior</span>
      </button>
    </div>
  );
}

export default ElderlyUtilityHub;
