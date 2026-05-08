import React, { useEffect, useRef, useState } from "react";
import "./ScanProducts.css";
import { scanMultipleImages } from "../../../services/imageScanApi";
import {
  deleteMealLog,
  fetchDailyMealSummary,
  fetchNutritionPreview,
  saveScannedMeal,
} from "../../../services/mealLogApi";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"];
const MAX_IMAGE_COUNT = 5;
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

function todayString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function humanizeLabel(label) {
  return String(label || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function percent(score) {
  return `${Math.round(Number(score || 0) * 100)}%`;
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

function findResultList(data) {
  if (Array.isArray(data)) return data;

  const possibleLists = [
    data?.results,
    data?.images,
    data?.items,
    data?.predictions,
    data?.analyses,
    data?.responses,
    data?.data,
  ];

  return possibleLists.find(Array.isArray) || [data];
}

function normalizeScanResponseItem(item) {
  const result = item?.result || item?.analysis || item?.prediction_result || item;

  return {
    ...result,
    label: result?.label || result?.prediction || result?.class_name || "",
    confidence: result?.confidence ?? result?.score ?? 0,
    topk: result?.topk || result?.matches || result?.alternatives || [],
    file_name:
      result?.file_name ||
      item?.file_name ||
      item?.filename ||
      item?.name ||
      item?.image_name ||
      "",
  };
}

function buildScanItem(result, file, previewUrl, index) {
  const defaultLabel = result.is_unclear
    ? ""
    : result.label || result.topk?.[0]?.label || "";
  const defaultPreview = defaultLabel
    ? normalizeNutritionPreview(defaultLabel, result.nutrition)
    : null;

  return {
    id: `${file?.name || result.file_name || "image"}-${index}`,
    fileName: file?.name || result.file_name || `Image ${index + 1}`,
    previewUrl,
    result,
    selectedLabel: defaultLabel,
    manualLabelInput: defaultLabel,
    nutritionPreview: defaultPreview,
    suggestedNutrition: defaultLabel
      ? {
          [nutritionKey(defaultLabel)]: defaultPreview,
        }
      : {},
    editedCaloriesInput:
      defaultPreview?.estimated_calories != null
        ? String(defaultPreview.estimated_calories)
        : "",
    isLoadingNutrition: false,
  };
}

function getActiveLabel(scanItem) {
  const result = scanItem?.result;
  const requiresConfirmation = Boolean(result?.is_unclear);
  const hasConfidentScanLabel = Boolean(result?.label && !requiresConfirmation);

  return (
    scanItem?.manualLabelInput?.trim() ||
    scanItem?.selectedLabel ||
    (hasConfidentScanLabel ? result?.label : "")
  );
}

function getSelectedCandidate(scanItem) {
  const result = scanItem?.result;
  const activeLabel = getActiveLabel(scanItem);

  if (!result || !activeLabel) return null;

  const activeKey = nutritionKey(activeLabel);
  return (
    result.topk?.find((item) => nutritionKey(item.label) === activeKey) ||
    result.matches?.find((item) => nutritionKey(item.label) === activeKey) ||
    null
  );
}

function ScanProducts({ mode = "scan", embedded = false } = {}) {
  const fileInputRef = useRef(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [scanItems, setScanItems] = useState([]);
  const [selectedMealType, setSelectedMealType] = useState("Lunch");
  const [todaySummary, setTodaySummary] = useState(null);
  const [scanError, setScanError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadTodaySummary();
  }, []);

  useEffect(() => {
    if (!uploadedImages.length) {
      setPreviewUrls([]);
      return undefined;
    }

    const objectUrls = uploadedImages.map((file) => URL.createObjectURL(file));
    setPreviewUrls(objectUrls);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [uploadedImages]);

  async function loadTodaySummary() {
    setIsRefreshing(true);
    try {
      const summary = await fetchDailyMealSummary(todayString());
      setTodaySummary(summary);
    } catch (error) {
      console.error("Failed to load meal summary:", error);
    } finally {
      setIsRefreshing(false);
    }
  }

  function resetScanReview() {
    setScanItems([]);
    setScanError("");
    setSaveMessage("");
  }

  function handleFileUploadChange(event) {
    const files = Array.from(event.target.files || []);

    resetScanReview();

    if (!files.length) {
      setUploadedImages([]);
      return;
    }

    const nonImageFiles = files.filter((file) => !file.type.startsWith("image/"));

    if (nonImageFiles.length) {
      setUploadedImages([]);
      setScanError(
        `Only image files are supported. Please remove: ${nonImageFiles
          .map((file) => file.name)
          .join(", ")}`
      );
      event.target.value = "";
      return;
    }

    if (files.length > MAX_IMAGE_COUNT) {
      setUploadedImages([]);
      setScanError(`Please upload up to ${MAX_IMAGE_COUNT} images at a time.`);
      event.target.value = "";
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > MAX_IMAGE_SIZE_BYTES);

    if (oversizedFiles.length) {
      setUploadedImages([]);
      setScanError(
        `Each image must be ${MAX_IMAGE_SIZE_MB}MB or smaller. Please remove: ${oversizedFiles
          .map((file) => file.name)
          .join(", ")}`
      );
      event.target.value = "";
      return;
    }

    setUploadedImages(files);
  }

  function updateScanItem(index, updater) {
    setScanItems((currentItems) =>
      currentItems.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const updates = typeof updater === "function" ? updater(item) : updater;
        return { ...item, ...updates };
      })
    );
  }

  async function loadNutritionForItem(index, label, { applyResult = true } = {}) {
    const requestKey = nutritionKey(label);

    if (applyResult) {
      updateScanItem(index, { isLoadingNutrition: true });
    }

    try {
      const preview = await fetchNutritionPreview(label);

      updateScanItem(index, (item) => {
        const updatedNutrition = {
          ...item.suggestedNutrition,
          [requestKey]: preview,
        };

        const currentActiveKey = nutritionKey(getActiveLabel(item));
        const shouldApply = applyResult && currentActiveKey === requestKey;

        return {
          suggestedNutrition: updatedNutrition,
          nutritionPreview: shouldApply ? preview : item.nutritionPreview,
          editedCaloriesInput: shouldApply
            ? preview?.estimated_calories != null
              ? String(preview.estimated_calories)
              : ""
            : item.editedCaloriesInput,
        };
      });

      return preview;
    } catch (error) {
      if (applyResult) {
        updateScanItem(index, {
          nutritionPreview: null,
          editedCaloriesInput: "",
        });
        setScanError(error.message || "Failed to estimate calories.");
      }
      return null;
    } finally {
      if (applyResult) {
        updateScanItem(index, { isLoadingNutrition: false });
      }
    }
  }

  async function handleImageUpload() {
    if (!uploadedImages.length) {
      setScanError("Choose at least one image before scanning.");
      return;
    }

    setIsScanning(true);
    setScanError("");
    setSaveMessage("");
    setScanItems([]);

    try {
      // Use the multi-image endpoint for both one image and multiple images.
      // This keeps prediction behaviour consistent across the scan flow.
      const data = await scanMultipleImages(uploadedImages, { topk: 5 });

      const resultList = findResultList(data);
      const normalizedResults = resultList.map(normalizeScanResponseItem);

      const items = normalizedResults.map((result, index) =>
        buildScanItem(result, uploadedImages[index], previewUrls[index], index)
      );

      setScanItems(items);

      items.forEach((scanItem, index) => {
        const suggestionLabels = (scanItem.result.topk || [])
          .map((item) => item.label)
          .filter((label, labelIndex, array) => label && array.indexOf(label) === labelIndex);

        suggestionLabels.forEach((label) => {
          void loadNutritionForItem(index, label, {
            applyResult:
              Boolean(scanItem.selectedLabel) &&
              nutritionKey(label) === nutritionKey(scanItem.selectedLabel),
          });
        });
      });
    } catch (error) {
      setScanItems([]);
      setScanError(error.message || "Failed to analyze image.");
    } finally {
      setIsScanning(false);
    }
  }

  function handleCandidateSelect(index, label) {
    setSaveMessage("");
    setScanError("");

    const scanItem = scanItems[index];
    const preview = scanItem?.suggestedNutrition?.[nutritionKey(label)];

    updateScanItem(index, {
      selectedLabel: label,
      manualLabelInput: label,
      nutritionPreview: preview || null,
      editedCaloriesInput:
        preview?.estimated_calories != null ? String(preview.estimated_calories) : "",
    });

    if (!preview) {
      void loadNutritionForItem(index, label);
    }
  }

  function handleManualLabelChange(index, value) {
    updateScanItem(index, {
      manualLabelInput: value,
      selectedLabel: "",
    });
    setSaveMessage("");
    setScanError("");
  }

  function handleCaloriesChange(index, value) {
    updateScanItem(index, { editedCaloriesInput: value });
    setSaveMessage("");
    setScanError("");
  }

  async function handleSaveMeal(index) {
    const scanItem = scanItems[index];
    const result = scanItem?.result;
    const activeLabel = getActiveLabel(scanItem);
    const selectedCandidate = getSelectedCandidate(scanItem);
    const editedCaloriesInput = scanItem?.editedCaloriesInput || "";
    const parsedCalories =
      editedCaloriesInput.trim() === ""
        ? null
        : Math.max(0, Math.round(Number(editedCaloriesInput)));

    if (!result) {
      setScanError("Scan an image before saving a meal.");
      return;
    }

    if (!activeLabel) {
      setScanError("Choose or edit a dish name before saving.");
      return;
    }

    if (editedCaloriesInput.trim() !== "" && !Number.isFinite(Number(editedCaloriesInput))) {
      setScanError("Enter a valid calorie number or leave it blank.");
      return;
    }

    const requiresConfirmation = Boolean(result?.is_unclear);
    const isManualOverride = Boolean(
      scanItem.manualLabelInput.trim() &&
        scanItem.manualLabelInput.trim() !== scanItem.selectedLabel &&
        scanItem.manualLabelInput.trim() !== result?.label
    );

    setIsSaving(true);
    setScanError("");
    setSaveMessage("");

    try {
      const payload = {
        date: todayString(),
        meal_type: selectedMealType,
        label: activeLabel,
        confidence:
          activeLabel === result.label
            ? result.confidence ?? 0
            : selectedCandidate?.score ?? 0,
        estimated_calories: parsedCalories,
        serving_description: scanItem.nutritionPreview?.serving_description ?? null,
        recommendation: result.recommendation || "",
        is_unclear: result.is_unclear,
        quality_issues: result.quality?.issues || [],
        source: requiresConfirmation
          ? isManualOverride
            ? "scan_manual_reviewed"
            : "scan_user_reviewed"
          : "scan",
      };

      const response = await saveScannedMeal(payload);
      setTodaySummary(response.daily_summary);
      setSaveMessage(
        `Saved ${humanizeLabel(response.entry.label)} to ${response.entry.meal_type}.`
      );
    } catch (error) {
      setScanError(error.message || "Failed to save meal log.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteEntry(entryId) {
    try {
      await deleteMealLog(entryId);
      await loadTodaySummary();
    } catch (error) {
      setScanError(error.message || "Failed to delete meal log entry.");
    }
  }

  function renderScanResultCard(scanItem, index) {
    const result = scanItem.result;
    const activeLabel = getActiveLabel(scanItem);
    const selectedCandidate = getSelectedCandidate(scanItem);
    const requiresConfirmation = Boolean(result?.is_unclear);
    const hasConfidentScanLabel = Boolean(result?.label && !requiresConfirmation);
    const hasSuggestedMatches = Boolean(result?.topk?.length);
    const hasPhotoIssue = hasBlockingPhotoIssue(result?.quality?.issues || []);
    const isManualOverride = Boolean(
      scanItem.manualLabelInput.trim() &&
        scanItem.manualLabelInput.trim() !== scanItem.selectedLabel &&
        scanItem.manualLabelInput.trim() !== result?.label
    );
    const confidenceText = requiresConfirmation
      ? hasSuggestedMatches
        ? "Review needed"
        : "Not confident"
      : isManualOverride && !selectedCandidate
      ? "Edited by you"
      : percent(selectedCandidate?.score ?? result?.confidence);
    const photoQualityText = hasPhotoIssue ? "Try another photo" : "Good enough";
    const nutritionPreview = scanItem.nutritionPreview;
    const hasNutritionEstimate = nutritionPreview?.estimated_calories != null;
    const displayMealName =
      nutritionPreview?.display_name || humanizeLabel(activeLabel) || "Choose a meal";
    const scanReviewTitle = hasConfidentScanLabel
      ? humanizeLabel(result.label)
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
    const canSave = Boolean(
      result && activeLabel && !scanItem.isLoadingNutrition && !isSaving
    );

    return (
      <div className="scan-products-container scan-result-card" key={scanItem.id}>
        <div className="scan-status-row">
          <div>
            <h2>Scan Result {scanItems.length > 1 ? index + 1 : ""}</h2>
            <p className="scan-muted">{scanItem.fileName}</p>
          </div>
          <span className={`scan-pill ${requiresConfirmation ? "warn" : "ok"}`}>
            {requiresConfirmation ? "Needs Review" : "Looks Good"}
          </span>
        </div>

        {scanItem.previewUrl ? (
          <div className="scan-image-preview">
            <img
              src={scanItem.previewUrl}
              alt={`Uploaded preview ${index + 1}`}
              className="scan-preview-img"
            />
          </div>
        ) : null}

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
              value={scanItem.manualLabelInput}
              onChange={(event) => handleManualLabelChange(index, event.target.value)}
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
                value={scanItem.editedCaloriesInput}
                onChange={(event) => handleCaloriesChange(index, event.target.value)}
                placeholder={
                  scanItem.isLoadingNutrition
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
            {nutritionPreview?.cuisine ? (
              <span className="scan-pill info">{nutritionPreview.cuisine}</span>
            ) : null}
          </div>

          <p className="scan-meal-info-copy">{mealAboutText}</p>

          <div className="scan-meal-info-grid">
            <div className="scan-meal-info-stat">
              <span>Estimate</span>
              <strong>
                {hasNutritionEstimate
                  ? `${nutritionPreview.estimated_calories} kcal`
                  : "No estimate yet"}
              </strong>
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

        {result.topk?.length ? (
          <div className="scan-suggestions-block">
            <div className="scan-suggestions-header">
              <h3>Similar matches</h3>
              <p>
                Tap one to update the meal name, dish information, and starting calorie estimate for that match.
              </p>
            </div>
            <div className="scan-topk-list">
              {result.topk.map((item) => (
                <button
                  key={`${scanItem.id}-${item.label}`}
                  type="button"
                  className={`scan-topk-option ${
                    scanItem.selectedLabel === item.label ? "active" : ""
                  }`}
                  onClick={() => handleCandidateSelect(index, item.label)}
                >
                  <span>{humanizeLabel(item.label)}</span>
                  <strong>{requiresConfirmation ? "Review" : percent(item.score)}</strong>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {result.quality?.issues?.length ? (
          <ul className="scan-quality-list">
            {result.quality.issues.map((issue) => (
              <li key={`${scanItem.id}-${issue}`}>{issue}</li>
            ))}
          </ul>
        ) : null}

        <div className="scan-actions-row">
          <button
            className="scan-button-selector"
            onClick={() => handleSaveMeal(index)}
            disabled={!canSave}
          >
            {isSaving ? "Saving..." : `Save to ${selectedMealType}`}
          </button>
        </div>
      </div>
    );
  }

  const pageClassName = [
    "scan-products-page",
    mode === "review" ? "scan-review-page" : "",
    embedded ? "scan-embedded" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={pageClassName}>
      <div className="scan-products-container">
        <h1>Scan a Meal</h1>
        <p className="scan-muted">
          Upload one or more food photos to detect each dish, estimate rough calories,
          and save them into today&apos;s meal log.
        </p>

        <div className="scan-products-form">
          <label className="scan-products-label" htmlFor="file-upload">
            Food Images
          </label>
          <div
            className="upload-section"
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: "pointer" }}
          >
            <div>
              <p>Click to Upload Images</p>
              {uploadedImages.length ? (
                <p className="file-name">
                  {uploadedImages.length} image{uploadedImages.length > 1 ? "s" : ""} added: {" "}
                  {uploadedImages.map((file) => file.name).join(", ")}
                </p>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUploadChange}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {previewUrls.length ? (
          <div
            className="scan-image-preview"
            style={{ display: "grid", gap: "12px" }}
          >
            {previewUrls.map((url, index) => (
              <img
                key={`${uploadedImages[index]?.name || "preview"}-${index}`}
                src={url}
                alt={`Uploaded preview ${index + 1}`}
                className="scan-preview-img"
              />
            ))}
          </div>
        ) : null}

        <div className="scan-actions-row">
          <select
            className="scan-inline-select"
            value={selectedMealType}
            onChange={(event) => setSelectedMealType(event.target.value)}
          >
            {MEAL_TYPES.map((mealType) => (
              <option key={mealType} value={mealType}>
                {mealType}
              </option>
            ))}
          </select>

          <button className="upload-button" onClick={handleImageUpload} disabled={isScanning}>
            {isScanning
              ? "Scanning..."
              : uploadedImages.length > 1
              ? "Analyze Images"
              : "Analyze Image"}
          </button>
        </div>

        {scanError ? <p className="scan-error">{scanError}</p> : null}
        {saveMessage ? <p className="scan-success">{saveMessage}</p> : null}
      </div>

      {scanItems.map((scanItem, index) => renderScanResultCard(scanItem, index))}

      <div className="scan-products-container scan-summary-card">
        <div className="scan-status-row">
          <h2>Today&apos;s Meal Log</h2>
          <span className="scan-pill info">
            {isRefreshing ? "Refreshing..." : todayString()}
          </span>
        </div>

        <div className="scan-result-grid">
          <div className="scan-stat">
            <span>Total calories</span>
            <strong>{todaySummary?.total_calories ?? 0} kcal</strong>
          </div>
          <div className="scan-stat">
            <span>Logged meals</span>
            <strong>{todaySummary?.entry_count ?? 0}</strong>
          </div>
          <div className="scan-stat">
            <span>Breakfast/Lunch</span>
            <strong>
              {(todaySummary?.meal_type_breakdown?.Breakfast ?? 0)}/
              {(todaySummary?.meal_type_breakdown?.Lunch ?? 0)}
            </strong>
          </div>
          <div className="scan-stat">
            <span>Dinner/Snacks</span>
            <strong>
              {(todaySummary?.meal_type_breakdown?.Dinner ?? 0)}/
              {(todaySummary?.meal_type_breakdown?.Snacks ?? 0)}
            </strong>
          </div>
        </div>

        {!todaySummary?.meals?.length ? (
          <p className="scan-muted">No scanned meals have been saved for today yet.</p>
        ) : (
          <div className="scan-meal-log-list">
            {todaySummary.meals.map((meal) => (
              <div key={meal.id} className="scan-meal-log-item">
                <div>
                  <strong>{humanizeLabel(meal.label)}</strong>
                  <p>
                    {meal.meal_type} · {meal.estimated_calories ?? "?"} kcal · confidence{" "}
                    {percent(meal.confidence)}
                  </p>
                </div>
                <button
                  type="button"
                  className="scan-delete-btn"
                  onClick={() => handleDeleteEntry(meal.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="view-history-button" onClick={loadTodaySummary}>
        Refresh Today&apos;s Log
      </button>
    </div>
  );
}

export default ScanProducts;
