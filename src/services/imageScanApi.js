import BaseApi from "./baseApi";
import { AI_API_BASE_URL } from "./aiApi";

function normalizeConfidence(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(1, parsed > 1 ? parsed / 100 : parsed));
}

function parseRawFoodLabel(rawLabel) {
  const label = String(rawLabel || "").trim();
  if (!label) return "";
  return label.replace(/:\s*~?\s*\d+(?:\.\d+)?\s*calories\s*per\s*100\s*grams$/i, "").trim();
}

function normalizeBackendScanResponse(responseBody) {
  const payload = responseBody?.data?.scan || responseBody?.data || responseBody || {};
  const classification =
    payload.classification ||
    responseBody?.data?.classification ||
    responseBody?.classification ||
    {};
  const confidence = normalizeConfidence(classification.confidence);
  const label =
    classification.label ||
    parseRawFoodLabel(classification.rawLabel) ||
    parseRawFoodLabel(classification.raw_label);

  const alternatives = Array.isArray(classification.alternatives)
    ? classification.alternatives
    : [];
  const topk = alternatives
    .map((item) => ({
      label: item.label || parseRawFoodLabel(item.rawLabel),
      score: normalizeConfidence(item.confidence ?? item.score),
    }))
    .filter((item) => item.label);

  if (label && !topk.some((item) => item.label === label)) {
    topk.unshift({ label, score: confidence });
  }

  const calories = classification.calories || payload.nutrition || null;
  const calorieValue =
    calories && typeof calories === "object"
      ? calories.value ?? calories.estimated_calories
      : null;

  return {
    label,
    raw_label: classification.rawLabel || classification.raw_label || label,
    confidence,
    is_unclear: Boolean(classification.uncertain || payload.status === "uncertain"),
    unclear_reason: classification.uncertain ? "Low confidence image classification." : "",
    retake_needed: false,
    topk,
    matches: topk,
    nutrition:
      calorieValue != null
        ? {
            available: true,
            display_name: label,
            estimated_calories: calorieValue,
            serving_description: calories.unit || "per 100g",
            source: "image_classification",
          }
        : null,
    explainability: payload.explainability || responseBody?.data?.explainability || null,
    scan: payload,
  };
}

async function parseJsonResponse(response) {
  return response.json().catch(() => null);
}

class ImageScanApi extends BaseApi {
  constructor() {
    super();
    this.aiBaseURL = String(AI_API_BASE_URL || "").trim().replace(/\/+$/, "");
  }

  async scanWithAi(file, { topk = 3 } = {}) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${this.aiBaseURL}/ai-model/image-analysis/image-analysis?topk=${topk}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      const error = new Error(data?.detail || data?.error || data?.message || "Failed to scan image.");
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async scanWithApiFallback(file, { topk = 3 } = {}) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${this.baseURL}/imageClassification?topk=${topk}`, {
      method: "POST",
      body: formData,
      headers: {
        ...(this.getAuthToken() && { Authorization: `Bearer ${this.getAuthToken()}` }),
      },
    });

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(data?.detail || data?.error?.message || data?.error || data?.message || "Failed to scan image.");
    }
    return normalizeBackendScanResponse(data);
  }

  async scanSingleImage(file, { topk = 3 } = {}) {
    try {
      return await this.scanWithAi(file, { topk });
    } catch (error) {
      if (![404, 500, 502, 503, 504].includes(Number(error?.status || 0))) {
        throw error;
      }
    }

    return this.scanWithApiFallback(file, { topk });
  }

  async scanMultipleImages(files, { topk = 3 } = {}) {
    const selectedFiles = Array.from(files || []);

    if (selectedFiles.length === 0) {
      throw new Error("Please select at least one image before scanning.");
    }

    const predictions = await Promise.all(
      selectedFiles.map((file) => this.scanSingleImage(file, { topk }))
    );

    return { predictions };
  }
}

class ScanVerificationApi extends BaseApi {
  async verifyScanWithProfile(scanResult) {
    const token = this.getAuthToken();
    if (!token || !scanResult) return null;

    const response = await fetch(`${this.baseURL}/chatbot/scan-verification`, {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify({ scan_result: scanResult }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || data?.error || "Failed to verify scan with profile.");
    }
    return data;
  }
}

export const imageScanApi = new ImageScanApi();
export const scanVerificationApi = new ScanVerificationApi();
export const scanSingleImage = (...args) => imageScanApi.scanSingleImage(...args);
export const scanMultipleImages = (...args) => imageScanApi.scanMultipleImages(...args);
export const verifyScanWithProfile = (...args) =>
  scanVerificationApi.verifyScanWithProfile(...args);
