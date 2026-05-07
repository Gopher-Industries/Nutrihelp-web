import "./MealRecipeDetail.css";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  Clock3,
  Cloud,
  Heart,
  Moon,
  Pencil,
  Printer,
  Share2,
  ShoppingCart,
  Star,
  Sun,
  Trash2,
  Users,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import recipeApi from "../../services/recepieApi";
import { generateDetailedRecipe } from "../../services/aiRecipeDetailApi";
import { getRecipes } from "../CreateRecipe/data/db/db";

const MEAL_SELECTIONS_STORAGE_KEY = "nutrihelp_add_meal_selections_by_date_v1";
const AI_RECIPE_CACHE_STORAGE_KEY = "nutrihelp_ai_recipe_detail_cache_v1";
const DEFAULT_IMAGE = "/images/meal-mock/placeholder.svg";

const MEAL_SLOT_OPTIONS = [
  { key: "breakfast", label: "Breakfast", icon: Sun, iconClass: "slot-breakfast" },
  { key: "lunch", label: "Lunch", icon: Cloud, iconClass: "slot-lunch" },
  { key: "dinner", label: "Dinner", icon: Moon, iconClass: "slot-dinner" },
];

const NUTRITION_PRESETS = {
  breakfast: { calories: 285, carbs: 42, protein: 14, fat: 10, fiber: 8, sodium: 180 },
  lunch: { calories: 465, carbs: 53, protein: 29, fat: 14, fiber: 10, sodium: 430 },
  dinner: { calories: 535, carbs: 46, protein: 34, fat: 18, fiber: 9, sodium: 500 },
  others: { calories: 225, carbs: 25, protein: 10, fat: 8, fiber: 6, sodium: 165 },
};

const TAGS_BY_TYPE = {
  breakfast: ["Light", "Morning Energy", "Balanced"],
  lunch: ["Balanced", "High Protein", "Satisfying"],
  dinner: ["Rich Flavor", "Recovery", "Nutrient Dense"],
  others: ["Quick", "Snack", "Easy Prep"],
};

const IMAGE_RULES = [
  { keywords: ["oat", "porridge"], src: "/images/meal-mock/oatmeal-bowl.jpg" },
  { keywords: ["yogurt", "parfait", "chia"], src: "/images/symptom_assessment/chia_seeds_yogurt.jpg" },
  { keywords: ["quinoa", "buddha"], src: "/images/meal-mock/quinoa.jpg" },
  { keywords: ["salmon", "tuna"], src: "/images/symptom_assessment/grilled_salmon.jpg" },
  { keywords: ["egg", "omelette"], src: "/images/meal-mock/omelette.jpg" },
  { keywords: ["smoothie", "juice"], src: "/images/meal-mock/smoothie.jpg" },
  { keywords: ["chicken", "teriyaki", "wrap"], src: "/images/meal-mock/chicken.jpg" },
  { keywords: ["curry", "masala", "lentil"], src: "/images/meal-mock/indian.jpg" },
  { keywords: ["steak", "beef"], src: "/images/meal-mock/meat.jpg" },
  { keywords: ["avocado", "toast", "bagel"], src: "/images/meal-mock/avocado.jpg" },
  { keywords: ["pasta", "ramen", "thai"], src: "/images/meal-mock/italian.jpg" },
  { keywords: ["salad", "veggie", "vegetable"], src: "/images/meal-mock/salad.jpg" },
];

const IMAGE_ROTATION = [
  "/images/meal-mock/oatmeal.jpg",
  "/images/meal-mock/salad.jpg",
  "/images/meal-mock/salmon.jpg",
  "/images/meal-mock/vegetables.jpg",
  "/images/meal-mock/rice.jpg",
  "/images/meal-mock/chicken.jpg",
];

const INGREDIENT_RULES = [
  { keywords: ["oat", "porridge"], list: ["Granola", "Fresh blueberries", "Greek yogurt or milk", "Honey", "Chia seeds"] },
  { keywords: ["yogurt", "parfait"], list: ["Greek Yogurt", "Fresh Berries", "Granola", "Chia Seeds"] },
  { keywords: ["quinoa", "bowl"], list: ["Quinoa", "Leafy Greens", "Cherry Tomato", "Olive Oil"] },
  { keywords: ["salmon", "tuna"], list: ["Salmon", "Lemon", "Herbs", "Mixed Greens"] },
  { keywords: ["egg", "omelette"], list: ["Eggs", "Spinach", "Mushroom", "Black Pepper"] },
  { keywords: ["curry", "lentil"], list: ["Lentils", "Tomato", "Coconut Milk", "Turmeric"] },
  { keywords: ["wrap", "sandwich"], list: ["Whole Grain Wrap", "Lean Protein", "Lettuce", "Tomato"] },
  {
    keywords: ["ramen", "noodle", "pho", "udon"],
    list: [
      "Ramen Noodles",
      "Low-Sodium Chicken or Vegetable Stock",
      "Chicken Breast or Firm Tofu",
      "Soft-Boiled Egg",
      "Mushrooms",
      "Baby Bok Choy or Spinach",
      "Spring Onion",
      "Ginger",
      "Garlic",
      "Light Soy Sauce",
    ],
  },
  { keywords: ["steak", "beef"], list: ["Lean Beef", "Garlic", "Bell Pepper", "Olive Oil"] },
];

const INGREDIENT_COST_RULES = [
  { keywords: ["granola"], quantity: "1/2 cup", cost: 0.5 },
  { keywords: ["blueberr", "berries"], quantity: "1/2 cup", cost: 1.2 },
  { keywords: ["yogurt", "milk"], quantity: "1/2 cup", cost: 0.6 },
  { keywords: ["honey"], quantity: "1 tsp", cost: 0.1 },
  { keywords: ["chia", "seed"], quantity: "1 tbsp", cost: 0.2 },
  { keywords: ["salmon"], quantity: "150g", cost: 3.5 },
  { keywords: ["quinoa"], quantity: "3/4 cup", cost: 0.9 },
  { keywords: ["egg"], quantity: "2 pcs", cost: 0.8 },
  { keywords: ["ramen", "noodle", "udon"], quantity: "120 g", cost: 1.6 },
  { keywords: ["stock", "broth"], quantity: "500 ml", cost: 1.1 },
  { keywords: ["tofu"], quantity: "150 g", cost: 1.7 },
  { keywords: ["bok choy", "spinach"], quantity: "1 cup", cost: 0.95 },
  { keywords: ["spring onion", "scallion"], quantity: "2 stalks", cost: 0.6 },
  { keywords: ["ginger"], quantity: "1 tbsp", cost: 0.35 },
  { keywords: ["soy sauce"], quantity: "1 tbsp", cost: 0.25 },
  { keywords: ["olive oil"], quantity: "1 tbsp", cost: 0.25 },
  { keywords: ["greens", "lettuce", "spinach"], quantity: "1 cup", cost: 0.7 },
  { keywords: ["tomato"], quantity: "1/2 cup", cost: 0.55 },
  { keywords: ["mushroom"], quantity: "1/2 cup", cost: 0.85 },
];

const DISH_ARCHETYPE_RULES = [
  { key: "rice_bowl", keywords: ["bibimbap", "donburi", "poke", "rice bowl"] },
  { key: "noodle_soup", keywords: ["ramen", "pho", "udon", "laksa", "noodle soup"] },
  { key: "noodle_stir_fry", keywords: ["pad thai", "yakisoba", "chow mein", "lo mein", "mi goreng"] },
  { key: "curry_stew", keywords: ["curry", "masala", "korma", "dal", "lentil stew"] },
  { key: "pasta", keywords: ["pasta", "spaghetti", "carbonara", "bolognese", "lasagna", "macaroni"] },
  { key: "sandwich_wrap", keywords: ["sandwich", "wrap", "burger", "bagel", "taco"] },
  { key: "salad_bowl", keywords: ["salad", "caesar", "quinoa bowl", "grain bowl"] },
  { key: "breakfast_plate", keywords: ["omelette", "oatmeal", "porridge", "parfait", "pancake", "waffle"] },
  { key: "grilled_plate", keywords: ["steak", "grilled salmon", "grilled chicken", "fish fillet"] },
];

const ARCHETYPE_FALLBACK_PROFILES = {
  rice_bowl: {
    portioning: { people: 2, mealPortions: 2, servingSize: "1 bowl (~500 g)" },
    nutrition: { calories: 560, carbs: 68, protein: 30, fat: 18, fiber: 7, sodium: 820, sugar: 8, potassium: 760, calcium: 130, iron: 4 },
    ingredientItems: [
      { name: "Cooked rice", quantity: "300 g (2 cups)", cost: 1.4 },
      { name: "Lean protein (beef/chicken/tofu)", quantity: "180 g", cost: 3.8 },
      { name: "Spinach", quantity: "120 g", cost: 1.1 },
      { name: "Bean sprouts", quantity: "120 g", cost: 1.2 },
      { name: "Carrot (julienned)", quantity: "80 g", cost: 0.5 },
      { name: "Zucchini (julienned)", quantity: "100 g", cost: 0.7 },
      { name: "Mushrooms", quantity: "100 g", cost: 1.8 },
      { name: "Eggs", quantity: "2", cost: 1.2 },
      { name: "Low-sodium soy sauce", quantity: "1.5 tbsp", cost: 0.3 },
      { name: "Sesame oil", quantity: "1 tbsp", cost: 0.35 },
      { name: "Garlic (minced)", quantity: "2 cloves", cost: 0.15 },
      { name: "Spring onion", quantity: "2 stalks", cost: 0.5 },
    ],
    instructions: [
      "Marinate protein with soy sauce, sesame oil, garlic, and pepper for 10-15 minutes.",
      "Blanch leafy vegetables and bean sprouts separately, then season lightly.",
      "Stir-fry carrot, zucchini, and mushrooms over medium-high heat until tender-crisp.",
      "Cook marinated protein in a hot pan until fully cooked and lightly browned.",
      "Fry eggs to preferred doneness.",
      "Place warm rice in bowls and arrange protein and vegetables in sections.",
      "Top with egg, spring onion, and optional chili paste; adjust seasoning to taste.",
    ],
    allergens: [
      { label: "Soy", detail: "Usually present in soy-based sauce." },
      { label: "Egg", detail: "Egg is commonly used as a topping." },
      { label: "Sesame", detail: "Sesame oil or seeds are often included." },
    ],
    tags: ["Balanced", "High Protein", "Vegetable-Rich"],
  },
  noodle_soup: {
    portioning: { people: 2, mealPortions: 2, servingSize: "1 bowl (~450 g)" },
    nutrition: { calories: 490, carbs: 60, protein: 28, fat: 14, fiber: 5, sodium: 980, sugar: 6, potassium: 650, calcium: 120, iron: 3 },
    ingredientItems: [
      { name: "Noodles", quantity: "200 g", cost: 1.8 },
      { name: "Low-sodium stock", quantity: "1 L", cost: 2.0 },
      { name: "Chicken breast or tofu", quantity: "200 g", cost: 3.8 },
      { name: "Eggs", quantity: "2", cost: 1.2 },
      { name: "Bok choy or spinach", quantity: "120 g", cost: 1.0 },
      { name: "Mushrooms", quantity: "120 g", cost: 1.6 },
      { name: "Spring onion", quantity: "2 stalks", cost: 0.5 },
      { name: "Ginger", quantity: "1 tbsp", cost: 0.35 },
      { name: "Garlic", quantity: "2 cloves", cost: 0.15 },
      { name: "Soy sauce", quantity: "1 tbsp", cost: 0.25 },
    ],
    instructions: [
      "Simmer stock with ginger, garlic, and spring onion for 8-10 minutes.",
      "Cook noodles separately until just tender and set aside.",
      "Cook protein until fully done, then slice if needed.",
      "Blanch greens and mushrooms briefly in the hot broth.",
      "Season broth with soy sauce and pepper; keep salt moderate.",
      "Assemble bowls with noodles, protein, vegetables, and hot broth.",
      "Finish with egg and fresh herbs, then serve immediately.",
    ],
    allergens: [
      { label: "Gluten", detail: "Possible from wheat noodles and soy sauce." },
      { label: "Soy", detail: "Usually present in seasoning sauce." },
      { label: "Egg", detail: "Egg topping is common." },
    ],
    tags: ["Comforting", "Balanced", "High Protein"],
  },
  noodle_stir_fry: {
    portioning: { people: 2, mealPortions: 2, servingSize: "1 plate (~420 g)" },
    nutrition: { calories: 540, carbs: 66, protein: 27, fat: 17, fiber: 6, sodium: 900, sugar: 9, potassium: 620, calcium: 95, iron: 3 },
    ingredientItems: [
      { name: "Noodles", quantity: "220 g", cost: 1.8 },
      { name: "Chicken or tofu", quantity: "180 g", cost: 3.4 },
      { name: "Eggs", quantity: "2", cost: 1.2 },
      { name: "Carrot", quantity: "80 g", cost: 0.5 },
      { name: "Capsicum", quantity: "100 g", cost: 0.9 },
      { name: "Bean sprouts", quantity: "120 g", cost: 1.2 },
      { name: "Spring onion", quantity: "2 stalks", cost: 0.5 },
      { name: "Garlic", quantity: "2 cloves", cost: 0.15 },
      { name: "Soy sauce", quantity: "1.5 tbsp", cost: 0.3 },
      { name: "Lime", quantity: "1", cost: 0.4 },
    ],
    instructions: [
      "Soak or boil noodles until nearly tender, then drain.",
      "Stir-fry protein in a hot wok with a little oil until cooked through.",
      "Push protein aside, scramble eggs in the same pan, then combine.",
      "Add garlic and vegetables; stir-fry quickly to keep crunch.",
      "Add noodles and sauce; toss over high heat for 1-2 minutes.",
      "Finish with sprouts, spring onion, and lime juice before serving.",
    ],
    allergens: [
      { label: "Gluten", detail: "Possible from noodles or soy sauce." },
      { label: "Soy", detail: "Present in soy-based sauce." },
      { label: "Egg", detail: "Egg is usually part of the stir-fry." },
    ],
    tags: ["Quick", "Wok-Friendly", "High Protein"],
  },
  curry_stew: {
    portioning: { people: 3, mealPortions: 3, servingSize: "1 bowl (~400 g)" },
    nutrition: { calories: 580, carbs: 52, protein: 32, fat: 24, fiber: 8, sodium: 760, sugar: 9, potassium: 780, calcium: 140, iron: 5 },
    ingredientItems: [
      { name: "Chicken thigh or chickpeas", quantity: "300 g", cost: 4.2 },
      { name: "Onion", quantity: "1 medium", cost: 0.5 },
      { name: "Garlic", quantity: "3 cloves", cost: 0.2 },
      { name: "Ginger", quantity: "1 tbsp", cost: 0.35 },
      { name: "Curry powder or paste", quantity: "2 tbsp", cost: 0.7 },
      { name: "Tomato passata", quantity: "300 ml", cost: 1.1 },
      { name: "Light coconut milk", quantity: "250 ml", cost: 1.4 },
      { name: "Potato or pumpkin", quantity: "200 g", cost: 0.9 },
      { name: "Spinach", quantity: "100 g", cost: 0.9 },
      { name: "Rice (to serve)", quantity: "300 g cooked", cost: 1.2 },
    ],
    instructions: [
      "Saute onion, garlic, and ginger until fragrant.",
      "Add curry spices/paste and cook for 30-60 seconds.",
      "Add protein and sear lightly before adding tomato and coconut milk.",
      "Simmer with vegetables until protein is tender and fully cooked.",
      "Stir in spinach at the end and adjust salt, acidity, and heat.",
      "Serve hot with rice or whole-grain flatbread.",
    ],
    allergens: [
      { label: "Dairy", detail: "Possible if yogurt/cream is added." },
      { label: "Gluten", detail: "Possible from packaged curry paste additives." },
    ],
    tags: ["Hearty", "Protein-Rich", "Meal Prep Friendly"],
  },
  pasta: {
    portioning: { people: 2, mealPortions: 2, servingSize: "1 plate (~420 g)" },
    nutrition: { calories: 620, carbs: 72, protein: 30, fat: 22, fiber: 7, sodium: 840, sugar: 10, potassium: 700, calcium: 160, iron: 4 },
    ingredientItems: [
      { name: "Dry pasta", quantity: "220 g", cost: 1.4 },
      { name: "Lean mince or mushrooms", quantity: "220 g", cost: 3.9 },
      { name: "Onion", quantity: "1 small", cost: 0.4 },
      { name: "Garlic", quantity: "2 cloves", cost: 0.15 },
      { name: "Tomato passata", quantity: "400 ml", cost: 1.4 },
      { name: "Olive oil", quantity: "1 tbsp", cost: 0.25 },
      { name: "Parmesan", quantity: "25 g", cost: 0.9 },
      { name: "Basil or parsley", quantity: "1 handful", cost: 0.8 },
    ],
    instructions: [
      "Cook pasta in salted boiling water until al dente.",
      "Saute onion and garlic in olive oil until translucent.",
      "Cook protein (or mushrooms) until browned.",
      "Add tomato sauce and simmer 8-10 minutes to thicken.",
      "Toss pasta with sauce and a little pasta water for gloss.",
      "Finish with herbs and parmesan before serving.",
    ],
    allergens: [
      { label: "Gluten", detail: "Present in regular wheat pasta." },
      { label: "Dairy", detail: "Possible from parmesan or creamy additions." },
    ],
    tags: ["Satisfying", "Family Friendly", "Balanced"],
  },
  salad_bowl: {
    portioning: { people: 2, mealPortions: 2, servingSize: "1 bowl (~380 g)" },
    nutrition: { calories: 430, carbs: 38, protein: 24, fat: 18, fiber: 10, sodium: 520, sugar: 8, potassium: 780, calcium: 170, iron: 4 },
    ingredientItems: [
      { name: "Leafy greens", quantity: "150 g", cost: 1.4 },
      { name: "Quinoa or brown rice", quantity: "180 g cooked", cost: 1.1 },
      { name: "Chicken breast or tofu", quantity: "180 g", cost: 3.3 },
      { name: "Cucumber", quantity: "100 g", cost: 0.5 },
      { name: "Cherry tomatoes", quantity: "120 g", cost: 1.2 },
      { name: "Avocado", quantity: "1/2 medium", cost: 1.1 },
      { name: "Olive oil", quantity: "1 tbsp", cost: 0.25 },
      { name: "Lemon juice", quantity: "1 tbsp", cost: 0.2 },
    ],
    instructions: [
      "Cook grain component and let it cool slightly.",
      "Cook protein and season with pepper, garlic, and herbs.",
      "Prepare vegetables and keep pieces similar in size.",
      "Whisk dressing from olive oil, lemon juice, and seasoning.",
      "Assemble greens, grain, protein, and vegetables in bowls.",
      "Dress just before serving and toss lightly.",
    ],
    allergens: [
      { label: "Nuts", detail: "Possible if nuts/seeds are added as topping." },
    ],
    tags: ["High Fiber", "Fresh", "Balanced"],
  },
  sandwich_wrap: {
    portioning: { people: 2, mealPortions: 2, servingSize: "1 sandwich/wrap each" },
    nutrition: { calories: 510, carbs: 46, protein: 28, fat: 21, fiber: 7, sodium: 860, sugar: 7, potassium: 620, calcium: 150, iron: 3 },
    ingredientItems: [
      { name: "Whole-grain bread or wraps", quantity: "2 servings", cost: 1.6 },
      { name: "Lean protein", quantity: "180 g", cost: 3.2 },
      { name: "Lettuce", quantity: "80 g", cost: 0.6 },
      { name: "Tomato", quantity: "100 g", cost: 0.6 },
      { name: "Cucumber", quantity: "80 g", cost: 0.4 },
      { name: "Greek yogurt or light mayo", quantity: "2 tbsp", cost: 0.45 },
      { name: "Mustard or chili sauce", quantity: "1 tbsp", cost: 0.2 },
    ],
    instructions: [
      "Toast or warm bread/wrap for better texture.",
      "Cook or slice protein into even portions.",
      "Prepare crisp vegetables and pat dry.",
      "Spread sauce thinly to avoid sogginess.",
      "Layer protein then vegetables evenly; roll or stack firmly.",
      "Slice and serve immediately.",
    ],
    allergens: [
      { label: "Gluten", detail: "Usually present in bread or wraps." },
      { label: "Dairy", detail: "Possible in sauces/cheese." },
    ],
    tags: ["Quick", "Portable", "Balanced"],
  },
  breakfast_plate: {
    portioning: { people: 1, mealPortions: 1, servingSize: "1 breakfast plate" },
    nutrition: { calories: 420, carbs: 45, protein: 22, fat: 16, fiber: 7, sodium: 520, sugar: 10, potassium: 540, calcium: 180, iron: 3 },
    ingredientItems: [
      { name: "Eggs or Greek yogurt", quantity: "2 eggs or 180 g yogurt", cost: 1.5 },
      { name: "Whole-grain toast or oats", quantity: "1-2 slices / 1/2 cup", cost: 0.8 },
      { name: "Fruit", quantity: "1 cup", cost: 1.3 },
      { name: "Nuts or seeds", quantity: "1 tbsp", cost: 0.25 },
      { name: "Milk", quantity: "150 ml", cost: 0.35 },
    ],
    instructions: [
      "Prepare protein component first (eggs/yogurt).",
      "Cook or toast grain component.",
      "Add fruit and seeds for fiber and micronutrients.",
      "Adjust sweetness with fruit before adding syrups.",
      "Serve while warm for best texture.",
    ],
    allergens: [
      { label: "Egg", detail: "Common in breakfast dishes." },
      { label: "Dairy", detail: "Possible from milk or yogurt." },
      { label: "Gluten", detail: "Possible from bread/oats depending on product." },
    ],
    tags: ["Morning Energy", "Balanced", "Protein Support"],
  },
  grilled_plate: {
    portioning: { people: 2, mealPortions: 2, servingSize: "1 plate (~420 g)" },
    nutrition: { calories: 500, carbs: 32, protein: 38, fat: 22, fiber: 8, sodium: 620, sugar: 7, potassium: 860, calcium: 120, iron: 5 },
    ingredientItems: [
      { name: "Fish/chicken/lean beef", quantity: "260 g", cost: 5.2 },
      { name: "Olive oil", quantity: "1 tbsp", cost: 0.25 },
      { name: "Lemon", quantity: "1", cost: 0.4 },
      { name: "Garlic", quantity: "2 cloves", cost: 0.15 },
      { name: "Mixed vegetables", quantity: "250 g", cost: 2.1 },
      { name: "Potato or whole grains", quantity: "180 g cooked", cost: 1.0 },
    ],
    instructions: [
      "Season protein with olive oil, garlic, lemon, salt, and pepper.",
      "Preheat grill or pan to medium-high heat.",
      "Cook protein until safe internal temperature is reached.",
      "Roast or saute vegetables until tender-crisp.",
      "Plate with grain/starch side and drizzle pan juices on top.",
      "Serve with fresh herbs and lemon wedge.",
    ],
    allergens: [
      { label: "Fish", detail: "Applies when seafood protein is used." },
    ],
    tags: ["High Protein", "Lower Carb", "Dinner Ready"],
  },
};

const CUISINE_TAG_RULES = [
  { tag: "Korean", keywords: ["bibimbap", "kimchi", "gochujang"] },
  { tag: "Japanese", keywords: ["ramen", "udon", "donburi", "miso"] },
  { tag: "Vietnamese", keywords: ["pho", "bun", "lemongrass"] },
  { tag: "Thai", keywords: ["pad thai", "tom yum", "green curry"] },
  { tag: "Indian", keywords: ["masala", "korma", "dal", "tikka"] },
  { tag: "Italian", keywords: ["pasta", "spaghetti", "lasagna", "risotto"] },
  { tag: "Western", keywords: ["burger", "sandwich", "steak"] },
];

const ALLERGEN_WARNING_RULES = [
  {
    keywords: ["nut", "almond", "cashew", "walnut", "peanut"],
    label: "Nuts",
    detail: "May contain almonds, cashews, walnuts, or mixed nut blends.",
  },
  {
    keywords: ["seed", "chia", "sesame", "sunflower"],
    label: "Seeds",
    detail: "Can include chia, sesame, or sunflower seeds in some blends.",
  },
  {
    keywords: ["yogurt", "milk", "cheese", "dairy"],
    label: "Dairy",
    detail: "Contains or may be prepared with milk-based ingredients.",
  },
  {
    keywords: ["oat", "bread", "pasta", "flour", "granola", "gluten"],
    label: "Gluten",
    detail: "Some ingredients may include gluten or traces from processing.",
  },
  {
    keywords: ["egg", "omelette"],
    label: "Egg",
    detail: "Includes egg-based ingredients in preparation.",
  },
  {
    keywords: ["salmon", "tuna", "fish", "shrimp", "shellfish"],
    label: "Seafood",
    detail: "May include fish or shellfish-based ingredients.",
  },
];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function formatMealTypeLabel(mealType) {
  const normalized = normalize(mealType);
  if (!normalized) return "Meal";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function normalizeMealType(value) {
  const normalized = normalize(value);
  if (["breakfast", "lunch", "dinner", "others"].includes(normalized)) return normalized;
  if (["morning"].some((keyword) => normalized.includes(keyword))) return "breakfast";
  if (["noon"].some((keyword) => normalized.includes(keyword))) return "lunch";
  if (["night", "supper"].some((keyword) => normalized.includes(keyword))) return "dinner";
  return "breakfast";
}

function normalizePlanMealType(value) {
  const normalized = normalizeMealType(value);
  return ["breakfast", "lunch", "dinner"].includes(normalized) ? normalized : "breakfast";
}

function getTodayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatTitleFromId(value) {
  const normalized = String(value || "recipe")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return "Recipe";
  return normalized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatTime(value) {
  if (value === null || value === undefined || value === "") return "20 Mins";
  if (typeof value === "number" && Number.isFinite(value)) return `${value} Mins`;
  const text = String(value).trim();
  if (!text) return "20 Mins";
  if (/\d/.test(text) && /(min|hr|hour)/i.test(text)) return text;
  if (/^\d+$/.test(text)) return `${text} Mins`;
  return text;
}

function formatServings(value) {
  if (value === null || value === undefined || value === "") return "1 Serving";
  if (typeof value === "number" && Number.isFinite(value)) {
    return value === 1 ? "1 Serving" : `${value} Servings`;
  }
  const text = String(value).trim();
  if (!text) return "1 Serving";
  if (/(serv|bowl|plate|piece|pcs|cup|slice|roll|set)/i.test(text)) return text;
  return `${text} Serving`;
}

function resolveImage(title, seed = 0) {
  const normalized = normalize(title);
  const matched = IMAGE_RULES.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)));
  if (matched?.src) return matched.src;
  return IMAGE_ROTATION[Math.abs(seed) % IMAGE_ROTATION.length];
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

function resolveNutritionValue(primary, fallback) {
  const primaryValue = roundNonNegative(primary);
  if (primaryValue !== null) return primaryValue;
  const fallbackValue = roundNonNegative(fallback);
  if (fallbackValue !== null) return fallbackValue;
  return 0;
}

function positiveInt(value) {
  const parsed = toFiniteNumber(value);
  if (parsed === null) return null;
  const rounded = Math.round(parsed);
  return rounded > 0 ? rounded : null;
}

function inferPeopleFromServingsText(servingsText) {
  const text = String(servingsText || "").trim();
  if (!text) return null;
  const matched = text.match(/(\d+(?:\.\d+)?)/);
  if (!matched) return null;
  return positiveInt(Number(matched[1]));
}

function isLikelyTemplateInstruction(step) {
  const normalized = normalize(step);
  return (
    normalized.includes("prepare the ingredients for") ||
    normalized.includes("cook the base ingredients first") ||
    normalized.includes("add remaining components in sequence") ||
    normalized.includes("plate the dish and garnish")
  );
}

function inferDishArchetype(title, mealType = "lunch") {
  const normalizedTitle = normalize(title);
  const matchedRule = DISH_ARCHETYPE_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalizedTitle.includes(keyword)),
  );
  if (matchedRule?.key) return matchedRule.key;

  if (mealType === "breakfast") return "breakfast_plate";
  if (mealType === "dinner") return "grilled_plate";
  return "rice_bowl";
}

function inferCuisineTag(title) {
  const normalizedTitle = normalize(title);
  const matchedRule = CUISINE_TAG_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalizedTitle.includes(keyword)),
  );
  return matchedRule?.tag || null;
}

function getRecipeProfile(title, mealType = "lunch") {
  const archetype = inferDishArchetype(title, mealType);
  const baseProfile = ARCHETYPE_FALLBACK_PROFILES[archetype] || ARCHETYPE_FALLBACK_PROFILES.rice_bowl;
  const cuisineTag = inferCuisineTag(title);

  const tags = Array.isArray(baseProfile.tags) ? [...baseProfile.tags] : [];
  if (cuisineTag && !tags.includes(cuisineTag)) {
    tags.unshift(cuisineTag);
  }

  const noteBase =
    baseProfile?.portioning?.note ||
    "Suitable as a complete main meal with balanced macronutrients.";

  return {
    ...baseProfile,
    tags,
    portioning: {
      ...baseProfile.portioning,
      note: `${noteBase} Estimated for ${String(title || "this dish").trim()}.`,
    },
    ingredientItems: Array.isArray(baseProfile.ingredientItems)
      ? baseProfile.ingredientItems.map((item) => ({ ...item }))
      : [],
    instructions: Array.isArray(baseProfile.instructions)
      ? baseProfile.instructions.map((step) => String(step || "").replace(/\{dish\}/g, String(title || "the dish")))
      : [],
    allergens: Array.isArray(baseProfile.allergens)
      ? baseProfile.allergens.map((item) => ({ ...item }))
      : [],
  };
}

function parseIngredients(rawIngredients, title, mealType = "lunch") {
  const isGenericIngredientLabel = (value) => {
    const normalized = normalize(value);
    return [
      "fresh ingredients",
      "whole foods",
      "healthy protein",
      "lean protein",
      "natural seasoning",
      "herbs",
      "protein",
    ].includes(normalized);
  };

  if (Array.isArray(rawIngredients) && rawIngredients.length > 0) {
    const normalizedList = rawIngredients
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (!item || typeof item !== "object") return "";
        return String(
          item.ingredientCategory ||
            item.ingredient_name ||
            item.ingredient ||
            item.name ||
            item.label ||
            "",
        ).trim();
      })
      .filter(Boolean);

    if (normalizedList.length > 0) {
      const deduped = Array.from(new Set(normalizedList));
      const allGeneric = deduped.every((item) => isGenericIngredientLabel(item));
      if (!allGeneric) {
        return deduped.slice(0, 16);
      }
    }
  }

  if (typeof rawIngredients === "string" && rawIngredients.trim()) {
    const list = rawIngredients
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (list.length > 0) return Array.from(new Set(list)).slice(0, 8);
  }

  const profile = getRecipeProfile(title, mealType);
  if (Array.isArray(profile?.ingredientItems) && profile.ingredientItems.length > 0) {
    return profile.ingredientItems
      .map((item) => String(item?.name || "").trim())
      .filter(Boolean)
      .slice(0, 16);
  }

  const normalizedTitle = normalize(title);
  const matched = INGREDIENT_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalizedTitle.includes(keyword)),
  );
  return matched?.list || ["Fresh Produce", "Whole Foods", "Healthy Protein", "Natural Seasoning"];
}

function parseInstructions(rawInstructions, title, mealType = "lunch") {
  const normalizeStep = (step) =>
    String(step || "")
      .replace(/^\d+[\).\s-]*/, "")
      .trim();

  if (Array.isArray(rawInstructions) && rawInstructions.length > 0) {
    const steps = rawInstructions.map(normalizeStep).filter(Boolean);
    if (steps.length > 0) {
      const hasOnlyTemplateSteps = steps.every((step) => isLikelyTemplateInstruction(step));
      if (!hasOnlyTemplateSteps) return steps;
    }
  }

  if (typeof rawInstructions === "string" && rawInstructions.trim()) {
    const steps = rawInstructions
      .split(/\n|(?=\d+\.)/)
      .map(normalizeStep)
      .filter(Boolean);
    if (steps.length > 0) {
      const hasOnlyTemplateSteps = steps.every((step) => isLikelyTemplateInstruction(step));
      if (!hasOnlyTemplateSteps) return steps;
    }
  }

  const dishName = String(title || "the dish").trim();
  const normalizedTitle = normalize(title);
  const profile = getRecipeProfile(title, mealType);

  if (Array.isArray(profile?.instructions) && profile.instructions.length > 0) {
    return profile.instructions.slice(0, 12);
  }

  if (["ramen", "noodle", "pho", "udon"].some((keyword) => normalizedTitle.includes(keyword))) {
    return [
      "Bring low-sodium stock to a gentle simmer with garlic, ginger, and spring onion for 6-8 minutes.",
      "Cook noodles separately until just tender, then rinse quickly to stop overcooking.",
      "Season broth with soy sauce, a small amount of sesame oil, and white pepper.",
      "Add protein (tofu, chicken, or egg) and simmer until fully cooked through.",
      "Place noodles in a bowl, pour over hot broth, and top with greens, mushrooms, and herbs.",
      "Taste and adjust salt level before serving; add chili or lime at the table if desired.",
    ];
  }

  if (["salad", "bowl", "quinoa"].some((keyword) => normalizedTitle.includes(keyword))) {
    return [
      "Rinse grains and cook until tender, then spread on a tray to cool slightly.",
      "Prepare vegetables by slicing evenly so each bite has balanced texture.",
      "Whisk dressing with olive oil, citrus juice, and a pinch of salt and pepper.",
      "Combine grains, vegetables, and protein in a large bowl.",
      "Toss gently with dressing just before serving to keep greens crisp.",
      "Finish with herbs, seeds, and a final taste check for acidity and salt.",
    ];
  }

  if (["curry", "lentil", "masala"].some((keyword) => normalizedTitle.includes(keyword))) {
    return [
      "Saute onion, garlic, and ginger in a small amount of oil until aromatic.",
      "Add dry spices and toast for 30-60 seconds to bloom flavor.",
      "Stir in tomato base and simmer until slightly thickened.",
      "Add protein or lentils with stock, then cook until tender.",
      "Finish with coconut milk or yogurt if needed for texture, then adjust seasoning.",
      "Serve hot with whole grains and fresh herbs.",
    ];
  }

  return [
    `Prepare and measure all ingredients for ${dishName}.`,
    "Cook aromatics first to build flavor without burning.",
    "Add core ingredients in stages based on cooking time.",
    "Simmer until protein is fully cooked and vegetables are tender-crisp.",
    "Adjust seasoning gradually to control salt and acidity.",
    "Serve immediately and garnish with fresh herbs or citrus.",
  ];
}

function formatLevel(value) {
  const normalized = normalize(value);
  if (!normalized) return "Easy";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function createNutrition(mealType) {
  return NUTRITION_PRESETS[mealType] || NUTRITION_PRESETS.breakfast;
}

function createDescription(title, mealType) {
  return `${title} is a ${mealType} recipe designed to support your daily wellness with balanced nutrition.`;
}

function createRating(value) {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return Math.min(5, Math.max(1, Number(numeric.toFixed(1))));
  }
  return 4.5;
}

function parseNutrition(rawNutrition, mealType, title = "") {
  const source = rawNutrition && typeof rawNutrition === "object" ? rawNutrition : {};
  const base = createNutrition(mealType);
  const profile = getRecipeProfile(title, mealType);
  const profileNutrition = profile?.nutrition && typeof profile.nutrition === "object"
    ? profile.nutrition
    : {};

  return {
    calories: resolveNutritionValue(
      source.calories ?? source.calories_kcal ?? source.kcal ?? source.estimated_calories,
      profileNutrition.calories ?? base.calories,
    ),
    carbs: resolveNutritionValue(
      source.carbs ?? source.carbohydrates ?? source.carbs_g,
      profileNutrition.carbs ?? base.carbs,
    ),
    protein: resolveNutritionValue(source.protein ?? source.protein_g, profileNutrition.protein ?? base.protein),
    fat: resolveNutritionValue(source.fat ?? source.fat_g ?? source.total_fat, profileNutrition.fat ?? base.fat),
    fiber: resolveNutritionValue(
      source.fiber ?? source.fibre ?? source.fiber_g ?? source.fibre_g,
      profileNutrition.fiber ?? base.fiber,
    ),
    sodium: resolveNutritionValue(source.sodium ?? source.sodium_mg, profileNutrition.sodium ?? base.sodium),
    sugar: roundNonNegative(source.sugar ?? source.sugar_g ?? source.sugars ?? profileNutrition.sugar),
    potassium: roundNonNegative(source.potassium ?? source.potassium_mg ?? profileNutrition.potassium),
    calcium: roundNonNegative(source.calcium ?? source.calcium_mg ?? profileNutrition.calcium),
    iron: roundNonNegative(source.iron ?? source.iron_mg ?? profileNutrition.iron),
  };
}

function parseNutritionDetails(rawDetails, nutrition) {
  if (Array.isArray(rawDetails) && rawDetails.length > 0) {
    const normalized = rawDetails
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const label = String(item.label || item.name || "").trim();
        const value = toFiniteNumber(item.value);
        const unit = String(item.unit || "").trim();
        if (!label || value === null) return null;
        return { label, value: Number(Math.max(0, value).toFixed(1)), unit };
      })
      .filter(Boolean);

    if (normalized.length > 0) return normalized;
  }

  const fallback = [
    { label: "Calories", value: nutrition.calories, unit: "kcal" },
    { label: "Carbs", value: nutrition.carbs, unit: "g" },
    { label: "Protein", value: nutrition.protein, unit: "g" },
    { label: "Fat", value: nutrition.fat, unit: "g" },
    { label: "Fiber", value: nutrition.fiber, unit: "g" },
    { label: "Sodium", value: nutrition.sodium, unit: "mg" },
    { label: "Sugar", value: nutrition.sugar, unit: "g" },
    { label: "Potassium", value: nutrition.potassium, unit: "mg" },
    { label: "Calcium", value: nutrition.calcium, unit: "mg" },
    { label: "Iron", value: nutrition.iron, unit: "mg" },
  ];

  return fallback.filter((item) => item.value !== null && item.value !== undefined);
}

function parsePortioning(rawPortioning, servingsText, title = "", mealType = "lunch") {
  const source = rawPortioning && typeof rawPortioning === "object" ? rawPortioning : {};
  const profile = getRecipeProfile(title, mealType);
  const profilePortioning = profile?.portioning && typeof profile.portioning === "object"
    ? profile.portioning
    : {};
  const normalizedServings = formatServings(servingsText);
  const inferredPeople = inferPeopleFromServingsText(normalizedServings);

  const people =
    positiveInt(source.people ?? source.serves ?? source.servings_people) ??
    positiveInt(profilePortioning.people) ??
    inferredPeople ??
    1;
  const mealPortions =
    positiveInt(source.mealPortions ?? source.meal_portions ?? source.meals ?? source.portions) ??
    positiveInt(profilePortioning.mealPortions ?? profilePortioning.meal_portions) ??
    people;
  const servingSize =
    String(source.servingSize || source.serving_size || source.serving || "").trim() ||
    String(profilePortioning.servingSize || profilePortioning.serving_size || "").trim() ||
    normalizedServings;
  const note =
    String(source.note || source.description || "").trim() ||
    String(profilePortioning.note || profilePortioning.description || "").trim() ||
    `Suitable for ${people} people, around ${mealPortions} meal portion${mealPortions > 1 ? "s" : ""}.`;

  return {
    people,
    mealPortions,
    servingSize,
    note,
  };
}

function parseIngredientItems(rawIngredients, title, mealType = "lunch") {
  const isGenericIngredientLabel = (value) => {
    const normalized = normalize(value);
    return [
      "fresh ingredients",
      "whole foods",
      "healthy protein",
      "lean protein",
      "natural seasoning",
      "herbs",
      "protein",
    ].includes(normalized);
  };

  const fromObjects = Array.isArray(rawIngredients)
    ? rawIngredients
        .map((item) => {
          if (!item) return null;
          if (typeof item === "string") {
            const name = item.trim();
            if (!name) return null;
            return { name, quantity: "1 serving", cost: null, note: null };
          }
          if (typeof item !== "object") return null;

          const name = String(
            item.name ||
              item.ingredient_name ||
              item.ingredient ||
              item.label ||
              item.ingredientCategory ||
              "",
          ).trim();
          if (!name) return null;

          const quantity = String(
            item.quantity ||
              item.amount ||
              item.portion ||
              item.serving ||
              item.unit ||
              "1 serving",
          ).trim();
          const costRaw = toFiniteNumber(item.estimated_cost_aud ?? item.cost_aud ?? item.cost);

          return {
            name,
            quantity: quantity || "1 serving",
            cost: costRaw === null ? null : Number(Math.max(0, costRaw).toFixed(2)),
            note: String(item.note || item.preparation_note || "").trim() || null,
          };
        })
        .filter(Boolean)
    : [];

  if (fromObjects.length > 0) {
    const allGeneric = fromObjects.every((item) => isGenericIngredientLabel(item.name));
    if (!allGeneric) {
      return fromObjects.slice(0, 16);
    }
  }

  const profile = getRecipeProfile(title, mealType);
  if (Array.isArray(profile?.ingredientItems) && profile.ingredientItems.length > 0) {
    return profile.ingredientItems
      .map((item) => ({
        name: String(item?.name || "").trim(),
        quantity: String(item?.quantity || item?.amount || "1 portion").trim() || "1 portion",
        cost: toFiniteNumber(item?.cost) === null
          ? null
          : Number(Math.max(0, Number(item.cost)).toFixed(2)),
        note: String(item?.note || "").trim() || null,
      }))
      .filter((item) => item.name)
      .slice(0, 16);
  }

  return parseIngredients(rawIngredients, title, mealType).map((name) => {
    const normalizedName = normalize(name);
    const matchedRule = INGREDIENT_COST_RULES.find((rule) =>
      rule.keywords.some((keyword) => normalizedName.includes(keyword)),
    );

    return {
      name,
      quantity: matchedRule?.quantity || "1 portion",
      cost: matchedRule?.cost ?? null,
      note: null,
    };
  });
}

function parseAllergens(rawAllergens, title = "", mealType = "lunch") {
  if (!Array.isArray(rawAllergens) || rawAllergens.length === 0) {
    const profile = getRecipeProfile(title, mealType);
    if (Array.isArray(profile?.allergens) && profile.allergens.length > 0) {
      return profile.allergens
        .map((item) => ({
          label: String(item?.label || "").trim(),
          detail: String(item?.detail || "").trim(),
        }))
        .filter((item) => item.label)
        .slice(0, 10);
    }
    return [];
  }

  return rawAllergens
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") {
        const label = item.trim();
        if (!label) return null;
        return {
          label,
          detail: "May be present depending on ingredient brands and preparation.",
        };
      }
      if (typeof item !== "object") return null;

      const label = String(item.label || item.name || item.allergen || "").trim();
      if (!label) return null;
      const detail = String(item.detail || item.description || item.warning || "").trim();
      return {
        label,
        detail: detail || "May be present depending on ingredient brands and preparation.",
      };
    })
    .filter(Boolean)
    .slice(0, 10);
}

function shouldEnhanceWithAI(recipe) {
  const instructionCount = Array.isArray(recipe.instructions) ? recipe.instructions.length : 0;
  const ingredientCount = Array.isArray(recipe.ingredientItems) ? recipe.ingredientItems.length : 0;
  const hasTemplateInstructions =
    instructionCount > 0 && recipe.instructions.every((step) => isLikelyTemplateInstruction(step));
  const missingMicros =
    recipe.nutrition.sugar === null ||
    recipe.nutrition.potassium === null ||
    recipe.nutrition.calcium === null ||
    recipe.nutrition.iron === null;
  const cameFromScan = normalize(recipe.time) === "ai scan" || normalize(recipe.level) === "ready";
  const missingPortioning =
    !recipe.portioning ||
    !positiveInt(recipe.portioning.people) ||
    !positiveInt(recipe.portioning.mealPortions);

  if (cameFromScan) return true;
  if (hasTemplateInstructions) return true;
  if (instructionCount < 5) return true;
  if (ingredientCount < 6) return true;
  if (missingPortioning) return true;
  if (missingMicros) return true;
  return false;
}

function isDetailedAIRecipe(aiData) {
  const genericIngredientLabels = new Set([
    "fresh ingredients",
    "whole foods",
    "healthy protein",
    "lean protein",
    "natural seasoning",
    "herbs",
    "protein",
  ]);
  const ingredientItems = Array.isArray(aiData?.ingredientItems) ? aiData.ingredientItems : [];
  const ingredientNames = ingredientItems
    .map((item) => normalize(item?.name))
    .filter(Boolean);
  const nonGenericIngredientCount = ingredientNames.filter(
    (name) => !genericIngredientLabels.has(name),
  ).length;

  const instructions = Array.isArray(aiData?.instructions)
    ? aiData.instructions.map((step) => String(step || "").trim()).filter(Boolean)
    : [];
  const hasTemplateOnly = instructions.length > 0 && instructions.every((step) => isLikelyTemplateInstruction(step));

  return nonGenericIngredientCount >= 6 && instructions.length >= 6 && !hasTemplateOnly;
}

function createRecipeCacheKey(recipe) {
  const title = normalize(recipe.title);
  const mealType = normalize(recipe.mealType);
  const calories = recipe.nutrition?.calories ?? "";
  return `${title}|${mealType}|${calories}`;
}

function readAIRecipeCache() {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(AI_RECIPE_CACHE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAIRecipeCache(nextValue) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(AI_RECIPE_CACHE_STORAGE_KEY, JSON.stringify(nextValue));
  } catch {
    // Ignore cache write issues.
  }
}

function mergeRecipeWithAI(baseRecipe, aiData) {
  if (!aiData || typeof aiData !== "object") return baseRecipe;

  const mergedNutrition = parseNutrition(
    {
      ...baseRecipe.nutrition,
      ...aiData.nutrition,
    },
    baseRecipe.mealType,
    aiData.title || baseRecipe.title,
  );

  const ingredientItems =
    Array.isArray(aiData.ingredientItems) && aiData.ingredientItems.length > 0
      ? aiData.ingredientItems
      : baseRecipe.ingredientItems;
  const ingredients = ingredientItems.map((item) => item.name).filter(Boolean);

  const nutritionDetails = parseNutritionDetails(aiData.nutritionDetails, mergedNutrition);

  const mergedAllergens =
    Array.isArray(aiData.allergens) && aiData.allergens.length > 0
      ? aiData.allergens
      : baseRecipe.allergens;
  const hasAIPortioning =
    aiData.portioning &&
    typeof aiData.portioning === "object" &&
    Object.keys(aiData.portioning).length > 0;
  const mergedServings = aiData.servings || baseRecipe.servings;
  const mergedPortioning = parsePortioning(
    hasAIPortioning ? aiData.portioning : baseRecipe.portioning,
    mergedServings,
    aiData.title || baseRecipe.title,
    baseRecipe.mealType,
  );

  return {
    ...baseRecipe,
    title: aiData.title || baseRecipe.title,
    description: aiData.description || baseRecipe.description,
    time: aiData.time || baseRecipe.time,
    servings: mergedServings,
    portioning: mergedPortioning,
    level: aiData.level || baseRecipe.level,
    nutrition: mergedNutrition,
    nutritionDetails,
    ingredientItems,
    ingredients: ingredients.length > 0 ? ingredients : baseRecipe.ingredients,
    instructions:
      Array.isArray(aiData.instructions) && aiData.instructions.length > 0
        ? aiData.instructions
        : baseRecipe.instructions,
    allergens: mergedAllergens,
    tags:
      Array.isArray(aiData.tags) && aiData.tags.length > 0
        ? aiData.tags
        : baseRecipe.tags,
    aiEnhanced: true,
  };
}

function readStoredSelections() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(MEAL_SELECTIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredSelections(nextValue) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MEAL_SELECTIONS_STORAGE_KEY, JSON.stringify(nextValue));
    window.dispatchEvent(new Event("storage"));
  } catch {
    // Ignore storage write issues for this optional UX feature.
  }
}

function removeDuplicateMealSelections(selectionMap, incomingMeal) {
  if (!selectionMap || typeof selectionMap !== "object") return {};

  const incomingTitleKey = normalize(incomingMeal?.title || incomingMeal?.name);
  const incomingMealType = normalizePlanMealType(incomingMeal?.mealType);
  const incomingLogEntryKey = normalize(incomingMeal?.logEntryId);
  const incomingIdKey = normalize(incomingMeal?.id);

  return Object.fromEntries(
    Object.entries(selectionMap).filter(([entryKey, existingMeal]) => {
      if (!existingMeal || typeof existingMeal !== "object") return true;

      const existingTitleKey = normalize(existingMeal?.title || existingMeal?.name);
      const existingMealType = normalizePlanMealType(existingMeal?.mealType);
      const existingLogEntryKey = normalize(existingMeal?.logEntryId);
      const existingIdKey = normalize(existingMeal?.id || entryKey);
      const sameMealType = existingMealType === incomingMealType;
      const sameTitle = incomingTitleKey && existingTitleKey === incomingTitleKey;
      const sameLogEntry = incomingLogEntryKey && existingLogEntryKey === incomingLogEntryKey;
      const sameId = incomingIdKey && existingIdKey === incomingIdKey;

      return !(sameMealType && (sameTitle || sameLogEntry || sameId));
    })
  );
}

function doesIdMatch(item, routeId) {
  const candidateIds = [item?.id, item?.recipeId, item?.recipe_id]
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value));
  return candidateIds.includes(String(routeId));
}

function buildRecipeData(source, routeId) {
  const title =
    source?.title ||
    source?.recipe_name ||
    source?.name ||
    formatTitleFromId(routeId);
  const mealType = normalizeMealType(source?.mealType || source?.meal_type || "breakfast");
  const time = formatTime(source?.time || source?.preparation_time);
  const servings = formatServings(source?.servings || source?.total_servings);
  const portioning = parsePortioning(
    source?.portioning || source?.portioning_info || null,
    servings,
    title,
    mealType,
  );
  const level = formatLevel(source?.level || source?.difficulty || "Easy");
  const nutrition = parseNutrition(source?.nutrition, mealType, title);
  const ingredientItems = parseIngredientItems(source?.ingredients, title, mealType);
  const ingredients = ingredientItems.map((item) => item.name).filter(Boolean);
  const allergens = parseAllergens(source?.allergens, title, mealType);
  const nutritionDetails = parseNutritionDetails(source?.nutrition_details, nutrition);
  const profile = getRecipeProfile(title, mealType);
  const fallbackTags = Array.isArray(profile?.tags) && profile.tags.length > 0
    ? profile.tags
    : TAGS_BY_TYPE[mealType];

  const numericSeed = Number.parseInt(String(routeId).replace(/\D/g, ""), 10);
  const image = source?.image || resolveImage(title, Number.isNaN(numericSeed) ? 1 : numericSeed);

  return {
    id: source?.id || routeId || `recipe-${Date.now()}`,
    recipeId: source?.recipeId || source?.recipe_id || source?.id || routeId || null,
    title,
    image,
    mealType,
    time,
    servings,
    portioning,
    level,
    rating: createRating(source?.rating),
    tags: Array.isArray(source?.tags) && source.tags.length > 0 ? source.tags : fallbackTags,
    description: source?.description || createDescription(title, mealType),
    nutrition,
    nutritionDetails,
    ingredientItems,
    ingredients: ingredients.length > 0 ? ingredients : parseIngredients(source?.ingredients, title, mealType),
    instructions: parseInstructions(source?.instructions, title, mealType),
    allergens,
    aiEnhanced: Boolean(source?.aiEnhanced),
  };
}

function toSelectedMealPayload(recipe, selectedMealType) {
  const mealType = normalizePlanMealType(selectedMealType);
  const recipeIdKey = normalize(recipe.recipeId);
  const titleKey = normalize(recipe.title || recipe.name);
  const idKey = normalize(recipe.id);
  const identityKey =
    (titleKey && `title:${titleKey}`) ||
    (recipeIdKey && recipeIdKey !== "null" && `recipe:${recipeIdKey}`) ||
    (idKey && `id:${idKey}`) ||
    `legacy:${Date.now()}`;
  const selectedId = `slot:${identityKey}|${mealType}`;

  return {
    id: selectedId,
    name: recipe.title,
    recipeId: recipe.recipeId || recipe.id || null,
    logEntryId: recipe.logEntryId || null,
    title: recipe.title,
    image: recipe.image,
    time: recipe.time,
    servings: recipe.servings,
    level: recipe.level,
    mealType,
    tags: recipe.tags,
    description: recipe.description,
    portioning: recipe.portioning,
    nutrition: recipe.nutrition,
    nutrition_details: recipe.nutritionDetails,
    ingredients: recipe.ingredients,
    ingredientItems: recipe.ingredientItems,
    instructions: recipe.instructions,
    allergens: recipe.allergens,
  };
}

function buildIngredientCostItems(recipe) {
  const fallbackCost = (name) => {
    const hash = Array.from(String(name || ""))
      .reduce((total, char) => total + char.charCodeAt(0), 0);
    return 0.35 + (hash % 120) / 100;
  };

  const sourceItems =
    Array.isArray(recipe?.ingredientItems) && recipe.ingredientItems.length > 0
      ? recipe.ingredientItems
      : (recipe?.ingredients || []).map((name) => ({
          name,
          quantity: "1 serving",
          cost: null,
        }));

  return sourceItems.slice(0, 16).map((item, index) => {
    const name = String(item?.name || "").trim();
    if (!name) return null;
    const normalizedName = normalize(name);
    const matchedRule = INGREDIENT_COST_RULES.find((rule) =>
      rule.keywords.some((keyword) => normalizedName.includes(keyword)),
    );

    const quantity = String(item?.quantity || matchedRule?.quantity || "1 portion").trim();
    const itemCost = toFiniteNumber(item?.cost);
    const cost = itemCost === null ? matchedRule?.cost || fallbackCost(`${name}-${index}`) : itemCost;

    return {
      name,
      quantity: quantity || "1 portion",
      cost: Number(cost.toFixed(2)),
      note: item?.note || null,
    };
  }).filter(Boolean);
}

function buildAllergenWarnings(recipe) {
  if (Array.isArray(recipe.allergens) && recipe.allergens.length > 0) {
    return recipe.allergens
      .map((item) => ({
        label: String(item.label || "").trim(),
        detail: String(item.detail || "").trim(),
      }))
      .filter((item) => item.label)
      .map((item) => ({
        label: item.label,
        detail:
          item.detail || "May be present depending on ingredient brands and kitchen handling.",
      }));
  }

  const source = normalize(`${recipe.title} ${recipe.ingredients.join(" ")}`);

  const matched = ALLERGEN_WARNING_RULES.filter((rule) =>
    rule.keywords.some((keyword) => source.includes(keyword)),
  ).map((rule) => ({
    label: rule.label,
    detail: rule.detail,
  }));

  if (matched.length > 0) {
    return matched.filter((item, index, array) =>
      array.findIndex((nextItem) => nextItem.label === item.label) === index,
    );
  }

  return [
    {
      label: "General Notice",
      detail: "Please verify ingredient labels if you have food allergies or dietary restrictions.",
    },
  ];
}

function formatCost(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

const MealRecipeDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: rawId } = useParams();

  const routeId = useMemo(() => decodeURIComponent(String(rawId || "recipe")), [rawId]);
  const todayIso = useMemo(() => getTodayISO(), []);
  const stateMeal = useMemo(() => location.state?.meal || location.state?.recipe || null, [location.state]);

  const [recipe, setRecipe] = useState(() => buildRecipeData(stateMeal, routeId));
  const [isLoading, setIsLoading] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedMealType, setSelectedMealType] = useState(() =>
    normalizePlanMealType(stateMeal?.mealType || stateMeal?.meal_type || "breakfast"),
  );

  useEffect(() => {
    let isMounted = true;

    const enhanceRecipeWithAI = async (baseRecipe) => {
      if (!shouldEnhanceWithAI(baseRecipe)) return;

      const cacheKey = createRecipeCacheKey(baseRecipe);
      const cache = readAIRecipeCache();
      const cachedAIResult = cache[cacheKey];

      if (cachedAIResult && typeof cachedAIResult === "object" && isDetailedAIRecipe(cachedAIResult)) {
        const mergedFromCache = mergeRecipeWithAI(baseRecipe, cachedAIResult);
        if (!isMounted) return;
        setRecipe(mergedFromCache);
        return;
      }

      setIsEnhancing(true);
      try {
        const aiResult = await generateDetailedRecipe({
          title: baseRecipe.title,
          mealType: baseRecipe.mealType,
          description: baseRecipe.description,
          servings: baseRecipe.servings,
          portioning: baseRecipe.portioning,
          time: baseRecipe.time,
          ingredients: baseRecipe.ingredients,
          nutrition: baseRecipe.nutrition,
        });

        if (!isMounted) return;

        const shouldUseAIResult = isDetailedAIRecipe(aiResult);
        const mergedRecipe = shouldUseAIResult
          ? mergeRecipeWithAI(baseRecipe, aiResult)
          : baseRecipe;
        setRecipe(mergedRecipe);
        setSelectedMealType(normalizePlanMealType(mergedRecipe.mealType));

        if (shouldUseAIResult) {
          writeAIRecipeCache({
            ...cache,
            [cacheKey]: aiResult,
          });
        }

        try {
          sessionStorage.setItem(
            "selectedMealDetail",
            JSON.stringify(toSelectedMealPayload(mergedRecipe, normalizePlanMealType(mergedRecipe.mealType))),
          );
        } catch {
          // Ignore storage write issues.
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          // Keep this log in dev only. UI already has a valid fallback recipe.
          console.error("AI recipe enrichment failed:", error);
        }
      } finally {
        if (isMounted) {
          setIsEnhancing(false);
        }
      }
    };

    const loadRecipe = async () => {
      setIsLoading(true);
      setIsEnhancing(false);

      let resolved = stateMeal ? buildRecipeData(stateMeal, routeId) : null;

      if (!resolved) {
        try {
          const raw = sessionStorage.getItem("selectedMealDetail");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (doesIdMatch(parsed, routeId)) {
              resolved = buildRecipeData(parsed, routeId);
            }
          }
        } catch {
          // Ignore invalid session data.
        }
      }

      if (!resolved) {
        try {
          const idbRecipes = await getRecipes();
          const matched = Array.isArray(idbRecipes)
            ? idbRecipes.find((item) => doesIdMatch(item, routeId))
            : null;
          if (matched) {
            resolved = buildRecipeData(matched, routeId);
          }
        } catch {
          // Ignore IndexedDB issues and keep fallback strategy.
        }
      }

      if (!resolved) {
        try {
          const apiRecipes = await recipeApi.getRecepie();
          const matched = Array.isArray(apiRecipes)
            ? apiRecipes.find((item) => doesIdMatch(item, routeId))
            : null;
          if (matched) {
            resolved = buildRecipeData(matched, routeId);
          }
        } catch {
          // Ignore API failures and keep fallback recipe.
        }
      }

      if (!resolved) {
        resolved = buildRecipeData({ id: routeId }, routeId);
      }

      if (!isMounted) return;

      setRecipe(resolved);
      setSelectedMealType(normalizePlanMealType(resolved.mealType));
      setIsLoading(false);
      void enhanceRecipeWithAI(resolved);
    };

    loadRecipe();

    return () => {
      isMounted = false;
    };
  }, [routeId, stateMeal]);

  const ingredientCostItems = useMemo(
    () => buildIngredientCostItems(recipe),
    [recipe],
  );

  const estimatedTotalCost = useMemo(
    () => ingredientCostItems.reduce((total, item) => total + item.cost, 0),
    [ingredientCostItems],
  );

  const allergenWarnings = useMemo(() => buildAllergenWarnings(recipe), [recipe]);
  const nutritionDetails = useMemo(
    () => parseNutritionDetails(recipe.nutritionDetails, recipe.nutrition),
    [recipe.nutritionDetails, recipe.nutrition],
  );

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = DEFAULT_IMAGE;
  };

  const handleAddToMealPlan = () => {
    if (!selectedDate || selectedDate < todayIso) {
      toast.error("Please choose a valid date from today onward.");
      return;
    }

    const nextSelectionByDate = readStoredSelections();
    const currentDateSelections = nextSelectionByDate[selectedDate] || {};
    const payload = toSelectedMealPayload(recipe, selectedMealType);
    const dedupedDateSelections = removeDuplicateMealSelections(currentDateSelections, payload);

    nextSelectionByDate[selectedDate] = {
      ...dedupedDateSelections,
      [payload.id]: payload,
    };

    writeStoredSelections(nextSelectionByDate);

    try {
      sessionStorage.setItem("selectedMealDetail", JSON.stringify(payload));
    } catch {
      // Ignore storage write issues and keep the success path.
    }

    toast.success(
      `Added ${recipe.title} to ${formatMealTypeLabel(selectedMealType)} on ${selectedDate}.`,
    );
    setIsPlannerOpen(false);
  };

  const handleToggleFavourite = () => {
    setIsFavourite((previous) => {
      const next = !previous;
      toast.info(next ? `${recipe.title} added to favourites.` : `${recipe.title} removed from favourites.`);
      return next;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: recipe.title,
      text: `Check this recipe: ${recipe.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard below.
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Recipe link copied to clipboard.");
    } catch {
      toast.info("Sharing is not available on this browser.");
    }
  };

  const handleEdit = () => {
    toast.info("Edit recipe feature is coming soon.");
  };

  const handleDelete = () => {
    toast.info("Delete recipe feature is coming soon.");
  };

  const handleShopIngredients = () => {
    const payload = toSelectedMealPayload(recipe, selectedMealType);
    navigate("/shopping-list", {
      state: {
        selectedItems: [payload],
        totalNutrition: {
          calories: recipe.nutrition.calories,
          proteins: recipe.nutrition.protein,
          fats: recipe.nutrition.fat,
          vitamins: recipe.nutrition.fiber,
          sodium: recipe.nutrition.sodium,
        },
      },
    });
  };

  return (
    <div className="meal-recipe-page">
      <div className="meal-recipe-shell">
        <div className="meal-recipe-breadcrumb" aria-label="breadcrumb">
          <button type="button" className="meal-recipe-back" onClick={() => navigate(-1)}>
            <ChevronLeft size={14} />
            Back
          </button>
          <span>/</span>
          <span className="meal-recipe-muted">Recipes</span>
          <span>/</span>
          <span className="meal-recipe-current">{recipe.title}</span>
        </div>

        <section className="meal-recipe-hero">
          <img src={recipe.image} alt={recipe.title} loading="lazy" onError={handleImageError} />
          <div className="meal-recipe-hero-scrim" aria-hidden="true" />
          <div className="meal-recipe-hero-panel">
            <h1>{recipe.title}</h1>
            <div className="meal-recipe-meta-row">
              <span className="recipe-rating">
                <Star size={16} fill="currentColor" />
                {recipe.rating.toFixed(1)}
              </span>
              <span>
                <Clock3 size={16} />
                {recipe.time}
              </span>
              <span>
                <Users size={16} />
                {`Serves ${recipe.portioning.people} · ${recipe.portioning.mealPortions} meal${
                  recipe.portioning.mealPortions > 1 ? "s" : ""
                }`}
              </span>
              <span>
                <BarChart3 size={16} />
                {recipe.level}
              </span>
            </div>
          </div>
        </section>

        <section className="meal-recipe-actions-row">
          <div className="meal-recipe-actions-left">
            <div className="meal-recipe-plan-wrap">
              <button
                type="button"
                className="meal-recipe-pill-btn"
                onClick={() => setIsPlannerOpen((previous) => !previous)}
              >
                Add to Meal Plan
                <CalendarDays size={16} />
              </button>

              {isPlannerOpen ? (
                <div className="meal-recipe-planner-panel">
                  <label htmlFor="recipe-plan-date">Select date</label>
                  <div className="meal-recipe-date-input-wrap">
                    <CalendarDays size={16} />
                    <input
                      id="recipe-plan-date"
                      type="date"
                      min={todayIso}
                      value={selectedDate}
                      onChange={(event) => setSelectedDate(event.target.value)}
                    />
                  </div>

                  <div className="meal-recipe-slot-grid" role="tablist" aria-label="Meal slot selection">
                    {MEAL_SLOT_OPTIONS.map((slot) => {
                      const Icon = slot.icon;
                      const isActive = selectedMealType === slot.key;
                      return (
                        <button
                          key={slot.key}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          className={`meal-recipe-slot-btn ${slot.iconClass} ${isActive ? "active" : ""}`}
                          onClick={() => setSelectedMealType(slot.key)}
                        >
                          <Icon size={15} />
                          <span>{slot.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="meal-recipe-plan-actions">
                    <button type="button" className="confirm" onClick={handleAddToMealPlan}>
                      Confirm
                    </button>
                    <button type="button" className="close" onClick={() => setIsPlannerOpen(false)}>
                      Close
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className={`meal-recipe-pill-btn ${isFavourite ? "is-favourite" : ""}`}
              onClick={handleToggleFavourite}
            >
              Add to Favourites
              <Heart size={16} fill={isFavourite ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="meal-recipe-actions-right">
            <button type="button" className="meal-recipe-pill-btn small" onClick={handlePrint}>
              Print PDF
              <Printer size={16} />
            </button>
            <button type="button" className="meal-recipe-pill-btn small" onClick={handleShare}>
              Share
              <Share2 size={16} />
            </button>
            <button type="button" className="meal-recipe-pill-btn small" onClick={handleEdit}>
              Edit
              <Pencil size={16} />
            </button>
            <button type="button" className="meal-recipe-pill-btn small danger" onClick={handleDelete}>
              Delete
              <Trash2 size={16} />
            </button>
          </div>
        </section>

        <section className="meal-recipe-main-grid">
          <article className="meal-recipe-card meal-recipe-cost-card">
            <h2>Ingredients & Estimated Cost</h2>
            <p className="meal-recipe-ai-note">
              {recipe.aiEnhanced ? "(AI-Generated • Detailed)" : "(AI-Generated)"}
            </p>

            <ul className="meal-recipe-cost-list">
              {ingredientCostItems.map((item) => (
                <li key={`${item.name}-${item.quantity}`}>
                  <span className="item-name-wrap">
                    <span className="item-dot" aria-hidden="true" />
                    <span className="item-name">{item.name}</span>
                    <span className="item-qty">({item.quantity})</span>
                  </span>
                  <strong>{formatCost(item.cost)}</strong>
                </li>
              ))}
            </ul>

            <div className="meal-recipe-total-row">
              <span>Estimated Total Cost</span>
              <strong>{formatCost(estimatedTotalCost)} AUD</strong>
            </div>

            <button type="button" className="meal-recipe-shop-btn" onClick={handleShopIngredients}>
              <ShoppingCart size={17} />
              Shop Ingredients
            </button>
          </article>

          <article className="meal-recipe-card meal-recipe-instruction-card">
            <h2>Instructions</h2>
            <ol className="meal-recipe-instruction-list">
              {recipe.instructions.map((step, index) => (
                <li key={`${step}-${index}`}>
                  <span className="step-badge">{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </article>
        </section>

        <section className="meal-recipe-card meal-recipe-nutrition-card">
          <h2>{`Nutrition Profile (Per ${recipe.portioning.servingSize})`}</h2>
          <div className="meal-recipe-nutrition-grid">
            {nutritionDetails.map((item) => (
              <div key={`${item.label}-${item.unit}`}>
                <span>{item.label}</span>
                <strong>
                  {item.value}
                  {item.unit ? ` ${item.unit}` : ""}
                </strong>
              </div>
            ))}
          </div>
        </section>

        <section className="meal-recipe-card meal-recipe-portion-card">
          <h2>Portion & Meal Coverage</h2>
          <div className="meal-recipe-portion-grid">
            <div>
              <span>People Served</span>
              <strong>{recipe.portioning.people}</strong>
            </div>
            <div>
              <span>Meal Portions</span>
              <strong>{recipe.portioning.mealPortions}</strong>
            </div>
            <div>
              <span>Serving Size</span>
              <strong>{recipe.portioning.servingSize}</strong>
            </div>
          </div>
          <p className="meal-recipe-portion-note">{recipe.portioning.note}</p>
        </section>

        <section className="meal-recipe-allergy-card">
          <h2>
            <AlertTriangle size={22} />
            Allergy & Dietary Warnings
          </h2>
          <p className="allergy-highlight">Contains Possible Allergens</p>
          <p className="allergy-description">
            This recipe may include ingredients that can trigger allergies. Please review before consuming.
          </p>

          <ul className="meal-recipe-allergy-list">
            {allergenWarnings.map((item) => (
              <li key={item.label}>
                <span className="allergy-dot" aria-hidden="true" />
                <div>
                  <strong>{item.label}</strong>
                  <span> — {item.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {isLoading ? <p className="meal-recipe-loading">Loading recipe details...</p> : null}
        {isEnhancing ? <p className="meal-recipe-loading">Enhancing with AI for a more realistic recipe...</p> : null}
      </div>
    </div>
  );
};

export default MealRecipeDetail;
