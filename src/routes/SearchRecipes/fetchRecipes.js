const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';

/*export async function fetchRecipes(user_id) {
  const response = await fetch(`${API_BASE}/api/recipe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch recipes");
  }
  const data = await response.json();
  return data;
}*/

export async function fetchRecipes(user_id) {
  const res = await fetch(`${API_BASE}/api/recipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id }),
  });
 
  if (res.status === 400) throw new Error("User Id is required");
  if (res.status === 404) return { recipes: [] };
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${text}`);
  }
 
  const data = await res.json();
  return { recipes: data.recipes || [], message: data.message };
}
