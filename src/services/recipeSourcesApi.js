import { BaseApi } from "./baseApi";

const api = new BaseApi();

function authHeaders() {
  const token = api.getAuthToken?.();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Typeahead search across external recipe sources.
 * Never throws — a failed keystroke should show no results, not an error screen.
 */
export async function searchRecipeSources(query) {
  try {
    const response = await fetch(
      `${api.baseURL}/recipe-sources/search?q=${encodeURIComponent(query)}`,
      { headers: { ...authHeaders() } }
    );
    if (!response.ok) return [];
    const payload = await response.json();
    return payload?.data?.results || [];
  } catch (_error) {
    return [];
  }
}

/**
 * Maps a chosen source recipe onto the NutriHelp schema.
 * Throws on failure — the user explicitly asked for this, so they get told.
 */
export async function mapRecipeSource(source, externalId) {
  const response = await fetch(`${api.baseURL}/recipe-sources/map`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ source, external_id: externalId }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error || `Recipe mapping failed (${response.status})`);
  }

  return payload.data;
}

/**
 * Resolves ingredient names to NutriHelp ids, creating the ones that don't
 * exist yet.
 *
 * Called at SAVE time, not at prefill time: this is the only call that writes
 * to the shared ingredients table, so it must follow a deliberate user action.
 * Throws on failure — the user is explicitly saving, so they get told.
 *
 * @param {Array<{name: string, category?: string}>} ingredients max 30
 * @returns {Promise<Array<{name, id, category, status}>>}
 */
export async function resolveRecipeIngredients(ingredients) {
  const response = await fetch(`${api.baseURL}/recipe-sources/resolve-ingredients`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ ingredients }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error || `Ingredient resolution failed (${response.status})`);
  }

  return payload.data.resolved || [];
}
