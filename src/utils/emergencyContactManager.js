export const EMERGENCY_CONTACT_STORAGE_KEY = "nutrihelp_emergency_contacts_v1";
export const EMERGENCY_CONTACT_CHANGED_EVENT = "nutrihelp:emergency-contact-changed";
const GUEST_KEY = "guest";

const digitsOnly = (value = "") => String(value || "").replace(/\D/g, "");

export function normalizeEmergencyContactUserKey(userKey = "") {
  const normalized = String(userKey || "").trim().toLowerCase();
  return normalized || GUEST_KEY;
}

export function sanitizeEmergencyContact(contact = {}) {
  const name = String(contact.name || "").trim().slice(0, 80);
  const phone = String(contact.phone || "").trim().slice(0, 24);
  return { name, phone };
}

export function isEmergencyPhoneValid(phone = "") {
  const normalizedDigits = digitsOnly(phone);
  return /^[0-9]{8,15}$/.test(normalizedDigits);
}

export function toEmergencyTelHref(phone = "") {
  const cleaned = String(phone || "").trim();
  if (!cleaned) return "";

  const compact = cleaned.replace(/[\s()-]/g, "");
  if (!compact) return "";

  const telTarget = compact.startsWith("+")
    ? `+${compact.slice(1).replace(/\D/g, "")}`
    : compact.replace(/\D/g, "");

  if (!telTarget) return "";
  return `tel:${telTarget}`;
}

export function hasEmergencyContact(contact = {}) {
  return isEmergencyPhoneValid(contact?.phone || "");
}

function readEmergencyContactsMap() {
  if (typeof window === "undefined" || !window.localStorage) return {};

  try {
    const raw = localStorage.getItem(EMERGENCY_CONTACT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}

function writeEmergencyContactsMap(nextMap) {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    localStorage.setItem(EMERGENCY_CONTACT_STORAGE_KEY, JSON.stringify(nextMap));
  } catch {
    // Ignore storage errors in restricted environments.
  }
}

export function readEmergencyContact(userKey = "") {
  const resolvedKey = normalizeEmergencyContactUserKey(userKey);
  const map = readEmergencyContactsMap();
  return sanitizeEmergencyContact(map[resolvedKey] || {});
}

export function saveEmergencyContact(userKey = "", contact = {}) {
  const resolvedKey = normalizeEmergencyContactUserKey(userKey);
  const sanitized = sanitizeEmergencyContact(contact);
  const map = readEmergencyContactsMap();

  if (sanitized.name || sanitized.phone) {
    map[resolvedKey] = sanitized;
  } else {
    delete map[resolvedKey];
  }

  writeEmergencyContactsMap(map);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(EMERGENCY_CONTACT_CHANGED_EVENT, {
        detail: {
          userKey: resolvedKey,
          contact: sanitized,
        },
      })
    );
  }

  return sanitized;
}

export function removeEmergencyContact(userKey = "") {
  return saveEmergencyContact(userKey, {});
}
