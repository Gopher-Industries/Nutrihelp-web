import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EMERGENCY_CONTACT_CHANGED_EVENT,
  hasEmergencyContact,
  isEmergencyPhoneValid,
  normalizeEmergencyContactUserKey,
  readEmergencyContact,
  removeEmergencyContact,
  saveEmergencyContact,
  toEmergencyTelHref,
} from "../../utils/emergencyContactManager";
import "./EmergencySOSButton.css";

function EmergencySOSButton({ userKey = "", profilePath = "/userProfile" }) {
  const navigate = useNavigate();
  const resolvedUserKey = useMemo(
    () => normalizeEmergencyContactUserKey(userKey),
    [userKey]
  );

  const [contact, setContact] = useState(() => readEmergencyContact(resolvedUserKey));
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftPhone, setDraftPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setContact(readEmergencyContact(resolvedUserKey));
  }, [resolvedUserKey]);

  useEffect(() => {
    const handleEmergencyContactChanged = (event) => {
      const changedUserKey = normalizeEmergencyContactUserKey(event?.detail?.userKey || "");
      if (changedUserKey !== resolvedUserKey) return;
      setContact(readEmergencyContact(resolvedUserKey));
    };

    window.addEventListener(EMERGENCY_CONTACT_CHANGED_EVENT, handleEmergencyContactChanged);
    return () => {
      window.removeEventListener(EMERGENCY_CONTACT_CHANGED_EVENT, handleEmergencyContactChanged);
    };
  }, [resolvedUserKey]);

  const openEditor = () => {
    const latest = readEmergencyContact(resolvedUserKey);
    setDraftName(latest.name || "");
    setDraftPhone(latest.phone || "");
    setError("");
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setError("");
  };

  const handleMainAction = () => {
    if (!hasEmergencyContact(contact)) {
      openEditor();
      return;
    }

    const telHref = toEmergencyTelHref(contact.phone);
    if (!telHref) {
      openEditor();
      return;
    }

    window.location.href = telHref;
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (!isEmergencyPhoneValid(draftPhone)) {
      setError("Please enter a valid phone number (8-15 digits).");
      return;
    }

    const saved = saveEmergencyContact(resolvedUserKey, {
      name: draftName,
      phone: draftPhone,
    });
    setContact(saved);
    setIsEditorOpen(false);
    setError("");
  };

  const handleRemove = () => {
    removeEmergencyContact(resolvedUserKey);
    setContact(readEmergencyContact(resolvedUserKey));
    setDraftName("");
    setDraftPhone("");
    setError("");
    setIsEditorOpen(false);
  };

  const callReady = hasEmergencyContact(contact);

  return (
    <div className="sos-floating-wrap tts-ignore" data-tts-ignore="true">
      {isEditorOpen ? (
        <form className="sos-editor-card" onSubmit={handleSave}>
          <h3>Emergency Contact</h3>
          <p>Save a trusted person for one-tap SOS calling.</p>

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

          {error ? <div className="sos-editor-error">{error}</div> : null}

          <div className="sos-editor-actions">
            <button type="submit" className="sos-editor-save">Save</button>
            <button type="button" className="sos-editor-cancel" onClick={closeEditor}>Cancel</button>
            <button type="button" className="sos-editor-profile" onClick={() => {
              closeEditor();
              navigate(profilePath);
            }}>
              Edit in Profile
            </button>
            {callReady ? (
              <button type="button" className="sos-editor-remove" onClick={handleRemove}>
                Remove
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      <div className="sos-floating-actions">
        <button
          type="button"
          className={`sos-main-button ${callReady ? "ready" : "setup"}`}
          aria-label={callReady ? "Call emergency contact" : "Add emergency contact"}
          onClick={handleMainAction}
          title={
            callReady
              ? `Call ${contact.name || "emergency contact"}`
              : "Add emergency contact"
          }
        >
          <span className="sos-label">SOS</span>
          <span className="sos-sub-label">{callReady ? "Call now" : "Add contact"}</span>
        </button>
      </div>
    </div>
  );
}

export default EmergencySOSButton;
