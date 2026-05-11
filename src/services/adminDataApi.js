import BaseApi from "./baseApi";
import { supabase } from "../supabaseClient";

const api = new BaseApi();

async function requestJson(path, options = {}) {
  const response = await fetch(`${api.baseURL}${path}`, {
    method: options.method || "GET",
    headers: {
      ...api.getHeaders(),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.error || data?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

async function requestFile(path, options = {}) {
  const token = api.getAuthToken ? api.getAuthToken() : "";
  const response = await fetch(`${api.baseURL}${path}`, {
    method: options.method || "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message = data?.error || data?.message || message;
    } catch (_error) {
      // keep default message
    }
    throw new Error(message);
  }

  return response;
}

function parseNumericId(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function getNextMealCatalogId(items) {
  const maxId = (Array.isArray(items) ? items : []).reduce((max, item) => {
    const parsed = parseNumericId(item?.id);
    if (parsed === null) return max;
    return Math.max(max, parsed);
  }, 0);
  return String(maxId + 1);
}

export async function fetchReferenceData() {
  const [cuisines, ingredients, cookingMethods] = await Promise.all([
    requestJson("/fooddata/cuisines"),
    requestJson("/fooddata/ingredients"),
    requestJson("/fooddata/cookingmethods"),
  ]);

  return {
    cuisines: Array.isArray(cuisines) ? cuisines : [],
    ingredients: Array.isArray(ingredients) ? ingredients : [],
    cookingMethods: Array.isArray(cookingMethods) ? cookingMethods : [],
  };
}

export async function fetchRecipesByUser(userId) {
  const payload = { user_id: Number(userId) };
  const data = await requestJson("/recipe", { method: "POST", body: payload });
  return Array.isArray(data?.recipes) ? data.recipes : [];
}

function getPublicImageUrl(fileName) {
  const normalized = String(fileName || "").trim();
  if (!normalized) return "";
  const { data } = supabase.storage.from("images").getPublicUrl(normalized);
  return data?.publicUrl || "";
}

export async function fetchAllUserRecipes(limit = 1000) {
  const maxRows = Math.max(1, Math.min(Number(limit) || 1000, 3000));
  const apiRows = await requestJson(`/recipe/admin/all?limit=${maxRows}`).catch(() => null);
  if (Array.isArray(apiRows?.recipes)) return apiRows.recipes;
  if (Array.isArray(apiRows?.data?.recipes)) return apiRows.data.recipes;

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(maxRows);

  if (error) throw new Error(error.message);

  const rows = Array.isArray(recipes) ? recipes : [];
  const cuisineIds = Array.from(new Set(rows.map((row) => row?.cuisine_id).filter(Boolean)));
  const imageIds = Array.from(new Set(rows.map((row) => row?.image_id).filter(Boolean)));

  const [cuisineResult, imageResult] = await Promise.all([
    cuisineIds.length
      ? supabase.from("cuisines").select("id,name").in("id", cuisineIds)
      : Promise.resolve({ data: [], error: null }),
    imageIds.length
      ? supabase.from("images").select("id,file_name,display_name,file_size").in("id", imageIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (cuisineResult.error) throw new Error(cuisineResult.error.message);
  if (imageResult.error) throw new Error(imageResult.error.message);

  const cuisinesById = new Map((cuisineResult.data || []).map((item) => [Number(item.id), item]));
  const imagesById = new Map((imageResult.data || []).map((item) => [Number(item.id), item]));

  return rows.map((row) => {
    const image = imagesById.get(Number(row?.image_id));
    const inferredImagePath = row?.image_id ? `recipe/${row.id}.webp` : "";
    const imageFileName = image?.file_name || inferredImagePath;
    const rawVisibility = String(row?.visibility || row?.community_status || row?.moderation_status || "").trim().toLowerCase();
    const recipeVisibility =
      rawVisibility === "community_pending" || rawVisibility === "pending"
        ? "community_pending"
        : rawVisibility === "community_rejected" || rawVisibility === "rejected"
          ? "community_rejected"
          : rawVisibility === "community" || rawVisibility === "published" || (!rawVisibility && row?.is_published === true)
            ? "community"
            : "user_private";
    return {
      ...row,
      cuisine_name: cuisinesById.get(Number(row?.cuisine_id))?.name || "",
      recipe_visibility: recipeVisibility,
      image_file_name: imageFileName,
      image_file_size: image?.file_size || "",
      image_url: row?.image_url || getPublicImageUrl(image?.file_name) || getPublicImageUrl(inferredImagePath),
    };
  });
}

export async function fetchAdminUserRoles(options = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(Number(options.limit) > 0 ? Number(options.limit) : 2000));
  if (options.q) params.set("q", String(options.q));
  if (options.role) params.set("role", String(options.role));
  if (options.created_from) params.set("created_from", String(options.created_from));
  if (options.created_to) params.set("created_to", String(options.created_to));

  const query = params.toString();
  const data = await requestJson(`/admin/user-roles${query ? `?${query}` : ""}`);
  return {
    rows: Array.isArray(data?.data) ? data.data : [],
    meta: data?.meta || { total: 0, visible: 0 },
  };
}

export async function updateAdminUserRole(userId, roleName) {
  const data = await requestJson(`/admin/user-roles/${userId}`, {
    method: "PATCH",
    body: { role_name: roleName },
  });
  return data?.data || null;
}

export async function updateUserRecipeVisibility(recipeId, visibility) {
  const data = await requestJson(`/recipe/admin/${recipeId}/visibility`, {
    method: "PATCH",
    body: { visibility },
  });
  return data?.recipe || data?.data?.recipe || data;
}

export async function fetchRecipeLibraryAdmin(options = {}) {
  const params = new URLSearchParams();
  if (options.scope) params.set("scope", String(options.scope));
  if (options.search) params.set("search", String(options.search));
  if (options.meal_type) params.set("meal_type", String(options.meal_type));
  if (options.cuisine_id) params.set("cuisine_id", String(options.cuisine_id));
  if (options.cooking_method_id) params.set("cooking_method_id", String(options.cooking_method_id));
  if (options.status) params.set("status", String(options.status));
  params.set("limit", String(Number(options.limit) > 0 ? Number(options.limit) : 100));
  if (options.offset !== undefined) {
    params.set("offset", String(Number(options.offset) >= 0 ? Number(options.offset) : 0));
  }

  const query = params.toString();
  const data = await requestJson(`/recipe-library/admin${query ? `?${query}` : ""}`);
  return Array.isArray(data?.data) ? data.data : [];
}

export async function fetchRecipeLibraryItem(id) {
  const data = await requestJson(`/recipe-library/${id}`);
  return data?.data || null;
}

export async function updateRecipeLibraryItem(id, payload) {
  const data = await requestJson(`/recipe-library/${id}`, {
    method: "PATCH",
    body: payload || {},
  });
  return data?.data || null;
}

export async function deleteRecipeLibraryItem(id) {
  const data = await requestJson(`/recipe-library/${id}`, {
    method: "DELETE",
  });
  return data?.data || null;
}

export async function recoverRecipeLibraryItem(id) {
  const data = await requestJson(`/recipe-library/admin/${id}/recover`, {
    method: "POST",
  });
  return data?.data || null;
}

export async function permanentlyDeleteRecipeLibraryItem(id) {
  const data = await requestJson(`/recipe-library/admin/${id}/permanent-delete`, {
    method: "DELETE",
  });
  return data?.data || null;
}

export async function fetchPendingCommunityRecipes() {
  const data = await requestJson("/recipe-library/admin/pending-community?limit=100");
  return Array.isArray(data?.data) ? data.data : [];
}

export async function fetchRecipeLibraryImportQueue(options = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(Number(options.limit) > 0 ? Number(options.limit) : 100));
  if (options.status) params.set("status", String(options.status));
  const query = params.toString();
  const data = await requestJson(`/recipe-library/admin/import-queue${query ? `?${query}` : ""}`);
  return Array.isArray(data?.data) ? data.data : [];
}

export async function updateRecipeLibraryImportQueueRow(id, payload) {
  const data = await requestJson(`/recipe-library/admin/import-queue/${id}`, {
    method: "PATCH",
    body: payload || {},
  });
  return data?.data || null;
}

export async function trashRecipeLibraryImportQueueRow(id, reason = "") {
  const data = await requestJson(`/recipe-library/admin/import-queue/${id}/trash`, {
    method: "POST",
    body: { reason },
  });
  return data?.data || null;
}

export async function recoverRecipeLibraryImportQueueRow(id) {
  const data = await requestJson(`/recipe-library/admin/import-queue/${id}/recover`, {
    method: "POST",
  });
  return data?.data || null;
}

export async function deleteRecipeLibraryImportQueueRow(id) {
  const data = await requestJson(`/recipe-library/admin/import-queue/${id}`, {
    method: "DELETE",
  });
  return data?.data || null;
}

export async function importRecipeLibraryDishNames(input) {
  const names = String(input.names || "")
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean);

  const data = await requestJson("/recipe-library/admin/import-names", {
    method: "POST",
    body: {
      names,
      meal_type: input.meal_type || undefined,
      cuisine_hint: input.cuisine_hint || undefined,
      cooking_method_hint: input.cooking_method_hint || undefined,
      admin_notes: input.admin_notes || undefined,
      recipe_name: input.recipe_name || undefined,
      description: input.description || undefined,
      servings: input.servings || undefined,
      calories: input.calories || undefined,
      ingredients: input.ingredients || undefined,
      instructions: input.instructions || undefined,
    },
  });
  return Array.isArray(data?.data) ? data.data : [];
}

export async function importRecipeLibraryDishRows(rows) {
  const data = await requestJson("/recipe-library/admin/import-rows", {
    method: "POST",
    body: { rows: Array.isArray(rows) ? rows : [] },
  });
  return Array.isArray(data?.data) ? data.data : [];
}

export async function enrichRecipeLibraryBatch(limit = 3, queueIds = []) {
  const data = await requestJson("/recipe-library/admin/enrich-batch", {
    method: "POST",
    body: {
      limit: Number(limit) || 3,
      queue_ids: Array.isArray(queueIds) ? queueIds : [],
    },
  });
  return {
    rows: Array.isArray(data?.data) ? data.data : [],
    pausedByQuota: Boolean(data?.pausedByQuota),
    pauseReason: data?.pauseReason || "",
  };
}

export async function approveRecipeLibraryImportQueueRows(queueIds = []) {
  const data = await requestJson("/recipe-library/admin/import-queue/approve", {
    method: "POST",
    body: {
      queue_ids: Array.isArray(queueIds) ? queueIds : [],
    },
  });
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.data?.rows)) return data.data.rows;
  return [];
}

export async function approveCommunityRecipe(id) {
  const data = await requestJson(`/recipe-library/admin/${id}/approve-community`, {
    method: "POST",
  });
  return data?.data;
}

export async function rejectCommunityRecipe(id, reason) {
  const data = await requestJson(`/recipe-library/admin/${id}/reject-community`, {
    method: "POST",
    body: { reason },
  });
  return data?.data;
}

export async function publishRecipeLibraryCatalog(id) {
  const data = await requestJson(`/recipe-library/admin/${id}/publish-catalog`, {
    method: "POST",
  });
  return data?.data;
}

export async function unpublishRecipeLibraryCatalog(id) {
  const data = await requestJson(`/recipe-library/admin/${id}/unpublish-catalog`, {
    method: "POST",
  });
  return data?.data;
}

export async function fetchRecipeLibraryMissingImages(recipeIds = []) {
  const data = await requestJson("/recipe-library/admin/fetch-images", {
    method: "POST",
    body: {
      recipe_ids: Array.isArray(recipeIds) ? recipeIds : [],
    },
  });
  return Array.isArray(data?.data) ? data.data : [];
}

export async function downloadRecipeLibraryImportTemplate() {
  const response = await requestFile("/recipe-library/admin/import-template");
  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") || "";
  const filenameMatch = disposition.match(/filename=\"?([^\";]+)\"?/i);
  const filename = filenameMatch?.[1] || "recipe_library_import_template.xlsx";

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export async function importRecipeLibraryDishFile(file) {
  if (!file) throw new Error("File is required");
  const formData = new FormData();
  formData.append("file", file);
  const response = await requestFile("/recipe-library/admin/import-file", {
    method: "POST",
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  return Array.isArray(data?.data) ? data.data : [];
}

export async function fetchMealCatalog() {
  const { data, error } = await supabase
    .from("weeklyrecipes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);
  return Array.isArray(data) ? data : [];
}

export async function createMealCatalogEntry(input, existingItems = []) {
  const payload = {
    ...input,
    id: String(input.id || getNextMealCatalogId(existingItems)),
  };

  const { data, error } = await supabase
    .from("weeklyrecipes")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateMealCatalogEntry(id, input) {
  const { data, error } = await supabase
    .from("weeklyrecipes")
    .update(input)
    .eq("id", String(id))
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMealCatalogEntry(id) {
  const { error } = await supabase.from("weeklyrecipes").delete().eq("id", String(id));
  if (error) throw new Error(error.message);
}

export async function fetchMealIngredientsMap() {
  const { data, error } = await supabase
    .from("weekly_recipe_ingredient")
    .select("*")
    .order("recipe_id", { ascending: true })
    .limit(1000);

  if (error) throw new Error(error.message);
  return Array.isArray(data) ? data : [];
}

export async function createMealIngredient(input) {
  const payload = {
    recipe_id: Number(input.recipe_id),
    ingredient_name: String(input.ingredient_name || "").trim(),
    amount: String(input.amount || "").trim(),
  };

  const { data, error } = await supabase
    .from("weekly_recipe_ingredient")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMealIngredient(row) {
  const { error } = await supabase
    .from("weekly_recipe_ingredient")
    .delete()
    .eq("recipe_id", Number(row.recipe_id))
    .eq("ingredient_name", String(row.ingredient_name || ""))
    .eq("amount", String(row.amount || ""));

  if (error) throw new Error(error.message);
}

export async function updateMealIngredient(previousRow, nextRow) {
  await deleteMealIngredient(previousRow);
  return createMealIngredient(nextRow);
}
