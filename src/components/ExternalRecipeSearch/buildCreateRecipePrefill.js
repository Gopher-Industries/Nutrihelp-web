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
    // The source carries no cost data. Zero keeps the table's totals valid;
    // the field is flagged for the user to complete.
    ingredientCost: 0,
  }));

  const instructions = (draft.instructions || [])
    .map((step) => String(step || "").trim())
    .filter(Boolean);

  const highlightFields = unmappedFields
    .map((field) => FIELD_MAP[field])
    .filter(Boolean);

  return {
    formPatch,
    ingredientRows,
    instructions,
    imagePreviewUrl: toFormValue(draft.image_url),
    highlightFields,
  };
}
