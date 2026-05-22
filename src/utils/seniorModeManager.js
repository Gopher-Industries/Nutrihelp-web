export const SENIOR_MODE_STORAGE_KEY = "nutrihelp_senior_mode_enabled_v1";
export const SENIOR_MODE_CHANGED_EVENT = "nutrihelp:senior-mode-changed";
const SENIOR_MODE_CLASS = "senior-mode";

function toBoolean(value) {
  return Boolean(value);
}

function applySeniorModeClass(enabled) {
  if (typeof document === "undefined") return;
  const isEnabled = toBoolean(enabled);

  document.documentElement.classList.toggle(SENIOR_MODE_CLASS, isEnabled);
  document.body.classList.toggle(SENIOR_MODE_CLASS, isEnabled);
}

export function getSeniorModeEnabled() {
  if (typeof window === "undefined" || !window.localStorage) return false;

  try {
    return localStorage.getItem(SENIOR_MODE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSeniorModeEnabled(enabled) {
  const isEnabled = toBoolean(enabled);

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      if (isEnabled) {
        localStorage.setItem(SENIOR_MODE_STORAGE_KEY, "1");
      } else {
        localStorage.removeItem(SENIOR_MODE_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors in restricted environments.
    }

    window.dispatchEvent(
      new CustomEvent(SENIOR_MODE_CHANGED_EVENT, {
        detail: { enabled: isEnabled },
      })
    );
  }

  applySeniorModeClass(isEnabled);
  return isEnabled;
}

export function toggleSeniorMode() {
  return setSeniorModeEnabled(!getSeniorModeEnabled());
}

export function initializeSeniorMode() {
  const enabled = getSeniorModeEnabled();
  applySeniorModeClass(enabled);
  return enabled;
}
