import "./Meal.css";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  BarChart3,
  Check,
  Calculator,
  CalendarDays,
  ChevronLeft,
  Clock3,
  Search,
  Settings2,
  ShoppingCart,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PersonalizedPlanForm from "./PersonalizedPlanForm";
import PersonalizedWeeklyPlan from "./PersonalizedWeeklyPlan";

const FILTERS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "others", label: "Others" },
  { key: "all", label: "All" },
  { key: "selected", label: "Selected" },
];

const SELECTED_VIEW_SECTIONS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "others", label: "Snack" },
];

const MEAL_SELECTIONS_STORAGE_KEY = "nutrihelp_add_meal_selections_by_date_v1";
const DEFAULT_FLOATING_BOTTOM = 18;
const FLOATING_STACK_GAP = 12;
const DEFAULT_WIDGET_BOTTOM = DEFAULT_FLOATING_BOTTOM + 48 + FLOATING_STACK_GAP;
const RECOMMENDED_SCROLLBAR_INSET = 2;
const RECOMMENDED_SCROLLBAR_MIN_THUMB = 56;

function getTodayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function readSelectionsByDateFromStorage() {
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

function shiftISODate(isoDate, days) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function getMealGridColumns() {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth <= 900) return 1;
  if (window.innerWidth <= 1360) return 2;
  return 3;
}

const IMAGE_FALLBACK_SRC = "/images/meal-mock/placeholder.svg";

const IMAGE_RULES = [
  { keywords: ["oatmeal", "oat"], src: "/images/meal-mock/oatmeal-bowl.jpg" },
  { keywords: ["yogurt", "parfait", "chia"], src: "/images/symptom_assessment/chia_seeds_yogurt.jpg" },
  { keywords: ["quinoa", "buddha"], src: "/images/meal-mock/quinoa.jpg" },
  { keywords: ["teriyaki", "chicken", "turkey", "wrap"], src: "/images/meal-mock/chicken.jpg" },
  { keywords: ["lentil"], src: "/images/symptom_assessment/lentil_soup.jpg" },
  { keywords: ["curry", "masala"], src: "/images/meal-mock/indian.jpg" },
  { keywords: ["salmon"], src: "/images/symptom_assessment/grilled_salmon.jpg" },
  { keywords: ["tuna", "salad", "nicoise"], src: "/images/meal-mock/salad.jpg" },
  { keywords: ["avocado", "toast", "bagel", "sandwich"], src: "/images/meal-mock/avocado.jpg" },
  { keywords: ["egg", "omelette"], src: "/images/meal-mock/omelette.jpg" },
  { keywords: ["smoothie", "juice"], src: "/images/meal-mock/smoothie.jpg" },
  { keywords: ["pancake"], src: "/images/meal-mock/dessert.jpg" },
  { keywords: ["shrimp", "pad thai"], src: "/images/meal-mock/thai.jpg" },
  { keywords: ["steak", "meat"], src: "/images/meal-mock/meat.jpg" },
  { keywords: ["ramen", "pasta"], src: "/images/meal-mock/italian.jpg" },
  { keywords: ["hummus", "veggie", "vegetable"], src: "/images/meal-mock/vegetables.jpg" },
  { keywords: ["fruit", "mango", "pineapple", "banana"], src: "/images/symptom_assessment/hydrating_fruits.jpg" },
  { keywords: ["nuts"], src: "/images/symptom_assessment/nuts_seeds.jpg" },
  { keywords: ["chocolate"], src: "/images/symptom_assessment/dark_chocolate.jpg" },
];

const IMAGE_ROTATION = [
  "/images/meal-mock/oatmeal.jpg",
  "/images/meal-mock/salad.jpg",
  "/images/meal-mock/salmon.jpg",
  "/images/meal-mock/vegetables.jpg",
  "/images/meal-mock/quinoa.jpg",
  "/images/meal-mock/rice.jpg",
  "/images/meal-mock/chicken.jpg",
  "/images/meal-mock/avocado.jpg",
];

const foodImage = (query, seed = 0) => {
  const normalized = String(query || "").toLowerCase();
  const matchedRule = IMAGE_RULES.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword)),
  );

  if (matchedRule?.src) {
    return matchedRule.src;
  }

  return IMAGE_ROTATION[Math.abs(seed) % IMAGE_ROTATION.length];
};

const handleMealImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = IMAGE_FALLBACK_SRC;
};

const recommendedMeals = [
  {
    id: "rec-1",
    title: "Oatmeal with Blueberries",
    image: foodImage("oatmeal blueberries breakfast bowl", 101),
    time: "8 mins",
    servings: "1 Serving",
    level: "Easy",
    tags: ["High Fiber", "Heart-Healthy"],
    mealType: "breakfast",
  },
  {
    id: "rec-2",
    title: "Greek Yogurt Parfait",
    image: foodImage("greek yogurt parfait berries granola", 102),
    time: "7 mins",
    servings: "1 Serving",
    level: "Easy",
    tags: ["Protein", "Gut-Friendly"],
    mealType: "breakfast",
  },
  {
    id: "rec-3",
    title: "Quinoa Salmon Bowl",
    image: foodImage("quinoa salmon bowl healthy", 103),
    time: "22 mins",
    servings: "2 Servings",
    level: "Easy",
    tags: ["Omega-3", "High Protein"],
    mealType: "lunch",
  },
  {
    id: "rec-4",
    title: "Chicken Teriyaki Rice Bowl",
    image: foodImage("chicken teriyaki rice bowl", 104),
    time: "25 mins",
    servings: "2 Servings",
    level: "Medium",
    tags: ["Balanced", "Vitamin-Rich"],
    mealType: "lunch",
  },
  {
    id: "rec-5",
    title: "Lentil & Vegetable Curry",
    image: foodImage("lentil vegetable curry", 105),
    time: "28 mins",
    servings: "2 Servings",
    level: "Medium",
    tags: ["Plant Protein", "High Fiber"],
    mealType: "dinner",
  },
  {
    id: "rec-6",
    title: "Grilled Salmon & Asparagus",
    image: foodImage("grilled salmon asparagus dinner", 106),
    time: "24 mins",
    servings: "2 Servings",
    level: "Easy",
    tags: ["Low Carb", "Omega-3"],
    mealType: "dinner",
  },
  {
    id: "rec-7",
    title: "Mango Chia Pudding",
    image: foodImage("mango chia pudding", 107),
    time: "10 mins",
    servings: "1 Serving",
    level: "Easy",
    tags: ["Calcium", "Antioxidant"],
    mealType: "others",
  },
  {
    id: "rec-8",
    title: "Hummus Veggie Snack Plate",
    image: foodImage("hummus veggie plate snack", 108),
    time: "6 mins",
    servings: "1 Serving",
    level: "Easy",
    tags: ["High Fiber", "Snack"],
    mealType: "others",
  },
];

const mockAllMeals = [
  {
    id: "meal-1",
    title: "Avocado Toast with Poached Egg",
    image: foodImage("avocado toast poached egg", 201),
    time: "12 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "breakfast",
    recipeId: null,
  },
  {
    id: "meal-2",
    title: "Spinach Mushroom Omelette",
    image: foodImage("spinach mushroom omelette", 202),
    time: "14 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "breakfast",
    recipeId: null,
  },
  {
    id: "meal-3",
    title: "Berry Banana Smoothie",
    image: foodImage("berry banana smoothie", 203),
    time: "6 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "breakfast",
    recipeId: null,
  },
  {
    id: "meal-4",
    title: "Smoked Salmon Bagel",
    image: foodImage("smoked salmon bagel", 204),
    time: "10 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "breakfast",
    recipeId: null,
  },
  {
    id: "meal-5",
    title: "Protein Pancakes",
    image: foodImage("protein pancakes", 205),
    time: "18 Mins",
    servings: "2 Servings",
    level: "Medium",
    mealType: "breakfast",
    recipeId: null,
  },
  {
    id: "meal-6",
    title: "Chia Seed Pudding",
    image: foodImage("chia seed pudding", 206),
    time: "8 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "breakfast",
    recipeId: null,
  },
  {
    id: "meal-7",
    title: "Chicken Caesar Wrap",
    image: foodImage("chicken caesar wrap", 207),
    time: "20 Mins",
    servings: "2 Servings",
    level: "Medium",
    mealType: "lunch",
    recipeId: null,
  },
  {
    id: "meal-8",
    title: "Quinoa Salmon Bowl",
    image: foodImage("quinoa salmon bowl", 208),
    time: "24 Mins",
    servings: "2 Servings",
    level: "Medium",
    mealType: "lunch",
    recipeId: null,
  },
  {
    id: "meal-9",
    title: "Shrimp Pad Thai",
    image: foodImage("shrimp pad thai", 209),
    time: "27 Mins",
    servings: "2 Servings",
    level: "Medium",
    mealType: "lunch",
    recipeId: null,
  },
  {
    id: "meal-10",
    title: "Tuna Nicoise Salad",
    image: foodImage("tuna nicoise salad", 210),
    time: "15 Mins",
    servings: "2 Servings",
    level: "Easy",
    mealType: "lunch",
    recipeId: null,
  },
  {
    id: "meal-11",
    title: "Turkey Veggie Sandwich",
    image: foodImage("turkey veggie sandwich", 211),
    time: "10 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "lunch",
    recipeId: null,
  },
  {
    id: "meal-12",
    title: "Mediterranean Buddha Bowl",
    image: foodImage("mediterranean buddha bowl", 212),
    time: "22 Mins",
    servings: "2 Servings",
    level: "Medium",
    mealType: "lunch",
    recipeId: null,
  },
  {
    id: "meal-13",
    title: "Lemon Herb Baked Salmon",
    image: foodImage("baked salmon lemon herbs", 213),
    time: "26 Mins",
    servings: "2 Servings",
    level: "Medium",
    mealType: "dinner",
    recipeId: null,
  },
  {
    id: "meal-14",
    title: "Chicken Tikka Masala",
    image: foodImage("chicken tikka masala", 214),
    time: "35 Mins",
    servings: "3 Servings",
    level: "Hard",
    mealType: "dinner",
    recipeId: null,
  },
  {
    id: "meal-15",
    title: "Vegetable Coconut Curry",
    image: foodImage("vegetable coconut curry", 215),
    time: "30 Mins",
    servings: "3 Servings",
    level: "Medium",
    mealType: "dinner",
    recipeId: null,
  },
  {
    id: "meal-16",
    title: "Garlic Butter Shrimp Pasta",
    image: foodImage("garlic butter shrimp pasta", 216),
    time: "29 Mins",
    servings: "2 Servings",
    level: "Medium",
    mealType: "dinner",
    recipeId: null,
  },
  {
    id: "meal-17",
    title: "Grilled Steak & Vegetables",
    image: foodImage("grilled steak vegetables", 217),
    time: "32 Mins",
    servings: "2 Servings",
    level: "Hard",
    mealType: "dinner",
    recipeId: null,
  },
  {
    id: "meal-18",
    title: "Miso Ramen Bowl",
    image: foodImage("miso ramen bowl", 218),
    time: "33 Mins",
    servings: "2 Servings",
    level: "Hard",
    mealType: "dinner",
    recipeId: null,
  },
  {
    id: "meal-19",
    title: "Hummus & Veggie Plate",
    image: foodImage("hummus veggie plate", 219),
    time: "7 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "others",
    recipeId: null,
  },
  {
    id: "meal-20",
    title: "Fruit & Yogurt Cup",
    image: foodImage("fruit yogurt cup", 220),
    time: "5 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "others",
    recipeId: null,
  },
  {
    id: "meal-21",
    title: "Dark Chocolate Oat Bites",
    image: foodImage("dark chocolate oat bites", 221),
    time: "9 Mins",
    servings: "2 Servings",
    level: "Easy",
    mealType: "others",
    recipeId: null,
  },
  {
    id: "meal-22",
    title: "Cottage Cheese with Pineapple",
    image: foodImage("cottage cheese pineapple", 222),
    time: "4 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "others",
    recipeId: null,
  },
  {
    id: "meal-23",
    title: "Mixed Nuts & Dried Fruit",
    image: foodImage("mixed nuts dried fruit", 223),
    time: "3 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "others",
    recipeId: null,
  },
  {
    id: "meal-24",
    title: "Green Detox Juice",
    image: foodImage("green detox juice", 224),
    time: "6 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "others",
    recipeId: null,
  },
];

const normalize = (value) => String(value || "").trim().toLowerCase();

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getHighlightParts(text, query) {
  const source = String(text || "");
  const normalizedQuery = normalize(query);
  if (!source || !normalizedQuery) return [{ text: source, matched: false }];

  const escapedQuery = escapeRegExp(normalizedQuery);
  const queryRegex = new RegExp(`(${escapedQuery})`, "ig");

  return source
    .split(queryRegex)
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      matched: part.toLowerCase() === normalizedQuery,
    }));
}

function includesQuery(item, query) {
  if (!query) return true;

  const haystack = [
    item.title,
    item.time,
    item.servings,
    item.level,
    item.mealType,
    ...(item.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function matchesMealFilter(item, activeFilter) {
  if (activeFilter === "all") return true;
  return normalize(item.mealType) === activeFilter;
}

function formatMealTypeLabel(mealType) {
  const normalized = normalize(mealType);
  if (!normalized) return "Meal";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function normalizeMealType(value) {
  const normalized = normalize(value);
  if (normalized === "breakfast" || normalized === "lunch" || normalized === "dinner") return normalized;
  if (normalized === "snack" || normalized === "snacks" || normalized === "other") return "others";
  return "others";
}

function parseRequestedMealFilter(value) {
  const normalized = normalize(value);
  if (normalized === "breakfast" || normalized === "lunch" || normalized === "dinner" || normalized === "others") {
    return normalized;
  }
  if (normalized === "snack" || normalized === "snacks" || normalized === "other") return "others";
  return null;
}

function resolveInitialMealFilter(location, routeMealType) {
  const routeRequestedType = parseRequestedMealFilter(routeMealType);
  if (routeRequestedType) return routeRequestedType;

  if (!location) return null;

  const stateMealType =
    location.state?.defaultMealType ||
    location.state?.mealType ||
    location.state?.activeFilter;

  if (stateMealType) {
    const parsedFromState = parseRequestedMealFilter(stateMealType);
    if (parsedFromState) return parsedFromState;
  }

  const searchParams = new URLSearchParams(location.search || "");
  const queryMealType = searchParams.get("mealType") || searchParams.get("tab");
  return parseRequestedMealFilter(queryMealType);
}

function isISODateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function resolveInitialPlanDate(location) {
  if (!location) return null;

  const stateDate = location.state?.planDate || location.state?.selectedDate || location.state?.targetDate;
  if (isISODateString(stateDate)) return stateDate;

  const searchParams = new URLSearchParams(location.search || "");
  const queryDate = searchParams.get("date") || searchParams.get("planDate");
  if (isISODateString(queryDate)) return queryDate;

  return null;
}

function getMealIdentityKey(meal, fallback = "") {
  const recipeIdKey = normalize(meal?.recipeId);
  if (recipeIdKey && recipeIdKey !== "null") return `recipe:${recipeIdKey}`;

  const titleKey = normalize(meal?.title || meal?.name);
  if (titleKey) return `title:${titleKey}`;

  const idKey = normalize(meal?.id);
  if (idKey) return `id:${idKey}`;

  const fallbackKey = normalize(fallback);
  if (fallbackKey) return `legacy:${fallbackKey}`;

  return "";
}

function getMealSlotKey(meal, fallback = "") {
  const identityKey = getMealIdentityKey(meal, fallback);
  if (!identityKey) return "";

  const mealTypeKey = normalizeMealType(meal?.mealType);
  return `slot:${identityKey}|${mealTypeKey}`;
}

function normalizeSelectionMap(selectionMap) {
  if (!selectionMap || typeof selectionMap !== "object") return {};

  const normalizedMap = {};
  Object.entries(selectionMap).forEach(([entryKey, meal], index) => {
    if (!meal || typeof meal !== "object") return;
    const normalizedMeal = {
      ...meal,
      mealType: normalizeMealType(meal?.mealType),
    };
    const selectionKey = getMealSlotKey(normalizedMeal, `${entryKey || index}`);
    if (!selectionKey || normalizedMap[selectionKey]) return;
    normalizedMap[selectionKey] = normalizedMeal;
  });

  return normalizedMap;
}

function normalizeSelectionsByDate(selectionsByDate) {
  if (!selectionsByDate || typeof selectionsByDate !== "object") return {};

  const normalizedByDate = {};
  Object.entries(selectionsByDate).forEach(([isoDate, selectionMap]) => {
    const normalizedSelectionMap = normalizeSelectionMap(selectionMap);
    if (Object.keys(normalizedSelectionMap).length === 0) return;
    normalizedByDate[isoDate] = normalizedSelectionMap;
  });

  return normalizedByDate;
}

const NUTRITION_BY_TYPE = {
  breakfast: { calories: 290, proteins: 16, fats: 9, vitamins: 120, sodium: 180 },
  lunch: { calories: 430, proteins: 26, fats: 14, vitamins: 170, sodium: 360 },
  dinner: { calories: 520, proteins: 32, fats: 18, vitamins: 210, sodium: 460 },
  others: { calories: 210, proteins: 8, fats: 7, vitamins: 90, sodium: 140 },
};

const LEVEL_FACTOR = {
  easy: 1,
  medium: 1.15,
  hard: 1.3,
};

function estimateMealNutrition(meal) {
  const type = normalize(meal?.mealType) || "breakfast";
  const level = normalize(meal?.level) || "easy";
  const base = NUTRITION_BY_TYPE[type] || NUTRITION_BY_TYPE.breakfast;
  const factor = LEVEL_FACTOR[level] || 1;

  return {
    calories: Math.round(base.calories * factor),
    proteins: Math.round(base.proteins * factor),
    fats: Math.round(base.fats * factor),
    vitamins: Math.round(base.vitamins * factor),
    sodium: Math.round(base.sodium * factor),
  };
}

const Meal = () => {
  const { preselectedMealType } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [todayISO, setTodayISO] = useState(() => getTodayISO());
  const [activeFilter, setActiveFilter] = useState(
    () => resolveInitialMealFilter(location, preselectedMealType) || "all",
  );
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [gridColumns, setGridColumns] = useState(() => getMealGridColumns());
  const [widgetFabBottom, setWidgetFabBottom] = useState(DEFAULT_WIDGET_BOTTOM);
  const [isWidgetMenuOpen, setIsWidgetMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => resolveInitialPlanDate(location) || getTodayISO());
  const dateInputRef = useRef(null);
  const searchWrapRef = useRef(null);
  const widgetFabRef = useRef(null);
  const previousTodayISORef = useRef(getTodayISO());
  const recommendedRowRef = useRef(null);
  const recommendedScrollbarTrackRef = useRef(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [recommendedScrollbar, setRecommendedScrollbar] = useState({
    thumbWidthPx: 0,
    thumbOffsetPx: 0,
  });
  const [mealSelectionsByDate, setMealSelectionsByDate] = useState(() =>
    normalizeSelectionsByDate(readSelectionsByDateFromStorage()),
  );

  const [activeTab, setActiveTab] = useState('addMeal');
  const [planFilters, setPlanFilters] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const requestedFilter = resolveInitialMealFilter(location, preselectedMealType);
    if (requestedFilter) {
      setActiveFilter(requestedFilter);
    }
  }, [preselectedMealType, location.key, location.search]);

  useEffect(() => {
    const requestedDate = resolveInitialPlanDate(location);
    if (requestedDate && requestedDate !== selectedDate) {
      setSelectedDate(requestedDate);
    }
  }, [selectedDate, location.key, location.search]);

  const normalizedQuery = normalize(query);

  const selectedMealMap = useMemo(
    () => normalizeSelectionMap(mealSelectionsByDate[selectedDate] || {}),
    [mealSelectionsByDate, selectedDate],
  );

  const selectedMealEntries = useMemo(
    () =>
      Object.entries(selectedMealMap).map(([entryId, meal]) => ({
        entryId,
        meal,
      })),
    [selectedMealMap],
  );

  const selectedMeals = useMemo(
    () => selectedMealEntries.map(({ meal }) => meal),
    [selectedMealEntries],
  );

  const selectedSlotKeySet = useMemo(() => {
    const slotKeySet = new Set();
    selectedMealEntries.forEach(({ entryId, meal }) => {
      const slotKey = getMealSlotKey(meal, entryId);
      if (slotKey) slotKeySet.add(slotKey);
    });
    return slotKeySet;
  }, [selectedMealEntries]);

  const selectedIdentityKeySet = useMemo(() => {
    const identitySet = new Set();
    selectedMealEntries.forEach(({ entryId, meal }) => {
      const identityKey = getMealIdentityKey(meal, entryId);
      if (identityKey) identitySet.add(identityKey);
    });
    return identitySet;
  }, [selectedMealEntries]);

  const selectedMealGroups = useMemo(() => {
    const groups = {
      breakfast: [],
      lunch: [],
      dinner: [],
      others: [],
    };

    selectedMealEntries
      .filter(({ meal }) => includesQuery(meal, normalizedQuery))
      .forEach(({ entryId, meal }) => {
        const mealType = normalizeMealType(meal?.mealType);
        if (mealType === "breakfast" || mealType === "lunch" || mealType === "dinner" || mealType === "others") {
          groups[mealType].push({ entryId, meal });
          return;
        }

        groups.others.push({ entryId, meal });
      });

    return groups;
  }, [normalizedQuery, selectedMealEntries]);

  const filteredRecommended = useMemo(
    () =>
      recommendedMeals.filter(
        (item) =>
          matchesMealFilter(item, activeFilter) && includesQuery(item, normalizedQuery),
      ),
    [activeFilter, normalizedQuery],
  );

  const filteredAllMeals = useMemo(
    () =>
      mockAllMeals.filter(
        (item) =>
          matchesMealFilter(item, activeFilter) && includesQuery(item, normalizedQuery),
      ),
    [activeFilter, normalizedQuery],
  );

  const searchableMeals = useMemo(() => {
    const uniqueByTitle = new Map();
    [...recommendedMeals, ...mockAllMeals].forEach((meal) => {
      const titleKey = normalize(meal?.title);
      if (!titleKey || uniqueByTitle.has(titleKey)) return;
      uniqueByTitle.set(titleKey, meal);
    });
    return Array.from(uniqueByTitle.values());
  }, []);

  const searchSuggestions = useMemo(() => {
    if (!normalizedQuery) return [];

    return searchableMeals
      .map((meal) => {
        const titleText = normalize(meal.title);
        const tagsText = Array.isArray(meal.tags) ? meal.tags.join(" ").toLowerCase() : "";
        const metaText = `${normalize(meal.mealType)} ${normalize(meal.time)} ${normalize(meal.servings)}`;

        let score = 0;
        if (titleText.startsWith(normalizedQuery)) score += 4;
        if (titleText.includes(normalizedQuery)) score += 2;
        if (tagsText.includes(normalizedQuery)) score += 1;
        if (metaText.includes(normalizedQuery)) score += 1;
        if (score === 0) return null;

        return { meal, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || a.meal.title.localeCompare(b.meal.title))
      .slice(0, 6)
      .map(({ meal }) => meal);
  }, [normalizedQuery, searchableMeals]);

  const showSearchSuggestions =
    isSuggestionOpen && Boolean(normalizedQuery) && searchSuggestions.length > 0;

  const rowsPerPage = 3;
  const itemsPerPage = gridColumns * rowsPerPage;
  const totalPages = Math.max(1, Math.ceil(filteredAllMeals.length / itemsPerPage));

  const paginatedAllMeals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAllMeals.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAllMeals, currentPage, itemsPerPage]);

  const totalNutrition = useMemo(
    () =>
      selectedMeals.reduce(
        (accumulator, meal) => {
          const estimated = estimateMealNutrition(meal);
          return {
            calories: accumulator.calories + estimated.calories,
            proteins: accumulator.proteins + estimated.proteins,
            fats: accumulator.fats + estimated.fats,
            vitamins: accumulator.vitamins + estimated.vitamins,
            sodium: accumulator.sodium + estimated.sodium,
          };
        },
        { calories: 0, proteins: 0, fats: 0, vitamins: 0, sodium: 0 },
      ),
    [selectedMeals],
  );

  const selectedDish = useMemo(() => {
    if (selectedMealEntries.length === 0) return null;
    return selectedMealEntries[selectedMealEntries.length - 1].meal;
  }, [selectedMealEntries]);

  const selectedDishKey = useMemo(
    () => (selectedDish ? getMealIdentityKey(selectedDish, selectedDish.id || selectedDish.title) : ""),
    [selectedDish],
  );

  const selectedDishNutrition = useMemo(
    () =>
      selectedDish
        ? estimateMealNutrition(selectedDish)
        : { calories: 0, proteins: 0, fats: 0, vitamins: 0, sodium: 0 },
    [selectedDish],
  );

  const syncRecommendedScrollbar = useCallback(() => {
    const rowElement = recommendedRowRef.current;
    const trackElement = recommendedScrollbarTrackRef.current;

    if (!rowElement || !trackElement) {
      setRecommendedScrollbar({ thumbWidthPx: 0, thumbOffsetPx: 0 });
      return;
    }

    const maxScroll = Math.max(0, rowElement.scrollWidth - rowElement.clientWidth);
    const trackWidth = trackElement.clientWidth;
    const usableTrackWidth = Math.max(0, trackWidth - RECOMMENDED_SCROLLBAR_INSET * 2);
    if (usableTrackWidth <= 0) {
      setRecommendedScrollbar({ thumbWidthPx: 0, thumbOffsetPx: 0 });
      return;
    }

    if (maxScroll <= 0) {
      setRecommendedScrollbar({ thumbWidthPx: usableTrackWidth, thumbOffsetPx: 0 });
      return;
    }

    const rawThumbWidth = (rowElement.clientWidth / rowElement.scrollWidth) * usableTrackWidth;
    const minThumb = Math.min(RECOMMENDED_SCROLLBAR_MIN_THUMB, usableTrackWidth);
    const thumbWidthPx = Math.max(minThumb, Math.min(usableTrackWidth, rawThumbWidth));
    const maxThumbTravel = Math.max(0, usableTrackWidth - thumbWidthPx);
    const progress = rowElement.scrollLeft / maxScroll;
    const thumbOffsetPx = Math.max(0, Math.min(maxThumbTravel, maxThumbTravel * progress));

    setRecommendedScrollbar((previous) => {
      const widthDiff = Math.abs(previous.thumbWidthPx - thumbWidthPx);
      const offsetDiff = Math.abs(previous.thumbOffsetPx - thumbOffsetPx);
      if (widthDiff < 0.1 && offsetDiff < 0.1) return previous;
      return { thumbWidthPx, thumbOffsetPx };
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(MEAL_SELECTIONS_STORAGE_KEY, JSON.stringify(mealSelectionsByDate));
  }, [mealSelectionsByDate]);

  useEffect(() => {
    const syncTodayISO = () => {
      setTodayISO((previous) => {
        const current = getTodayISO();
        return previous === current ? previous : current;
      });
    };

    syncTodayISO();
    const intervalId = window.setInterval(syncTodayISO, 60 * 1000);
    const handleFocus = () => syncTodayISO();
    const handleVisibility = () => {
      if (!document.hidden) syncTodayISO();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    const previousTodayISO = previousTodayISORef.current;
    if (todayISO === previousTodayISO) return;

    if (selectedDate === previousTodayISO) {
      setSelectedDate(todayISO);
    }

    previousTodayISORef.current = todayISO;
  }, [todayISO, selectedDate]);

  useEffect(() => {
    const rowElement = recommendedRowRef.current;
    if (!rowElement) return undefined;

    let frameId = 0;
    const queueSync = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        syncRecommendedScrollbar();
      });
    };

    queueSync();

    rowElement.addEventListener("scroll", queueSync, { passive: true });
    window.addEventListener("resize", queueSync);

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(queueSync);
      resizeObserver.observe(rowElement);
    }

    return () => {
      rowElement.removeEventListener("scroll", queueSync);
      window.removeEventListener("resize", queueSync);
      if (resizeObserver) resizeObserver.disconnect();
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [syncRecommendedScrollbar, filteredRecommended.length, activeFilter, normalizedQuery]);

  const syncWidgetFabBottom = useCallback(() => {
    const ttsButton = document.querySelector(
      '.tts-ignore button[aria-label="Open Text-to-Speech controls"]',
    );

    if (!ttsButton) {
      setWidgetFabBottom(DEFAULT_WIDGET_BOTTOM);
      return;
    }

    const computedStyle = window.getComputedStyle(ttsButton);
    if (
      computedStyle.display === "none" ||
      computedStyle.visibility === "hidden" ||
      computedStyle.opacity === "0"
    ) {
      setWidgetFabBottom(DEFAULT_WIDGET_BOTTOM);
      return;
    }

    const rect = ttsButton.getBoundingClientRect();
    const ttsBottom = Math.max(0, window.innerHeight - rect.bottom);
    const nextOffset = ttsBottom + rect.height + FLOATING_STACK_GAP;
    setWidgetFabBottom(Math.max(DEFAULT_WIDGET_BOTTOM, Math.ceil(nextOffset)));
  }, []);

  useEffect(() => {
    const handleResize = () => setGridColumns(getMealGridColumns());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    syncWidgetFabBottom();

    const ttsButton = document.querySelector(
      '.tts-ignore button[aria-label="Open Text-to-Speech controls"]',
    );

    const hasResizeObserver = typeof ResizeObserver !== "undefined";
    const resizeObserver =
      hasResizeObserver && ttsButton
        ? new ResizeObserver(() => {
            syncWidgetFabBottom();
          })
        : null;

    if (resizeObserver && ttsButton) {
      resizeObserver.observe(ttsButton);
    }

    const mutationObserver =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(() => {
            syncWidgetFabBottom();
          })
        : null;

    if (mutationObserver) {
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    window.addEventListener("resize", syncWidgetFabBottom);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      window.removeEventListener("resize", syncWidgetFabBottom);
    };
  }, [syncWidgetFabBottom]);

  useEffect(() => {
    if (!isWidgetMenuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (!widgetFabRef.current) return;
      if (!widgetFabRef.current.contains(event.target)) {
        setIsWidgetMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setIsWidgetMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isWidgetMenuOpen]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const handleClickOutsideSearch = (event) => {
      if (!searchWrapRef.current) return;
      if (!searchWrapRef.current.contains(event.target)) {
        setIsSuggestionOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideSearch);
    document.addEventListener("touchstart", handleClickOutsideSearch);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSearch);
      document.removeEventListener("touchstart", handleClickOutsideSearch);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, normalizedQuery, selectedDate]);

  const toggleMealSelection = (meal) => {
    const selectionKey = getMealSlotKey(meal, meal?.id || meal?.title || selectedDate);
    if (!selectionKey) return;

    setMealSelectionsByDate((previousByDate) => {
      const currentDateMap = normalizeSelectionMap(previousByDate[selectedDate] || {});
      const nextDateMap = { ...currentDateMap };

      if (nextDateMap[selectionKey]) {
        delete nextDateMap[selectionKey];
      } else {
        nextDateMap[selectionKey] = {
          ...meal,
          mealType: normalizeMealType(meal?.mealType),
        };
      }

      const nextByDate = { ...previousByDate };
      if (Object.keys(nextDateMap).length === 0) {
        delete nextByDate[selectedDate];
      } else {
        nextByDate[selectedDate] = nextDateMap;
      }

      return nextByDate;
    });
  };

  const removeSelectionEntry = (entryId) => {
    if (!entryId) return;

    setMealSelectionsByDate((previousByDate) => {
      const currentDateMap = normalizeSelectionMap(previousByDate[selectedDate] || {});
      if (!currentDateMap[entryId]) return previousByDate;

      const nextDateMap = { ...currentDateMap };
      delete nextDateMap[entryId];

      const nextByDate = { ...previousByDate };
      if (Object.keys(nextDateMap).length === 0) {
        delete nextByDate[selectedDate];
      } else {
        nextByDate[selectedDate] = nextDateMap;
      }

      return nextByDate;
    });
  };

  const handleClearSelectedDishes = () => {
    setMealSelectionsByDate((previousByDate) => {
      if (!previousByDate[selectedDate]) return previousByDate;
      const nextByDate = { ...previousByDate };
      delete nextByDate[selectedDate];
      return nextByDate;
    });
  };

  const applySelectedDate = (nextDate) => {
    setSelectedDate(nextDate);
  };

  const handleDateChange = (event) => {
    const nextDate = event.target.value;
    if (!nextDate) return;
    if (nextDate < todayISO) return;
    applySelectedDate(nextDate);
  };

  const handlePrevDate = () => {
    if (selectedDate <= todayISO) return;
    const previousDate = shiftISODate(selectedDate, -1);
    if (previousDate < todayISO) return;
    applySelectedDate(previousDate);
  };

  const handleNextDate = () => {
    const nextDate = shiftISODate(selectedDate, 1);
    applySelectedDate(nextDate);
  };

  const goToPreviousPage = () => {
    setCurrentPage((previous) => Math.max(1, previous - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((previous) => Math.min(totalPages, previous + 1));
  };

  const handleSearchInputChange = (event) => {
    setQuery(event.target.value);
    setIsSuggestionOpen(true);
  };

  const handleSelectSuggestion = (meal) => {
    setQuery(meal.title);
    setIsSuggestionOpen(false);
  };

  const handleRecommendedScrollbarTrackClick = (event) => {
    const rowElement = recommendedRowRef.current;
    const trackElement = recommendedScrollbarTrackRef.current;
    if (!rowElement || !trackElement) return;

    const maxScroll = Math.max(0, rowElement.scrollWidth - rowElement.clientWidth);
    if (maxScroll <= 0) return;

    const rect = trackElement.getBoundingClientRect();
    const trackWidth = trackElement.clientWidth;
    const usableTrackWidth = Math.max(0, trackWidth - RECOMMENDED_SCROLLBAR_INSET * 2);
    const thumbWidth = Math.max(
      1,
      Math.min(usableTrackWidth, Number(recommendedScrollbar.thumbWidthPx) || usableTrackWidth),
    );
    const maxThumbTravel = Math.max(0, usableTrackWidth - thumbWidth);
    if (rect.width <= 0 || usableTrackWidth <= 0) return;

    const clickX = event.clientX - rect.left;
    const clickOnRail = Math.max(0, Math.min(usableTrackWidth, clickX - RECOMMENDED_SCROLLBAR_INSET));
    const targetThumbOffset = Math.max(
      0,
      Math.min(maxThumbTravel, clickOnRail - thumbWidth / 2),
    );
    const ratio = maxThumbTravel > 0 ? targetThumbOffset / maxThumbTravel : 0;

    rowElement.scrollTo({
      left: maxScroll * ratio,
      behavior: "smooth",
    });
  };

  const openDatePicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
      return;
    }
    dateInputRef.current?.focus();
    dateInputRef.current?.click();
  };

  const handleViewDetail = (meal) => {
    if (meal) {
      sessionStorage.setItem("selectedMealDetail", JSON.stringify(meal));
    }
    navigate("/dish/detail", { state: { meal } });
  };

  const handleViewRecipe = (meal) => {
    if (!meal) return;

    try {
      sessionStorage.setItem("selectedMealDetail", JSON.stringify(meal));
    } catch {
      // Ignore storage write errors and continue navigation.
    }

    const targetRecipeId = meal.recipeId || meal.id || "recipe";
    navigate(`/recipe/${encodeURIComponent(String(targetRecipeId))}`, {
      state: { meal },
    });
  };

  const handleGeneratePlan = (filters) => {
    setPlanFilters(filters);
  };

  const handleExportPDF = () => {
    const printArea = document.getElementById('personalized-meal-plan');
    if (!printArea) return;
    html2canvas(printArea, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('Personalized_Meal_Plan.pdf');
    });
  };

  const selectedCount = selectedMeals.length;
  const selectedViewCount = SELECTED_VIEW_SECTIONS.reduce(
    (total, section) => total + selectedMealGroups[section.key].length,
    0,
  );
  const isSelectedView = activeFilter === "selected";
  const isTodaySelected = selectedDate === todayISO;
  const dateDisplayLabel = isTodaySelected ? "Today" : selectedDate;

  return (
    <div className="add-meal-page">
      <div className="add-meal-shell">
        <div className="add-meal-breadcrumb" aria-label="breadcrumb">
          <button
            type="button"
            className="add-meal-back"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={14} />
            Back
          </button>
          <span className="crumb-divider">/</span>
          <span className="crumb-muted">Meal Planning</span>
          <span className="crumb-divider">/</span>
          <span className="crumb-current">Add Meal</span>
        </div>

        <div className="meal-tab-switcher">
          <button
            type="button"
            className={`meal-tab-btn ${activeTab === 'addMeal' ? 'active' : ''}`}
            onClick={() => setActiveTab('addMeal')}
          >
            Add Meal
          </button>
          <button
            type="button"
            className={`meal-tab-btn ${activeTab === 'personalizedPlan' ? 'active' : ''}`}
            onClick={() => setActiveTab('personalizedPlan')}
          >
            <Sparkles size={15} />
            AI Personalized Plan
          </button>
        </div>

        {activeTab === 'addMeal' && (<>
        <div className="add-meal-toolbar">
          <div className="add-meal-date-row" aria-label="Plan date controls">
            <button
              type="button"
              className="add-meal-date-nav"
              onClick={handlePrevDate}
              disabled={selectedDate <= todayISO}
            >
              ← Prev
            </button>

            <div className="add-meal-date-display-wrap">
              <button
                type="button"
                className="add-meal-date-display"
                onClick={openDatePicker}
                aria-label="Choose planning date"
              >
                <CalendarDays size={16} className="add-meal-date-icon" />
                <span>{dateDisplayLabel}</span>
              </button>

              <input
                ref={dateInputRef}
                id="add-meal-plan-date"
                type="date"
                className="add-meal-date-picker-hidden"
                value={selectedDate}
                min={todayISO}
                onChange={handleDateChange}
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>

            <button
              type="button"
              className="add-meal-date-nav"
              onClick={handleNextDate}
            >
              Next →
            </button>

          </div>

          <div className="add-meal-search-wrap" ref={searchWrapRef}>
            <label className="add-meal-search" htmlFor="add-meal-search">
              <Search size={22} strokeWidth={2.2} className="search-icon" />
              <input
                id="add-meal-search"
                type="text"
                value={query}
                onChange={handleSearchInputChange}
                onFocus={() => setIsSuggestionOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsSuggestionOpen(false);
                    return;
                  }

                  if (event.key === "Enter" && showSearchSuggestions) {
                    event.preventDefault();
                    handleSelectSuggestion(searchSuggestions[0]);
                  }
                }}
                placeholder="Search for foods, recipes, or meals"
              />
            </label>

            {showSearchSuggestions ? (
              <ul className="add-meal-suggestions" role="listbox" aria-label="Meal search suggestions">
                {searchSuggestions.map((meal) => (
                  <li key={`suggestion-${meal.id}`}>
                    <button
                      type="button"
                      className="add-meal-suggestion-item"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelectSuggestion(meal)}
                    >
                      <span className="add-meal-suggestion-title">
                        {getHighlightParts(meal.title, normalizedQuery).map((part, index) => (
                          <span
                            key={`${meal.id}-title-part-${index}`}
                            className={part.matched ? "add-meal-suggestion-highlight" : undefined}
                          >
                            {part.text}
                          </span>
                        ))}
                      </span>
                      <span className="add-meal-suggestion-meta">
                        {getHighlightParts(
                          `${formatMealTypeLabel(meal.mealType)} · ${meal.time || "N/A"}`,
                          normalizedQuery,
                        ).map((part, index) => (
                          <span
                            key={`${meal.id}-meta-part-${index}`}
                            className={part.matched ? "add-meal-suggestion-highlight" : undefined}
                          >
                            {part.text}
                          </span>
                        ))}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="add-meal-filters" role="tablist" aria-label="Meal type filter">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <button
                key={filter.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`filter-chip ${isActive ? "active" : ""}`}
                onClick={() => setActiveFilter(filter.key)}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="add-meal-content-grid">
          <div className="add-meal-main">
            {isSelectedView ? (
              <section className="add-meal-section selected-view-section">
                <div className="section-title-row">
                  <h2 className="section-title">Selected Meals</h2>
                  <button
                    type="button"
                    className="clear-selected-btn"
                    onClick={handleClearSelectedDishes}
                    disabled={selectedCount === 0}
                  >
                    <Trash2 size={15} />
                    Clear all selected dishes
                  </button>
                </div>

                {selectedViewCount === 0 ? (
                  <p className="empty-state">
                    {normalizedQuery
                      ? "No selected dishes matched your search."
                      : "No dishes selected for this date yet."}
                  </p>
                ) : (
                  <div className="selected-meal-groups">
                    {SELECTED_VIEW_SECTIONS.map((section) => {
                      const sectionMeals = selectedMealGroups[section.key];

                      return (
                        <article key={section.key} className="selected-meal-group">
                          <div className="selected-meal-group-header">
                            <h3>{section.label}</h3>
                            <span>
                              {sectionMeals.length} {sectionMeals.length === 1 ? "dish" : "dishes"}
                            </span>
                          </div>

                          {sectionMeals.length === 0 ? (
                            <p className="selected-group-empty">No selected dishes in this meal.</p>
                          ) : (
                            <div className="selected-group-list">
                              {sectionMeals.map(({ entryId, meal }, index) => {
                                const mealKey = getMealIdentityKey(
                                  meal,
                                  `${entryId || meal.id || meal.recipeId || meal.title || index}`,
                                );
                                return (
                                <article
                                  key={`selected-${section.key}-${entryId || mealKey}`}
                                  className="selected-dish-card"
                                >
                                  <div className="selected-dish-thumb">
                                    <img
                                      src={meal.image}
                                      alt={meal.title}
                                      loading="lazy"
                                      onError={handleMealImageError}
                                    />
                                    <span
                                      className={`meal-type-badge type-${normalize(meal.mealType)}`}
                                    >
                                      {formatMealTypeLabel(meal.mealType)}
                                    </span>
                                  </div>

                                  <div className="selected-dish-body">
                                    <h4>{meal.title}</h4>
                                    <div className="selected-dish-meta">
                                      <span>
                                        <Clock3 size={14} />
                                        {meal.time || "N/A"}
                                      </span>
                                      <span>
                                        <Users size={14} />
                                        {meal.servings || "N/A"}
                                      </span>
                                      <span>
                                        <BarChart3 size={14} />
                                        {meal.level || "Easy"}
                                      </span>
                                    </div>

                                        {Array.isArray(meal.tags) && meal.tags.length > 0 ? (
                                      <div className="selected-dish-tags">
                                        {meal.tags.slice(0, 3).map((tag) => (
                                          <span key={`${entryId || mealKey}-${tag}`}>{tag}</span>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>

                                  <div className="selected-dish-actions">
                                    <button
                                      type="button"
                                      className="add-meal-action-btn add-meal-detail-btn"
                                      onClick={() => handleViewDetail(meal)}
                                    >
                                      View Detail
                                    </button>
                                    <button
                                      type="button"
                                      className="add-meal-action-btn add-meal-recipe-btn"
                                      onClick={() => handleViewRecipe(meal)}
                                    >
                                      View Recipe
                                    </button>
                                    <button
                                      type="button"
                                      className="selected-remove-btn"
                                      onClick={() => removeSelectionEntry(entryId)}
                                      aria-label={`Remove ${meal.title}`}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </article>
                                );
                              })}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : (
              <>
                <section className="add-meal-section">
                  <h2 className="section-title">Recommended Meals</h2>

                  {filteredRecommended.length === 0 ? (
                    <p className="empty-state">No recommended meals found for the selected filter.</p>
                  ) : (
                    <div className="recommended-row-shell">
                      <div className="recommended-row" ref={recommendedRowRef}>
                        {filteredRecommended.map((meal) => {
                          const mealSlotKey = getMealSlotKey(
                            meal,
                            meal.id || meal.recipeId || meal.title,
                          );
                          const mealIdentityKey = getMealIdentityKey(
                            meal,
                            meal.id || meal.recipeId || meal.title,
                          );
                          const isSelectedInCurrentSlot =
                            Boolean(mealSlotKey) && selectedSlotKeySet.has(mealSlotKey);
                          const isSelected =
                            isSelectedInCurrentSlot ||
                            (Boolean(mealIdentityKey) && selectedIdentityKeySet.has(mealIdentityKey));
                          const isSelectedDish =
                            Boolean(selectedDishKey) &&
                            Boolean(mealIdentityKey) &&
                            selectedDishKey === mealIdentityKey;

                          return (
                            <article
                              key={meal.id}
                              className={`recommend-card ${isSelected ? "selected" : ""} ${isSelectedDish ? "selected-dish" : ""}`}
                              onClick={() => toggleMealSelection(meal)}
                            >
                              <div className="recommend-image-wrap">
                                <img
                                  src={meal.image}
                                  alt={meal.title}
                                  loading="lazy"
                                  onError={handleMealImageError}
                                />
                                <span className={`meal-type-badge type-${normalize(meal.mealType)}`}>
                                  {formatMealTypeLabel(meal.mealType)}
                                </span>
                                {isSelected ? (
                                  <span className="selected-check" aria-label="Selected">
                                    <span className="selected-check-icon" aria-hidden="true">
                                      <Check size={13} strokeWidth={3} />
                                    </span>
                                    <span className="selected-check-label">Selected</span>
                                  </span>
                                ) : null}
                                <span className="recommend-time">
                                  <Clock3 size={13} />
                                  {meal.time}
                                </span>
                              </div>

                              <div className="recommend-content">
                                <h3>{meal.title}</h3>
                                <div className="recipe-meta recommend-meta">
                                  <span>
                                    <Clock3 size={16} />
                                    {meal.time || "N/A"}
                                  </span>
                                  <span>
                                    <Users size={16} />
                                    {meal.servings || "N/A"}
                                  </span>
                                  <span>
                                    <BarChart3 size={16} />
                                    {meal.level || "Easy"}
                                  </span>
                                </div>
                                <div className="recommend-tags">
                                  {(Array.isArray(meal.tags) ? meal.tags : []).map((tag) => (
                                    <span key={`${meal.id}-${tag}`}>{tag}</span>
                                  ))}
                                </div>
                                <div className="meal-card-actions recommend-card-actions">
                                  <button
                                    type="button"
                                    className="add-meal-action-btn add-meal-detail-btn"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleViewDetail(meal);
                                    }}
                                  >
                                    View Detail
                                  </button>
                                  <button
                                    type="button"
                                    className="add-meal-action-btn add-meal-recipe-btn"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleViewRecipe(meal);
                                    }}
                                  >
                                    View Recipe
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        className="recommended-scrollbar-track"
                        ref={recommendedScrollbarTrackRef}
                        onClick={handleRecommendedScrollbarTrackClick}
                        aria-label="Scroll recommended meals"
                      >
                        <span
                          className="recommended-scrollbar-thumb"
                          style={{
                            width: `${recommendedScrollbar.thumbWidthPx}px`,
                            left: `${RECOMMENDED_SCROLLBAR_INSET + recommendedScrollbar.thumbOffsetPx}px`,
                          }}
                        />
                      </button>
                    </div>
                  )}
                </section>

                <section className="add-meal-section">
                  <div className="section-title-row">
                    <h2 className="section-title">All Meals & Recipes</h2>
                    <button
                      type="button"
                      className="clear-selected-btn"
                      onClick={handleClearSelectedDishes}
                      disabled={selectedCount === 0}
                    >
                      <Trash2 size={15} />
                      Clear all selected dishes
                    </button>
                  </div>

                  {filteredAllMeals.length === 0 ? (
                    <p className="empty-state">No meals matched your search.</p>
                  ) : (
                    <div className="all-meals-wrap">
                      <div className="all-meals-grid">
                        {paginatedAllMeals.map((meal) => {
                          const mealSlotKey = getMealSlotKey(
                            meal,
                            meal.id || meal.recipeId || meal.title,
                          );
                          const mealIdentityKey = getMealIdentityKey(
                            meal,
                            meal.id || meal.recipeId || meal.title,
                          );
                          const isSelectedInCurrentSlot =
                            Boolean(mealSlotKey) && selectedSlotKeySet.has(mealSlotKey);
                          const isSelected =
                            isSelectedInCurrentSlot ||
                            (Boolean(mealIdentityKey) && selectedIdentityKeySet.has(mealIdentityKey));
                          const isSelectedDish =
                            Boolean(selectedDishKey) &&
                            Boolean(mealIdentityKey) &&
                            selectedDishKey === mealIdentityKey;

                          return (
                            <article
                              key={meal.id}
                              className={`all-meal-card ${isSelected ? "selected" : ""} ${isSelectedDish ? "selected-dish" : ""}`}
                              onClick={() => toggleMealSelection(meal)}
                            >
                              <div className="all-meal-image-wrap">
                                <img
                                  src={meal.image}
                                  alt={meal.title}
                                  loading="lazy"
                                  onError={handleMealImageError}
                                />
                                <span className={`meal-type-badge type-${normalize(meal.mealType)}`}>
                                  {formatMealTypeLabel(meal.mealType)}
                                </span>
                                {isSelected ? (
                                  <span className="selected-check" aria-label="Selected">
                                    <span className="selected-check-icon" aria-hidden="true">
                                      <Check size={13} strokeWidth={3} />
                                    </span>
                                    <span className="selected-check-label">Selected</span>
                                  </span>
                                ) : null}
                              </div>

                              <div className="all-meal-content">
                                <h3>{meal.title}</h3>

                                <div className="recipe-meta">
                                  <span>
                                    <Clock3 size={16} />
                                    {meal.time}
                                  </span>
                                  <span>
                                    <Users size={16} />
                                    {meal.servings}
                                  </span>
                                  <span>
                                    <BarChart3 size={16} />
                                    {meal.level}
                                  </span>
                                </div>

                                <div className="meal-card-actions">
                                  <button
                                    type="button"
                                    className="add-meal-action-btn add-meal-detail-btn"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleViewDetail(meal);
                                    }}
                                  >
                                    View Detail
                                  </button>
                                  <button
                                    type="button"
                                    className="add-meal-action-btn add-meal-recipe-btn"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleViewRecipe(meal);
                                    }}
                                  >
                                    View Recipe
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>

                      {totalPages > 1 ? (
                        <div className="all-meals-pagination" aria-label="All meals pagination">
                          <button
                            type="button"
                            className="pagination-nav"
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                          >
                            Prev
                          </button>

                          <div className="pagination-index-list">
                            {Array.from({ length: totalPages }, (_, index) => {
                              const pageNumber = index + 1;
                              const isActive = currentPage === pageNumber;

                              return (
                                <button
                                  key={pageNumber}
                                  type="button"
                                  className={`pagination-index ${isActive ? "active" : ""}`}
                                  onClick={() => setCurrentPage(pageNumber)}
                                >
                                  {pageNumber}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            className="pagination-nav"
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>

          <aside className="add-meal-sidebar">
            <div className="nutrition-panel">
              <h3>Nutritional Value</h3>
              <div className="nutrition-section selected-dish-nutrition">
                <h4>Selected Dish Nutrition</h4>
                {selectedDish ? (
                  <>
                    <p className="selected-dish-name">{selectedDish.title}</p>
                    <ul className="nutrition-kpi-list">
                      <li>
                        <span>Calories</span>
                        <strong>{selectedDishNutrition.calories} kcal</strong>
                      </li>
                      <li>
                        <span>Proteins</span>
                        <strong>{selectedDishNutrition.proteins}g</strong>
                      </li>
                      <li>
                        <span>Fats</span>
                        <strong>{selectedDishNutrition.fats}g</strong>
                      </li>
                      <li>
                        <span>Vitamins</span>
                        <strong>{selectedDishNutrition.vitamins}mg</strong>
                      </li>
                      <li>
                        <span>Sodium</span>
                        <strong>{selectedDishNutrition.sodium}mg</strong>
                      </li>
                    </ul>
                  </>
                ) : (
                  <p className="selected-dish-empty">
                    Select a dish card to see its individual nutrition.
                  </p>
                )}
              </div>

              <div className="nutrition-section total-nutrition-section">
                <h4>Total Nutrition</h4>
                <p>Total items selected: {selectedCount}</p>
                <ul className="nutrition-kpi-list">
                  <li>
                    <span>Calories</span>
                    <strong>{totalNutrition.calories} kcal</strong>
                  </li>
                  <li>
                    <span>Proteins</span>
                    <strong>{totalNutrition.proteins}g</strong>
                  </li>
                  <li>
                    <span>Fats</span>
                    <strong>{totalNutrition.fats}g</strong>
                  </li>
                  <li>
                    <span>Vitamins</span>
                    <strong>{totalNutrition.vitamins}mg</strong>
                  </li>
                  <li>
                    <span>Sodium</span>
                    <strong>{totalNutrition.sodium}mg</strong>
                  </li>
                </ul>
              </div>

              <div className="panel-action-list">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/dashboard", {
                      state: {
                        selectedItems: selectedMeals,
                        totalNutrition,
                      },
                    })
                  }
                >
                  View Meal Plan
                </button>
                <button type="button" onClick={() => navigate("/weekly-plan")}>
                  View Full Weekly Meal Plan
                </button>
              </div>
            </div>
          </aside>
        </div>
        </>)}

        {activeTab === 'personalizedPlan' && (
          <div className="personalized-plan-section">
            <PersonalizedPlanForm
              onGenerate={handleGeneratePlan}
              onExport={planFilters ? handleExportPDF : undefined}
              loading={false}
            />
            {planFilters && (
              <PersonalizedWeeklyPlan
                filters={planFilters}
                onExport={handleExportPDF}
                showExport={true}
              />
            )}
          </div>
        )}
      </div>

      <div
        ref={widgetFabRef}
        className="widget-fab-stack tts-ignore"
        data-tts-ignore="true"
        style={{ bottom: `${widgetFabBottom}px` }}
      >
        <div className={`widget-fab-actions ${isWidgetMenuOpen ? "open" : ""}`}>
          <button
            type="button"
            className="widget-fab-action widget-fab-shopping"
            onClick={() => {
              setIsWidgetMenuOpen(false);
              navigate("/shopping-list", {
                state: {
                  selectedItems: selectedMeals,
                  totalNutrition,
                },
              });
            }}
            aria-label="Go to Shopping List"
            title="Shopping List"
          >
            <ShoppingCart size={18} />
          </button>
          <button
            type="button"
            className="widget-fab-action widget-fab-calculator"
            onClick={() => {
              setIsWidgetMenuOpen(false);
              navigate("/nutrition-calculator");
            }}
            aria-label="Go to Nutrition Calculator"
            title="Nutrition Calculator"
          >
            <Calculator size={18} />
          </button>
        </div>

        <button
          type="button"
          className={`widget-fab-main ${isWidgetMenuOpen ? "open" : ""}`}
          onClick={() => setIsWidgetMenuOpen((previous) => !previous)}
          aria-label="Widget"
          title="Widget"
          aria-expanded={isWidgetMenuOpen}
        >
          <Settings2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default Meal;
