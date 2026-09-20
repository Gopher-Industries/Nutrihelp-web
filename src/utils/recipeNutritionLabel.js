/**
 * Turns a recipe's nutrition record into something a person can read.
 *
 * The backend stores two layers. `calories` is the strict total, withheld when
 * too much of the recipe is unknown. `ingredients.nutrition_coverage` says what
 * was counted and estimated, and keeps the partial sum. A withheld total is
 * still worth showing, as long as it is labelled for what it is:
 * "About 850 kcal per serving, covers 6 of 8 ingredients".
 *
 * Pure functions, so the wording can be tested without mounting a page.
 */

const CREDIT = "Nutrition calculated with USDA FoodData Central data.";

function finiteOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function wholeNumber(value) {
  return Math.round(value).toLocaleString("en-AU");
}

function coverageOf(recipe) {
  return recipe?.ingredients?.nutrition_coverage || null;
}

function coverageLabel(coverage) {
  if (!coverage) return "";
  const parts = [];
  const counted = finiteOrNull(coverage.counted?.calories);
  if (counted !== null && counted < coverage.ingredients) {
    parts.push(`Covers ${counted} of ${coverage.ingredients} ingredients`);
  }
  if (coverage.estimated > 0) {
    parts.push(`${coverage.estimated} weight${coverage.estimated === 1 ? "" : "s"} estimated`);
  }
  return parts.join(" · ");
}

/**
 * @param {object} recipe a recipe as the list endpoint returns it
 * @returns {{headline: string, approximate: boolean, label: string}|null}
 *   null when there is no figure worth standing behind
 */
export function formatRecipeNutrition(recipe) {
  if (!recipe) return null;
  const coverage = coverageOf(recipe);
  // No coverage record means the total predates gram weights: it was worked out
  // by reading every bare quantity as grams ("2 chicken breasts" as 2 g), which
  // put "7 kcal per serving" on real dishes. Nobody can vouch for that figure.
  if (!coverage) return null;

  let calories = finiteOrNull(recipe.calories);
  let approximate = false;
  if (calories === null) {
    const counted = finiteOrNull(coverage?.counted?.calories) || 0;
    calories = counted > 0 ? finiteOrNull(coverage?.partial?.calories) : null;
    approximate = true;
  }
  if (calories === null) return null;

  const servings = finiteOrNull(recipe.total_servings);
  const figure =
    servings && servings > 0
      ? `${wholeNumber(calories / servings)} kcal per serving`
      : `${wholeNumber(calories)} kcal`;

  return {
    headline: approximate ? `About ${figure}` : figure,
    approximate,
    label: coverageLabel(coverage),
  };
}

/**
 * One sentence for the toast shown right after a recipe is saved.
 * @param {{calories: number|null, coverage: object|null}|null} nutrition from createRecipe
 * @returns {string} empty when the backend sent no coverage
 */
export function describeSavedNutrition(nutrition) {
  const coverage = nutrition?.coverage;
  if (!coverage) return "";

  if (finiteOrNull(nutrition.calories) !== null) {
    const label = coverageLabel(coverage);
    return label ? `${CREDIT} ${label}.` : CREDIT;
  }

  const counted = finiteOrNull(coverage.counted?.calories) || 0;
  const partial = finiteOrNull(coverage.partial?.calories);
  if (counted > 0 && partial !== null) {
    return `Nutrition is partial: about ${wholeNumber(partial)} kcal from ${counted} of ${coverage.ingredients} ingredients. The rest could not be weighed or have no data.`;
  }
  return "Nutrition could not be calculated for this recipe.";
}
