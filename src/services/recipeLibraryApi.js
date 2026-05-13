import BaseApi from "./baseApi";

const api = new BaseApi();

function parseNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const matched = String(value ?? "").match(/-?\d+(?:\.\d+)?/);
  if (!matched) return 0;
  const parsed = Number(matched[0]);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeMealType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "breakfast" || normalized === "lunch" || normalized === "dinner") return normalized;
  if (
    normalized === "other" ||
    normalized === "others" ||
    normalized === "snack" ||
    normalized === "snacks" ||
    normalized === "dessert" ||
    normalized === "desserts" ||
    normalized === "drink" ||
    normalized === "drinks" ||
    normalized === "beverage" ||
    normalized === "beverages"
  ) {
    return "other";
  }
  return "other";
}

const LOCAL_MEAL_IMAGE_FALLBACKS = [
  { match: ["pho", "ramen", "noodle", "bun", "soup"], image: "/images/meal-mock/thai.jpg" },
  { match: ["rice", "com", "curry", "biryani"], image: "/images/meal-mock/rice.jpg" },
  { match: ["salmon", "fish", "tuna"], image: "/images/meal-mock/fish.jpg" },
  { match: ["chicken", "ga", "turkey"], image: "/images/meal-mock/chicken.jpg" },
  { match: ["beef", "steak", "pork", "meat"], image: "/images/meal-mock/meat.jpg" },
  { match: ["salad", "vegetable", "veggie"], image: "/images/meal-mock/salad.jpg" },
  { match: ["smoothie", "juice", "drink", "tea", "coffee"], image: "/images/meal-mock/juice.jpg" },
  { match: ["dessert", "cake", "chocolate", "che", "sweet"], image: "/images/meal-mock/dessert.jpg" },
  { match: ["egg", "omelette", "omelet"], image: "/images/meal-mock/omelette.jpg" },
  { match: ["oat", "porridge"], image: "/images/meal-mock/oatmeal.jpg" },
  { match: ["sandwich", "toast", "bread", "bagel"], image: "/images/meal-mock/sandwich.jpg" },
  { match: ["thai", "pad"], image: "/images/meal-mock/thai.jpg" },
  { match: ["indian", "masala"], image: "/images/meal-mock/indian.jpg" },
  { match: ["mexican", "taco"], image: "/images/meal-mock/mexican.jpg" },
  { match: ["italian", "pasta"], image: "/images/meal-mock/italian.jpg" },
  { match: ["chinese", "stir"], image: "/images/meal-mock/chinese.jpg" },
];

function getRecipeLibraryFallbackImage(row) {
  const text = [
    row?.recipe_name,
    row?.dish_name,
    row?.display_name,
    row?.cuisine_name_snapshot,
    row?.meal_type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const fallback = LOCAL_MEAL_IMAGE_FALLBACKS.find((item) =>
    item.match.some((keyword) => text.includes(keyword))
  );

  if (fallback?.image) return fallback.image;

  const mealType = normalizeMealType(row?.meal_type);
  if (mealType === "other") return "/images/meal-mock/bowl.jpg";
  return "/images/meal-mock/placeholder.svg";
}

function formatMinutes(prep, cook, total) {
  const minutes = parseNumber(total) || parseNumber(prep) + parseNumber(cook);
  return minutes > 0 ? `${Math.round(minutes)} Mins` : "Ready";
}

function formatServings(value) {
  const servings = parseNumber(value);
  if (!servings) return "1 Serving";
  const label = Number(servings.toFixed(2));
  return `${label} ${label === 1 ? "Serving" : "Servings"}`;
}

function buildTags(row) {
  return [
    row?.cuisine_name_snapshot,
    ...(Array.isArray(row?.dietary_tags) ? row.dietary_tags : []),
    ...(Array.isArray(row?.health_tags) ? row.health_tags : []),
    row?.visibility === "community" ? "Community" : null,
    row?.source === "user_created" ? "My Recipe" : null,
  ].filter(Boolean);
}

export function mapRecipeLibraryRowToMeal(row) {
  const title = row?.display_name || row?.recipe_name || row?.dish_name || "Untitled Recipe";

  return {
    id: `library-${row.id}`,
    recipeId: row.id,
    title,
    name: title,
    dishName: row?.dish_name || title,
    image: row?.image_url || getRecipeLibraryFallbackImage(row),
    imageSource: row?.image_source || "",
    imageAttribution: row?.image_attribution || "",
    imageSourceUrl: row?.image_source_url || "",
    time: formatMinutes(row?.prep_time_minutes, row?.cook_time_minutes, row?.total_time_minutes),
    servings: formatServings(row?.servings),
    level: row?.difficulty ? String(row.difficulty).replace(/^\w/, (c) => c.toUpperCase()) : "Easy",
    mealType: normalizeMealType(row?.meal_type),
    source: "recipe_library",
    visibility: row?.visibility || "",
    description: row?.description || "",
    tags: buildTags(row),
    ingredients: row?.ingredients || [],
    instructions: row?.instructions || [],
    nutrition: {
      calories: row?.calories || 0,
      protein: row?.protein || 0,
      proteins: row?.protein || 0,
      fat: row?.fat || 0,
      fats: row?.fat || 0,
      carbohydrates: row?.carbohydrates || 0,
      fiber: row?.fiber || 0,
      sugar: row?.sugar || 0,
      sodium: row?.sodium || 0,
      vitamins: (Number(row?.vitamin_a) || 0) + (Number(row?.vitamin_c) || 0),
    },
    rawRecipe: row,
  };
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${api.baseURL}${path}`, {
    method: options.method || "GET",
    cache: "no-store",
    headers: {
      ...api.getHeaders(),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error || data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function fetchRecipeLibraryForAddMeal(options = {}) {
  const limit = Math.max(1, Math.min(1000, Number(options.limit) || 500));
  const cacheBust = options.cacheBust !== false;
  const stamp = cacheBust ? `&ts=${Date.now()}` : "";

  try {
    const data = await requestJson(`/recipe-library/add-meal?limit=${limit}${stamp}`);
    return Array.isArray(data?.data) ? data.data.map(mapRecipeLibraryRowToMeal) : [];
  } catch (error) {
    if (error.status !== 401 && error.status !== 403) throw error;
    const data = await requestJson(`/recipe-library/public?limit=${limit}${stamp}`);
    return Array.isArray(data?.data) ? data.data.map(mapRecipeLibraryRowToMeal) : [];
  }
}
