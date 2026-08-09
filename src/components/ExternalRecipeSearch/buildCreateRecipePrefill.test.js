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
    expect(JSON.stringify(formPatch)).not.toContain("null");
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

  it("survives a draft with nothing in it", () => {
    const result = buildCreateRecipePrefill({}, []);

    expect(result.ingredientRows).toEqual([]);
    expect(result.instructions).toEqual([]);
    expect(result.formPatch.recipeName).toBe("");
  });
});
