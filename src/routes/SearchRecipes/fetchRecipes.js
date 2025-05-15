export async function fetchRecipes(user_id) {
  const response = await fetch("http://localhost:80/api/recipe", {
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
}

export async function fetchCuisines() {
  const resp = await fetch("http://localhost/api/fooddata/cuisines");
  if (!resp.ok) {
    throw new Error("Failed to load cuisines");
  }
  const raw = await resp.json();
  return raw.map(c => c.name);
}