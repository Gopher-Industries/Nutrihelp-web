import buildCreateRecipePrefill from "./buildCreateRecipePrefill";

const DRAFT = {
  recipe_name: "Spicy Arrabiata Penne",
  description: null,
  cuisine_name: "Italian",
  cooking_method_name: null,
  meal_type: null,
  servings: null,
  prep_time_minutes: null,
  cook_time_minutes: null,
  difficulty: null,
  image_url: "https://example.com/thumb.jpg",
  ingredients: [
    { name: "penne rigate", quantity: 1, unit: "pound", notes: null },
    { name: "olive oil", quantity: 0.25, unit: "cup", notes: null },
    { name: "garlic", quantity: null, unit: null, notes: "to taste" },
  ],
  instructions: ["Boil the penne", "Heat the oil"],
  calories: null,
  protein: null,
  fat: null,
  carbohydrates: null,
};

const UNMAPPED = ["description", "cooking_method_name", "servings", "prep_time_minutes", "calories"];

describe("buildCreateRecipePrefill", () => {
  it("maps scalar fields onto the form patch", () => {
    const { formPatch } = buildCreateRecipePrefill(DRAFT, UNMAPPED);

    expect(formPatch.recipeName).toBe("Spicy Arrabiata Penne");
    expect(formPatch.cuisine).toBe("Italian");
  });

  it("turns missing values into empty strings, never the text null", () => {
    const { formPatch } = buildCreateRecipePrefill(DRAFT, UNMAPPED);

    expect(formPatch.preparationTime).toBe("");
    expect(formPatch.totalServings).toBe("");
    expect(formPatch.cookingMethod).toBe("");
    expect(formPatch.recipeName).not.toBe("null");
    expect(formPatch.cuisine).not.toBe("null");
    expect(formPatch.cookingMethod).not.toBe("null");
    expect(formPatch.preparationTime).not.toBe("null");
    expect(formPatch.totalServings).not.toBe("null");
  });

  it("builds ingredient rows in the shape the table already uses", () => {
    const { ingredientRows } = buildCreateRecipePrefill(DRAFT, UNMAPPED);

    expect(ingredientRows).toHaveLength(3);
    expect(ingredientRows[0]).toEqual({
      ingredientCategory: "",
      ingredient: "penne rigate",
      ingredientQuantity: 1,
      ingredientCost: 0,
    });
  });

  it("keeps an ingredient whose quantity the source did not give", () => {
    const { ingredientRows } = buildCreateRecipePrefill(DRAFT, UNMAPPED);

    expect(ingredientRows[2].ingredient).toBe("garlic");
    expect(ingredientRows[2].ingredientQuantity).toBe("");
  });

  it("preserves zero as a valid quantity, not coercing it to empty string", () => {
    const draftWithZeroQuantity = {
      recipe_name: "Test Recipe",
      ingredients: [{ name: "salt", quantity: 0, unit: "tsp" }],
    };
    const { ingredientRows } = buildCreateRecipePrefill(draftWithZeroQuantity, []);

    expect(ingredientRows[0].ingredientQuantity).toBe(0);
  });

  it("passes instructions through as plain strings", () => {
    const { instructions } = buildCreateRecipePrefill(DRAFT, UNMAPPED);

    expect(instructions).toEqual(["Boil the penne", "Heat the oil"]);
  });

  it("exposes the source image for preview", () => {
    const { imagePreviewUrl } = buildCreateRecipePrefill(DRAFT, UNMAPPED);

    expect(imagePreviewUrl).toBe("https://example.com/thumb.jpg");
  });

  it("translates unmapped backend fields into form field names", () => {
    const { highlightFields } = buildCreateRecipePrefill(DRAFT, UNMAPPED);

    expect(highlightFields).toContain("preparationTime");
    expect(highlightFields).toContain("totalServings");
    expect(highlightFields).toContain("cookingMethod");
    expect(highlightFields).not.toContain("recipeName");
  });

  it("flags ingredientCost when ingredient rows are prefilled", () => {
    const { highlightFields } = buildCreateRecipePrefill(DRAFT, UNMAPPED);

    expect(highlightFields).toContain("ingredientCost");
  });

  it("carries the mapper's ingredient category through and does not flag it", () => {
    const draftWithCategories = {
      ...DRAFT,
      ingredients: [
        { name: "penne rigate", quantity: 1, unit: "pound", notes: null, category: "Pantry" },
        { name: "garlic", quantity: 3, unit: null, notes: null, category: "Fruit & Vegetables" },
      ],
    };

    const { ingredientRows, highlightFields } = buildCreateRecipePrefill(draftWithCategories, UNMAPPED);

    expect(ingredientRows[0].ingredientCategory).toBe("Pantry");
    expect(ingredientRows[1].ingredientCategory).toBe("Fruit & Vegetables");
    expect(highlightFields).not.toContain("ingredientCategory");
  });

  it("flags ingredientCategory when any prefilled row lacks one", () => {
    const draftMissingCategory = {
      ...DRAFT,
      ingredients: [
        { name: "penne rigate", quantity: 1, unit: "pound", notes: null, category: "Pantry" },
        { name: "mystery item", quantity: null, unit: null, notes: null },
      ],
    };

    const { highlightFields } = buildCreateRecipePrefill(draftMissingCategory, UNMAPPED);

    expect(highlightFields).toContain("ingredientCategory");
  });

  it("does not flag ingredientCost and ingredientCategory for a draft with no ingredients", () => {
    const draftNoIngredients = {
      recipe_name: "No Ingredients Recipe",
      ingredients: [],
    };
    const { highlightFields } = buildCreateRecipePrefill(draftNoIngredients, []);

    expect(highlightFields).not.toContain("ingredientCost");
    expect(highlightFields).not.toContain("ingredientCategory");
  });

  it("survives a draft with nothing in it", () => {
    const result = buildCreateRecipePrefill({}, []);

    expect(result.ingredientRows).toEqual([]);
    expect(result.instructions).toEqual([]);
    expect(result.formPatch.recipeName).toBe("");
  });
});
