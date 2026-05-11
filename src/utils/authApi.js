export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://localhost:8443";

export async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch (_error) {
    return {};
  }
}
