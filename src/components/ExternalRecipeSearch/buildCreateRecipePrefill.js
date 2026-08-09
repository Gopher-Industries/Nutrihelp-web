/**
 * Translates a backend recipe-sources draft into the exact state shapes
 * CreateRecipe.jsx already uses.
 *
 * Kept pure and separate from the component so this — the fiddly part — can be
 * tested without mounting the form. Anything the source could not supply stays
 * empty and gets reported in highlightFields; nothing is ever invented here.
 */

// Backend field name -> CreateRecipe form field name.
const FIELD_MAP = {
  recipe_name: "recipeName",
  cuisine_name: "cuisine",
  cooking_method_name: "cookingMethod",
  prep_time_minutes: "preparationTime",
  servings: "totalServings",
};

function toFormValue(value) {
  // Preserve 0 as a valid number, convert null/undefined to empty string
  if (value === null || value === undefined) return "";
  return value;
}

export default function buildCreateRecipePrefill(draft = {}, unmappedFields = []) {
  const formPatch = {
    recipeName: toFormValue(draft.recipe_name),
    cuisine: toFormValue(draft.cuisine_name),
    cookingMethod: toFormValue(draft.cooking_method_name),
    preparationTime: toFormValue(draft.prep_time_minutes),
    totalServings: toFormValue(draft.servings),
  };

  const ingredientRows = (draft.ingredients || []).map((item) => ({
    ingredientCategory: "",
    ingredient: toFormValue(item?.name),
    ingredientQuantity: toFormValue(item?.quantity),
    // The source carries no cost data. Zero keeps the table's totals valid.
    // Cost and category are flagged in highlightFields to signal the user to complete them.
    ingredientCost: 0,
  }));

  const instructions = (draft.instructions || [])
    .map((step) => String(step || "").trim())
    .filter(Boolean);

  let highlightFields = unmappedFields
    .map((field) => FIELD_MAP[field])
    .filter(Boolean);

  // External sources never supply cost or category data. Flag them whenever
  // we have prefilled ingredients so users know to complete these fields.
  if (ingredientRows.length > 0) {
    highlightFields = [...highlightFields, "ingredientCost", "ingredientCategory"];
  }

  return {
    formPatch,
    ingredientRows,
    instructions,
    imagePreviewUrl: toFormValue(draft.image_url),
    highlightFields,
  };
}
