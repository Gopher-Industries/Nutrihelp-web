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
    // The mapper classifies each ingredient into NutriHelp's category
    // vocabulary. recipe_ingredient.cuisine_id is NOT NULL, so an empty
    // category makes the row unsavable.
    ingredientCategory: toFormValue(item?.category),
    // The backend matched this name to an existing NutriHelp ingredient id, or
    // left it null. Carrying the id through means the save path does not have
    // to match by name — which silently dropped ~75% of ingredients. Nulls are
    // resolved (and created) at save time, not here: previewing a recipe must
    // not write to the shared ingredients table.
    ingredientId: item?.ingredient_id ?? null,
    ingredient: toFormValue(item?.matched_name || item?.name),
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

  // External sources never supply cost data, so that stays flagged whenever we
  // prefilled ingredients. Category is now classified by the mapper, so flag it
  // only if any row actually came back without one.
  if (ingredientRows.length > 0) {
    highlightFields = [...highlightFields, "ingredientCost"];

    if (ingredientRows.some((row) => !String(row.ingredientCategory || "").trim())) {
      highlightFields = [...highlightFields, "ingredientCategory"];
    }
  }

  return {
    formPatch,
    ingredientRows,
    instructions,
    imagePreviewUrl: toFormValue(draft.image_url),
    highlightFields,
  };
}
