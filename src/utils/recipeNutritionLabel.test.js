import { formatRecipeNutrition, describeSavedNutrition } from "./recipeNutritionLabel";

const complete = {
  total_servings: 2,
  calories: 1830.4,
  ingredients: {
    nutrition_coverage: {
      ingredients: 8,
      weighed: 8,
      estimated: 0,
      reliable: true,
      counted: { calories: 8 },
      partial: { calories: 1830.4 },
    },
  },
};

function recipeWith(overrides = {}, coverage = {}) {
  return {
    ...complete,
    ...overrides,
    ingredients: {
      nutrition_coverage: { ...complete.ingredients.nutrition_coverage, ...coverage },
    },
  };
}

describe("formatRecipeNutrition", () => {
  it("shows a complete total per serving with no caveat", () => {
    expect(formatRecipeNutrition(complete)).toEqual({
      headline: "915 kcal per serving",
      approximate: false,
      label: "",
    });
  });

  it("says how many ingredients a reliable total leaves out", () => {
    const view = formatRecipeNutrition(recipeWith({}, { counted: { calories: 7 } }));

    expect(view.headline).toBe("915 kcal per serving");
    expect(view.approximate).toBe(false);
    expect(view.label).toBe("Covers 7 of 8 ingredients");
  });

  it("says when a weight was estimated", () => {
    const view = formatRecipeNutrition(recipeWith({}, { estimated: 1 }));

    expect(view.label).toBe("1 weight estimated");
  });

  it("falls back to the partial sum, marked approximate, when the total was withheld", () => {
    const view = formatRecipeNutrition(
      recipeWith(
        { calories: null },
        { reliable: false, counted: { calories: 6 }, partial: { calories: 1700 }, estimated: 2 }
      )
    );

    expect(view.headline).toBe("About 850 kcal per serving");
    expect(view.approximate).toBe(true);
    expect(view.label).toBe("Covers 6 of 8 ingredients · 2 weights estimated");
  });

  it("uses the whole recipe when the servings are unknown", () => {
    const view = formatRecipeNutrition(recipeWith({ total_servings: null }));

    expect(view.headline).toBe("1,830 kcal");
  });

  it("shows nothing for a recipe saved before coverage was recorded", () => {
    // Those totals treated every bare quantity as grams, so "2 chicken breasts"
    // counted as 2 g. My Recipes was showing "7 kcal per serving" and
    // "0 kcal per serving" for real dishes. A figure nobody can vouch for stays hidden.
    expect(formatRecipeNutrition({ calories: 28, total_servings: 4 })).toBeNull();
    expect(formatRecipeNutrition({ calories: 28, total_servings: 4, ingredients: { id: [1] } })).toBeNull();
  });

  it("shows nothing when there is no figure to stand behind", () => {
    expect(formatRecipeNutrition({ calories: null, total_servings: 2 })).toBeNull();
    expect(
      formatRecipeNutrition(
        recipeWith({ calories: null }, { reliable: false, counted: { calories: 0 }, partial: { calories: null } })
      )
    ).toBeNull();
    expect(formatRecipeNutrition(null)).toBeNull();
  });
});

describe("describeSavedNutrition", () => {
  const coverage = complete.ingredients.nutrition_coverage;

  it("credits USDA when everything was counted", () => {
    expect(describeSavedNutrition({ calories: 1830.4, coverage })).toBe(
      "Nutrition calculated with USDA FoodData Central data."
    );
  });

  it("explains a reliable total that leaves something out or leans on an estimate", () => {
    const message = describeSavedNutrition({
      calories: 1830.4,
      coverage: { ...coverage, counted: { calories: 7 }, estimated: 1 },
    });

    expect(message).toBe(
      "Nutrition calculated with USDA FoodData Central data. Covers 7 of 8 ingredients · 1 weight estimated."
    );
  });

  it("says the figure is partial when the total was withheld", () => {
    const message = describeSavedNutrition({
      calories: null,
      coverage: { ...coverage, reliable: false, counted: { calories: 6 }, partial: { calories: 1700 } },
    });

    expect(message).toBe(
      "Nutrition is partial: about 1,700 kcal from 6 of 8 ingredients. The rest could not be weighed or have no data."
    );
  });

  it("says so plainly when nothing could be calculated", () => {
    const message = describeSavedNutrition({
      calories: null,
      coverage: { ...coverage, reliable: false, counted: { calories: 0 }, partial: { calories: null } },
    });

    expect(message).toBe("Nutrition could not be calculated for this recipe.");
  });

  it("says nothing for a backend that sends no coverage", () => {
    expect(describeSavedNutrition(null)).toBe("");
    expect(describeSavedNutrition({ calories: 10, coverage: null })).toBe("");
  });
});
