export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8081";

export async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch (_error) {
    return {};
  }
}
