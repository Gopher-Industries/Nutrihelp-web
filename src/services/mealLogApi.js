import AIBaseApi from "./aiApi";

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

function normalizeUserId(value) {
  if (value === undefined || value === null || value === "") return undefined;
  return String(value);
}

function formatValidationPath(location = []) {
  const parts = Array.isArray(location) ? location : [location];
  return parts.filter((part) => part !== "body" && part !== "query").join(".");
}

function formatApiError(data, fallbackMessage) {
  const baseMessage = data?.detail || data?.error || fallbackMessage;
  const details = data?.details || data?.detail;

  if (!Array.isArray(details)) {
    return String(baseMessage || fallbackMessage);
  }

  const detailMessage = details
    .map((item) => {
      const path = formatValidationPath(item?.loc);
      return path ? `${path}: ${item?.msg}` : item?.msg;
    })
    .filter(Boolean)
    .join("; ");

  return detailMessage ? `${baseMessage}: ${detailMessage}` : String(baseMessage || fallbackMessage);
}

class MealLogApi extends AIBaseApi {
  async saveScannedMeal(payload) {
    const currentUserId = normalizeUserId(payload.user_id || this.getCurrentUserId());
    const response = await fetch(`${this.baseURL}/ai-model/meals/log-scan`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...payload,
        user_id: currentUserId,
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(formatApiError(data, "Failed to save meal log."));
    }
    return data;
  }

  async fetchDailyMealSummary(date) {
    const response = await fetch(
      `${this.baseURL}/ai-model/meals/daily-summary${buildQuery({
        date,
        user_id: this.getCurrentUserId() || undefined,
      })}`
    );

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(formatApiError(data, "Failed to fetch daily summary."));
    }
    return data;
  }

  async fetchMealLogs(date) {
    const response = await fetch(
      `${this.baseURL}/ai-model/meals/logs${buildQuery({
        date,
        user_id: this.getCurrentUserId() || undefined,
      })}`
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(formatApiError(data, "Failed to fetch meal logs."));
    }
    return data;
  }

  async deleteMealLog(entryId) {
    const response = await fetch(
      `${this.baseURL}/ai-model/meals/logs/${entryId}${buildQuery({
        user_id: this.getCurrentUserId() || undefined,
      })}`,
      {
        method: "DELETE",
      }
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(formatApiError(data, "Failed to delete meal log."));
    }
    return data;
  }

  async fetchMealPlanContext({ dateTo, days = 7 } = {}) {
    const response = await fetch(
      `${this.baseURL}/ai-model/meals/plan-context${buildQuery({
        date_to: dateTo,
        days,
        user_id: this.getCurrentUserId() || undefined,
      })}`
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(formatApiError(data, "Failed to fetch meal plan context."));
    }
    return data;
  }

  async fetchNutritionPreview(label) {
    const response = await fetch(
      `${this.baseURL}/ai-model/meals/nutrition-preview${buildQuery({ label })}`
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(formatApiError(data, "Failed to preview calories."));
    }
    return data;
  }
}

export const mealLogApi = new MealLogApi();
export const saveScannedMeal = (...args) => mealLogApi.saveScannedMeal(...args);
export const fetchDailyMealSummary = (...args) => mealLogApi.fetchDailyMealSummary(...args);
export const fetchMealLogs = (...args) => mealLogApi.fetchMealLogs(...args);
export const deleteMealLog = (...args) => mealLogApi.deleteMealLog(...args);
export const fetchMealPlanContext = (...args) => mealLogApi.fetchMealPlanContext(...args);
export const fetchNutritionPreview = (...args) => mealLogApi.fetchNutritionPreview(...args);
