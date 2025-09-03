export async function Fetching(recipeId, serving, partial){
    /*const res = awaitfetch(`http://localhost:80/api/recipe/cost/${recipeId}`,{
        method: 'GET',
        headers: {
            'Origin' : 'http://localhost:3000/',
            'Content-type' : 'application/json'
        }
    });*/

    const url = `http://localhost:80/api/recipe/cost/${recipeId}`;

    let res;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" }, // don't set "Origin"
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



/*try{
    const json = await Fetching(recipeId, serving, partial)
    setData(json);
    console.log("The final data is: " , data);
    }
    catch(err){
        setError(err.message);
    }*/