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
