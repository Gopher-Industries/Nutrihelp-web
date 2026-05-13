import BaseApi from "./baseApi";

const api = new BaseApi();

function normalizeSourceType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "library" || normalized === "catalog") return "recipe_library";
  if (normalized === "recipe_library" || normalized === "community") return normalized;
  return "";
}

function normalizeRecipeId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${api.baseURL}${path}`, {
    method: options.method || "GET",
    cache: "no-store",
    headers: {
      ...api.getHeaders(),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error || data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }
  return data;
}

export function getRecipeReviewKey(sourceType, recipeId) {
  const normalizedSource = normalizeSourceType(sourceType);
  const normalizedId = normalizeRecipeId(recipeId);
  return normalizedSource && normalizedId ? `${normalizedSource}:${normalizedId}` : "";
}

export async function fetchRecipeReviewSummaries(items = []) {
  const payloadItems = items
    .map((item) => ({
      source_type: normalizeSourceType(item.sourceType || item.source || item.source_type),
      recipe_id: normalizeRecipeId(item.recipeId || item.recipe_id || item.id),
    }))
    .filter((item) => item.source_type && item.recipe_id);

  if (!payloadItems.length) return {};

  const data = await requestJson("/recipe-reviews/summary", {
    method: "POST",
    body: { items: payloadItems },
  });
  return data?.data || {};
}

export async function fetchRecipeReviews(sourceType, recipeId) {
  const normalizedSource = normalizeSourceType(sourceType);
  const normalizedId = normalizeRecipeId(recipeId);
  if (!normalizedSource || !normalizedId) {
    return { items: [], summary: { averageRating: null, reviewCount: 0 } };
  }

  const params = new URLSearchParams({
    source_type: normalizedSource,
    recipe_id: String(normalizedId),
  });
  const data = await requestJson(`/recipe-reviews?${params.toString()}`);
  return {
    items: Array.isArray(data?.data) ? data.data : [],
    summary: data?.summary || { averageRating: null, reviewCount: 0 },
  };
}

export async function fetchRecipeReviewFeed(filters = {}) {
  const params = new URLSearchParams();
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.rating && filters.rating !== "all") params.set("rating", String(filters.rating));
  if (filters.sourceType && filters.sourceType !== "all") params.set("source_type", filters.sourceType);
  if (filters.limit) params.set("limit", String(filters.limit));

  const query = params.toString();
  const data = await requestJson(`/recipe-reviews/feed${query ? `?${query}` : ""}`);
  return {
    items: Array.isArray(data?.data) ? data.data : [],
    summary: data?.summary || {
      averageRating: null,
      reviewCount: 0,
      reviewedRecipeCount: 0,
      ratingBreakdown: {},
    },
    filters: data?.filters || {},
  };
}

export async function submitRecipeReview({ sourceType, recipeId, rating, comment }) {
  const data = await requestJson("/recipe-reviews", {
    method: "POST",
    body: {
      source_type: normalizeSourceType(sourceType),
      recipe_id: normalizeRecipeId(recipeId),
      rating,
      comment,
    },
  });
  return {
    item: data?.data || null,
    summary: data?.summary || { averageRating: null, reviewCount: 0 },
  };
}

export async function deleteRecipeReviewByAdmin(reviewId) {
  const id = Number(reviewId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid review id.");
  }
  const data = await requestJson(`/recipe-reviews/${id}`, {
    method: "DELETE",
  });
  return data?.data || null;
}
