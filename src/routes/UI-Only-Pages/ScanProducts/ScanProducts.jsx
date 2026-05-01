import React, { useEffect, useMemo, useRef, useState } from "react";
import "./ScanProducts.css";
import { useLocation, useNavigate } from "react-router-dom";
import { scanSingleImage } from "../../../services/imageScanApi";
import {
  fetchNutritionPreview,
  saveScannedMeal,
} from "../../../services/mealLogApi";
import { fetchDishImage } from "../../../services/dishImageApi";
import {
  SCAN_LOG_UPDATED_EVENT,
  getScanLogKey,
  readScanLogEntries,
  removeScanLogEntry,
  upsertScanLogEntry,
} from "../../../utils/scanLogStorage";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"];
const BOOKMARK_TAG_OPTIONS = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "others", label: "Other" },
];
const DEFAULT_MEAL_IMAGE = "/images/meal-mock/placeholder.svg";
const MENU_SELECTIONS_STORAGE_KEY = "nutrihelp_add_meal_selections_by_date_v1";
const SCAN_REVIEW_STORAGE_KEY = "nutrihelp_scan_review_flow_v1";

function formatLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayString() {
  return formatLocalDate();
}

function isBeforeToday(dateValue) {
  return Boolean(dateValue && dateValue < todayString());
}

function humanizeLabel(label) {
  return String(label || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function percent(score) {
  return `${Math.round(Number(score || 0) * 100)}%`;
}

function isBlobUrl(value) {
  return /^blob:/i.test(String(value || ""));
}

function resolveDetailImage({ explicitImage, fallbackImage }) {
  const safeExplicitImage = String(explicitImage || "").trim();
  if (safeExplicitImage && !isBlobUrl(safeExplicitImage)) return safeExplicitImage;

  const safeFallbackImage = String(fallbackImage || "").trim();
  if (safeFallbackImage && !isBlobUrl(safeFallbackImage)) return safeFallbackImage;

  return DEFAULT_MEAL_IMAGE;
}

function normalizeNutritionPreview(label, nutrition) {
  return {
    label,
    display_name: nutrition?.display_name || humanizeLabel(label),
    about: nutrition?.about || null,
    cuisine: nutrition?.cuisine || null,
    estimated_calories: nutrition?.estimated_calories ?? null,
    serving_description: nutrition?.serving_description ?? null,
    source: nutrition?.source || "scan_result",
    available: Boolean(
      nutrition?.available ?? nutrition?.estimated_calories != null
    ),
  };
}

function nutritionKey(label) {
  return String(label || "").trim().toLowerCase();
}

function hasBlockingPhotoIssue(issues = []) {
  return issues.some((issue) =>
    /resolution|blurry|large face|clear food photo/i.test(issue)
  );
}

function normalizeMealTypeForDetail(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "breakfast" || normalized === "lunch" || normalized === "dinner") {
    return normalized;
  }
  return "others";
}

function formatBookmarkTagLabel(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "others") return "Other";
  return normalized ? `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}` : "Any meal";
}

function toNonNegativeInteger(value, fallback = null) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" && value.trim() === "") return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.round(parsed));
}

function normalizeConfidence(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  const decimalValue = parsed > 1 ? parsed / 100 : parsed;
  return Math.max(0, Math.min(1, decimalValue));
}

function getDefaultScanLabel(scanResult) {
  if (!scanResult) return "";
  return scanResult.is_unclear ? "" : scanResult.label || scanResult.topk?.[0]?.label || "";
}

function readScanReviewPayload(locationState) {
  if (locationState?.scanFlow?.scanResult) return locationState.scanFlow;
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(SCAN_REVIEW_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.scanResult ? parsed : null;
  } catch {
    return null;
  }
}

function writeScanReviewPayload(payload) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SCAN_REVIEW_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Route state still carries the current scan result if browser storage is full.
  }
}

function createImagePreviewDataUrl(file, { maxWidth = 1400, quality = 0.82 } = {}) {
  return new Promise((resolve) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => resolve("");
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => resolve(String(reader.result || ""));
      image.onload = () => {
        const scale = Math.min(1, maxWidth / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");

        if (!context) {
          resolve(String(reader.result || ""));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

function readMenuSelectionsByDate() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(MENU_SELECTIONS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeMenuSelectionsByDate(selectionsByDate) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MENU_SELECTIONS_STORAGE_KEY, JSON.stringify(selectionsByDate));
  window.dispatchEvent(new Event("storage"));
}

function getScanEntryId(entry) {
  return entry?.id ?? entry?._id ?? entry?.entry_id ?? null;
}

function buildMenuMealSlotKey(meal, fallback = "") {
  const recipeIdKey = nutritionKey(meal?.recipeId);
  const titleKey = nutritionKey(meal?.title || meal?.name);
  const logEntryKey = nutritionKey(meal?.logEntryId);
  const idKey = nutritionKey(meal?.id);
  const fallbackKey = nutritionKey(fallback);
  const selectedIdentityKey = titleKey
    ? `title:${titleKey}`
    : recipeIdKey && recipeIdKey !== "null"
    ? `recipe:${recipeIdKey}`
    : logEntryKey
    ? `scan-log:${logEntryKey}`
    : idKey
    ? `id:${idKey}`
    : fallbackKey
    ? `legacy:${fallbackKey}`
    : "";

  if (!selectedIdentityKey) return "";
  return `slot:${selectedIdentityKey}|${normalizeMealTypeForDetail(meal?.mealType)}`;
}

function removeDuplicateMealSelections(selectionMap, incomingMeal) {
  if (!selectionMap || typeof selectionMap !== "object") return {};

  const incomingTitleKey = nutritionKey(incomingMeal?.title || incomingMeal?.name);
  const incomingMealType = normalizeMealTypeForDetail(incomingMeal?.mealType);
  const incomingLogEntryKey = nutritionKey(incomingMeal?.logEntryId);
  const incomingIdKey = nutritionKey(incomingMeal?.id);

  return Object.fromEntries(
    Object.entries(selectionMap).filter(([entryKey, existingMeal]) => {
      if (!existingMeal || typeof existingMeal !== "object") return true;

      const existingTitleKey = nutritionKey(existingMeal?.title || existingMeal?.name);
      const existingMealType = normalizeMealTypeForDetail(existingMeal?.mealType);
      const existingLogEntryKey = nutritionKey(existingMeal?.logEntryId);
      const existingIdKey = nutritionKey(existingMeal?.id || entryKey);
      const sameMealType = existingMealType === incomingMealType;
      const sameTitle = incomingTitleKey && existingTitleKey === incomingTitleKey;
      const sameLogEntry = incomingLogEntryKey && existingLogEntryKey === incomingLogEntryKey;
      const sameId = incomingIdKey && existingIdKey === incomingIdKey;

      return !(sameMealType && (sameTitle || sameLogEntry || sameId));
    })
  );
}

function syncScanMealToMenuStorage(date, meal) {
  if (!date || !meal) return false;

  try {
    const currentSelections = readMenuSelectionsByDate();
    const currentDateMap =
      currentSelections[date] && typeof currentSelections[date] === "object"
        ? currentSelections[date]
        : {};
    const normalizedMeal = {
      ...meal,
      mealType: normalizeMealTypeForDetail(meal.mealType),
    };
    const slotKey = buildMenuMealSlotKey(normalizedMeal, `${date}-${normalizedMeal.title}`);
    if (!slotKey) return false;
    const dedupedDateMap = removeDuplicateMealSelections(currentDateMap, normalizedMeal);

    writeMenuSelectionsByDate({
      ...currentSelections,
      [date]: {
        ...dedupedDateMap,
        [slotKey]: normalizedMeal,
      },
    });

    return true;
  } catch {
    return false;
  }
}

function buildMenuMealFromScan({
  entry,
  activeLabel,
  selectedMealType,
  nutritionPreview,
  scanResult,
  parsedCalories,
  requiresConfirmation,
  selectedLogDate,
}) {
  const scanNutrition = scanResult?.nutrition || {};
  const nutritionSource = nutritionPreview || {};
  const logEntryId = getScanEntryId(entry);
  const dishTitle =
    nutritionSource?.display_name ||
    scanNutrition?.display_name ||
    humanizeLabel(entry?.label || activeLabel);
  const normalizedMealType = normalizeMealTypeForDetail(entry?.meal_type || selectedMealType);
  const estimatedCalories = toNonNegativeInteger(
    parsedCalories ??
      entry?.estimated_calories ??
      nutritionSource?.estimated_calories ??
      nutritionSource?.calories ??
      scanNutrition?.estimated_calories ??
      scanNutrition?.calories,
    null
  );

  return {
    id: logEntryId ? `scan-${logEntryId}` : `scan-${nutritionKey(dishTitle)}-${Date.now()}`,
    recipeId: null,
    logEntryId: logEntryId || null,
    title: dishTitle,
    name: dishTitle,
    image: resolveDetailImage({
      explicitImage: nutritionSource?.image || scanNutrition?.image || scanResult?.image,
    }),
    imageSource: "scan",
    imageAttribution: "",
    imageSourceUrl: "",
    mealType: normalizedMealType,
    description:
      nutritionSource?.about ||
      scanNutrition?.about ||
      `${dishTitle} was identified from your uploaded food photo and saved from the scan flow.`,
    time: "AI Scan",
    servings:
      entry?.serving_description ||
      nutritionSource?.serving_description ||
      scanNutrition?.serving_description ||
      "1 Serving",
    level: requiresConfirmation ? "Needs Review" : "Ready",
    tags: [
      nutritionSource?.cuisine || scanNutrition?.cuisine || null,
      requiresConfirmation ? "Needs Review" : "AI Scan",
      estimatedCalories == null ? "No Estimate" : "Calorie Estimate",
    ].filter(Boolean),
    source: "scan_result",
    date: entry?.date || selectedLogDate,
    nutrition: {
      calories: estimatedCalories,
      carbs: toNonNegativeInteger(
        nutritionSource?.carbs ?? nutritionSource?.carbohydrates ?? scanNutrition?.carbs ?? scanNutrition?.carbohydrates,
        null
      ),
      protein: toNonNegativeInteger(nutritionSource?.protein ?? scanNutrition?.protein, null),
      fiber: toNonNegativeInteger(nutritionSource?.fiber ?? scanNutrition?.fiber, null),
      fat: toNonNegativeInteger(nutritionSource?.fat ?? scanNutrition?.fat, null),
      sodium: toNonNegativeInteger(nutritionSource?.sodium ?? scanNutrition?.sodium, null),
    },
  };
}

function ScanProducts({ mode = "scan", embedded = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const activeLabelRef = useRef("");
  const isReviewMode = mode === "review";
  const reviewPayload = useMemo(
    () => (isReviewMode ? readScanReviewPayload(location.state) : null),
    [isReviewMode, location.state]
  );
  const initialScanResult = reviewPayload?.scanResult || null;
  const initialLabel = getDefaultScanLabel(initialScanResult);
  const initialNutritionPreview = initialLabel
    ? normalizeNutritionPreview(initialLabel, initialScanResult?.nutrition)
    : null;
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(reviewPayload?.previewUrl || "");
  const [scanResult, setScanResult] = useState(initialScanResult);
  const [selectedMealType, setSelectedMealType] = useState("Lunch");
  const [selectedLogDate, setSelectedLogDate] = useState(() => todayString());
  const [selectedLabel, setSelectedLabel] = useState(initialLabel);
  const [manualLabelInput, setManualLabelInput] = useState(initialLabel);
  const [nutritionPreview, setNutritionPreview] = useState(initialNutritionPreview);
  const [suggestedNutrition, setSuggestedNutrition] = useState(
    initialLabel
      ? {
          [nutritionKey(initialLabel)]: initialNutritionPreview,
        }
      : {}
  );
  const [editedCaloriesInput, setEditedCaloriesInput] = useState(
    initialNutritionPreview?.estimated_calories != null
      ? String(initialNutritionPreview.estimated_calories)
      : ""
  );
  const [scanLogEntries, setScanLogEntries] = useState(() => readScanLogEntries());
  const [scanError, setScanError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingNutrition, setIsLoadingNutrition] = useState(false);
  const [isOpeningDetail, setIsOpeningDetail] = useState(false);
  const [isSavingScanLog, setIsSavingScanLog] = useState(false);
  const [isBookmarkTagDialogOpen, setIsBookmarkTagDialogOpen] = useState(false);
  const [bookmarkTag, setBookmarkTag] = useState(() => normalizeMealTypeForDetail("Lunch"));

  const requiresConfirmation = Boolean(scanResult?.is_unclear);
  const hasConfidentScanLabel = Boolean(scanResult?.label && !requiresConfirmation);
  const activeLabel =
    manualLabelInput.trim() || selectedLabel || (hasConfidentScanLabel ? scanResult?.label : "");
  const isManualOverride = Boolean(
    manualLabelInput.trim() &&
      manualLabelInput.trim() !== selectedLabel &&
      manualLabelInput.trim() !== scanResult?.label
  );
  const canSave = Boolean(
    scanResult &&
      activeLabel &&
      selectedLogDate &&
      selectedMealType &&
      !isBeforeToday(selectedLogDate) &&
      !isLoadingNutrition &&
      !isSaving
  );
  const hasSuggestedMatches = Boolean(scanResult?.topk?.length);
  const hasPhotoIssue = hasBlockingPhotoIssue(scanResult?.quality?.issues || []);

  const selectedCandidate = useMemo(() => {
    if (!scanResult || !activeLabel) return null;
    const activeKey = nutritionKey(activeLabel);
    return (
      scanResult.topk?.find((item) => nutritionKey(item.label) === activeKey) ||
      scanResult.matches?.find((item) => nutritionKey(item.label) === activeKey) ||
      null
    );
  }, [activeLabel, scanResult]);

  const parsedCalories =
    editedCaloriesInput.trim() === "" ? null : Math.max(0, Math.round(Number(editedCaloriesInput)));
  const confidenceText =
    requiresConfirmation
      ? hasSuggestedMatches
        ? "Review needed"
        : "Not confident"
      : isManualOverride && !selectedCandidate
      ? "Edited by you"
      : percent(selectedCandidate?.score ?? scanResult?.confidence);
  const photoQualityText = hasPhotoIssue ? "Try another photo" : "Good enough";
  const hasNutritionEstimate = nutritionPreview?.estimated_calories != null;
  const displayMealName =
    nutritionPreview?.display_name || humanizeLabel(activeLabel) || "Choose a meal";
  const scanReviewTitle = hasConfidentScanLabel
    ? humanizeLabel(scanResult.label)
    : hasSuggestedMatches
    ? "Review suggested matches"
    : "No confident food match";
  const mealAboutText =
    nutritionPreview?.about ||
    (activeLabel
      ? "Detailed dish information is not available yet for this selection. You can still review the meal name and calories before saving."
      : "AI is not confident enough to choose a dish from this image. Pick one of the suggestions only if it looks right, or type the meal name yourself.");
  const servingHint = nutritionPreview
    ? nutritionPreview.available
      ? nutritionPreview.serving_description
        ? `Based on ${nutritionPreview.serving_description}. Calories are still only a rough estimate.`
        : "Calories are only a rough estimate."
        : "No estimate yet for this dish. You can type your own calories before saving."
    : "Calories are only a rough estimate.";
  const activeScanLogKey = getScanLogKey(activeLabel || displayMealName);
  const scanLogKeySet = useMemo(
    () => new Set(scanLogEntries.map((entry) => getScanLogKey(entry.scanKey || entry.title))),
    [scanLogEntries]
  );
  const isInScanLog = Boolean(activeScanLogKey && scanLogKeySet.has(activeScanLogKey));
  useEffect(() => {
    activeLabelRef.current = activeLabel;
  }, [activeLabel]);

  useEffect(() => {
    const syncScanLog = () => {
      setScanLogEntries(readScanLogEntries());
    };

    syncScanLog();
    window.addEventListener(SCAN_LOG_UPDATED_EVENT, syncScanLog);
    window.addEventListener("storage", syncScanLog);
    return () => {
      window.removeEventListener(SCAN_LOG_UPDATED_EVENT, syncScanLog);
      window.removeEventListener("storage", syncScanLog);
    };
  }, []);

  useEffect(() => {
    if (isReviewMode) {
      return undefined;
    }

    if (!uploadedImage) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(uploadedImage);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [isReviewMode, uploadedImage]);

  useEffect(() => {
    if (!scanResult || !activeLabel) {
      return undefined;
    }

    const cachedPreview = suggestedNutrition[nutritionKey(activeLabel)];
    if (cachedPreview) {
      setNutritionPreview(cachedPreview);
      setEditedCaloriesInput(
        cachedPreview?.estimated_calories != null
          ? String(cachedPreview.estimated_calories)
          : ""
      );
      return undefined;
    }

    if (activeLabel === scanResult.label && scanResult.nutrition) {
      const preview = normalizeNutritionPreview(activeLabel, scanResult.nutrition);
      setSuggestedNutrition((current) => ({
        ...current,
        [nutritionKey(activeLabel)]: preview,
      }));
      setNutritionPreview(preview);
      setEditedCaloriesInput(
        scanResult.nutrition?.estimated_calories != null
          ? String(scanResult.nutrition.estimated_calories)
          : ""
      );
      return undefined;
    }

    const timer = setTimeout(() => {
      void loadNutritionForLabel(activeLabel);
    }, 300);

    return () => clearTimeout(timer);
  }, [activeLabel, scanResult, suggestedNutrition]);

  function handleSelectedLogDateChange(event) {
    const nextDate = event.target.value;
    setSaveMessage("");

    if (!nextDate) {
      setSelectedLogDate("");
      setScanError("Choose a date before saving.");
      return;
    }

    if (isBeforeToday(nextDate)) {
      setScanError("Choose today or a future date.");
      return;
    }

    setScanError("");
    setSelectedLogDate(nextDate);
  }

  function handleFileUploadChange(event) {
    const file = event.target.files?.[0];
    setUploadedImage(file || null);
    setIsBookmarkTagDialogOpen(false);
    setScanResult(null);
    setSelectedLabel("");
    setManualLabelInput("");
    setNutritionPreview(null);
    setSuggestedNutrition({});
    setEditedCaloriesInput("");
    setScanError("");
    setSaveMessage("");
  }

  async function loadNutritionForLabel(label, { applyResult = true } = {}) {
    const requestKey = nutritionKey(label);
    if (applyResult) {
      setIsLoadingNutrition(true);
    }
    try {
      const preview = await fetchNutritionPreview(label);
      setSuggestedNutrition((current) => ({
        ...current,
        [requestKey]: preview,
      }));
      if (applyResult && nutritionKey(activeLabelRef.current) === requestKey) {
        setNutritionPreview(preview);
        setEditedCaloriesInput(
          preview?.estimated_calories != null ? String(preview.estimated_calories) : ""
        );
      }
      return preview;
    } catch (error) {
      if (applyResult) {
        setNutritionPreview(null);
        setEditedCaloriesInput("");
        setScanError(error.message || "Failed to estimate calories.");
      }
      return null;
    } finally {
      if (applyResult) {
        setIsLoadingNutrition(false);
      }
    }
  }

  async function handleImageUpload() {
    if (!uploadedImage) {
      setScanError("Choose an image before scanning.");
      return;
    }

    setIsScanning(true);
    setScanError("");
    setSaveMessage("");

    try {
      const data = await scanSingleImage(uploadedImage, { topk: 3 });
      const defaultLabel = data.is_unclear ? "" : data.label || data.topk?.[0]?.label || "";
      const reviewPreviewUrl = await createImagePreviewDataUrl(uploadedImage);
      const scanFlow = {
        scanResult: data,
        previewUrl: reviewPreviewUrl,
        scannedAt: Date.now(),
      };
      writeScanReviewPayload(scanFlow);
      navigate("/scan-review", { state: { scanFlow } });

      const defaultPreview = defaultLabel
        ? normalizeNutritionPreview(defaultLabel, data.nutrition)
        : null;
      setScanResult(data);
      setSelectedLabel(defaultLabel);
      setManualLabelInput(defaultLabel);
      setSuggestedNutrition(
        defaultLabel
          ? {
              [nutritionKey(defaultLabel)]: defaultPreview,
            }
          : {}
      );
      setNutritionPreview(defaultPreview);
      setEditedCaloriesInput(
        defaultPreview?.estimated_calories != null ? String(defaultPreview.estimated_calories) : ""
      );

      const suggestionLabels = (data.topk || [])
        .map((item) => item.label)
        .filter((label, index, array) => label && array.indexOf(label) === index);

      suggestionLabels.forEach((label) => {
        void loadNutritionForLabel(label, {
          applyResult: Boolean(defaultLabel) && nutritionKey(label) === nutritionKey(defaultLabel),
        });
      });
    } catch (error) {
      setScanResult(null);
      setSelectedLabel("");
      setManualLabelInput("");
      setNutritionPreview(null);
      setSuggestedNutrition({});
      setEditedCaloriesInput("");
      setScanError(error.message || "Failed to analyze image.");
    } finally {
      setIsScanning(false);
    }
  }

  function handleCandidateSelect(label) {
    setSelectedLabel(label);
    setManualLabelInput(label);
    setIsBookmarkTagDialogOpen(false);
    setSaveMessage("");
    setScanError("");

    const preview = suggestedNutrition[nutritionKey(label)];
    if (preview) {
      setNutritionPreview(preview);
      setEditedCaloriesInput(
        preview?.estimated_calories != null ? String(preview.estimated_calories) : ""
      );
    } else {
      setEditedCaloriesInput("");
      void loadNutritionForLabel(label);
    }
  }

  function handleToggleScanLogEntry() {
    if (!scanResult || !activeLabel) {
      setScanError("Choose a meal first, then save it to Scan Log.");
      return;
    }

    const dishTitle = displayMealName || humanizeLabel(activeLabel);
    const entryKey = getScanLogKey(activeLabel || dishTitle);

    if (!entryKey) {
      setScanError("Unable to save this dish to Scan Log.");
      return;
    }

    setScanError("");
    setSaveMessage("");

    if (scanLogKeySet.has(entryKey)) {
      const nextEntries = removeScanLogEntry(entryKey);
      setScanLogEntries(nextEntries);
      setIsBookmarkTagDialogOpen(false);
      setSaveMessage(`Removed ${dishTitle} from Scan Log.`);
      return;
    }

    setBookmarkTag(normalizeMealTypeForDetail(selectedMealType));
    setIsBookmarkTagDialogOpen(true);
  }

  function handleCancelBookmarkTag() {
    if (isSavingScanLog) return;
    setIsBookmarkTagDialogOpen(false);
  }

  async function handleConfirmBookmarkTag() {
    if (!scanResult || !activeLabel) {
      setScanError("Choose a meal first, then save it to Scan Log.");
      return;
    }

    const dishTitle = displayMealName || humanizeLabel(activeLabel);
    const nutritionSource = nutritionPreview || scanResult?.nutrition || {};
    const entryKey = getScanLogKey(activeLabel || dishTitle);
    const normalizedBookmarkTag = normalizeMealTypeForDetail(bookmarkTag);

    if (!entryKey) {
      setScanError("Unable to save this dish to Scan Log.");
      return;
    }

    setScanError("");
    setIsSavingScanLog(true);

    try {
      const fallbackImage = resolveDetailImage({
        explicitImage: nutritionSource?.image || scanResult?.image,
        fallbackImage: previewUrl,
      });
      const fetchedImage = await fetchDishImage(dishTitle, {
        cuisine: nutritionSource?.cuisine || "",
      }).catch(() => null);
      const savedEntries = upsertScanLogEntry({
        scanKey: entryKey,
        id: `scanlog-${entryKey}`,
        label: activeLabel,
        title: dishTitle,
        name: dishTitle,
        image: fetchedImage?.imageUrl || fallbackImage,
        imageSource: fetchedImage?.source || "scan",
        imageAttribution: fetchedImage?.attribution || "",
        imageSourceUrl: fetchedImage?.sourceUrl || "",
        mealType: normalizedBookmarkTag,
        source: "scan_log",
        time: "AI Scan",
        servings: nutritionSource?.serving_description || "1 Serving",
        level: requiresConfirmation ? "Needs Review" : "Ready",
        cuisine: nutritionSource?.cuisine || "",
        about: nutritionSource?.about || "",
        confidence: normalizeConfidence(
          activeLabel === scanResult.label
            ? scanResult.confidence ?? 0
            : selectedCandidate?.score ?? 0
        ),
        tags: [
          nutritionSource?.cuisine || null,
          "Scan Log",
          requiresConfirmation ? "Needs Review" : "AI Scan",
        ].filter(Boolean),
        nutrition: {
          calories: toNonNegativeInteger(
            parsedCalories ??
              nutritionSource?.estimated_calories ??
              nutritionSource?.calories,
            null
          ),
          carbs: toNonNegativeInteger(nutritionSource?.carbs ?? nutritionSource?.carbohydrates, null),
          protein: toNonNegativeInteger(nutritionSource?.protein, null),
          fiber: toNonNegativeInteger(nutritionSource?.fiber, null),
          fat: toNonNegativeInteger(nutritionSource?.fat, null),
          sodium: toNonNegativeInteger(nutritionSource?.sodium, null),
        },
      });
      setScanLogEntries(savedEntries);
      setIsBookmarkTagDialogOpen(false);
      setSaveMessage(
        `Saved ${dishTitle} to Scan Log (${formatBookmarkTagLabel(normalizedBookmarkTag)}).`
      );
    } catch {
      setScanError("Failed to update Scan Log.");
    } finally {
      setIsSavingScanLog(false);
    }
  }

  async function handleSaveMeal() {
    if (!scanResult) {
      setScanError("Scan an image before saving a meal.");
      return;
    }
    if (!activeLabel) {
      setScanError("Choose or edit a dish name before saving.");
      return;
    }
    if (!selectedLogDate || isBeforeToday(selectedLogDate)) {
      setScanError("Choose today or a future date before saving.");
      return;
    }
    if (editedCaloriesInput.trim() !== "" && !Number.isFinite(Number(editedCaloriesInput))) {
      setScanError("Enter a valid calorie number or leave it blank.");
      return;
    }

    setIsSaving(true);
    setScanError("");
    setSaveMessage("");

    try {
      const confidenceValue =
        activeLabel === scanResult.label
          ? scanResult.confidence ?? 0
          : selectedCandidate?.score ?? 0;
      const payload = {
        date: selectedLogDate,
        meal_type: selectedMealType,
        label: activeLabel,
        confidence: normalizeConfidence(confidenceValue),
        estimated_calories: parsedCalories,
        serving_description: nutritionPreview?.serving_description ?? null,
        recommendation: scanResult.recommendation || "",
        is_unclear: scanResult.is_unclear,
        quality_issues: scanResult.quality?.issues || [],
        source: requiresConfirmation
          ? isManualOverride
            ? "scan_manual_reviewed"
            : "scan_user_reviewed"
          : "scan",
      };

      const response = await saveScannedMeal(payload);
      const savedEntry = response.entry || payload;
      const savedDate = savedEntry.date || selectedLogDate;
      const savedMealBase = buildMenuMealFromScan({
        entry: savedEntry,
        activeLabel,
        selectedMealType,
        nutritionPreview,
        scanResult,
        parsedCalories,
        requiresConfirmation,
        selectedLogDate: savedDate,
      });
      let savedMeal = savedMealBase;

      try {
        const dishImage = await fetchDishImage(savedMealBase.title, {
          cuisine: nutritionPreview?.cuisine || scanResult?.nutrition?.cuisine || "",
        });

        if (dishImage?.imageUrl) {
          savedMeal = {
            ...savedMealBase,
            image: dishImage.imageUrl,
            imageSource: dishImage.source || savedMealBase.imageSource,
            imageAttribution: dishImage.attribution || savedMealBase.imageAttribution,
            imageSourceUrl: dishImage.sourceUrl || savedMealBase.imageSourceUrl,
          };
        }
      } catch {
        // Image enrichment should not block saving the meal.
      }

      const syncedToMenu = syncScanMealToMenuStorage(savedDate, savedMeal);

      setSaveMessage(
        `Saved ${humanizeLabel(savedEntry.label)} to ${savedEntry.meal_type || selectedMealType} on ${
          savedDate
        }${syncedToMenu ? " and added it to your menu." : "."}`
      );
    } catch (error) {
      setScanError(error.message || "Failed to save meal log.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleViewDetail() {
    if (!scanResult || !activeLabel) {
      setScanError("Scan and review a meal before opening details.");
      return;
    }

    const nutritionSource = nutritionPreview || scanResult?.nutrition || {};
    const normalizedMealType = normalizeMealTypeForDetail(selectedMealType);
    const dishTitle = nutritionSource?.display_name || humanizeLabel(activeLabel);
    const fallbackDetailImage = resolveDetailImage({
      explicitImage: nutritionSource?.image || scanResult?.image,
      fallbackImage: previewUrl,
    });
    let dishImage = null;

    setIsOpeningDetail(true);
    try {
      dishImage = await fetchDishImage(dishTitle, {
        cuisine: nutritionSource?.cuisine || "",
      });
    } catch {
      dishImage = null;
    } finally {
      setIsOpeningDetail(false);
    }

    const mealPayload = {
      id: `scan-${nutritionKey(activeLabel)}-${Date.now()}`,
      recipeId: null,
      title: dishTitle,
      name: dishTitle,
      image: dishImage?.imageUrl || fallbackDetailImage,
      imageSource: dishImage?.source || "fallback",
      imageAttribution: dishImage?.attribution || "",
      imageSourceUrl: dishImage?.sourceUrl || "",
      mealType: normalizedMealType,
      description:
        nutritionSource?.about ||
        `${dishTitle} was identified from your uploaded food photo and prepared for review.`,
      time: "AI Scan",
      servings: nutritionSource?.serving_description || "1 Serving",
      level: requiresConfirmation ? "Needs Review" : "Ready",
      tags: [
        nutritionSource?.cuisine || null,
        requiresConfirmation ? "Needs Review" : "AI Verified",
        nutritionSource?.available === false ? "No Estimate" : "Calorie Estimate",
      ].filter(Boolean),
      nutrition: {
        calories: toNonNegativeInteger(
          parsedCalories ??
            nutritionSource?.estimated_calories ??
            nutritionSource?.calories,
          null
        ),
        carbs: toNonNegativeInteger(nutritionSource?.carbs ?? nutritionSource?.carbohydrates, null),
        protein: toNonNegativeInteger(nutritionSource?.protein, null),
        fiber: toNonNegativeInteger(nutritionSource?.fiber, null),
        fat: toNonNegativeInteger(nutritionSource?.fat, null),
        sodium: toNonNegativeInteger(nutritionSource?.sodium, null),
      },
    };

    try {
      sessionStorage.setItem("selectedMealDetail", JSON.stringify(mealPayload));
    } catch {
      // Ignore storage write issues and continue navigation.
    }

    navigate("/dish/detail", { state: { meal: mealPayload } });
  }

  function handleBackFromReview() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/scan-products");
  }

  return (
    <div
      className={`scan-products-page ${isReviewMode ? "scan-review-page" : "scan-start-page"} ${
        embedded ? "scan-embedded" : ""
      }`}
    >
      {!embedded ? (
      <section className="scan-flow-hero">
        <div>
          <span className="scan-flow-eyebrow">AI meal scanner</span>
          <h1>{isReviewMode ? "Review your scan result" : "Scan a meal in one clean step"}</h1>
          <p>
            {isReviewMode
              ? "Confirm the dish, adjust calories if needed, then choose the date and meal slot before saving."
              : "Upload a food photo. NutriHelp will classify the dish and move you to a focused review screen."}
          </p>
        </div>
        <div className="scan-flow-steps" aria-label="Scan progress">
          <span className="active">1 Upload</span>
          <span className={isReviewMode ? "active" : ""}>2 Review</span>
          <span className={saveMessage ? "active" : ""}>3 Save</span>
        </div>
      </section>
      ) : null}

      {!isReviewMode ? (
      <div className="scan-products-container scan-upload-panel">
        <div className="scan-upload-copy">
          <span className="scan-review-kicker">Food image</span>
          <h2>Upload a clear photo</h2>
          <p className="scan-muted">
            Use a centered photo with the full dish visible. Avoid blurry shots, packaging-only images, or heavy shadows.
          </p>
        </div>

        <div className="scan-products-form">
          <div
            className={`upload-section ${previewUrl ? "has-preview" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: "pointer" }}
          >
            {previewUrl ? (
              <div className="scan-upload-preview-wrap">
                <img src={previewUrl} alt="Uploaded preview" className="scan-upload-preview-img" />
                <div className="scan-upload-preview-meta">
                  <span className="scan-upload-preview-kicker">Image added</span>
                  <strong className="scan-upload-file-name">{uploadedImage?.name || "Uploaded image"}</strong>
                </div>
                <span className="scan-upload-preview-change">Click to change image</span>
              </div>
            ) : (
              <div className="scan-upload-empty-state">
                <p>Click to Upload Image</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUploadChange}
              style={{ display: "none" }}
            />
          </div>
        </div>

        <div className="scan-actions-row">
          <button className="upload-button" onClick={handleImageUpload} disabled={isScanning}>
            {isScanning ? "Scanning..." : "Analyze Image"}
          </button>
        </div>

        {scanError ? <p className="scan-error">{scanError}</p> : null}
        {saveMessage ? <p className="scan-success">{saveMessage}</p> : null}
      </div>
      ) : null}

      {isReviewMode && !scanResult ? (
        <div className="scan-products-container scan-empty-review">
          <span className="scan-review-kicker">No scan loaded</span>
          <h2>Start from a meal photo first</h2>
          <p className="scan-muted">
            The review page needs a scan result. Upload a new image and NutriHelp will bring you back here automatically.
          </p>
          <button type="button" className="upload-button" onClick={() => navigate("/scan-products")}>
            Back to Scan
          </button>
        </div>
      ) : null}

      {isReviewMode && scanResult ? (
        <div className="scan-products-container scan-result-card">
          <div className="scan-status-row scan-status-row--result">
            <div className="scan-status-title-wrap">
              <button type="button" className="scan-back-link-btn" onClick={handleBackFromReview}>
                ← Back
              </button>
              <h2>Scan Result</h2>
            </div>
            <span className={`scan-pill ${requiresConfirmation ? "warn" : "ok"}`}>
              {requiresConfirmation ? "Needs Review" : "Looks Good"}
            </span>
          </div>

          <div className="scan-review-banner">
            <div>
              <span className="scan-review-kicker">AI suggestion</span>
              <h3>{scanReviewTitle}</h3>
              <p>
                {requiresConfirmation
                  ? hasSuggestedMatches
                    ? "AI found possible matches but is not confident enough to confirm one automatically. Pick a suggestion if it looks right, or type the meal name yourself."
                    : "AI is not confident enough to confirm a dish from this image. Try another photo or type the meal name yourself."
                  : "This looks like a strong match. You can still adjust the meal name or calories if the serving looks different."}
              </p>
            </div>
            <div className="scan-review-meta">
              <div className="scan-meta-chip">
                <span>AI match</span>
                <strong>{confidenceText}</strong>
              </div>
              <div className="scan-meta-chip">
                <span>Photo quality</span>
                <strong>{photoQualityText}</strong>
              </div>
            </div>
          </div>

          <p className="scan-note friendly">
            {requiresConfirmation
              ? "Pick one of the similar matches below to start from that dish and its calorie estimate, or type the right meal name yourself. Nothing is locked. You can still review and edit everything before saving."
              : "Check the meal name, dish information, and estimated calories below. If the serving is larger or smaller than usual, update it before saving."}
          </p>

          <div className="scan-editable-grid">
            <label className="scan-edit-card">
              <span>Meal name</span>
              <input
                type="text"
                className="scan-edit-input"
                value={manualLabelInput}
                onChange={(event) => {
                  setManualLabelInput(event.target.value);
                  setSelectedLabel("");
                  setSaveMessage("");
                  setScanError("");
                }}
              />
              <small>
                Change this if the AI picked the wrong dish. Similar matches will also update the dish info and starting calorie estimate when available.
              </small>
            </label>

            <label className="scan-edit-card">
              <span>Estimated calories</span>
              <div className="scan-calorie-input-wrap">
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="scan-edit-input"
                  value={editedCaloriesInput}
                  onChange={(event) => {
                    setEditedCaloriesInput(event.target.value);
                    setSaveMessage("");
                    setScanError("");
                  }}
                  placeholder={
                    isLoadingNutrition
                      ? "Loading estimate..."
                      : nutritionPreview?.available === false
                        ? "No estimate yet"
                        : "e.g. 380"
                  }
                />
                <span>kcal</span>
              </div>
              <small>{servingHint}</small>
            </label>
          </div>

          <div className="scan-meal-info-card">
            <div className="scan-meal-info-header">
              <div>
                <span className="scan-review-kicker">About this meal</span>
                <h3>{displayMealName}</h3>
              </div>
              <div className="scan-meal-info-actions">
                {nutritionPreview?.cuisine ? (
                  <span className="scan-pill info">{nutritionPreview.cuisine}</span>
                ) : null}
                <button
                  type="button"
                  className="scan-view-detail-btn"
                  onClick={handleViewDetail}
                  disabled={isOpeningDetail}
                >
                  {isOpeningDetail ? "Finding image..." : "View detail"}
                </button>
                <button
                  type="button"
                  className={`scan-log-star-btn ${isInScanLog ? "active" : ""}`}
                  onClick={handleToggleScanLogEntry}
                  disabled={isSavingScanLog}
                  title={isInScanLog ? "Remove from Scan Log" : "Save to Scan Log"}
                >
                  {isInScanLog ? "★" : "☆"}
                </button>

                {isBookmarkTagDialogOpen ? (
                  <div className="scan-bookmark-tag-dialog" role="dialog" aria-modal="false">
                    <div className="scan-bookmark-tag-dialog-content">
                      <div className="scan-bookmark-tag-header">
                        <h4>Bookmark tag</h4>
                      </div>
                      <label className="scan-inline-field">
                        <span>Choose tag</span>
                        <select
                          className="scan-inline-select"
                          value={bookmarkTag}
                          onChange={(event) => setBookmarkTag(event.target.value)}
                        >
                          {BOOKMARK_TAG_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="scan-bookmark-tag-actions">
                        <button
                          type="button"
                          className="scan-bookmark-secondary-btn"
                          onClick={handleCancelBookmarkTag}
                          disabled={isSavingScanLog}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="scan-bookmark-primary-btn"
                          onClick={handleConfirmBookmarkTag}
                          disabled={isSavingScanLog}
                        >
                          {isSavingScanLog ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <p className="scan-meal-info-copy">{mealAboutText}</p>

            <div className="scan-meal-info-grid">
              <div className="scan-meal-info-stat">
                <span>Estimate</span>
                <strong>{hasNutritionEstimate ? `${nutritionPreview.estimated_calories} kcal` : "No estimate yet"}</strong>
              </div>
              <div className="scan-meal-info-stat">
                <span>Typical serve</span>
                <strong>{nutritionPreview?.serving_description || "Not set yet"}</strong>
              </div>
              <div className="scan-meal-info-stat">
                <span>Selection</span>
                <strong>{displayMealName}</strong>
              </div>
            </div>
          </div>

          {scanResult.topk?.length ? (
            <div className="scan-suggestions-block">
              <div className="scan-suggestions-header">
                <h3>Similar matches</h3>
                <p>Tap one to update the meal name, dish information, and starting calorie estimate for that match.</p>
              </div>
              <div className="scan-topk-list">
              {scanResult.topk.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`scan-topk-option ${selectedLabel === item.label ? "active" : ""}`}
                  onClick={() => handleCandidateSelect(item.label)}
                >
                  <span>{humanizeLabel(item.label)}</span>
                  <strong>{requiresConfirmation ? "Review" : percent(item.score)}</strong>
                </button>
              ))}
              </div>
            </div>
          ) : null}

          {scanResult.quality?.issues?.length ? (
            <ul className="scan-quality-list">
              {scanResult.quality.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          ) : null}

          <div className="scan-save-options-card">
            <div>
              <span className="scan-review-kicker">Save settings</span>
              <h3>Choose when this meal should be logged</h3>
              <p>
                This scan result will be saved to the selected date and meal slot, not forced into today&apos;s menu.
              </p>
            </div>
            <div className="scan-save-options-grid">
              <label className="scan-inline-field">
                <span>Date</span>
                <input
                  type="date"
                  value={selectedLogDate}
                  min={todayString()}
                  onChange={handleSelectedLogDateChange}
                />
              </label>
              <label className="scan-inline-field">
                <span>Meal</span>
                <select
                  className="scan-inline-select"
                  value={selectedMealType}
                  onChange={(event) => {
                    setSelectedMealType(event.target.value);
                    setSaveMessage("");
                    setScanError("");
                  }}
                >
                  {MEAL_TYPES.map((mealType) => (
                    <option key={mealType} value={mealType}>
                      {mealType}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="scan-actions-row">
            <button className="scan-button-selector" onClick={handleSaveMeal} disabled={!canSave}>
              {isSaving ? "Saving..." : `Save to ${selectedMealType} on ${selectedLogDate || "selected date"}`}
            </button>
          </div>
        </div>
      ) : null}

    </div>
  );
}

export default ScanProducts;
