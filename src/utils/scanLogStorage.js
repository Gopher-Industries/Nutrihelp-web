const SCAN_LOG_STORAGE_KEY = "nutrihelp_scan_log_v1";
const SCAN_LOG_UPDATED_EVENT = "nutrihelp:scan-log-updated";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeMealType(value) {
  const mealType = normalize(value);
  if (!mealType) return "";
  if (mealType === "breakfast" || mealType === "lunch" || mealType === "dinner") return mealType;
  if (mealType === "snack" || mealType === "snacks" || mealType === "other") return "others";
  return "";
}

function toNonNegativeInteger(value, fallback = null) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" && value.trim() === "") return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.round(parsed));
}

function toArray(rawValue) {
  if (Array.isArray(rawValue)) return rawValue;
  if (rawValue && typeof rawValue === "object") return Object.values(rawValue);
  return [];
}

function readRawScanLogEntries() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SCAN_LOG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return toArray(parsed);
  } catch {
    return [];
  }
}

function writeRawScanLogEntries(entries) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SCAN_LOG_STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new Event(SCAN_LOG_UPDATED_EVENT));
  } catch {
    // Ignore storage write errors to keep UI responsive.
  }
}

export function getScanLogKey(value) {
  return normalize(value);
}

export function normalizeScanLogEntry(entry, fallbackId = "") {
  const key = getScanLogKey(
    entry?.scanKey || entry?.title || entry?.name || entry?.label || fallbackId
  );
  if (!key) return null;

  const savedAt = entry?.savedAt || entry?.updatedAt || new Date().toISOString();
  const updatedAt = entry?.updatedAt || savedAt;
  const calories = toNonNegativeInteger(
    entry?.nutrition?.calories ?? entry?.estimatedCalories ?? entry?.estimated_calories,
    null
  );

  return {
    id: entry?.id || `scanlog-${key}`,
    scanKey: key,
    label: entry?.label || entry?.title || entry?.name || "",
    title: entry?.title || entry?.name || entry?.label || "Scanned meal",
    name: entry?.name || entry?.title || entry?.label || "Scanned meal",
    image: String(entry?.image || "").trim(),
    imageSource: entry?.imageSource || "",
    imageAttribution: entry?.imageAttribution || "",
    imageSourceUrl: entry?.imageSourceUrl || "",
    // Optional bookmark tag: breakfast/lunch/dinner/others.
    mealType: normalizeMealType(entry?.mealType),
    source: "scan_log",
    time: entry?.time || "AI Scan",
    servings: entry?.servings || entry?.servingDescription || entry?.serving_description || "1 Serving",
    level: entry?.level || "Ready",
    cuisine: entry?.cuisine || "",
    about: entry?.about || entry?.description || "",
    tags: Array.isArray(entry?.tags) ? entry.tags.filter(Boolean) : [],
    nutrition: {
      calories,
      carbs: toNonNegativeInteger(entry?.nutrition?.carbs, null),
      protein: toNonNegativeInteger(entry?.nutrition?.protein, null),
      fiber: toNonNegativeInteger(entry?.nutrition?.fiber, null),
      fat: toNonNegativeInteger(entry?.nutrition?.fat, null),
      sodium: toNonNegativeInteger(entry?.nutrition?.sodium, null),
    },
    confidence:
      typeof entry?.confidence === "number" && Number.isFinite(entry.confidence)
        ? Math.max(0, Math.min(1, entry.confidence))
        : 0,
    savedAt,
    updatedAt,
  };
}

export function readScanLogEntries() {
  const entries = readRawScanLogEntries()
    .map((entry, index) => normalizeScanLogEntry(entry, `legacy-${index}`))
    .filter(Boolean);

  const dedupedByKey = new Map();
  entries.forEach((entry) => {
    const existing = dedupedByKey.get(entry.scanKey);
    if (!existing || new Date(entry.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
      dedupedByKey.set(entry.scanKey, entry);
    }
  });

  return Array.from(dedupedByKey.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function writeScanLogEntries(entries) {
  const normalized = toArray(entries)
    .map((entry, index) => normalizeScanLogEntry(entry, `raw-${index}`))
    .filter(Boolean);
  writeRawScanLogEntries(normalized);
}

export function upsertScanLogEntry(entry) {
  const normalized = normalizeScanLogEntry(entry);
  if (!normalized) return readScanLogEntries();

  const current = readScanLogEntries();
  const next = [
    {
      ...normalized,
      savedAt: normalized.savedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    ...current.filter((item) => item.scanKey !== normalized.scanKey),
  ];

  writeScanLogEntries(next);
  return next;
}

export function removeScanLogEntry(entryOrKey) {
  const key = getScanLogKey(
    typeof entryOrKey === "string"
      ? entryOrKey
      : entryOrKey?.scanKey || entryOrKey?.title || entryOrKey?.name || entryOrKey?.label
  );
  if (!key) return readScanLogEntries();

  const current = readScanLogEntries();
  const next = current.filter((entry) => entry.scanKey !== key);
  writeScanLogEntries(next);
  return next;
}

export function updateScanLogEntryMealType(entryOrKey, mealType) {
  const key = getScanLogKey(
    typeof entryOrKey === "string"
      ? entryOrKey
      : entryOrKey?.scanKey || entryOrKey?.title || entryOrKey?.name || entryOrKey?.label
  );
  const normalizedMealType = normalizeMealType(mealType);

  if (!key || !normalizedMealType) return readScanLogEntries();

  const current = readScanLogEntries();
  let wasUpdated = false;
  const next = current.map((entry) => {
    if (entry.scanKey !== key) return entry;
    wasUpdated = true;
    return {
      ...entry,
      mealType: normalizedMealType,
      updatedAt: new Date().toISOString(),
    };
  });

  if (!wasUpdated) return current;

  writeScanLogEntries(next);
  return readScanLogEntries();
}

export { SCAN_LOG_STORAGE_KEY, SCAN_LOG_UPDATED_EVENT };
