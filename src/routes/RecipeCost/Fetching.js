export async function Fetching(recipeId, serving, partial){
    let url;
    if(recipeId == null){return null}
    else if((serving == null) && (partial == null)){
        url = `http://localhost:80/api/recipe/cost/${recipeId}`;
    }
    else if(partial == null){
        url = `http://localhost:80/api/recipe/cost/${recipeId}?desired_servings=${serving}`;
    }
    else if(serving == null){
        url = `http://localhost:80/api/recipe/cost/${recipeId}?exclude_ids=${partial}`;
    }
    else{
        url = `http://localhost:80/api/recipe/cost/${recipeId}?desired_servings=${serving}&exclude_ids=${partial}`;
    }
    
    let res;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    throw new Error(`Network error reaching API: ${err?.message || err}`);
  }

  if (!res.ok) {
    let detail = "";
    try { detail = await res.text(); } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`);
  }

  try {
    return await res.json();
  } catch {
    throw new Error("Invalid JSON in response");
  }
}