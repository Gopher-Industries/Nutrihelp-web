import AIBaseApi from "./aiApi";

const CHATBOT_ENDPOINT = "/ai-model/chatbot/chat";

function normalizeText(value) {
  return String(value || "").trim();
}

function toFiniteNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function roundNonNegative(value) {
  const parsed = toFiniteNumber(value);
  if (parsed === null) return null;
  return Math.max(0, Math.round(parsed));
}

function clampCost(value) {
  const parsed = toFiniteNumber(value);
  if (parsed === null) return null;
  return Math.max(0, Number(parsed.toFixed(2)));
}

function normalizeDifficulty(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (!normalized) return "Medium";
  if (normalized.includes("hard") || normalized.includes("advanced")) return "Hard";
  if (normalized.includes("easy") || normalized.includes("beginner")) return "Easy";
  return "Medium";
}

function normalizeTimeText(value) {
  const text = normalizeText(value);
  if (!text) return "30 Mins";
  if (/\d/.test(text) && /(min|hr|hour)/i.test(text)) return text;
  if (/^\d+$/.test(text)) return `${text} Mins`;
  return text;
}

function normalizeServingsText(value) {
  const text = normalizeText(value);
  if (!text) return "1 Serving";
  if (/serv/i.test(text)) return text;
  if (/^\d+(\.\d+)?$/.test(text)) {
    const numeric = Number(text);
    return numeric === 1 ? "1 Serving" : `${numeric} Servings`;
  }
  return text;
}

function positiveInt(value) {
  const parsed = toFiniteNumber(value);
  if (parsed === null) return null;
  const rounded = Math.round(parsed);
  return rounded > 0 ? rounded : null;
}

function inferPeopleFromServingsText(servingsText) {
  const text = normalizeText(servingsText);
  if (!text) return null;
  const match = text.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  return positiveInt(Number(match[1]));
}

function normalizePortioning(rawPortioning, servingsText) {
  const source = rawPortioning && typeof rawPortioning === "object" ? rawPortioning : {};
  const normalizedServings = normalizeServingsText(servingsText);
  const inferredPeople = inferPeopleFromServingsText(normalizedServings);

  const people =
    positiveInt(source.people ?? source.serves ?? source.servings_people) ??
    inferredPeople ??
    1;
  const mealPortions =
    positiveInt(source.meal_portions ?? source.meals ?? source.portions) ??
    people;
  const servingSize =
    normalizeText(source.serving_size || source.serving || source.serving_text) ||
    normalizedServings;
  const note =
    normalizeText(source.note || source.description) ||
    `Suitable for ${people} people, around ${mealPortions} meal portion${mealPortions > 1 ? "s" : ""}.`;

  return {
    people,
    mealPortions,
    servingSize,
    note,
  };
}

function pickNumber(source, keys) {
  if (!source || typeof source !== "object") return null;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const parsed = roundNonNegative(source[key]);
      if (parsed !== null) return parsed;
    }
  }
  return null;
}

function extractFirstJsonObject(rawText) {
  const text = normalizeText(rawText);
  if (!text) return null;

  const unwrapped = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  try {
    return JSON.parse(unwrapped);
  } catch {
    // Continue with bracket extraction below.
  }

  const firstBrace = unwrapped.indexOf("{");
  if (firstBrace === -1) return null;

  for (let end = unwrapped.length - 1; end > firstBrace; end -= 1) {
    if (unwrapped[end] !== "}") continue;
    const candidate = unwrapped.slice(firstBrace, end + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // Try a shorter candidate.
    }
  }

  return null;
}

function normalizeIngredient(item) {
  if (!item) return null;

  if (typeof item === "string") {
    const name = normalizeText(item);
    if (!name) return null;
    return { name, quantity: "1 serving", cost: null };
  }

  if (typeof item !== "object") return null;

  const name = normalizeText(
    item.name || item.ingredient || item.ingredient_name || item.label || item.item,
  );
  if (!name) return null;

  const quantity = normalizeText(
    item.quantity || item.amount || item.portion || item.serving || item.unit,
  );
  const cost = clampCost(item.estimated_cost_aud ?? item.cost_aud ?? item.cost);

  return {
    name,
    quantity: quantity || "1 serving",
    cost,
    note: normalizeText(item.note || item.preparation_note || "") || null,
  };
}

function normalizeAllergen(item) {
  if (!item) return null;

  if (typeof item === "string") {
    const label = normalizeText(item);
    if (!label) return null;
    return {
      label,
      detail: "May be present depending on ingredient brands and kitchen handling.",
    };
  }

  if (typeof item !== "object") return null;

  const label = normalizeText(item.label || item.name || item.allergen);
  if (!label) return null;

  return {
    label,
    detail:
      normalizeText(item.detail || item.description || item.warning) ||
      "May be present depending on ingredient brands and kitchen handling.",
  };
}

function normalizeNutrition(rawNutrition) {
  const nutrition = rawNutrition && typeof rawNutrition === "object" ? rawNutrition : {};

  return {
    calories: pickNumber(nutrition, ["calories", "calories_kcal", "kcal", "energy_kcal"]),
    carbs: pickNumber(nutrition, ["carbs", "carbohydrates", "carbs_g"]),
    protein: pickNumber(nutrition, ["protein", "protein_g"]),
    fat: pickNumber(nutrition, ["fat", "fat_g", "total_fat"]),
    fiber: pickNumber(nutrition, ["fiber", "fibre", "fiber_g", "fibre_g"]),
    sodium: pickNumber(nutrition, ["sodium", "sodium_mg"]),
    sugar: pickNumber(nutrition, ["sugar", "sugar_g", "sugars"]),
    potassium: pickNumber(nutrition, ["potassium", "potassium_mg"]),
    calcium: pickNumber(nutrition, ["calcium", "calcium_mg"]),
    iron: pickNumber(nutrition, ["iron", "iron_mg"]),
  };
}

function normalizeNutritionDetails(rawDetails, normalizedNutrition) {
  const fromArray = Array.isArray(rawDetails)
    ? rawDetails
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const label = normalizeText(item.label || item.name);
          const value = toFiniteNumber(item.value);
          const unit = normalizeText(item.unit);
          if (!label || value === null) return null;
          return { label, value: Math.max(0, Number(value.toFixed(1))), unit: unit || "" };
        })
        .filter(Boolean)
    : [];

  if (fromArray.length > 0) return fromArray;

  const fallback = [
    { label: "Calories", value: normalizedNutrition.calories, unit: "kcal" },
    { label: "Carbs", value: normalizedNutrition.carbs, unit: "g" },
    { label: "Protein", value: normalizedNutrition.protein, unit: "g" },
    { label: "Fat", value: normalizedNutrition.fat, unit: "g" },
    { label: "Fiber", value: normalizedNutrition.fiber, unit: "g" },
    { label: "Sodium", value: normalizedNutrition.sodium, unit: "mg" },
    { label: "Sugar", value: normalizedNutrition.sugar, unit: "g" },
    { label: "Potassium", value: normalizedNutrition.potassium, unit: "mg" },
    { label: "Calcium", value: normalizedNutrition.calcium, unit: "mg" },
    { label: "Iron", value: normalizedNutrition.iron, unit: "mg" },
  ]
    .filter((item) => item.value !== null)
    .map((item) => ({ label: item.label, value: item.value, unit: item.unit }));

  return fallback;
}

function normalizeRecipePayload(payload, fallbackTitle) {
  const source = payload && typeof payload === "object" ? payload : {};
  const title = normalizeText(source.title || source.recipe_name || fallbackTitle);

  const nutrition = normalizeNutrition(source.nutrition);
  const nutritionDetails = normalizeNutritionDetails(source.nutrition_details, nutrition);

  const ingredientsSource = Array.isArray(source.ingredients) ? source.ingredients : [];
  const ingredientItems = ingredientsSource.map(normalizeIngredient).filter(Boolean).slice(0, 20);

  const instructions = Array.isArray(source.instructions)
    ? source.instructions
        .map((item) => normalizeText(item))
        .filter(Boolean)
        .slice(0, 20)
    : [];

  const allergenSource = Array.isArray(source.allergens) ? source.allergens : [];
  const allergens = allergenSource.map(normalizeAllergen).filter(Boolean).slice(0, 10);

  const tags = Array.isArray(source.tags)
    ? source.tags
        .map((item) => normalizeText(item))
        .filter(Boolean)
        .slice(0, 12)
    : [];
  const servings = normalizeServingsText(source.servings || source.total_servings);
  const portioning = normalizePortioning(source.portioning, servings);

  return {
    title: title || "Recipe",
    description: normalizeText(source.description),
    time: normalizeTimeText(source.time || source.total_time || source.prep_time),
    servings,
    level: normalizeDifficulty(source.level || source.difficulty),
    nutrition,
    nutritionDetails,
    portioning,
    ingredientItems,
    instructions,
    allergens,
    tags,
  };
}

function buildPrompt(context) {
  const title = normalizeText(context?.title || "Unknown Dish");
  const mealType = normalizeText(context?.mealType || "meal");
  const description = normalizeText(context?.description || "");
  const servings = normalizeText(context?.servings || "1 Serving");
  const portioning = context?.portioning && typeof context.portioning === "object" ? context.portioning : {};
  const time = normalizeText(context?.time || "30 Mins");
  const ingredients = Array.isArray(context?.ingredients) ? context.ingredients.slice(0, 12) : [];
  const nutrition = context?.nutrition && typeof context.nutrition === "object" ? context.nutrition : {};

  const ingredientText = ingredients.length > 0 ? ingredients.join(", ") : "Unknown";
  const nutritionText = JSON.stringify(nutrition);
  const schema =
    '{"title":"string","description":"string","time":"35 Mins","servings":"2 Servings","portioning":{"people":2,"meal_portions":2,"serving_size":"1 large bowl (~500 g)","note":"Good as one main meal."},"level":"Easy|Medium|Hard","nutrition":{"calories":520,"carbs":58,"protein":24,"fat":18,"fiber":7,"sodium":920,"sugar":6,"potassium":540,"calcium":210,"iron":4},"nutrition_details":[{"label":"Calories","value":520,"unit":"kcal"}],"ingredients":[{"name":"Chicken breast","quantity":"180 g","estimated_cost_aud":3.9,"note":"optional"}],"instructions":["step"],"allergens":[{"label":"Gluten","detail":"..."}],"tags":["High Protein","Balanced","Japanese"]}';

  const prompt = [
    "You are a nutrition chef assistant.",
    "Return ONE valid JSON object only (no markdown).",
    "Make the recipe realistic for home cooking in Australia.",
    "Use practical ingredient quantities, costs in AUD, and specific steps.",
    "Include complete nutrition per serving and avoid placeholders.",
    "Use this exact key schema:",
    schema,
    "Rules: 8-14 ingredients, 6-10 instructions, no null values, coherent nutrition ranges.",
    "portioning.people and portioning.meal_portions must be positive integers.",
    `Dish=${title}; MealType=${mealType}; Description=${description || "N/A"}; Servings=${servings}; Time=${time}.`,
    `PortioningHint=${JSON.stringify(portioning)}.`,
    `IngredientHint=${ingredientText}.`,
    `NutritionHint=${nutritionText}.`,
  ].join(" ");

  return prompt.length > 1900 ? prompt.slice(0, 1900) : prompt;
}

class AIRecipeDetailApi extends AIBaseApi {
  async generateDetailedRecipe(context = {}) {
    const prompt = buildPrompt(context);

    const response = await fetch(`${this.baseURL}${CHATBOT_ENDPOINT}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ query: prompt }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.detail || data?.error || "Failed to generate detailed recipe.");
    }

    const rawMessage = normalizeText(data?.msg || data?.message || "");
    const parsed = extractFirstJsonObject(rawMessage);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("AI did not return valid recipe JSON.");
    }

    return normalizeRecipePayload(parsed, context?.title || "Recipe");
  }
}

export const aiRecipeDetailApi = new AIRecipeDetailApi();
export const generateDetailedRecipe = (...args) => aiRecipeDetailApi.generateDetailedRecipe(...args);

export default aiRecipeDetailApi;
