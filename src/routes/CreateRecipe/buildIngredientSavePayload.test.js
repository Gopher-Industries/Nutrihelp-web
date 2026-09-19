import {
  buildResolveRequest,
  buildIngredientSavePayload,
  describeNutritionOutcome,
} from "./buildIngredientSavePayload";

const OIL = {
  ingredient: "Olive Oil",
  ingredientCategory: "Pantry",
  ingredientQuantity: 0.25,
  ingredientUnit: "cup",
  ingredientNotes: "",
  ingredientSourceMeasure: "1/4 cup",
  ingredientCost: 0,
  ingredientId: 3,
};
const GARLIC = {
  ingredient: "Garlic",
  ingredientCategory: "Fruit & Vegetables",
  ingredientQuantity: 2,
  ingredientUnit: "cloves",
  ingredientNotes: "minced",
  ingredientSourceMeasure: "2 cloves minced",
  ingredientCost: 0,
  ingredientId: 63,
};
// Added by hand in the form, which has no unit field: the quantity is grams.
const MANUAL_TOMATO = {
  ingredient: "Tomato",
  ingredientCategory: "Fruit & Vegetables",
  ingredientQuantity: "400",
  ingredientCost: "2.5",
};
const SALT_TO_TASTE = {
  ingredient: "Salt",
  ingredientCategory: "Pantry",
  ingredientQuantity: "",
  ingredientUnit: "",
  ingredientNotes: "to taste",
  ingredientSourceMeasure: "To taste",
  ingredientCost: 0,
  ingredientId: 8,
};

describe("buildResolveRequest", () => {
  it("sends every named row with its measure", () => {
    expect(buildResolveRequest([OIL, GARLIC])).toEqual([
      { name: "Olive Oil", category: "Pantry", quantity: 0.25, unit: "cup", notes: "" },
      { name: "Garlic", category: "Fruit & Vegetables", quantity: 2, unit: "cloves", notes: "minced" },
    ]);
  });

  it("treats a hand-typed quantity as grams, which is what the form has always meant", () => {
    expect(buildResolveRequest([MANUAL_TOMATO])[0]).toEqual({
      name: "Tomato",
      category: "Fruit & Vegetables",
      quantity: 400,
      unit: "g",
      notes: "",
    });
  });

  it("sends a null quantity for an amount such as to taste", () => {
    const [salt] = buildResolveRequest([SALT_TO_TASTE]);

    expect(salt.quantity).toBeNull();
    expect(salt.unit).toBe("");
    expect(salt.notes).toBe("to taste");
  });

  it("skips rows with no ingredient name", () => {
    expect(buildResolveRequest([{ ingredient: "  " }, OIL])).toHaveLength(1);
  });

  it("stays inside the backend cap of 30 ingredients", () => {
    const many = Array.from({ length: 40 }, (_v, i) => ({ ...OIL, ingredient: `Oil ${i}` }));

    expect(buildResolveRequest(many)).toHaveLength(30);
  });
});

describe("buildIngredientSavePayload", () => {
  const idOf = (row) => row.ingredientId || null;
  const enriched = [
    { name: "Olive Oil", id: 3, grams: 54, grams_source: "usda_portion" },
    { name: "Garlic", id: 63, grams: 6, grams_source: "usda_portion" },
  ];

  it("lines the gram weights up with the ingredients it saves", () => {
    const payload = buildIngredientSavePayload([OIL, GARLIC], { idOf, enriched });

    expect(payload.ingredient_id).toEqual([3, 63]);
    expect(payload.ingredient_quantity).toEqual([0.25, 2]);
    expect(payload.ingredient_unit).toEqual(["cup", "cloves"]);
    expect(payload.ingredient_notes).toEqual(["", "minced"]);
    expect(payload.ingredient_source_measure).toEqual(["1/4 cup", "2 cloves minced"]);
    expect(payload.ingredient_grams).toEqual([54, 6]);
    expect(payload.ingredient_grams_source).toEqual(["usda_portion", "usda_portion"]);
  });

  it("uses an id the backend resolved when the row has none of its own", () => {
    const newRow = { ...OIL, ingredient: "Penne Rigate", ingredientId: null };
    const payload = buildIngredientSavePayload([newRow], {
      idOf,
      enriched: [{ name: "Penne Rigate", id: 501, grams: 453.59, grams_source: "mass" }],
    });

    expect(payload.ingredient_id).toEqual([501]);
    expect(payload.dropped).toEqual([]);
  });

  it("reports an ingredient it cannot save instead of dropping it silently", () => {
    const unknown = { ...OIL, ingredient: "Unobtainium", ingredientId: null };
    const payload = buildIngredientSavePayload([unknown, GARLIC], {
      idOf,
      enriched: [
        { name: "Unobtainium", id: null, grams: null, grams_source: null },
        { name: "Garlic", id: 63, grams: 6, grams_source: "usda_portion" },
      ],
    });

    expect(payload.dropped).toEqual(["Unobtainium"]);
    expect(payload.ingredient_id).toEqual([63]);
    expect(payload.ingredient_grams).toEqual([6]);
  });

  it("keeps a hand-typed row working as grams when the backend gave no weights", () => {
    const payload = buildIngredientSavePayload([{ ...MANUAL_TOMATO, ingredientId: 9 }], {
      idOf,
      enriched: [],
    });

    expect(payload.ingredient_quantity).toEqual([400]);
    expect(payload.ingredient_unit).toEqual(["g"]);
    expect(payload.ingredient_grams).toEqual([null]);
    expect(payload.ingredient_cost).toEqual([2.5]);
  });

  it("passes a zero weight through, because a pinch is a real answer", () => {
    const payload = buildIngredientSavePayload([SALT_TO_TASTE], {
      idOf,
      enriched: [{ name: "Salt", id: 8, grams: 0, grams_source: "negligible" }],
    });

    expect(payload.ingredient_quantity).toEqual([null]);
    expect(payload.ingredient_grams).toEqual([0]);
  });

  it("matches weights by position, so a repeated ingredient keeps each measure", () => {
    const again = { ...GARLIC, ingredientQuantity: 1, ingredientUnit: "tsp" };
    const payload = buildIngredientSavePayload([GARLIC, again], {
      idOf,
      enriched: [
        { name: "Garlic", id: 63, grams: 6, grams_source: "usda_portion" },
        { name: "Garlic", id: 63, grams: 2.8, grams_source: "usda_portion" },
      ],
    });

    expect(payload.ingredient_grams).toEqual([6, 2.8]);
  });
});

describe("describeNutritionOutcome", () => {
  it("credits USDA when every ingredient could be counted", () => {
    const message = describeNutritionOutcome({
      provider: "USDA FoodData Central",
      weighed: 5,
      unweighed: 0,
      missing: 0,
      complete: true,
    });

    expect(message).toMatch(/USDA FoodData Central/);
    expect(message).not.toMatch(/could not/i);
  });

  it("says how many ingredients could not be counted", () => {
    const message = describeNutritionOutcome({
      provider: "USDA FoodData Central",
      weighed: 4,
      unweighed: 1,
      missing: 2,
      complete: false,
    });

    expect(message).toMatch(/1 ingredient could not be weighed/);
    expect(message).toMatch(/2 have no nutrition data/);
  });

  it("says nothing when the backend sent no summary", () => {
    expect(describeNutritionOutcome(null)).toBe("");
  });
});
