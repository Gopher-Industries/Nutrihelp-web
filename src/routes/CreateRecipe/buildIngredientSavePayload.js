/**
 * Builds the ingredient half of the create-recipe request.
 *
 * Kept pure and out of CreateRecipe.jsx so the fiddly part can be tested without
 * mounting the form. The point of it: a recipe's nutrition total is worked out
 * from gram weights, and "0.25 cup" or "2 cloves" is not a weight. The backend
 * converts each measure using USDA FoodData Central portion data; this module
 * sends the measures and lines the answers back up with the rows being saved.
 */

// The backend validates at most 30 ingredients per resolve call.
const MAX_RESOLVE_INGREDIENTS = 30;

// The form has no unit field, so a hand-typed quantity has always meant grams.
const DEFAULT_UNIT = "g";

function text(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function positiveNumberOrNull(value) {
  if (value === null || value === undefined || text(value) === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function costOrNull(value) {
  if (value === null || value === undefined || text(value) === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Number(parsed.toFixed(2)) : null;
}

function measureOf(row) {
  const quantity = positiveNumberOrNull(row.ingredientQuantity);
  const unit = text(row.ingredientUnit) || (quantity === null ? "" : DEFAULT_UNIT);
  return { quantity, unit, notes: text(row.ingredientNotes) };
}

function namedRows(rows) {
  return (rows || []).filter((row) => text(row?.ingredient)).slice(0, MAX_RESOLVE_INGREDIENTS);
}

/**
 * @param {Array<object>} rows ingredient table rows
 * @returns {Array<{name, category, quantity, unit, notes}>} body for resolve-ingredients
 */
export function buildResolveRequest(rows) {
  return namedRows(rows).map((row) => ({
    name: text(row.ingredient),
    category: text(row.ingredientCategory),
    ...measureOf(row),
  }));
}

/**
 * @param {Array<object>} rows ingredient table rows
 * @param {{idOf: (row) => number|null, enriched: Array<object>}} options
 *   idOf finds an id the form already knows; enriched is the backend's answer to
 *   buildResolveRequest(rows), in the same order
 * @returns {object} the ingredient_* arrays, plus `dropped`: names that cannot be saved
 */
export function buildIngredientSavePayload(rows, { idOf, enriched = [] } = {}) {
  const asked = namedRows(rows);
  const payload = {
    ingredient_id: [],
    ingredient_quantity: [],
    ingredient_cost: [],
    ingredient_unit: [],
    ingredient_notes: [],
    ingredient_source_measure: [],
    ingredient_grams: [],
    ingredient_grams_source: [],
    dropped: [],
  };

  (rows || []).forEach((row) => {
    const name = text(row?.ingredient);
    if (!name) return;

    // Answers come back in request order, so a repeated ingredient keeps the
    // weight of its own measure rather than the first one's.
    const position = asked.indexOf(row);
    const answer = position === -1 ? null : enriched[position];
    const sameIngredient = answer && text(answer.name).toLowerCase() === name.toLowerCase();
    const entry = sameIngredient ? answer : null;

    const id = (idOf && idOf(row)) || entry?.id || null;
    if (!id) {
      payload.dropped.push(name);
      return;
    }

    const { quantity, unit, notes } = measureOf(row);
    const grams = entry && Number.isFinite(entry.grams) ? entry.grams : null;

    payload.ingredient_id.push(id);
    payload.ingredient_quantity.push(quantity);
    payload.ingredient_cost.push(costOrNull(row.ingredientCost));
    payload.ingredient_unit.push(unit);
    payload.ingredient_notes.push(notes);
    payload.ingredient_source_measure.push(text(row.ingredientSourceMeasure));
    payload.ingredient_grams.push(grams);
    payload.ingredient_grams_source.push(grams === null ? null : entry.grams_source || null);
  });

  return payload;
}

/**
 * The quantity as the ingredient table shows it. Never a bare number: "0.25"
 * with no unit is what let a quarter cup be read as a quarter of a gram.
 * @returns {string} e.g. "0.25 cup", "400 g", "to taste", or "" when empty
 */
export function formatIngredientQuantity(row) {
  if (!row) return "";
  const { quantity, unit, notes } = measureOf(row);
  if (quantity === null) return notes;
  return `${quantity} ${unit}`;
}

/**
 * One sentence for the user about how complete the nutrition total will be.
 * @returns {string} empty when the backend sent no summary
 */
export function describeNutritionOutcome(nutrition) {
  if (!nutrition) return "";

  const credit = `Nutrition calculated with ${nutrition.provider || "USDA FoodData Central"} data.`;
  if (nutrition.complete) return credit;

  const gaps = [];
  if (nutrition.unweighed > 0) {
    gaps.push(
      `${nutrition.unweighed} ingredient${nutrition.unweighed === 1 ? "" : "s"} could not be weighed`
    );
  }
  if (nutrition.missing > 0) {
    gaps.push(`${nutrition.missing} have no nutrition data`);
  }
  if (!gaps.length) return credit;

  return `${credit} ${gaps.join(" and ")}, so some totals may be blank.`;
}
