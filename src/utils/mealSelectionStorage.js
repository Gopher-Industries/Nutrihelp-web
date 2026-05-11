const BASE_MEAL_SELECTIONS_STORAGE_KEY = "nutrihelp_add_meal_selections_by_date_v1";

function safeParseJson(rawValue) {
  if (!rawValue) return null;
  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

function normalizeUserId(value) {
  if (value === null || value === undefined) return "";
  const text = String(value).trim();
  return text ? text : "";
}

function extractUserIdFromSessionPayload(payload) {
  if (!payload || typeof payload !== "object") return "";

  return (
    normalizeUserId(payload.user_id) ||
    normalizeUserId(payload.id) ||
    normalizeUserId(payload.uid) ||
    normalizeUserId(payload.sub) ||
    normalizeUserId(payload.userId) ||
    normalizeUserId(payload?.user?.user_id) ||
    normalizeUserId(payload?.user?.id)
  );
}

function getCurrentSessionUserId() {
  if (typeof window === "undefined") return "";

  const storageTargets = [sessionStorage, localStorage];
  const payloadKeys = ["user_session", "user"];

  for (const storageTarget of storageTargets) {
    for (const payloadKey of payloadKeys) {
      const parsed = safeParseJson(storageTarget.getItem(payloadKey));
      const userId = extractUserIdFromSessionPayload(parsed);
      if (userId) return userId;
    }
  }

  return "";
}

export function getMealSelectionsStorageKey() {
  const userId = getCurrentSessionUserId();
  return userId
    ? `${BASE_MEAL_SELECTIONS_STORAGE_KEY}::user_${userId}`
    : `${BASE_MEAL_SELECTIONS_STORAGE_KEY}::guest`;
}

export function readMealSelectionsByDateFromStorage() {
  if (typeof window === "undefined") return {};

  try {
    const storageKey = getMealSelectionsStorageKey();
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeMealSelectionsByDateToStorage(nextValue) {
  if (typeof window === "undefined") return;

  try {
    const storageKey = getMealSelectionsStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(nextValue));
  } catch {
    // Ignore localStorage write failures in unsupported/private environments.
  }
}

