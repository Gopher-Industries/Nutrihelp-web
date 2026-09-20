import {
  searchRecipeSources,
  mapRecipeSource,
  resolveRecipeIngredients,
  resolveRecipeIngredientsWithNutrition,
} from "./recipeSourcesApi";

describe("recipeSourcesApi", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.clear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  function jsonResponse(body, ok = true, status = 200) {
    return Promise.resolve({ ok, status, json: () => Promise.resolve(body) });
  }

  it("returns results from the search endpoint", async () => {
    const row = {
      source: "themealdb",
      external_id: "52771",
      title: "Spicy Arrabiata Penne",
      thumbnail: "https://example.com/t.jpg",
      cuisine: "Italian",
      category: "Vegetarian",
    };
    global.fetch.mockReturnValue(jsonResponse({ success: true, data: { results: [row] } }));

    const results = await searchRecipeSources("arrabiata");

    expect(results).toEqual([row]);
    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).toContain("/recipe-sources/search");
    expect(calledUrl).toContain("q=arrabiata");
  });

  it("url-encodes the query", async () => {
    global.fetch.mockReturnValue(jsonResponse({ success: true, data: { results: [] } }));

    await searchRecipeSources("chicken & rice");

    expect(global.fetch.mock.calls[0][0]).toContain("chicken%20%26%20rice");
  });

  it("returns an empty array when search fails", async () => {
    global.fetch.mockReturnValue(jsonResponse({ success: false }, false, 502));

    await expect(searchRecipeSources("arrabiata")).resolves.toEqual([]);
  });

  it("returns an empty array when the network throws", async () => {
    global.fetch.mockRejectedValue(new Error("offline"));

    await expect(searchRecipeSources("arrabiata")).resolves.toEqual([]);
  });

  it("posts source and external_id to the map endpoint", async () => {
    const payload = {
      draft: { recipe_name: "Spicy Arrabiata Penne", ingredients: [], instructions: [] },
      unmapped_fields: ["calories"],
      source_meta: { attribution: "TheMealDB" },
      mapper: { strategy: "llm" },
    };
    global.fetch.mockReturnValue(jsonResponse({ success: true, data: payload }));

    const result = await mapRecipeSource("themealdb", "52771");

    expect(result).toEqual(payload);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain("/recipe-sources/map");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ source: "themealdb", external_id: "52771" });
  });

  it("throws when mapping fails so the caller can surface it", async () => {
    global.fetch.mockReturnValue(jsonResponse({ success: false, error: "nope" }, false, 500));

    await expect(mapRecipeSource("themealdb", "52771")).rejects.toThrow();
  });

  it("posts ingredients to the resolve endpoint and returns the resolution", async () => {
    const resolved = [
      { name: "garlic", id: 7, category: "Fruit & Vegetables", status: "matched" },
      { name: "penne rigate", id: 501, category: "Pantry", status: "created" },
    ];
    global.fetch.mockReturnValue(jsonResponse({ success: true, data: { resolved } }));

    const ingredients = [
      { name: "garlic", category: "Fruit & Vegetables" },
      { name: "penne rigate", category: "Pantry" },
    ];
    const result = await resolveRecipeIngredients(ingredients);

    expect(result).toEqual(resolved);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain("/recipe-sources/resolve-ingredients");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ ingredients });
  });

  it("returns an empty array when the endpoint resolves nothing", async () => {
    global.fetch.mockReturnValue(jsonResponse({ success: true, data: {} }));

    await expect(resolveRecipeIngredients([{ name: "garlic" }])).resolves.toEqual([]);
  });

  it("throws when resolution fails so the save path can surface it", async () => {
    global.fetch.mockReturnValue(
      jsonResponse({ success: false, error: "Validation Error" }, false, 400)
    );

    await expect(resolveRecipeIngredients([{ name: "garlic" }])).rejects.toThrow(
      "Validation Error"
    );
  });

  describe("resolveRecipeIngredientsWithNutrition", () => {
    const resolved = [
      { name: "garlic", id: 63, status: "matched", grams: 6, grams_source: "usda_portion" },
    ];
    const nutrition = {
      provider: "USDA FoodData Central",
      weighed: 1,
      unweighed: 0,
      filled: 0,
      missing: 0,
      complete: true,
    };

    it("sends each measure so the backend can work out a gram weight", async () => {
      global.fetch.mockReturnValue(jsonResponse({ success: true, data: { resolved, nutrition } }));
      const ingredients = [{ name: "garlic", quantity: 2, unit: "cloves", notes: "minced" }];

      await resolveRecipeIngredientsWithNutrition(ingredients);

      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toContain("/recipe-sources/resolve-ingredients");
      expect(JSON.parse(options.body)).toEqual({ ingredients });
    });

    it("returns the resolution together with the nutrition summary", async () => {
      global.fetch.mockReturnValue(jsonResponse({ success: true, data: { resolved, nutrition } }));

      const result = await resolveRecipeIngredientsWithNutrition([{ name: "garlic" }]);

      expect(result).toEqual({ resolved, nutrition });
    });

    it("reports no summary when the backend could not enrich", async () => {
      global.fetch.mockReturnValue(jsonResponse({ success: true, data: { resolved, nutrition: null } }));

      const result = await resolveRecipeIngredientsWithNutrition([{ name: "garlic" }]);

      expect(result.nutrition).toBeNull();
      expect(result.resolved).toEqual(resolved);
    });

    it("works against an older backend that returns no nutrition key", async () => {
      global.fetch.mockReturnValue(jsonResponse({ success: true, data: { resolved } }));

      const result = await resolveRecipeIngredientsWithNutrition([{ name: "garlic" }]);

      expect(result).toEqual({ resolved, nutrition: null });
    });

    it("throws when resolution fails", async () => {
      global.fetch.mockReturnValue(jsonResponse({ success: false, error: "nope" }, false, 500));

      await expect(resolveRecipeIngredientsWithNutrition([{ name: "garlic" }])).rejects.toThrow(
        "nope"
      );
    });
  });
});
