import BaseApi from "./baseApi";

function normalizeSingleClassificationPayload(payload, fileName = "") {
  const classification = payload?.data?.classification || payload?.classification || {};
  const explainability = payload?.data?.explainability || payload?.explainability || {};
  const label = classification?.label || classification?.rawLabel || "";
  const confidence = Number.isFinite(classification?.confidence)
    ? classification.confidence
    : 0;
  const alternatives = Array.isArray(classification?.alternatives)
    ? classification.alternatives
    : [];

  const topk = alternatives.length
    ? alternatives.map((item) => ({
        label: item?.label || "",
        score: Number.isFinite(item?.confidence) ? item.confidence : 0,
      }))
    : label
      ? [{ label, score: confidence }]
      : [];

  const nutrition = classification?.calories
    ? {
        estimated_calories: classification.calories.value ?? null,
        serving_description: classification.calories.unit || null,
        available: classification.calories.value != null,
      }
    : null;

  return {
    label,
    confidence,
    topk,
    matches: topk,
    is_unclear: Boolean(classification?.uncertain),
    quality: {
      issues: Array.isArray(explainability?.warnings) ? explainability.warnings : [],
    },
    nutrition,
    file_name: fileName,
  };
}

class ImageScanApi extends BaseApi {
  constructor() {
    super();
  }

  async scanSingleImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${this.baseURL}/imageClassification`, {
      method: "POST",
      body: formData,
      headers: {
        ...(this.getAuthToken() && { Authorization: `Bearer ${this.getAuthToken()}` }),
      },
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error || "Failed to scan image.");
    }

    return normalizeSingleClassificationPayload(data, file?.name || "");
  }

  async scanMultipleImages(files, _options = {}) {
    const selectedFiles = Array.from(files || []);

    if (selectedFiles.length === 0) {
      throw new Error("Please select at least one image before scanning.");
    }

    const predictions = [];

    for (const file of selectedFiles) {
      const prediction = await this.scanSingleImage(file);
      predictions.push(prediction);
    }

    return { predictions };
  }
}

export const imageScanApi = new ImageScanApi();

export const scanSingleImage = (...args) =>
  imageScanApi.scanSingleImage(...args);

export const scanMultipleImages = (...args) =>
  imageScanApi.scanMultipleImages(...args);
