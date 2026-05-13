import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Boxes,
  Database,
  FileText,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  Utensils,
  X,
} from "lucide-react";
import {
  createMealCatalogEntry,
  createMealIngredient,
  deleteRecipeLibraryImportQueueRow,
  deleteRecipeLibraryItem,
  deleteMealCatalogEntry,
  deleteMealIngredient,
  downloadRecipeLibraryImportTemplate,
  enrichRecipeLibraryBatch,
  fetchAllUserRecipes,
  fetchAdminUserRoles,
  fetchMealCatalog,
  fetchMealIngredientsMap,
  fetchPendingCommunityRecipes,
  fetchRecipeLibraryAdmin,
  fetchRecipeLibraryImportQueue,
  fetchRecipeLibraryMissingImages,
  fetchReferenceData,
  importRecipeLibraryDishNames,
  importRecipeLibraryDishRows,
  approveRecipeLibraryImportQueueRows,
  permanentlyDeleteRecipeLibraryItem,
  publishRecipeLibraryCatalog,
  recoverRecipeLibraryImportQueueRow,
  recoverRecipeLibraryItem,
  trashRecipeLibraryImportQueueRow,
  unpublishRecipeLibraryCatalog,
  updateUserRecipeVisibility,
  updateRecipeLibraryImportQueueRow,
  updateMealCatalogEntry,
  updateMealIngredient,
  updateAdminUserRole,
} from "../../services/adminDataApi";
import { deleteRecipeReviewByAdmin, fetchRecipeReviewFeed } from "../../services/recipeReviewApi";
import "./AdminDataCenter.css";

const TAB_CONFIG = {
  kpi: {
    icon: BarChart3,
    label: "KPI Dashboard",
    meta: "metrics overview",
  },
  recipes: {
    icon: BookOpen,
    label: "Recipes",
    meta: "all user-created",
  },
  roles: {
    icon: Users,
    label: "User Roles",
    meta: "access control",
  },
  references: {
    icon: Database,
    label: "Reference Data",
    meta: "taxonomy",
  },
  library: {
    icon: BookOpen,
    label: "Recipe Library",
    meta: "import + publish flow",
  },
  community: {
    icon: ShieldCheck,
    label: "Community Review",
    meta: "pending moderation",
  },
  trash: {
    icon: Trash2,
    label: "Trash",
    meta: "recover or delete permanently",
  },
};

const DEFAULT_MEAL_FORM = {
  id: "",
  recipe_name: "",
  meal_type: "breakfast",
  dietary_tags: "",
  instructions: "",
  ingredients: "[]",
  notes: "",
  calories: "0",
  protein: "0",
  fat: "0",
  carbohydrates: "0",
  fiber: "0",
  sugar: "0",
  vitamin_a: "0",
  vitamin_c: "0",
  is_published: "True",
};

const DEFAULT_INGREDIENT_FORM = {
  recipe_id: "",
  ingredient_name: "",
  amount: "",
};

const DEFAULT_IMPORT_FORM = {
  names: "",
  meal_type: "",
  cuisine_hint: "",
  cooking_method_hint: "",
  admin_notes: "",
  recipe_name: "",
  description: "",
  servings: "",
  calories: "",
  ingredients: "",
  instructions: "",
};

const DEFAULT_QUEUE_EDIT_FORM = {
  dish_name: "",
  meal_type: "",
  cuisine_hint: "",
  cooking_method_hint: "",
  admin_notes: "",
  recipe_name: "",
  description: "",
  difficulty: "",
  spice_level: "",
  prep_time_minutes: "",
  cook_time_minutes: "",
  servings: "",
  serving_size: "",
  calories: "",
  protein: "",
  fat: "",
  carbohydrates: "",
  fiber: "",
  sugar: "",
  sodium: "",
  ingredients: "",
  instructions: "",
  dietary_tags: "",
  allergens: "",
  image_url: "",
};

const DEFAULT_USER_RECIPE_FILTERS = {
  recipeId: "",
  recipeName: "",
  userId: "",
  visibility: "",
  cuisine: "",
  preparationTime: "",
  servings: "",
  imageStatus: "",
  createdFrom: "",
  createdTo: "",
};

const DEFAULT_MISSING_QUEUE_FILTERS = {
  dish: "",
  status: "",
  dataStatus: "",
  missingFields: "",
  error: "",
};

const DEFAULT_LIBRARY_FILTERS = {
  id: "",
  recipe: "",
  visibility: "",
  status: "",
  imageStatus: "",
  mealType: "",
};

const DEFAULT_COMMUNITY_REVIEW_FILTERS = {
  query: "",
  sourceType: "all",
  rating: "all",
  sort: "newest",
};

const DEFAULT_USER_ROLE_FILTERS = {
  userId: "",
  displayName: "",
  email: "",
  role: "",
  accountStatus: "",
  createdFrom: "",
  createdTo: "",
};

const IMPORT_QUEUE_MEAL_TYPES = ["", "breakfast", "lunch", "dinner", "other"];
const TRASH_REASON_PREFIX = "Moved to Trash";

function normalizeMealTypeValue(value, fallback = "") {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return fallback;
  if (normalized === "breakfast" || normalized === "lunch" || normalized === "dinner" || normalized === "other") {
    return normalized;
  }
  if (
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
  return fallback;
}

function normalizeHeaderKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s\-./]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function firstNonEmpty(source, keys) {
  for (const key of keys) {
    const value = String(source?.[key] ?? "").trim();
    if (value) return value;
  }
  return "";
}

function mapImportRow(rawRow) {
  const normalized = {};
  Object.entries(rawRow || {}).forEach(([key, value]) => {
    normalized[normalizeHeaderKey(key)] = String(value ?? "").trim();
  });

  const dishName = firstNonEmpty(normalized, [
    "dish_name",
    "dishname",
    "dish",
    "recipe_name",
    "recipename",
    "name",
  ]);
  const mealType = normalizeMealTypeValue(firstNonEmpty(normalized, ["meal_type", "mealtype"]), "");
  const cuisineHint = firstNonEmpty(normalized, ["cuisine_hint", "cuisine", "cuisine_name"]);
  const cookingMethodHint = firstNonEmpty(normalized, [
    "cooking_method_hint",
    "cooking_method",
    "method_hint",
    "method",
  ]);
  const adminNotes = firstNonEmpty(normalized, ["admin_notes", "notes", "note"]);
  const recipeName = firstNonEmpty(normalized, ["recipe_name", "recipe", "name"]);
  const description = firstNonEmpty(normalized, ["description", "desc"]);
  const difficulty = firstNonEmpty(normalized, ["difficulty"]);
  const spiceLevel = firstNonEmpty(normalized, ["spice_level", "spice"]);
  const servings = firstNonEmpty(normalized, ["servings", "total_servings"]);
  const prepTimeMinutes = firstNonEmpty(normalized, ["prep_time_minutes", "prep_time"]);
  const cookTimeMinutes = firstNonEmpty(normalized, ["cook_time_minutes", "cook_time"]);
  const servingSize = firstNonEmpty(normalized, ["serving_size"]);
  const ingredients = firstNonEmpty(normalized, ["ingredients_json", "ingredients"]);
  const instructions = firstNonEmpty(normalized, ["instructions_json", "instructions"]);
  const dietaryTags = firstNonEmpty(normalized, ["dietary_tags_csv", "dietary_tags"]);
  const allergens = firstNonEmpty(normalized, ["allergens_csv", "allergens"]);
  const calories = firstNonEmpty(normalized, ["calories"]);
  const protein = firstNonEmpty(normalized, ["protein"]);
  const fat = firstNonEmpty(normalized, ["fat"]);
  const carbohydrates = firstNonEmpty(normalized, ["carbohydrates"]);
  const fiber = firstNonEmpty(normalized, ["fiber"]);
  const sugar = firstNonEmpty(normalized, ["sugar"]);
  const sodium = firstNonEmpty(normalized, ["sodium"]);
  const imageUrl = firstNonEmpty(normalized, ["image_url"]);
  const equipment = firstNonEmpty(normalized, ["equipment_csv", "equipment"]);
  const tips = firstNonEmpty(normalized, ["tips_csv", "tips"]);
  const healthTags = firstNonEmpty(normalized, ["health_tags_csv", "health_tags"]);
  const avoidForConditions = firstNonEmpty(normalized, ["avoid_for_conditions_csv", "avoid_for_conditions"]);
  const suitableGoals = firstNonEmpty(normalized, ["suitable_goals_csv", "suitable_goals"]);

  return {
    dish_name: dishName,
    meal_type: mealType,
    cuisine_hint: cuisineHint,
    cooking_method_hint: cookingMethodHint,
    admin_notes: adminNotes,
    recipe_name: recipeName,
    description: description,
    difficulty: difficulty,
    spice_level: spiceLevel,
    prep_time_minutes: prepTimeMinutes,
    cook_time_minutes: cookTimeMinutes,
    servings: servings,
    serving_size: servingSize,
    ingredients: ingredients,
    instructions: instructions,
    dietary_tags: dietaryTags,
    health_tags: healthTags,
    allergens: allergens,
    avoid_for_conditions: avoidForConditions,
    suitable_goals: suitableGoals,
    calories: calories,
    protein: protein,
    fat: fat,
    carbohydrates: carbohydrates,
    fiber: fiber,
    sugar: sugar,
    sodium: sodium,
    image_url: imageUrl,
    equipment: equipment,
    tips: tips,
  };
}

function normalizeMealPayload(form) {
  return {
    id: String(form.id || "").trim(),
    recipe_name: String(form.recipe_name || "").trim(),
    meal_type: normalizeMealTypeValue(form.meal_type, "breakfast"),
    dietary_tags: String(form.dietary_tags || "").trim(),
    instructions: String(form.instructions || "").trim(),
    ingredients: String(form.ingredients || "[]").trim(),
    notes: String(form.notes || "").trim() || null,
    calories: String(form.calories || "0").trim(),
    protein: String(form.protein || "0").trim(),
    fat: String(form.fat || "0").trim(),
    carbohydrates: String(form.carbohydrates || "0").trim(),
    fiber: String(form.fiber || "0").trim(),
    sugar: String(form.sugar || "0").trim(),
    vitamin_a: String(form.vitamin_a || "0").trim(),
    vitamin_c: String(form.vitamin_c || "0").trim(),
    is_published: String(form.is_published || "False").trim(),
  };
}

function normalizeIngredientPayload(form) {
  return {
    recipe_id: String(form.recipe_id || "").trim(),
    ingredient_name: String(form.ingredient_name || "").trim(),
    amount: String(form.amount || "").trim(),
  };
}

function matchesSearch(values, query) {
  if (!query) return true;
  return values
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ")
    .includes(query);
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(
    Number(value) || 0
  );
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function parseDateBoundary(value, endOfDay = false) {
  if (!value) return null;
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hasUserRecipeImage(row) {
  return Boolean(String(row?.image_url || "").trim() || row?.image_id);
}

function normalizeUserRecipeVisibility(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "community_pending" || normalized === "pending") return "community_pending";
  if (normalized === "community" || normalized === "published") return "community";
  if (normalized === "community_rejected" || normalized === "rejected") return "community_rejected";
  return "user_private";
}

function getUserRecipeVisibilityLabel(value) {
  const normalized = normalizeUserRecipeVisibility(value);
  if (normalized === "community") return "Community";
  if (normalized === "community_pending") return "Community pending";
  if (normalized === "community_rejected") return "Community rejected";
  return "User private";
}

function getUserRecipeVisibilityTone(value) {
  const normalized = normalizeUserRecipeVisibility(value);
  if (normalized === "community") return "info";
  if (normalized === "community_pending") return "warning";
  if (normalized === "community_rejected") return "danger";
  return "neutral";
}

function normalizeQueueStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function getQueueRowId(row) {
  const raw = row?.id ?? row?.queue_id ?? row?.queueId ?? row?.import_queue_id ?? "";
  return String(raw || "").trim();
}

function isTrashQueueRow(row) {
  return (
    normalizeQueueStatus(row?.status) === "rejected" &&
    String(row?.error_message || "").startsWith(TRASH_REASON_PREFIX)
  );
}

function getImportedItemStatusLabel(status) {
  const normalized = normalizeQueueStatus(status);
  if (normalized === "enriching") return "in progress";
  if (normalized === "rejected") return "canceled";
  if (normalized === "imported") return "completed";
  if (normalized === "enriched") return "ready to approve";
  if (normalized === "queued") return "pending";
  return normalized || "-";
}

function getQueueReviewStatusLabel(row) {
  const status = normalizeQueueStatus(row?.status);
  const completeness = normalizeQueueCompleteness(row?.completeness_status);
  if (completeness === "ready" && (status === "pending" || status === "queued" || status === "failed" || status === "enriched")) {
    return "ready to approve";
  }
  if (completeness !== "ready" && status === "enriched") return "enriched (still missing data)";
  return getImportedItemStatusLabel(status);
}

function normalizeQueueCompleteness(value) {
  return String(value || "").trim().toLowerCase();
}

function getCompletenessLabel(value) {
  return normalizeQueueCompleteness(value) === "ready" ? "Data ready" : "Missing data";
}

function toCsvText(value) {
  if (Array.isArray(value)) return value.join(", ");
  return String(value || "").trim();
}

function toJsonText(value) {
  if (Array.isArray(value)) {
    try {
      return JSON.stringify(value, null, 2);
    } catch (_error) {
      return "";
    }
  }
  return String(value || "").trim();
}

function normalizeRecipeLibraryStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function getRecipeLibraryStatusLabel(status) {
  const normalized = normalizeRecipeLibraryStatus(status);
  if (normalized === "needs_review") return "Need review";
  if (normalized === "reviewed") return "Reviewed";
  if (normalized === "published") return "Published";
  if (normalized === "user_private") return "Private";
  if (normalized === "private") return "Private";
  if (normalized === "draft") return "Draft";
  if (normalized === "rejected") return "Rejected";
  if (!normalized) return "-";
  return normalized.replace(/_/g, " ");
}

function getRecipeLibraryStatusTone(status) {
  const normalized = normalizeRecipeLibraryStatus(status);
  if (normalized === "published" || normalized === "reviewed") return "good";
  if (normalized === "needs_review") return "warning";
  if (normalized === "rejected") return "danger";
  if (normalized === "draft" || normalized === "private" || normalized === "user_private") return "neutral";
  return "info";
}

function isRecipeLibraryTrashed(row) {
  if (row?.trashed_at) return true;
  const reason = String(row?.trash_reason || row?.moderation_reason || "");
  return (
    normalizeRecipeLibraryStatus(row?.data_status) === "rejected" &&
    reason.trim().toLowerCase().startsWith(TRASH_REASON_PREFIX.toLowerCase())
  );
}

function getRecipeLibraryVisibilityLabel(visibility) {
  const normalized = normalizeRecipeLibraryStatus(visibility);
  if (normalized === "public") return "Public";
  if (normalized === "community") return "Community";
  if (normalized === "community_pending") return "Community pending";
  if (normalized === "private") return "Private";
  if (normalized === "user_private") return "Private";
  if (!normalized) return "-";
  return normalized.replace(/_/g, " ");
}

function getRecipeLibraryVisibilityTone(visibility) {
  const normalized = normalizeRecipeLibraryStatus(visibility);
  if (normalized === "public") return "good";
  if (normalized === "community") return "info";
  if (normalized === "community_pending") return "warning";
  if (normalized === "private" || normalized === "user_private") return "neutral";
  return "info";
}

function hasRecipeImage(row) {
  return Boolean(String(row?.image_url || "").trim());
}

function normalizeReviewSourceType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "recipe_library") return "recipe_library";
  if (normalized === "community") return "community";
  return "";
}

function getReviewSourceLabel(value) {
  const normalized = normalizeReviewSourceType(value);
  if (normalized === "recipe_library") return "Recipe Library";
  if (normalized === "community") return "Community";
  return "Unknown";
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isQueueRowStillNeedsEnrichment(row) {
  const status = normalizeQueueStatus(row?.status);
  const completeness = normalizeQueueCompleteness(row?.completeness_status);
  return (
    completeness === "missing_data" &&
    (status === "pending" || status === "queued" || status === "failed" || status === "enriched")
  );
}

function isQueueRowWaitingForEnrichment(row) {
  const status = normalizeQueueStatus(row?.status);
  const completeness = normalizeQueueCompleteness(row?.completeness_status);
  return completeness === "missing_data" && (status === "pending" || status === "queued" || status === "enriching");
}

export default function AdminDataCenter() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("kpi");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [mealCatalog, setMealCatalog] = useState([]);
  const [mealIngredients, setMealIngredients] = useState([]);
  const [referenceData, setReferenceData] = useState({
    cuisines: [],
    ingredients: [],
    cookingMethods: [],
  });

  const [userRecipes, setUserRecipes] = useState([]);
  const [userRecipeFilters, setUserRecipeFilters] = useState(DEFAULT_USER_RECIPE_FILTERS);
  const [userRoleRows, setUserRoleRows] = useState([]);
  const [userRoleFilters, setUserRoleFilters] = useState(DEFAULT_USER_ROLE_FILTERS);
  const [recipeLibrary, setRecipeLibrary] = useState([]);
  const [missingQueueFilters, setMissingQueueFilters] = useState(DEFAULT_MISSING_QUEUE_FILTERS);
  const [recipeLibraryFilters, setRecipeLibraryFilters] = useState(DEFAULT_LIBRARY_FILTERS);
  const [communityReviewFilters, setCommunityReviewFilters] = useState(DEFAULT_COMMUNITY_REVIEW_FILTERS);
  const [trashedRecipeLibrary, setTrashedRecipeLibrary] = useState([]);
  const [pendingCommunity, setPendingCommunity] = useState([]);
  const [communityReviewFeedRows, setCommunityReviewFeedRows] = useState([]);
  const [communityReviewSummary, setCommunityReviewSummary] = useState({
    averageRating: null,
    reviewCount: 0,
    reviewedRecipeCount: 0,
    ratingBreakdown: {},
  });
  const [isCommunityReviewLoading, setIsCommunityReviewLoading] = useState(false);
  const [importQueue, setImportQueue] = useState([]);
  const [trashQueue, setTrashQueue] = useState([]);
  const [selectedRecipeLibraryIds, setSelectedRecipeLibraryIds] = useState([]);
  const [selectedRecipeLibraryTrashIds, setSelectedRecipeLibraryTrashIds] = useState([]);
  const [selectedMissingQueueIds, setSelectedMissingQueueIds] = useState([]);
  const [selectedTrashQueueIds, setSelectedTrashQueueIds] = useState([]);
  const [importForm, setImportForm] = useState(DEFAULT_IMPORT_FORM);
  const [importFile, setImportFile] = useState(null);
  const [enrichmentLimit, setEnrichmentLimit] = useState("10");
  const [autoEnrichOnImport, setAutoEnrichOnImport] = useState(false);
  const [isImportPreviewOpen, setIsImportPreviewOpen] = useState(false);
  const [isImportPreviewLoading, setIsImportPreviewLoading] = useState(false);
  const [importPreviewRows, setImportPreviewRows] = useState([]);
  const [editingPreviewCell, setEditingPreviewCell] = useState(null);
  const [importPreviewError, setImportPreviewError] = useState("");
  const [editingQueueRow, setEditingQueueRow] = useState(null);
  const [queueEditForm, setQueueEditForm] = useState(DEFAULT_QUEUE_EDIT_FORM);
  const [importProgress, setImportProgress] = useState({
    phase: "idle",
    running: false,
    total: 0,
    success: 0,
    failed: 0,
    message: "Waiting for import action.",
    updatedAt: null,
  });

  const [mealForm, setMealForm] = useState(DEFAULT_MEAL_FORM);
  const [editingMealId, setEditingMealId] = useState("");

  const [ingredientForm, setIngredientForm] = useState(DEFAULT_INGREDIENT_FORM);
  const [editingIngredientKey, setEditingIngredientKey] = useState("");
  const [editingIngredientRow, setEditingIngredientRow] = useState(null);

  const ingredientRowKey = (row) =>
    `${row?.recipe_id || ""}|${row?.ingredient_name || ""}|${row?.amount || ""}`;

  const loadCommunityReviewFeed = useCallback(async (filters = DEFAULT_COMMUNITY_REVIEW_FILTERS) => {
    setIsCommunityReviewLoading(true);
    try {
      const response = await fetchRecipeReviewFeed({
        sort: filters.sort,
        sourceType: filters.sourceType,
        rating: filters.rating,
        limit: 300,
      });
      setCommunityReviewFeedRows(Array.isArray(response?.items) ? response.items : []);
      setCommunityReviewSummary(
        response?.summary || {
          averageRating: null,
          reviewCount: 0,
          reviewedRecipeCount: 0,
          ratingBreakdown: {},
        }
      );
    } catch (err) {
      setCommunityReviewFeedRows([]);
      setCommunityReviewSummary({
        averageRating: null,
        reviewCount: 0,
        reviewedRecipeCount: 0,
        ratingBreakdown: {},
      });
      setError(err.message || "Failed to load community review feed.");
    } finally {
      setIsCommunityReviewLoading(false);
    }
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    setError("");
    setTrashedRecipeLibrary([]);
    setTrashQueue([]);
    try {
      const [catalog, ingredients, refs, userRecipeRows, userRolesResponse, library, trashedLibrary, pending, queue, trash] = await Promise.all([
        fetchMealCatalog(),
        fetchMealIngredientsMap(),
        fetchReferenceData(),
        fetchAllUserRecipes(),
        fetchAdminUserRoles({ limit: 3000 }),
        fetchRecipeLibraryAdmin({ limit: 300 }),
        fetchRecipeLibraryAdmin({ scope: "trash", limit: 300 }),
        fetchPendingCommunityRecipes(),
        fetchRecipeLibraryImportQueue({ limit: 300 }),
        fetchRecipeLibraryImportQueue({ status: "rejected", limit: 300 }),
      ]);
      setMealCatalog(catalog);
      setMealIngredients(ingredients);
      setReferenceData(refs);
      setUserRecipes(userRecipeRows);
      setUserRoleRows(Array.isArray(userRolesResponse?.rows) ? userRolesResponse.rows : []);
      setRecipeLibrary(library);
      setTrashedRecipeLibrary(trashedLibrary);
      setPendingCommunity(pending);
      const activeQueueRows = queue.filter((row) => !isTrashQueueRow(row));
      setImportQueue(activeQueueRows);
      setTrashQueue(trash.filter(isTrashQueueRow));
      setSelectedRecipeLibraryIds([]);
      setSelectedRecipeLibraryTrashIds([]);
      setSelectedMissingQueueIds([]);
      setSelectedTrashQueueIds([]);
      setLastSyncedAt(new Date());
      if (activeTab === "community") {
        loadCommunityReviewFeed(communityReviewFilters);
      }
    } catch (err) {
      setError(err.message || "Failed to load admin data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (activeTab !== "community") return;
    loadCommunityReviewFeed(communityReviewFilters);
  }, [
    activeTab,
    communityReviewFilters.rating,
    communityReviewFilters.sort,
    communityReviewFilters.sourceType,
    loadCommunityReviewFeed,
  ]);

  const onMealFormChange = (key, value) => {
    setMealForm((prev) => ({ ...prev, [key]: value }));
  };

  const onIngredientFormChange = (key, value) => {
    setIngredientForm((prev) => ({ ...prev, [key]: value }));
  };

  const onImportFormChange = (key, value) => {
    setImportForm((prev) => ({ ...prev, [key]: value }));
  };

  const onUserRecipeFilterChange = (key, value) => {
    setUserRecipeFilters((prev) => ({ ...prev, [key]: value }));
  };

  const onUserRoleFilterChange = (key, value) => {
    setUserRoleFilters((prev) => ({ ...prev, [key]: value }));
  };

  const onMissingQueueFilterChange = (key, value) => {
    setMissingQueueFilters((prev) => ({ ...prev, [key]: value }));
  };

  const onRecipeLibraryFilterChange = (key, value) => {
    setRecipeLibraryFilters((prev) => ({ ...prev, [key]: value }));
  };

  const onCommunityReviewFilterChange = (key, value) => {
    setCommunityReviewFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetUserRecipeFilters = () => {
    setUserRecipeFilters(DEFAULT_USER_RECIPE_FILTERS);
  };

  const resetUserRoleFilters = () => {
    setUserRoleFilters(DEFAULT_USER_ROLE_FILTERS);
  };

  const resetMissingQueueFilters = () => {
    setMissingQueueFilters(DEFAULT_MISSING_QUEUE_FILTERS);
  };

  const resetRecipeLibraryFilters = () => {
    setRecipeLibraryFilters(DEFAULT_LIBRARY_FILTERS);
  };

  const resetCommunityReviewFilters = () => {
    setCommunityReviewFilters(DEFAULT_COMMUNITY_REVIEW_FILTERS);
  };

  const handleUserRecipeVisibilityChange = async (row, visibility) => {
    const recipeId = row?.id;
    if (!recipeId) {
      setError("Invalid user recipe id.");
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const updatedRecipe = await updateUserRecipeVisibility(recipeId, visibility);
      setUserRecipes((prev) =>
        prev.map((item) =>
          Number(item?.id) === Number(recipeId)
            ? {
                ...item,
                ...(updatedRecipe && typeof updatedRecipe === "object" ? updatedRecipe : {}),
                recipe_visibility: normalizeUserRecipeVisibility(visibility),
              }
            : item
        )
      );
      setSuccess(`Updated recipe ${recipeId} visibility to ${getUserRecipeVisibilityLabel(visibility)}.`);
    } catch (err) {
      setError(err.message || "Failed to update user recipe visibility.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserRoleChange = async (row, roleName) => {
    const userId = Number(row?.user_id);
    if (!Number.isFinite(userId) || userId <= 0) {
      setError("Invalid user id.");
      return;
    }

    const normalizedRole = String(roleName || "").trim().toLowerCase();
    if (!normalizedRole) {
      setError("Role is required.");
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const updated = await updateAdminUserRole(userId, normalizedRole);
      setUserRoleRows((prev) =>
        prev.map((item) =>
          Number(item?.user_id) === userId
            ? {
                ...item,
                ...(updated && typeof updated === "object" ? updated : {}),
                role_name: normalizedRole,
              }
            : item
        )
      );
      setSuccess(`Updated role for user ${userId} to ${normalizedRole}.`);
    } catch (err) {
      setError(err.message || "Failed to update user role.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetMealForm = () => {
    setMealForm(DEFAULT_MEAL_FORM);
    setEditingMealId("");
  };

  const resetIngredientForm = () => {
    setIngredientForm(DEFAULT_INGREDIENT_FORM);
    setEditingIngredientKey("");
    setEditingIngredientRow(null);
  };

  const buildImportPreviewFromFile = useCallback(async (file) => {
    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: "array" });
    const sheetName = workbook.SheetNames?.[0];
    if (!sheetName) {
      return { rows: [], totalRows: 0, validRows: 0, invalidRows: 0 };
    }

    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false,
    });

    const mappedRows = rawRows
      .map((row) => mapImportRow(row))
      .filter((row) =>
        [
          row.dish_name,
          row.recipe_name,
          row.meal_type,
          row.cuisine_hint,
          row.cooking_method_hint,
          row.admin_notes,
          row.ingredients,
          row.instructions,
        ].some(Boolean)
      )
      .map((row, index) => ({
        ...row,
        previewId: `${Date.now()}-${index}`,
      }));

    const validRows = mappedRows.filter((row) => String(row.dish_name || "").trim()).length;
    const invalidRows = Math.max(0, mappedRows.length - validRows);

    return {
      rows: mappedRows,
      totalRows: mappedRows.length,
      validRows,
      invalidRows,
    };
  }, []);

  const refreshRecipeLibraryQueues = useCallback(async () => {
    const [library, trashedLibrary, queue, pending, trash] = await Promise.all([
      fetchRecipeLibraryAdmin({ limit: 300 }),
      fetchRecipeLibraryAdmin({ scope: "trash", limit: 300 }),
      fetchRecipeLibraryImportQueue({ limit: 300 }),
      fetchPendingCommunityRecipes(),
      fetchRecipeLibraryImportQueue({ status: "rejected", limit: 300 }),
    ]);
    setRecipeLibrary(library);
    setTrashedRecipeLibrary(trashedLibrary);
    setImportQueue(queue.filter((row) => !isTrashQueueRow(row)));
    setTrashQueue(trash.filter(isTrashQueueRow));
    setPendingCommunity(pending);
    setSelectedRecipeLibraryIds([]);
    setSelectedRecipeLibraryTrashIds([]);
    setSelectedMissingQueueIds([]);
    setSelectedTrashQueueIds([]);
    setLastSyncedAt(new Date());
    return { library, trashedLibrary, queue, pending, trash };
  }, []);

  const countPendingQueueRows = useCallback((rows) => {
    return (Array.isArray(rows) ? rows : []).filter((row) => {
      const status = normalizeQueueStatus(row?.status);
      return status === "pending" || status === "queued";
    }).length;
  }, []);

  const runEnrichmentLoop = useCallback(async (input = {}) => {
    const batchSize = Math.max(1, Math.min(50, Number(enrichmentLimit) || 10));
    const maxRounds = 120;
    const selectedQueueIds = Array.isArray(input.queueIds) ? input.queueIds.filter(Boolean) : [];

    const queueSnapshot = await fetchRecipeLibraryImportQueue({ limit: 300 }).catch(() => []);
    const enrichableStatuses = new Set(["pending", "queued", "failed", "enriched"]);
    const targetRows = selectedQueueIds.length
      ? queueSnapshot.filter(
          (row) =>
            selectedQueueIds.includes(getQueueRowId(row)) &&
            enrichableStatuses.has(normalizeQueueStatus(row?.status)) &&
            isQueueRowStillNeedsEnrichment(row)
        )
      : queueSnapshot.filter(
          (row) =>
            normalizeQueueStatus(row?.status) === "pending" &&
            isQueueRowStillNeedsEnrichment(row)
        );
    const initialPending = targetRows.length;

    if (initialPending <= 0) {
      setImportProgress({
        phase: "enriched",
        running: false,
        total: 0,
        success: 0,
        failed: 0,
        message: "No rows eligible for AI enrich.",
        updatedAt: new Date().toISOString(),
      });
      return {
        processed: 0,
        successCount: 0,
        failedCount: 0,
        remaining: 0,
        initialPending: 0,
        completed: 0,
        pausedByQuota: false,
      };
    }

    let processed = 0;
    let successCount = 0;
    let failedCount = 0;
    let remaining = initialPending;
    let pausedByQuota = false;
    let quotaPauseReason = "";

    setImportProgress({
      phase: "enriching",
      running: true,
      total: initialPending,
      success: 0,
      failed: 0,
      message: `AI enrichment started (${initialPending} row(s)).`,
      updatedAt: new Date().toISOString(),
    });

    for (let round = 1; round <= maxRounds; round += 1) {
      if (remaining <= 0) break;

      const idsForRound = selectedQueueIds.length ? targetRows.map((row) => getQueueRowId(row)).filter(Boolean) : [];
      const batchResponse = await enrichRecipeLibraryBatch(
        Math.min(batchSize, remaining),
        selectedQueueIds.length ? idsForRound : []
      );
      const batchRows = Array.isArray(batchResponse?.rows) ? batchResponse.rows : [];
      const roundPausedByQuota = Boolean(batchResponse?.pausedByQuota);
      const roundPauseReason = String(batchResponse?.pauseReason || "");
      if (batchRows.length === 0 && !roundPausedByQuota) break;

      const batchFailed = batchRows.filter((row) => normalizeQueueStatus(row?.status) === "failed").length;
      const batchSuccess = batchRows.filter((row) => normalizeQueueStatus(row?.status) === "enriched").length;

      processed += batchRows.length;
      successCount += batchSuccess;
      failedCount += batchFailed;

      let refreshed = await refreshRecipeLibraryQueues();
      let refreshedRows = selectedQueueIds.length
        ? refreshed.queue.filter((row) => selectedQueueIds.includes(getQueueRowId(row)))
        : refreshed.queue;
      remaining = selectedQueueIds.length
        ? refreshedRows.filter(isQueueRowWaitingForEnrichment).length
        : countPendingQueueRows(refreshedRows);

      setImportProgress({
        phase: roundPausedByQuota ? "paused" : "enriching",
        running: !roundPausedByQuota,
        total: initialPending,
        success: successCount,
        failed: failedCount,
        message: roundPausedByQuota
          ? `Quota exceeded. Paused after round ${round}; enriched ${successCount}, failed ${failedCount}, remaining ${remaining}.`
          : `Round ${round}: enriched ${successCount}, failed ${failedCount}, remaining ${remaining}.`,
        updatedAt: new Date().toISOString(),
      });

      if (roundPausedByQuota) {
        pausedByQuota = true;
        quotaPauseReason = roundPauseReason;
        break;
      }

      if (selectedQueueIds.length) break;
      await sleep(400);
    }

    const finalSnapshot = await refreshRecipeLibraryQueues();
    const finalRows = selectedQueueIds.length
      ? finalSnapshot.queue.filter((row) => selectedQueueIds.includes(getQueueRowId(row)))
      : finalSnapshot.queue;
    remaining = selectedQueueIds.length
      ? finalRows.filter(isQueueRowWaitingForEnrichment).length
      : countPendingQueueRows(finalRows);
    const completed = Math.max(0, initialPending - remaining);

    setImportProgress({
      phase: pausedByQuota ? "paused" : failedCount > 0 || remaining > 0 ? "failed" : "enriched",
      running: false,
      total: initialPending,
      success: successCount,
      failed: failedCount,
      message: pausedByQuota
        ? `Paused due to AI quota/rate limit. Enriched ${successCount}, failed ${failedCount}, ${remaining} still pending.${quotaPauseReason ? ` Reason: ${quotaPauseReason}` : ""}`
        : remaining > 0
          ? `Partial enrichment: ${successCount} enriched, ${failedCount} failed, ${remaining} still pending.`
          : `Enrichment finished: ${successCount} enriched, ${failedCount} failed.`,
      updatedAt: new Date().toISOString(),
    });

    return {
      processed,
      successCount,
      failedCount,
      remaining,
      initialPending,
      completed,
      pausedByQuota,
      pauseReason: quotaPauseReason,
    };
  }, [countPendingQueueRows, enrichmentLimit, refreshRecipeLibraryQueues]);

  const handleSaveMeal = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const payload = normalizeMealPayload(mealForm);
    if (!payload.recipe_name) {
      setError("Recipe name is required.");
      return;
    }

    if (!payload.instructions) {
      setError("Instructions are required.");
      return;
    }

    setIsLoading(true);
    try {
      if (editingMealId) {
        await updateMealCatalogEntry(editingMealId, payload);
        setSuccess(`Updated recipe id ${editingMealId}.`);
      } else {
        await createMealCatalogEntry(payload, mealCatalog);
        setSuccess("Created meal catalog entry.");
      }
      resetMealForm();
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Failed to save meal catalog entry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMeal = (row) => {
    setEditingMealId(String(row?.id || ""));
    setMealForm({
      id: String(row?.id || ""),
      recipe_name: String(row?.recipe_name || ""),
      meal_type: normalizeMealTypeValue(row?.meal_type, "breakfast"),
      dietary_tags: String(row?.dietary_tags || ""),
      instructions: String(row?.instructions || ""),
      ingredients: String(row?.ingredients || "[]"),
      notes: String(row?.notes || ""),
      calories: String(row?.calories || "0"),
      protein: String(row?.protein || "0"),
      fat: String(row?.fat || "0"),
      carbohydrates: String(row?.carbohydrates || "0"),
      fiber: String(row?.fiber || "0"),
      sugar: String(row?.sugar || "0"),
      vitamin_a: String(row?.vitamin_a || "0"),
      vitamin_c: String(row?.vitamin_c || "0"),
      is_published: String(row?.is_published || "False"),
    });
  };

  const handleDeleteMeal = async (row) => {
    const id = String(row?.id || "");
    if (!id) {
      setError("This row has empty id, cannot delete safely.");
      return;
    }

    if (!window.confirm(`Delete recipe id ${id}?`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await deleteMealCatalogEntry(id);
      setSuccess(`Deleted recipe id ${id}.`);
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Failed to delete meal catalog entry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIngredient = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const payload = normalizeIngredientPayload(ingredientForm);
    const recipeIdNum = Number(payload.recipe_id);

    if (!Number.isInteger(recipeIdNum) || recipeIdNum <= 0) {
      setError("Recipe ID must be a positive integer.");
      return;
    }
    if (!payload.ingredient_name) {
      setError("Ingredient name is required.");
      return;
    }
    if (!payload.amount) {
      setError("Amount is required.");
      return;
    }

    setIsLoading(true);
    try {
      if (editingIngredientKey && editingIngredientRow) {
        await updateMealIngredient(editingIngredientRow, {
          recipe_id: recipeIdNum,
          ingredient_name: payload.ingredient_name,
          amount: payload.amount,
        });
        setSuccess("Updated meal ingredient row.");
      } else {
        await createMealIngredient({
          recipe_id: recipeIdNum,
          ingredient_name: payload.ingredient_name,
          amount: payload.amount,
        });
        setSuccess("Created meal ingredient row.");
      }
      resetIngredientForm();
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Failed to save ingredient row.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditIngredient = (row) => {
    setEditingIngredientKey(ingredientRowKey(row));
    setEditingIngredientRow(row);
    setIngredientForm({
      recipe_id: String(row?.recipe_id || ""),
      ingredient_name: String(row?.ingredient_name || ""),
      amount: String(row?.amount || ""),
    });
  };

  const handleDeleteIngredient = async (row) => {
    if (!window.confirm("Delete this ingredient row?")) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await deleteMealIngredient(row);
      setSuccess("Deleted ingredient row.");
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Failed to delete ingredient row.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportDishNames = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!importForm.names.trim()) {
      setError("Dish names are required.");
      return;
    }

    setIsLoading(true);
    setImportProgress({
      phase: "importing",
      running: true,
      total: 0,
      success: 0,
      failed: 0,
      message: "Importing dish names from text input...",
      updatedAt: new Date().toISOString(),
    });
    try {
      const rows = await importRecipeLibraryDishNames(importForm);
      setSuccess(`Imported ${rows.length} dish names to import queue.`);
      setImportProgress({
        phase: "imported",
        running: false,
        total: rows.length,
        success: rows.length,
        failed: 0,
        message: `Text import completed: ${rows.length} rows queued. Select rows to AI enrich or approve.`,
        updatedAt: new Date().toISOString(),
      });
      setImportForm(DEFAULT_IMPORT_FORM);
      await refreshRecipeLibraryQueues();

      if (autoEnrichOnImport && rows.length > 0) {
        const importedQueueIds = rows.map((row) => getQueueRowId(row)).filter(Boolean);
        const result = await runEnrichmentLoop({ queueIds: importedQueueIds });
        setSuccess(
          result.pausedByQuota
              ? `Imported ${rows.length} rows. Auto enrichment (missing-data only) paused due to AI quota: ${result.successCount} enriched, ${result.failedCount} failed, ${result.remaining} still pending.`
            : result.remaining > 0
            ? `Imported ${rows.length} rows. Auto enrichment (missing-data only) partial: ${result.successCount} enriched, ${result.failedCount} failed, ${result.remaining} still pending.`
            : `Imported ${rows.length} rows. Auto enrichment (missing-data only) finished: ${result.successCount} enriched, ${result.failedCount} failed.`
        );
      }
    } catch (err) {
      setError(err.message || "Failed to import dish names.");
      setImportProgress({
        phase: "failed",
        running: false,
        total: 0,
        success: 0,
        failed: 0,
        message: err.message || "Text import failed.",
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenImportPreview = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!importFile) {
      setError("Please choose an Excel/CSV file first.");
      return;
    }

    setIsImportPreviewLoading(true);
    setImportPreviewError("");
    try {
      const preview = await buildImportPreviewFromFile(importFile);
      setImportPreviewRows(preview.rows);
      setIsImportPreviewOpen(true);
    } catch (err) {
      setImportPreviewError(err.message || "Failed to parse preview from file.");
      setError(err.message || "Failed to parse preview from file.");
    } finally {
      setIsImportPreviewLoading(false);
    }
  };

  const handleCloseImportPreview = () => {
    if (isLoading) return;
    setIsImportPreviewOpen(false);
    setEditingPreviewCell(null);
    setImportPreviewError("");
  };

  const updatePreviewRow = (previewId, key, value) => {
    setImportPreviewRows((prev) =>
      prev.map((row) => (row.previewId === previewId ? { ...row, [key]: value } : row))
    );
  };

  const removePreviewRow = (previewId) => {
    setImportPreviewRows((prev) => prev.filter((row) => row.previewId !== previewId));
    setEditingPreviewCell(null);
  };

  const handleConfirmImportDishFile = async () => {
    const rowsToImport = importPreviewRows
      .map((row) => ({
        dish_name: String(row.dish_name || "").trim(),
        meal_type: normalizeMealTypeValue(row.meal_type, ""),
        cuisine_hint: String(row.cuisine_hint || "").trim(),
        cooking_method_hint: String(row.cooking_method_hint || "").trim(),
        admin_notes: String(row.admin_notes || "").trim(),
        recipe_name: String(row.recipe_name || "").trim(),
        description: String(row.description || "").trim(),
        difficulty: String(row.difficulty || "").trim(),
        spice_level: String(row.spice_level || "").trim(),
        prep_time_minutes: String(row.prep_time_minutes || "").trim(),
        cook_time_minutes: String(row.cook_time_minutes || "").trim(),
        servings: String(row.servings || "").trim(),
        serving_size: String(row.serving_size || "").trim(),
        ingredients: String(row.ingredients || "").trim(),
        instructions: String(row.instructions || "").trim(),
        dietary_tags: String(row.dietary_tags || "").trim(),
        health_tags: String(row.health_tags || "").trim(),
        allergens: String(row.allergens || "").trim(),
        avoid_for_conditions: String(row.avoid_for_conditions || "").trim(),
        suitable_goals: String(row.suitable_goals || "").trim(),
        calories: String(row.calories || "").trim(),
        protein: String(row.protein || "").trim(),
        fat: String(row.fat || "").trim(),
        carbohydrates: String(row.carbohydrates || "").trim(),
        fiber: String(row.fiber || "").trim(),
        sugar: String(row.sugar || "").trim(),
        sodium: String(row.sodium || "").trim(),
        image_url: String(row.image_url || "").trim(),
        equipment: String(row.equipment || "").trim(),
        tips: String(row.tips || "").trim(),
      }))
      .filter((row) => row.dish_name);

    if (rowsToImport.length <= 0) {
      setImportPreviewError("At least one valid dish row is required.");
      return;
    }

    setIsLoading(true);
    setIsImportPreviewOpen(false);
    setImportProgress({
      phase: "importing",
      running: true,
      total: 0,
      success: 0,
      failed: 0,
      message: `Importing ${rowsToImport.length} preview rows...`,
      updatedAt: new Date().toISOString(),
    });
    try {
      const rows = await importRecipeLibraryDishRows(rowsToImport);
      setSuccess(`Imported ${rows.length} rows to import queue.`);
      setImportProgress({
        phase: "imported",
        running: false,
        total: rows.length,
        success: rows.length,
        failed: 0,
        message: `Import completed: ${rows.length} rows added to import queue. Select rows to AI enrich or approve.`,
        updatedAt: new Date().toISOString(),
      });
      setImportFile(null);
      setImportPreviewRows([]);
      setEditingPreviewCell(null);
      await refreshRecipeLibraryQueues();

      if (autoEnrichOnImport && rows.length > 0) {
        const importedQueueIds = rows.map((row) => getQueueRowId(row)).filter(Boolean);
        const enrichResult = await runEnrichmentLoop({ queueIds: importedQueueIds });
        setSuccess(
          enrichResult.pausedByQuota
            ? `Imported ${rows.length} rows. AI enrichment (missing-data only) paused due to quota: ${enrichResult.successCount} enriched, ${enrichResult.failedCount} failed, ${enrichResult.remaining} still pending.`
            : enrichResult.remaining > 0
              ? `Imported ${rows.length} rows. AI enrichment (missing-data only) partial: ${enrichResult.successCount} enriched, ${enrichResult.failedCount} failed, ${enrichResult.remaining} still missing data.`
              : `Imported ${rows.length} rows. AI enrichment (missing-data only) finished: ${enrichResult.successCount} enriched, ${enrichResult.failedCount} failed.`
        );
      }
    } catch (err) {
      setError(err.message || "Failed to import file.");
      setImportProgress({
        phase: "failed",
        running: false,
        total: 0,
        success: 0,
        failed: 0,
        message: err.message || "File import failed.",
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadImportTemplate = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await downloadRecipeLibraryImportTemplate();
      setSuccess("Template downloaded.");
    } catch (err) {
      setError(err.message || "Failed to download template.");
    } finally {
      setIsLoading(false);
    }
  };

  const openQueueEditModal = (row) => {
    setEditingQueueRow(row);
    const draft = row?.draft || {};
    setQueueEditForm({
      dish_name: String(row?.dish_name || ""),
      meal_type: normalizeMealTypeValue(row?.meal_type || draft?.meal_type || "", ""),
      cuisine_hint: String(row?.cuisine_hint || draft?.cuisine_name || ""),
      cooking_method_hint: String(row?.cooking_method_hint || draft?.cooking_method_name || ""),
      admin_notes: String(row?.admin_notes || ""),
      recipe_name: String(draft?.recipe_name || ""),
      description: String(draft?.description || ""),
      difficulty: String(draft?.difficulty || ""),
      spice_level: String(draft?.spice_level || ""),
      prep_time_minutes: String(draft?.prep_time_minutes ?? ""),
      cook_time_minutes: String(draft?.cook_time_minutes ?? ""),
      servings: String(draft?.servings ?? ""),
      serving_size: String(draft?.serving_size || ""),
      calories: String(draft?.calories ?? ""),
      protein: String(draft?.protein ?? ""),
      fat: String(draft?.fat ?? ""),
      carbohydrates: String(draft?.carbohydrates ?? ""),
      fiber: String(draft?.fiber ?? ""),
      sugar: String(draft?.sugar ?? ""),
      sodium: String(draft?.sodium ?? ""),
      ingredients: toJsonText(draft?.ingredients),
      instructions: toJsonText(draft?.instructions),
      dietary_tags: toCsvText(draft?.dietary_tags),
      allergens: toCsvText(draft?.allergens),
      image_url: String(draft?.image_url || ""),
    });
  };

  const closeQueueEditModal = () => {
    if (isLoading) return;
    setEditingQueueRow(null);
    setQueueEditForm(DEFAULT_QUEUE_EDIT_FORM);
  };

  const handleSaveQueueEdit = async () => {
    const queueId = String(editingQueueRow?.id || "").trim();
    if (!queueId) {
      setError("Invalid queue row id.");
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await updateRecipeLibraryImportQueueRow(queueId, queueEditForm);
      await refreshRecipeLibraryQueues();
      setSuccess(`Updated imported item ${queueEditForm.dish_name || queueId}.`);
      closeQueueEditModal();
    } catch (err) {
      setError(err.message || "Failed to update imported item.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrichSelectedQueueRows = async (queueIds = []) => {
    const ids = Array.isArray(queueIds) ? queueIds.filter(Boolean) : [];
    if (ids.length <= 0) {
      setError("No item selected for AI enrich.");
      return;
    }
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const result = await runEnrichmentLoop({ queueIds: ids });
      setSuccess(
        result.pausedByQuota
          ? `AI enrich (missing-data only) paused by quota: ${result.successCount} enriched, ${result.failedCount} failed, ${result.remaining} pending.`
          : result.remaining > 0
            ? `AI enrich (missing-data only) partial: ${result.successCount} enriched, ${result.failedCount} failed, ${result.remaining} still missing data.`
            : `AI enrich (missing-data only) completed: ${result.successCount} enriched, ${result.failedCount} failed.`
      );
    } catch (err) {
      setError(err.message || "Failed to AI enrich selected rows.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveSelectedQueueRows = async (queueIds = []) => {
    const ids = Array.isArray(queueIds) ? queueIds.filter(Boolean) : [];
    if (ids.length <= 0) {
      setError("No item selected for approve.");
      return;
    }
    if (!window.confirm(`Approve ${ids.length} item(s) to Recipe Library?`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const results = await approveRecipeLibraryImportQueueRows(ids);
      const imported = results.filter((item) => normalizeQueueStatus(item?.status) === "imported").length;
      const failed = results.filter((item) => normalizeQueueStatus(item?.status) === "failed").length;
      const skipped = results.filter((item) => normalizeQueueStatus(item?.status) === "skipped").length;
      const firstFailed = results.find((item) => normalizeQueueStatus(item?.status) === "failed");
      const firstError = String(firstFailed?.error || firstFailed?.reason || "").trim();
      if (imported > 0) {
        setSuccess(`Approve result: imported ${imported}, failed ${failed}, skipped ${skipped}.`);
      } else {
        setSuccess("");
      }
      if (failed > 0) {
        setError(
          firstError
            ? `Approve failed for ${failed} item(s): ${firstError}`
            : `Approve failed for ${failed} item(s). Check the Error column.`
        );
      }
      await refreshRecipeLibraryQueues();
    } catch (err) {
      setError(err.message || "Failed to approve selected rows.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCommunityReview = async (row) => {
    const reviewId = Number(row?.id);
    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      setError("Invalid review id.");
      return;
    }
    if (!window.confirm(`Delete review #${reviewId}? This will hide it from all feeds.`)) return;

    setError("");
    setSuccess("");
    setIsCommunityReviewLoading(true);
    try {
      await deleteRecipeReviewByAdmin(reviewId);
      await loadCommunityReviewFeed(communityReviewFilters);
      setSuccess(`Deleted review #${reviewId}.`);
    } catch (err) {
      setError(err.message || "Failed to delete review.");
    } finally {
      setIsCommunityReviewLoading(false);
    }
  };

  const handlePublishCatalog = async (row) => {
    if (!hasRecipeImage(row)) {
      setError("Recipe must have an image before publishing.");
      return;
    }
    if (!window.confirm(`Publish ${row.recipe_name} to public catalog?`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await publishRecipeLibraryCatalog(row.id);
      setSuccess(`Published ${row.recipe_name} to public catalog.`);
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Failed to publish recipe.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublishCatalog = async (row) => {
    if (!row?.id) return;
    if (!window.confirm(`Unpublish ${row.recipe_name} from public catalog?`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await unpublishRecipeLibraryCatalog(row.id);
      setSuccess(`Unpublished ${row.recipe_name} from public catalog.`);
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Failed to unpublish recipe.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRecipeLibraryPage = (row, hash = "") => {
    if (!row?.id) return;
    navigate(`/admin/recipe-library/${row.id}${hash ? `#${hash}` : ""}`);
  };

  const handleEditRecipeLibrary = (row) => {
    if (!row?.id) return;
    navigate(`/admin/recipe-library/${row.id}/edit`);
  };

  const handleDeleteRecipeLibrary = async (row) => {
    if (!row?.id) return;
    const title = row.recipe_name || row.dish_name || `recipe #${row.id}`;
    if (!window.confirm(`Move ${title} to Trash? You can recover it later or delete it permanently from Trash.`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await deleteRecipeLibraryItem(row.id);
      await loadAdminData();
      setSuccess(`Moved ${title} to Trash.`);
    } catch (err) {
      setError(err.message || "Failed to delete recipe library entry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverRecipeLibrary = async (row) => {
    if (!row?.id) return;
    const title = row.recipe_name || row.dish_name || `recipe #${row.id}`;
    if (!window.confirm(`Recover ${title} from Trash?`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await recoverRecipeLibraryItem(row.id);
      await loadAdminData();
      setSuccess(`Recovered ${title} from Trash.`);
    } catch (err) {
      setError(err.message || "Failed to recover recipe library entry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermanentDeleteRecipeLibrary = async (row) => {
    if (!row?.id) return;
    const title = row.recipe_name || row.dish_name || `recipe #${row.id}`;
    if (!window.confirm(`Permanently delete ${title}? This cannot be undone.`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await permanentlyDeleteRecipeLibraryItem(row.id);
      await loadAdminData();
      setSuccess(`Permanently deleted ${title}.`);
    } catch (err) {
      setError(err.message || "Failed to permanently delete recipe library entry.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecipeLibrarySelection = (id, checked) => {
    const key = String(id);
    setSelectedRecipeLibraryIds((prev) => {
      if (checked) return Array.from(new Set([...prev, key]));
      return prev.filter((item) => item !== key);
    });
  };

  const handleBulkDeleteRecipeLibrary = async () => {
    const selectedRows = visibleRecipeLibraryRows.filter((row) =>
      selectedRecipeLibraryIds.includes(String(row?.id))
    );

    if (selectedRows.length <= 0) {
      setError("No Recipe Library rows selected.");
      return;
    }
    if (!window.confirm(`Move ${selectedRows.length} selected recipe(s) to Trash?`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const results = await Promise.allSettled(selectedRows.map((row) => deleteRecipeLibraryItem(row.id)));
      const okCount = results.filter((result) => result.status === "fulfilled").length;
      const failCount = results.length - okCount;
      const firstError = results.find((result) => result.status === "rejected");
      await loadAdminData();
      if (okCount > 0) {
        setSuccess(
          `Moved ${okCount} recipe(s) to Trash${failCount > 0 ? `, failed ${failCount}` : ""}.`
        );
      }
      if (failCount > 0) {
        const reason =
          firstError && firstError.status === "rejected"
            ? firstError.reason?.message || ""
            : "";
        setError(reason || "Some selected recipes could not be moved to Trash.");
      }
    } catch (err) {
      setError(err.message || "Failed to move selected recipes to Trash.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkPublishRecipeLibrary = async () => {
    const selectedRows = visibleRecipeLibraryRows.filter((row) =>
      selectedRecipeLibraryIds.includes(String(row?.id))
    );
    const rowsMissingImage = selectedRows.filter((row) => row?.visibility !== "public" && !hasRecipeImage(row));
    const publishableRows = selectedRows.filter((row) => row?.visibility !== "public" && hasRecipeImage(row));
    const skipped = selectedRows.length - publishableRows.length;

    if (publishableRows.length <= 0) {
      setError(
        rowsMissingImage.length > 0
          ? `No publishable rows selected. ${rowsMissingImage.length} selected recipe(s) are missing image_url.`
          : "No publishable Recipe Library rows selected."
      );
      return;
    }
    if (rowsMissingImage.length > 0) {
      setError(`${rowsMissingImage.length} selected recipe(s) are missing image_url and will be skipped.`);
    }
    if (!window.confirm(`Publish ${publishableRows.length} selected recipe(s) to public catalog?`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const results = await Promise.allSettled(
        publishableRows.map((row) => publishRecipeLibraryCatalog(row.id))
      );
      const okCount = results.filter((result) => result.status === "fulfilled").length;
      const failCount = results.length - okCount;
      const firstError = results.find((result) => result.status === "rejected");
      await loadAdminData();
      if (okCount > 0) {
        setSuccess(
          `Published ${okCount} recipe(s)${skipped > 0 ? `, skipped ${skipped}` : ""}${failCount > 0 ? `, failed ${failCount}` : ""}.`
        );
      }
      if (failCount > 0) {
        const reason =
          firstError && firstError.status === "rejected"
            ? firstError.reason?.message || ""
            : "";
        setError(reason || "Some selected recipes could not be published.");
      }
    } catch (err) {
      setError(err.message || "Failed to publish selected recipes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUnpublishRecipeLibrary = async () => {
    const selectedRows = visibleRecipeLibraryRows.filter((row) =>
      selectedRecipeLibraryIds.includes(String(row?.id))
    );
    const publishRows = selectedRows.filter((row) => row?.visibility === "public");

    if (publishRows.length === 0) {
      setError("No published Recipe Library rows selected.");
      return;
    }
    if (!window.confirm(`Unpublish ${publishRows.length} selected recipe(s) from public catalog?`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const results = await Promise.allSettled(
        publishRows.map((row) => unpublishRecipeLibraryCatalog(row.id))
      );
      const failed = results.filter((result) => result.status === "rejected").length;
      const succeeded = results.length - failed;
      setSelectedRecipeLibraryIds([]);
      setSuccess(`Unpublish result: unpublished ${succeeded}, failed ${failed}.`);
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Failed to unpublish selected recipes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchMissingRecipeImages = async () => {
    const selectedRows = visibleRecipeLibraryRows.filter((row) =>
      selectedRecipeLibraryIds.includes(String(row?.id))
    );
    const targetRows = (selectedRows.length ? selectedRows : visibleRecipeLibraryRows).filter(
      (row) => !hasRecipeImage(row)
    );
    const ids = targetRows.map((row) => row.id).filter(Boolean);

    if (ids.length <= 0) {
      setError(
        selectedRows.length
          ? "Selected recipes already have images."
          : "No visible recipes are missing images."
      );
      return;
    }
    if (!window.confirm(`Fetch images for ${ids.length} recipe(s)?`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const results = await fetchRecipeLibraryMissingImages(ids);
      const added = results.filter((row) => normalizeQueueStatus(row?.status) === "image_added").length;
      const noImage = results.filter((row) => normalizeQueueStatus(row?.status) === "no_image").length;
      const failed = results.filter((row) => normalizeQueueStatus(row?.status) === "failed").length;
      const addedById = new Map(
        results
          .filter((row) => normalizeQueueStatus(row?.status) === "image_added")
          .map((row) => [Number(row?.id), String(row?.image_url || "").trim()])
          .filter(([id, imageUrl]) => Number.isInteger(id) && id > 0 && Boolean(imageUrl))
      );
      if (addedById.size > 0) {
        setRecipeLibrary((prev) =>
          prev.map((row) =>
            addedById.has(Number(row?.id)) ? { ...row, image_url: addedById.get(Number(row?.id)) } : row
          )
        );
      }
      await refreshRecipeLibraryQueues();
      setSuccess(`Image fetch result: added ${added}, no image ${noImage}, failed ${failed}.`);
      if (added === 0 && (noImage > 0 || failed > 0)) {
        const firstError = results.find((row) => row?.error)?.error || "";
        setError(firstError || "No matching images were returned for the selected recipes.");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch missing recipe images.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecipeLibraryTrashSelection = (id, checked) => {
    const key = String(id);
    setSelectedRecipeLibraryTrashIds((prev) => {
      if (checked) return Array.from(new Set([...prev, key]));
      return prev.filter((item) => item !== key);
    });
  };

  const handleBulkRecoverRecipeLibraryTrashRows = async () => {
    const selectedRows = visibleRecipeLibraryTrashRows.filter((row) =>
      selectedRecipeLibraryTrashIds.includes(String(row?.id))
    );

    if (selectedRows.length <= 0) {
      setError("No Recipe Library Trash rows selected.");
      return;
    }
    if (!window.confirm(`Recover ${selectedRows.length} selected recipe(s) from Trash?`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const results = await Promise.allSettled(
        selectedRows.map((row) => recoverRecipeLibraryItem(row.id))
      );
      const okCount = results.filter((result) => result.status === "fulfilled").length;
      const failCount = results.length - okCount;
      const firstError = results.find((result) => result.status === "rejected");
      await loadAdminData();
      if (okCount > 0) {
        setSuccess(
          `Recovered ${okCount} recipe(s) from Trash${failCount > 0 ? `, failed ${failCount}` : ""}.`
        );
      }
      if (failCount > 0) {
        const reason =
          firstError && firstError.status === "rejected"
            ? firstError.reason?.message || ""
            : "";
        setError(reason || "Some selected recipes could not be recovered.");
      }
    } catch (err) {
      setError(err.message || "Failed to recover selected recipes from Trash.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkPermanentDeleteRecipeLibraryTrashRows = async () => {
    const selectedRows = visibleRecipeLibraryTrashRows.filter((row) =>
      selectedRecipeLibraryTrashIds.includes(String(row?.id))
    );

    if (selectedRows.length <= 0) {
      setError("No Recipe Library Trash rows selected.");
      return;
    }
    if (!window.confirm(`Permanently delete ${selectedRows.length} selected recipe(s)? This cannot be undone.`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const results = await Promise.allSettled(
        selectedRows.map((row) => permanentlyDeleteRecipeLibraryItem(row.id))
      );
      const okCount = results.filter((result) => result.status === "fulfilled").length;
      const failCount = results.length - okCount;
      const firstError = results.find((result) => result.status === "rejected");
      await loadAdminData();
      if (okCount > 0) {
        setSuccess(
          `Permanently deleted ${okCount} recipe(s)${failCount > 0 ? `, failed ${failCount}` : ""}.`
        );
      }
      if (failCount > 0) {
        const reason =
          firstError && firstError.status === "rejected"
            ? firstError.reason?.message || ""
            : "";
        setError(reason || "Some selected recipes could not be deleted.");
      }
    } catch (err) {
      setError(err.message || "Failed to delete selected recipes permanently.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMissingQueueSelection = (id, checked) => {
    const key = String(id);
    if (!key) return;
    setSelectedMissingQueueIds((prev) => {
      if (checked) return Array.from(new Set([...prev, key]));
      return prev.filter((item) => item !== key);
    });
  };

  const toggleTrashSelection = (id, checked) => {
    const key = String(id);
    if (!key) return;
    setSelectedTrashQueueIds((prev) => {
      if (checked) return Array.from(new Set([...prev, key]));
      return prev.filter((item) => item !== key);
    });
  };

  const handleBulkTrashImportQueueRows = async () => {
    const selectedRows = missingDataQueueRows.filter((row) =>
      selectedMissingQueueIds.includes(getQueueRowId(row))
    );
    const eligibleRows = selectedRows.filter((row) => {
      const status = normalizeQueueStatus(row?.status);
      return status === "pending" || status === "queued" || status === "failed" || status === "enriched";
    });
    const skipped = selectedRows.length - eligibleRows.length;

    if (eligibleRows.length <= 0) {
      setError("No eligible rows selected. Only pending, queued, failed, or enriched rows can be deleted.");
      return;
    }
    if (!window.confirm(`Delete ${eligibleRows.length} selected imported item(s)?`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await Promise.all(
        eligibleRows.map((row) =>
          trashRecipeLibraryImportQueueRow(getQueueRowId(row), "Moved to Trash from bulk Imported Item action")
        )
      );
      setSuccess(`Moved ${eligibleRows.length} imported item(s) to Trash${skipped ? `, skipped ${skipped}` : ""}.`);
      await refreshRecipeLibraryQueues();
    } catch (err) {
      setError(err.message || "Failed to move selected rows to Trash.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkRecoverTrashRows = async () => {
    const selectedRows = filteredTrashQueue.filter((row) => selectedTrashQueueIds.includes(getQueueRowId(row)));
    if (selectedRows.length <= 0) {
      setError("No Trash rows selected.");
      return;
    }
    if (!window.confirm(`Recover ${selectedRows.length} selected Trash row(s)?`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await Promise.all(selectedRows.map((row) => recoverRecipeLibraryImportQueueRow(getQueueRowId(row))));
      setSuccess(`Recovered ${selectedRows.length} row(s) to active queue.`);
      await refreshRecipeLibraryQueues();
    } catch (err) {
      setError(err.message || "Failed to recover selected rows.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkPermanentDeleteTrashRows = async () => {
    const selectedRows = filteredTrashQueue.filter((row) => selectedTrashQueueIds.includes(getQueueRowId(row)));
    if (selectedRows.length <= 0) {
      setError("No Trash rows selected.");
      return;
    }
    if (!window.confirm(`Permanently delete ${selectedRows.length} selected Trash row(s)? This cannot be undone.`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await Promise.all(selectedRows.map((row) => deleteRecipeLibraryImportQueueRow(getQueueRowId(row))));
      setSuccess(`Permanently deleted ${selectedRows.length} row(s).`);
      await refreshRecipeLibraryQueues();
    } catch (err) {
      setError(err.message || "Failed to permanently delete selected rows.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrashImportQueueRow = async (row) => {
    const id = getQueueRowId(row);
    if (!id) {
      setError("Invalid queue row id.");
      return;
    }
    const label = row?.dish_name || id;
    if (!window.confirm(`Move imported item ${label} to Trash?`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await trashRecipeLibraryImportQueueRow(id, "Moved to Trash from Imported Item table");
      setSuccess(`Moved imported item ${label} to Trash.`);
      await refreshRecipeLibraryQueues();
    } catch (err) {
      setError(err.message || "Failed to move queue row to trash.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelImportQueueRow = async (row) => {
    const id = getQueueRowId(row);
    if (!id) {
      setError("Invalid imported item id.");
      return;
    }
    const label = row?.dish_name || id;
    if (!window.confirm(`Cancel imported item ${label}?`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await trashRecipeLibraryImportQueueRow(id, "Canceled from Imported Item table");
      setSuccess(`Canceled imported item ${label}.`);
      await refreshRecipeLibraryQueues();
    } catch (err) {
      setError(err.message || "Failed to cancel imported item.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverImportQueueRow = async (row) => {
    const id = getQueueRowId(row);
    if (!id) {
      setError("Invalid queue row id.");
      return;
    }
    const label = row?.dish_name || id;
    const status = normalizeQueueStatus(row?.status);
    const actionVerb = status === "failed" ? "Retry" : "Recover";
    if (!window.confirm(`${actionVerb} queue row ${label}?`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await recoverRecipeLibraryImportQueueRow(id);
      setSuccess(`${actionVerb} queue row ${label} to active queue.`);
      await refreshRecipeLibraryQueues();
    } catch (err) {
      setError(err.message || "Failed to recover queue row.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermanentDeleteImportQueueRow = async (row) => {
    const id = getQueueRowId(row);
    if (!id) {
      setError("Invalid queue row id.");
      return;
    }
    const label = row?.dish_name || id;
    if (!window.confirm(`Permanently delete queue row ${label}? This cannot be undone.`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await deleteRecipeLibraryImportQueueRow(id);
      setSuccess(`Permanently deleted queue row ${label}.`);
      await refreshRecipeLibraryQueues();
    } catch (err) {
      setError(err.message || "Failed to permanently delete queue row.");
    } finally {
      setIsLoading(false);
    }
  };

  const referenceSummary = useMemo(
    () => [
      { label: "Cuisines", count: referenceData.cuisines.length },
      { label: "Ingredients", count: referenceData.ingredients.length },
      { label: "Cooking Methods", count: referenceData.cookingMethods.length },
      { label: "Meal Catalog", count: mealCatalog.length },
      { label: "Meal Ingredient Rows", count: mealIngredients.length },
      { label: "User Recipes", count: userRecipes.length },
      { label: "Recipe Library", count: recipeLibrary.length },
      { label: "Community Pending", count: pendingCommunity.length },
    ],
    [referenceData, mealCatalog.length, mealIngredients.length, userRecipes.length, recipeLibrary.length, pendingCommunity.length]
  );

  const normalizedSearch = useMemo(
    () => String(searchQuery || "").trim().toLowerCase(),
    [searchQuery]
  );

  const filteredMealCatalog = useMemo(
    () =>
      mealCatalog.filter((row) =>
        matchesSearch(
          [row?.id, row?.recipe_name, row?.meal_type, row?.dietary_tags, row?.calories],
          normalizedSearch
        )
      ),
    [mealCatalog, normalizedSearch]
  );

  const filteredMealIngredients = useMemo(
    () =>
      mealIngredients.filter((row) =>
        matchesSearch([row?.recipe_id, row?.ingredient_name, row?.amount], normalizedSearch)
      ),
    [mealIngredients, normalizedSearch]
  );

  const userRecipeCuisineOptions = useMemo(() => {
    const options = new Map();
    userRecipes.forEach((row) => {
      const value = String(row?.cuisine_name || row?.cuisine_id || "").trim();
      if (!value) return;
      options.set(value.toLowerCase(), value);
    });
    return Array.from(options.values()).sort((a, b) => a.localeCompare(b));
  }, [userRecipes]);

  const filteredUserRecipes = useMemo(() => {
    const recipeId = String(userRecipeFilters.recipeId || "").trim().toLowerCase();
    const recipeName = String(userRecipeFilters.recipeName || "").trim().toLowerCase();
    const userId = String(userRecipeFilters.userId || "").trim().toLowerCase();
    const visibility = String(userRecipeFilters.visibility || "").trim().toLowerCase();
    const cuisine = String(userRecipeFilters.cuisine || "").trim().toLowerCase();
    const preparationTime = String(userRecipeFilters.preparationTime || "").trim().toLowerCase();
    const servings = String(userRecipeFilters.servings || "").trim().toLowerCase();
    const imageStatus = String(userRecipeFilters.imageStatus || "").trim().toLowerCase();
    const createdFrom = parseDateBoundary(userRecipeFilters.createdFrom);
    const createdTo = parseDateBoundary(userRecipeFilters.createdTo, true);

    return userRecipes.filter((row) => {
      if (
        !matchesSearch(
          [
            row?.id,
            row?.recipe_name,
            row?.user_id,
            row?.recipe_visibility,
            row?.cuisine_name,
            row?.cuisine_id,
            row?.image_url,
            row?.image_file_name,
            row?.preparation_time,
            row?.total_servings,
          ],
          normalizedSearch
        )
      ) {
        return false;
      }

      if (recipeId && !String(row?.id || "").toLowerCase().includes(recipeId)) return false;
      if (recipeName && !String(row?.recipe_name || "").toLowerCase().includes(recipeName)) return false;
      if (userId && String(row?.user_id || "").toLowerCase() !== userId) return false;
      if (visibility && normalizeUserRecipeVisibility(row?.recipe_visibility) !== visibility) return false;
      if (
        cuisine &&
        String(row?.cuisine_name || row?.cuisine_id || "").trim().toLowerCase() !== cuisine
      ) {
        return false;
      }
      if (
        preparationTime &&
        !String(row?.preparation_time || "").toLowerCase().includes(preparationTime)
      ) {
        return false;
      }
      if (servings && !String(row?.total_servings || "").toLowerCase().includes(servings)) return false;
      if (imageStatus) {
        const imageState = hasUserRecipeImage(row) ? "has" : "missing";
        if (imageState !== imageStatus) return false;
      }

      if (createdFrom || createdTo) {
        const createdAt = row?.created_at ? new Date(row.created_at) : null;
        if (!createdAt || Number.isNaN(createdAt.getTime())) return false;
        if (createdFrom && createdAt < createdFrom) return false;
        if (createdTo && createdAt > createdTo) return false;
      }

      return true;
    });
  }, [normalizedSearch, userRecipeFilters, userRecipes]);

  const userRecipeStats = useMemo(() => {
    const userCount = new Set(userRecipes.map((row) => row?.user_id).filter(Boolean)).size;
    const withImage = userRecipes.filter(hasUserRecipeImage).length;
    const visibleWithImage = filteredUserRecipes.filter(hasUserRecipeImage).length;
    const hasAdvancedFilters = Object.values(userRecipeFilters).some((value) => String(value || "").trim());
    return {
      total: userRecipes.length,
      visible: filteredUserRecipes.length,
      users: userCount,
      withImage,
      visibleWithImage,
      missingImage: Math.max(0, filteredUserRecipes.length - visibleWithImage),
      hasAdvancedFilters,
    };
  }, [filteredUserRecipes, userRecipeFilters, userRecipes]);

  const filteredUserRoles = useMemo(() => {
    const userId = String(userRoleFilters.userId || "").trim().toLowerCase();
    const displayName = String(userRoleFilters.displayName || "").trim().toLowerCase();
    const email = String(userRoleFilters.email || "").trim().toLowerCase();
    const role = String(userRoleFilters.role || "").trim().toLowerCase();
    const accountStatus = String(userRoleFilters.accountStatus || "").trim().toLowerCase();
    const createdFrom = parseDateBoundary(userRoleFilters.createdFrom);
    const createdTo = parseDateBoundary(userRoleFilters.createdTo, true);

    return userRoleRows.filter((row) => {
      if (
        !matchesSearch(
          [
            row?.user_id,
            row?.display_name,
            row?.name,
            row?.email,
            row?.role_name,
            row?.account_status,
          ],
          normalizedSearch
        )
      ) {
        return false;
      }

      if (userId && !String(row?.user_id || "").toLowerCase().includes(userId)) return false;
      if (displayName && !String(row?.display_name || row?.name || "").toLowerCase().includes(displayName)) return false;
      if (email && !String(row?.email || "").toLowerCase().includes(email)) return false;
      if (role && String(row?.role_name || "").toLowerCase() !== role) return false;
      if (accountStatus && !String(row?.account_status || "").toLowerCase().includes(accountStatus)) return false;

      if (createdFrom || createdTo) {
        const createdAt = row?.created_at ? new Date(row.created_at) : null;
        if (!createdAt || Number.isNaN(createdAt.getTime())) return false;
        if (createdFrom && createdAt < createdFrom) return false;
        if (createdTo && createdAt > createdTo) return false;
      }

      return true;
    });
  }, [normalizedSearch, userRoleFilters, userRoleRows]);

  const userRoleStats = useMemo(() => {
    const hasFilters = Object.values(userRoleFilters).some((value) => String(value || "").trim());
    const adminCount = filteredUserRoles.filter((row) => String(row?.role_name || "").toLowerCase() === "admin").length;
    return {
      total: userRoleRows.length,
      visible: filteredUserRoles.length,
      adminsVisible: adminCount,
      hasFilters,
    };
  }, [filteredUserRoles, userRoleFilters, userRoleRows]);

  const filteredReferenceData = useMemo(
    () => ({
      cuisines: referenceData.cuisines.filter((item) =>
        matchesSearch([item?.id, item?.name], normalizedSearch)
      ),
      cookingMethods: referenceData.cookingMethods.filter((item) =>
        matchesSearch([item?.id, item?.name], normalizedSearch)
      ),
      ingredients: referenceData.ingredients.filter((item) =>
        matchesSearch([item?.id, item?.name, item?.category], normalizedSearch)
      ),
    }),
    [referenceData, normalizedSearch]
  );

  const filteredRecipeLibrary = useMemo(
    () => {
      const id = String(recipeLibraryFilters.id || "").trim().toLowerCase();
      const recipe = String(recipeLibraryFilters.recipe || "").trim().toLowerCase();
      const visibility = String(recipeLibraryFilters.visibility || "").trim().toLowerCase();
      const status = String(recipeLibraryFilters.status || "").trim().toLowerCase();
      const imageStatus = String(recipeLibraryFilters.imageStatus || "").trim().toLowerCase();
      const mealType = String(recipeLibraryFilters.mealType || "").trim().toLowerCase();

      return recipeLibrary.filter((row) => {
        if (isRecipeLibraryTrashed(row)) return false;
        const rowVisibility = normalizeRecipeLibraryStatus(row?.visibility);
        if (rowVisibility !== "public" && rowVisibility !== "private") return false;
        if (
          !matchesSearch(
            [
              row?.id,
              row?.recipe_name,
              row?.dish_name,
              row?.visibility,
              row?.data_status,
              row?.moderation_status,
              row?.meal_type,
              row?.cuisine_name_snapshot,
            ],
            normalizedSearch
          )
        ) {
          return false;
        }

        if (id && !String(row?.id || "").toLowerCase().includes(id)) return false;
        if (
          recipe &&
          !String(`${row?.recipe_name || ""} ${row?.dish_name || ""}`).toLowerCase().includes(recipe)
        ) {
          return false;
        }
        if (visibility && rowVisibility !== visibility) return false;
        if (status && normalizeRecipeLibraryStatus(row?.data_status) !== status) return false;
        if (imageStatus) {
          const currentImageStatus = hasRecipeImage(row) ? "has" : "missing";
          if (currentImageStatus !== imageStatus) return false;
        }
        if (mealType && String(row?.meal_type || "").trim().toLowerCase() !== mealType) return false;

        return true;
      });
    },
    [recipeLibrary, recipeLibraryFilters, normalizedSearch]
  );

  const filteredRecipeLibraryTrash = useMemo(
    () =>
      trashedRecipeLibrary.filter((row) =>
        isRecipeLibraryTrashed(row) &&
        matchesSearch(
          [
            row?.id,
            row?.recipe_name,
            row?.dish_name,
            row?.visibility,
            row?.data_status,
            row?.moderation_status,
            row?.meal_type,
            row?.cuisine_name_snapshot,
            row?.trash_reason,
            row?.trashed_at,
          ],
          normalizedSearch
        )
      ),
    [trashedRecipeLibrary, normalizedSearch]
  );

  const filteredCommunityReviewFeed = useMemo(() => {
    const query = String(communityReviewFilters.query || "").trim().toLowerCase();
    return communityReviewFeedRows.filter((row) => {
      if (
        !matchesSearch(
          [
            row?.recipe?.title,
            row?.recipe?.description,
            row?.recipe?.cuisine,
            row?.comment,
            row?.userName,
            row?.sourceType,
            row?.rating,
          ],
          normalizedSearch
        )
      ) {
        return false;
      }
      if (!query) return true;
      return matchesSearch(
        [row?.recipe?.title, row?.recipe?.description, row?.recipe?.cuisine, row?.comment, row?.userName, row?.sourceType],
        query
      );
    });
  }, [communityReviewFeedRows, communityReviewFilters.query, normalizedSearch]);

  const visibleCommunityReviewRows = useMemo(
    () => filteredCommunityReviewFeed.slice(0, 200),
    [filteredCommunityReviewFeed]
  );

  const communityReviewBreakdown = useMemo(() => {
    const raw = communityReviewSummary?.ratingBreakdown || {};
    return {
      5: Number(raw?.[5] ?? raw?.["5"] ?? 0),
      4: Number(raw?.[4] ?? raw?.["4"] ?? 0),
      3: Number(raw?.[3] ?? raw?.["3"] ?? 0),
      2: Number(raw?.[2] ?? raw?.["2"] ?? 0),
      1: Number(raw?.[1] ?? raw?.["1"] ?? 0),
    };
  }, [communityReviewSummary]);

  const filteredImportQueue = useMemo(
    () =>
      importQueue.filter((row) =>
        matchesSearch(
          [
            row?.id,
            row?.dish_name,
            row?.status,
            row?.meal_type,
            row?.error_message,
            row?.completeness_status,
            Array.isArray(row?.missing_fields) ? row?.missing_fields.join(" ") : "",
          ],
          normalizedSearch
        )
      ),
    [importQueue, normalizedSearch]
  );

  const filteredTrashQueue = useMemo(
    () =>
      trashQueue.filter((row) =>
        matchesSearch([row?.id, row?.dish_name, row?.status, row?.meal_type, row?.error_message], normalizedSearch)
      ),
    [trashQueue, normalizedSearch]
  );

  const visibleImportQueue = useMemo(
    () =>
      filteredImportQueue.filter((row) => {
        const status = normalizeQueueStatus(row?.status);
        return status !== "imported" && status !== "rejected";
      }),
    [filteredImportQueue]
  );

  const visibleImportQueueRows = useMemo(
    () => visibleImportQueue.slice(0, 200),
    [visibleImportQueue]
  );

  const missingDataQueueRows = useMemo(() => {
    const dish = String(missingQueueFilters.dish || "").trim().toLowerCase();
    const status = String(missingQueueFilters.status || "").trim().toLowerCase();
    const dataStatus = String(missingQueueFilters.dataStatus || "").trim().toLowerCase();
    const missingFields = String(missingQueueFilters.missingFields || "").trim().toLowerCase();
    const error = String(missingQueueFilters.error || "").trim().toLowerCase();

    return visibleImportQueueRows.filter((row) => {
      const normalizedStatus = normalizeQueueStatus(row?.status);
      if (normalizedStatus === "rejected" || normalizedStatus === "imported") return false;

      const reviewStatus = getQueueReviewStatusLabel(row).toLowerCase();
      const completeness = String(row?.completeness_status || "").trim().toLowerCase();
      const fieldsText = Array.isArray(row?.missing_fields) ? row.missing_fields.join(", ").toLowerCase() : "";

      if (dish && !String(row?.dish_name || "").toLowerCase().includes(dish)) return false;
      if (status && reviewStatus !== status) return false;
      if (dataStatus && completeness !== dataStatus) return false;
      if (missingFields && !fieldsText.includes(missingFields)) return false;
      if (error && !String(row?.error_message || "").toLowerCase().includes(error)) return false;

      return true;
    });
  }, [missingQueueFilters, visibleImportQueueRows]);

  const visibleTrashQueueRows = useMemo(
    () => filteredTrashQueue.slice(0, 300),
    [filteredTrashQueue]
  );

  const visibleRecipeLibraryTrashRows = useMemo(
    () => filteredRecipeLibraryTrash.slice(0, 300),
    [filteredRecipeLibraryTrash]
  );

  const visibleRecipeLibraryRows = useMemo(
    () => filteredRecipeLibrary.slice(0, 120),
    [filteredRecipeLibrary]
  );

  const selectedMissingQueueCount = useMemo(
    () => missingDataQueueRows.filter((row) => selectedMissingQueueIds.includes(getQueueRowId(row))).length,
    [missingDataQueueRows, selectedMissingQueueIds]
  );

  const selectedVisibleTrashCount = useMemo(
    () => visibleTrashQueueRows.filter((row) => selectedTrashQueueIds.includes(getQueueRowId(row))).length,
    [selectedTrashQueueIds, visibleTrashQueueRows]
  );

  const selectedVisibleRecipeLibraryCount = useMemo(
    () =>
      visibleRecipeLibraryRows.filter((row) =>
        selectedRecipeLibraryIds.includes(String(row?.id))
      ).length,
    [selectedRecipeLibraryIds, visibleRecipeLibraryRows]
  );

  const selectedVisibleRecipeLibraryTrashCount = useMemo(
    () =>
      visibleRecipeLibraryTrashRows.filter((row) =>
        selectedRecipeLibraryTrashIds.includes(String(row?.id))
      ).length,
    [selectedRecipeLibraryTrashIds, visibleRecipeLibraryTrashRows]
  );

  const trashTabCount = filteredRecipeLibraryTrash.length + filteredTrashQueue.length;

  const importQueueStats = useMemo(() => {
    return importQueue.reduce(
      (acc, row) => {
        const status = normalizeQueueStatus(row?.status);
        if (status === "pending" || status === "queued") acc.pending += 1;
        else if (status === "enriching") acc.enriching += 1;
        else if (status === "enriched") acc.enriched += 1;
        else if (status === "imported") acc.imported += 1;
        else if (status === "failed") acc.failed += 1;
        else if (status === "rejected") acc.canceled += 1;
        else acc.other += 1;
        return acc;
      },
      { pending: 0, enriching: 0, enriched: 0, imported: 0, failed: 0, canceled: 0, other: 0 }
    );
  }, [importQueue]);

  const importProgressPercent = useMemo(() => {
    if (importProgress.total > 0) {
      const ratio = Math.round((importProgress.success / importProgress.total) * 100);
      if (importProgress.running) return Math.max(8, Math.min(99, ratio));
      return Math.max(0, Math.min(100, ratio));
    }
    if (importProgress.running) return 30;
    return 0;
  }, [importProgress]);

  const publishedMealCount = useMemo(
    () => mealCatalog.filter((row) => String(row?.is_published).toLowerCase() === "true").length,
    [mealCatalog]
  );

  const dashboardStats = useMemo(
    () => [
      {
        label: "Meal Catalog",
        value: mealCatalog.length,
        helper: `${publishedMealCount} published`,
        icon: Utensils,
        tone: "green",
      },
      {
        label: "Ingredient Rows",
        value: mealIngredients.length,
        helper: `${filteredMealIngredients.length} visible`,
        icon: Boxes,
        tone: "blue",
      },
      {
        label: "Reference Library",
        value:
          referenceData.cuisines.length +
          referenceData.ingredients.length +
          referenceData.cookingMethods.length,
        helper: "taxonomy records",
        icon: Database,
        tone: "amber",
      },
      {
        label: "User Recipes",
        value: userRecipes.length,
        helper: `${new Set(userRecipes.map((row) => row?.user_id).filter(Boolean)).size} users`,
        icon: FileText,
        tone: "slate",
      },
      {
        label: "Recipe Library",
        value: recipeLibrary.length,
        helper: `${pendingCommunity.length} pending community`,
        icon: BookOpen,
        tone: "blue",
      },
    ],
    [
      filteredMealIngredients.length,
      mealCatalog.length,
      mealIngredients.length,
      publishedMealCount,
      userRecipes,
      referenceData,
      recipeLibrary.length,
      pendingCommunity.length,
    ]
  );

  const volumeRows = useMemo(
    () => [...referenceSummary].sort((a, b) => b.count - a.count),
    [referenceSummary]
  );

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Admin sections">
        <div className="admin-brand">
          <span className="admin-brand-mark">
            <ShieldCheck size={18} />
          </span>
          <div>
            <strong>Nutrihelp Admin</strong>
            <span>Data Operations</span>
          </div>
        </div>

        <nav className="admin-side-nav">
          {Object.entries(TAB_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                type="button"
                className={`admin-side-item ${activeTab === key ? "active" : ""}`}
                onClick={() => setActiveTab(key)}
              >
                <Icon size={17} />
                <span>
                  <strong>{config.label}</strong>
                  <small>{config.meta}</small>
                </span>
                {key === "trash" && trashTabCount > 0 ? (
                  <span className="admin-side-badge">{trashTabCount > 99 ? "99+" : trashTabCount}</span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-status">
          <span>System status</span>
          <strong>{isLoading ? "Syncing" : "Ready"}</strong>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-search">
            <Search size={18} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search records, recipes, references..."
            />
          </div>

          <div className="admin-topbar-actions">
            <button type="button" className="admin-icon-button" onClick={loadAdminData} disabled={isLoading}>
              <RefreshCw size={17} />
              <span>{isLoading ? "Syncing" : "Refresh"}</span>
            </button>
            <div className="admin-user-card">
              <strong>Admin</strong>
              <span>{lastSyncedAt ? `Synced ${lastSyncedAt.toLocaleTimeString()}` : "Not synced"}</span>
            </div>
          </div>
        </header>

        <section className="admin-content">
          <div className="admin-page-title">
            <div>
              <span className="admin-eyebrow">Control center</span>
              <h1>{activeTab === "kpi" ? "KPI Dashboard" : "Admin Dashboard"}</h1>
            </div>
            <p>Production data console for meals, recipes, ingredients, and reference taxonomies.</p>
          </div>

          {error ? <p className="admin-banner error">{error}</p> : null}
          {success ? <p className="admin-banner success">{success}</p> : null}

          <section className="admin-workspace">
            <div className="admin-workspace-header">
              <div>
                <h2>{TAB_CONFIG[activeTab]?.label}</h2>
                <p>{TAB_CONFIG[activeTab]?.meta}</p>
              </div>
            </div>

            {activeTab === "kpi" ? (
              <div className="admin-module-panel">
                <div className="admin-kpi-grid">
                  {dashboardStats.map((item) => {
                    const Icon = item.icon;
                    return (
                      <article key={item.label} className={`admin-kpi-card ${item.tone}`}>
                        <span className="admin-kpi-icon">
                          <Icon size={18} />
                        </span>
                        <div>
                          <p>{item.label}</p>
                          <strong>{formatCompactNumber(item.value)}</strong>
                          <small>{item.helper}</small>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="admin-insight-grid">
                  <section className="admin-insight-panel wide">
                    <div className="admin-panel-title-row">
                      <div>
                        <h2>Data Volume</h2>
                        <p>Current record distribution</p>
                      </div>
                      <BarChart3 size={20} />
                    </div>
                    <div className="admin-volume-list">
                      {volumeRows.map((item) => {
                        const max = volumeRows[0]?.count || 1;
                        const width = Math.max(6, Math.round((item.count / max) * 100));
                        return (
                          <div key={item.label} className="admin-volume-row">
                            <div>
                              <span>{item.label}</span>
                              <strong>{item.count.toLocaleString()}</strong>
                            </div>
                            <i>
                              <b style={{ width: `${width}%` }} />
                            </i>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="admin-insight-panel">
                    <div className="admin-panel-title-row">
                      <div>
                        <h2>Workflow</h2>
                        <p>{TAB_CONFIG[activeTab]?.label}</p>
                      </div>
                      <FileText size={20} />
                    </div>
                    <div className="admin-workflow-list">
                      <span>Catalog CRUD</span>
                      <span>Ingredient mapping</span>
                      <span>Recipe lookup</span>
                      <span>Reference review</span>
                    </div>
                  </section>
                </div>
              </div>
            ) : null}

            {activeTab === "catalog" ? (
              <div className="admin-module-panel">
          <form className="admin-form" onSubmit={handleSaveMeal}>
            <label>
              ID (leave empty to auto-generate)
              <input
                value={mealForm.id}
                onChange={(e) => onMealFormChange("id", e.target.value)}
                placeholder="e.g. 101"
              />
            </label>
            <label>
              Recipe Name
              <input
                value={mealForm.recipe_name}
                onChange={(e) => onMealFormChange("recipe_name", e.target.value)}
                required
              />
            </label>
            <label>
              Meal Type
              <select
                value={mealForm.meal_type}
                onChange={(e) => onMealFormChange("meal_type", e.target.value)}
              >
                <option value="breakfast">breakfast</option>
                <option value="lunch">lunch</option>
                <option value="dinner">dinner</option>
                <option value="other">other</option>
              </select>
            </label>
            <label>
              Is Published
              <select
                value={mealForm.is_published}
                onChange={(e) => onMealFormChange("is_published", e.target.value)}
              >
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            </label>
            <label>
              Dietary Tags
              <input
                value={mealForm.dietary_tags}
                onChange={(e) => onMealFormChange("dietary_tags", e.target.value)}
                placeholder="e.g. Vegetarian, High-Protein"
              />
            </label>
            <label className="span-2">
              Ingredients JSON String
              <textarea
                value={mealForm.ingredients}
                onChange={(e) => onMealFormChange("ingredients", e.target.value)}
                rows={3}
              />
            </label>
            <label className="span-2">
              Instructions
              <textarea
                value={mealForm.instructions}
                onChange={(e) => onMealFormChange("instructions", e.target.value)}
                rows={3}
                required
              />
            </label>
            <label className="span-2">
              Notes
              <textarea
                value={mealForm.notes}
                onChange={(e) => onMealFormChange("notes", e.target.value)}
                rows={2}
              />
            </label>

            <label>
              Calories
              <input value={mealForm.calories} onChange={(e) => onMealFormChange("calories", e.target.value)} />
            </label>
            <label>
              Protein
              <input value={mealForm.protein} onChange={(e) => onMealFormChange("protein", e.target.value)} />
            </label>
            <label>
              Fat
              <input value={mealForm.fat} onChange={(e) => onMealFormChange("fat", e.target.value)} />
            </label>
            <label>
              Carbohydrates
              <input
                value={mealForm.carbohydrates}
                onChange={(e) => onMealFormChange("carbohydrates", e.target.value)}
              />
            </label>
            <label>
              Fiber
              <input value={mealForm.fiber} onChange={(e) => onMealFormChange("fiber", e.target.value)} />
            </label>
            <label>
              Sugar
              <input value={mealForm.sugar} onChange={(e) => onMealFormChange("sugar", e.target.value)} />
            </label>
            <label>
              Vitamin A
              <input value={mealForm.vitamin_a} onChange={(e) => onMealFormChange("vitamin_a", e.target.value)} />
            </label>
            <label>
              Vitamin C
              <input value={mealForm.vitamin_c} onChange={(e) => onMealFormChange("vitamin_c", e.target.value)} />
            </label>

            <div className="admin-actions span-2">
              <button type="submit" disabled={isLoading}>
                {editingMealId ? "Update Meal Entry" : "Create Meal Entry"}
              </button>
              <button type="button" className="muted" onClick={resetMealForm} disabled={isLoading}>
                Clear
              </button>
            </div>
          </form>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Meal Type</th>
                  <th>Published</th>
                  <th>Calories</th>
                  <th>Dietary Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMealCatalog.map((row, index) => (
                  <tr key={`${row?.id || "null"}-${index}`}>
                    <td>{row?.id || "(null)"}</td>
                    <td>{row?.recipe_name}</td>
                    <td>{row?.meal_type}</td>
                    <td>{String(row?.is_published)}</td>
                    <td>{row?.calories}</td>
                    <td>{row?.dietary_tags}</td>
                    <td className="table-actions">
                      <button type="button" onClick={() => handleEditMeal(row)}>
                        Edit
                      </button>
                      <button type="button" className="danger" onClick={() => handleDeleteMeal(row)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
              </div>
            ) : null}

            {activeTab === "ingredients" ? (
              <div className="admin-module-panel">
          <form className="admin-form compact" onSubmit={handleSaveIngredient}>
            <label>
              Recipe ID
              <input
                value={ingredientForm.recipe_id}
                onChange={(e) => onIngredientFormChange("recipe_id", e.target.value)}
                required
              />
            </label>
            <label>
              Ingredient Name
              <input
                value={ingredientForm.ingredient_name}
                onChange={(e) => onIngredientFormChange("ingredient_name", e.target.value)}
                required
              />
            </label>
            <label>
              Amount
              <input value={ingredientForm.amount} onChange={(e) => onIngredientFormChange("amount", e.target.value)} required />
            </label>
            <div className="admin-actions">
              <button type="submit" disabled={isLoading}>
                {editingIngredientKey ? "Update Ingredient Row" : "Create Ingredient Row"}
              </button>
              <button type="button" className="muted" onClick={resetIngredientForm} disabled={isLoading}>
                Clear
              </button>
            </div>
          </form>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Recipe ID</th>
                  <th>Ingredient</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMealIngredients.map((row, index) => (
                  <tr key={`${ingredientRowKey(row)}-${index}`}>
                    <td>{row?.recipe_id}</td>
                    <td>{row?.ingredient_name}</td>
                    <td>{row?.amount}</td>
                    <td className="table-actions">
                      <button type="button" onClick={() => handleEditIngredient(row)}>
                        Edit
                      </button>
                      <button type="button" className="danger" onClick={() => handleDeleteIngredient(row)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
              </div>
            ) : null}

            {activeTab === "recipes" ? (
              <div className="admin-module-panel admin-user-recipes-panel">
                {/* <div className="user-recipes-hero">
                  <div>
                    <span className="admin-eyebrow">User-created recipes</span>
                    <h3>All Recipes Created By Users</h3>
                  </div>
                  <div className="user-recipes-stat-grid">
                    <article>
                      <strong>{userRecipeStats.total}</strong>
                      <span>Total recipes</span>
                    </article>
                    <article>
                      <strong>{userRecipeStats.users}</strong>
                      <span>Users</span>
                    </article>
                    <article>
                      <strong>{userRecipeStats.withImage}</strong>
                      <span>With image</span>
                    </article>
                    <article>
                      <strong>{userRecipeStats.visible}</strong>
                      <span>Visible rows</span>
                    </article>
                  </div>
                </div> */}

                <div className="user-recipes-toolbar">
                  <span>
                    Showing {userRecipeStats.visible} of {userRecipeStats.total} user recipe(s)
                  </span>
                  <div className="user-recipes-toolbar-actions">
                    <span className={userRecipeStats.missingImage > 0 ? "warning" : "good"}>
                      {userRecipeStats.missingImage} visible missing image
                    </span>
                    <button
                      type="button"
                      className="muted"
                      onClick={resetUserRecipeFilters}
                      disabled={!userRecipeStats.hasAdvancedFilters}
                    >
                      Clear filters
                    </button>
                  </div>
                </div>

                <div className="admin-table-wrap user-recipes-table-wrap">
                  <table className="admin-table user-recipes-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Recipe</th>
                        <th>User</th>
                        <th>Visibility</th>
                        <th>Cuisine</th>
                        <th>Time</th>
                        <th>Servings</th>
                        <th>Image</th>
                        <th>Created</th>
                      </tr>
                      <tr className="excel-filter-row">
                        <th>
                          <input
                            value={userRecipeFilters.recipeId}
                            onChange={(event) => onUserRecipeFilterChange("recipeId", event.target.value)}
                            placeholder="Filter ID"
                            aria-label="Filter by recipe ID"
                          />
                        </th>
                        <th>
                          <input
                            value={userRecipeFilters.recipeName}
                            onChange={(event) => onUserRecipeFilterChange("recipeName", event.target.value)}
                            placeholder="Filter recipe"
                            aria-label="Filter by recipe name"
                          />
                        </th>
                        <th>
                          <input
                            value={userRecipeFilters.userId}
                            onChange={(event) => onUserRecipeFilterChange("userId", event.target.value)}
                            inputMode="numeric"
                            placeholder="User ID"
                            aria-label="Filter by user ID"
                          />
                        </th>
                        <th>
                          <select
                            value={userRecipeFilters.visibility}
                            onChange={(event) => onUserRecipeFilterChange("visibility", event.target.value)}
                            aria-label="Filter by user recipe visibility"
	                          >
	                            <option value="">All</option>
                            <option value="user_private">User private</option>
                            <option value="community">Community</option>
                            <option value="community_pending">Community pending</option>
                            <option value="community_rejected">Community rejected</option>
                          </select>
                        </th>
                        <th>
                          <select
                            value={userRecipeFilters.cuisine}
                            onChange={(event) => onUserRecipeFilterChange("cuisine", event.target.value)}
                            aria-label="Filter by cuisine"
                          >
                            <option value="">All</option>
                            {userRecipeCuisineOptions.map((cuisine) => (
                              <option key={cuisine} value={cuisine}>
                                {cuisine}
                              </option>
                            ))}
                          </select>
                        </th>
                        <th>
                          <input
                            value={userRecipeFilters.preparationTime}
                            onChange={(event) => onUserRecipeFilterChange("preparationTime", event.target.value)}
                            inputMode="numeric"
                            placeholder="Min"
                            aria-label="Filter by preparation time"
                          />
                        </th>
                        <th>
                          <input
                            value={userRecipeFilters.servings}
                            onChange={(event) => onUserRecipeFilterChange("servings", event.target.value)}
                            inputMode="numeric"
                            placeholder="Servings"
                            aria-label="Filter by servings"
                          />
                        </th>
                        <th>
                          <select
                            value={userRecipeFilters.imageStatus}
                            onChange={(event) => onUserRecipeFilterChange("imageStatus", event.target.value)}
                            aria-label="Filter by image status"
                          >
                            <option value="">All</option>
                            <option value="has">Has image</option>
                            <option value="missing">Missing</option>
                          </select>
                        </th>
                        <th>
                          <div className="excel-date-filter">
                            <input
                              type="date"
                              value={userRecipeFilters.createdFrom}
                              onChange={(event) => onUserRecipeFilterChange("createdFrom", event.target.value)}
                              aria-label="Filter created from"
                            />
                            <input
                              type="date"
                              value={userRecipeFilters.createdTo}
                              onChange={(event) => onUserRecipeFilterChange("createdTo", event.target.value)}
                              aria-label="Filter created to"
                            />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUserRecipes.length > 0 ? (
                        filteredUserRecipes.map((row, index) => (
                          <tr key={`${row?.id || "id"}-${index}`}>
                            <td className="user-recipe-id">{row?.id}</td>
                            <td>
                              <div className="user-recipe-name-cell">
                                <img
                                  src={row?.image_url || "/images/meal-mock/placeholder.svg"}
                                  alt={row?.recipe_name || "Recipe"}
                                  onError={(event) => {
                                    event.currentTarget.src = "/images/meal-mock/placeholder.svg";
                                  }}
                                />
                                <div>
                                  <strong>{row?.recipe_name || "Untitled recipe"}</strong>
                                  <small>{row?.image_file_name || "No uploaded image file"}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="recipe-status-badge tone-info">User {row?.user_id || "-"}</span>
                            </td>
                            <td>
                              <select
                                className={`user-recipe-visibility-select tone-${getUserRecipeVisibilityTone(row?.recipe_visibility)}`}
                                value={normalizeUserRecipeVisibility(row?.recipe_visibility)}
                                onChange={(event) => handleUserRecipeVisibilityChange(row, event.target.value)}
                                disabled={isLoading}
	                                aria-label={`Change visibility for recipe ${row?.id}`}
	                              >
                                <option value="user_private">Private</option>
                                <option value="community">Community</option>
                                <option value="community_pending">Community Pending</option>
                                <option value="community_rejected">Community Rejected</option>
	                              </select>
                            </td>
                            <td>{row?.cuisine_name || row?.cuisine_id || "-"}</td>
                            <td>{row?.preparation_time ? `${row.preparation_time} min` : "-"}</td>
                            <td>{row?.total_servings || "-"}</td>
                            <td>
                              {hasUserRecipeImage(row) ? (
                                <span className="recipe-status-badge tone-good">Has image</span>
                              ) : (
                                <span className="recipe-status-badge tone-warning">Missing</span>
                              )}
                            </td>
                            <td>{formatDateTime(row?.created_at)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="admin-empty-cell">
                            No user-created recipes match the current search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {activeTab === "roles" ? (
              <div className="admin-module-panel admin-user-recipes-panel">
                <div className="user-recipes-toolbar">
                  <span>
                    Showing {userRoleStats.visible} of {userRoleStats.total} user account(s)
                  </span>
                  <div className="user-recipes-toolbar-actions">
                    <span className={userRoleStats.adminsVisible > 0 ? "good" : "warning"}>
                      {userRoleStats.adminsVisible} visible admin
                    </span>
                    <button
                      type="button"
                      className="muted"
                      onClick={resetUserRoleFilters}
                      disabled={!userRoleStats.hasFilters}
                    >
                      Clear filters
                    </button>
                  </div>
                </div>

                <div className="admin-table-wrap user-recipes-table-wrap">
                  <table className="admin-table user-recipes-table">
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                      <tr className="excel-filter-row">
                        <th>
                          <input
                            value={userRoleFilters.userId}
                            onChange={(event) => onUserRoleFilterChange("userId", event.target.value)}
                            placeholder="Filter ID"
                            aria-label="Filter by user id"
                          />
                        </th>
                        <th>
                          <input
                            value={userRoleFilters.displayName}
                            onChange={(event) => onUserRoleFilterChange("displayName", event.target.value)}
                            placeholder="Filter name"
                            aria-label="Filter by user name"
                          />
                        </th>
                        <th>
                          <input
                            value={userRoleFilters.email}
                            onChange={(event) => onUserRoleFilterChange("email", event.target.value)}
                            placeholder="Filter email"
                            aria-label="Filter by email"
                          />
                        </th>
                        <th>
                          <select
                            value={userRoleFilters.role}
                            onChange={(event) => onUserRoleFilterChange("role", event.target.value)}
                            aria-label="Filter by role"
                          >
                            <option value="">All</option>
                            <option value="admin">Admin</option>
                            <option value="nutritionist">Nutritionist</option>
                            <option value="user">User</option>
                          </select>
                        </th>
                        <th>
                          <input
                            value={userRoleFilters.accountStatus}
                            onChange={(event) => onUserRoleFilterChange("accountStatus", event.target.value)}
                            placeholder="Status"
                            aria-label="Filter by account status"
                          />
                        </th>
                        <th>
                          <div className="excel-date-filter">
                            <input
                              type="date"
                              value={userRoleFilters.createdFrom}
                              onChange={(event) => onUserRoleFilterChange("createdFrom", event.target.value)}
                              aria-label="Filter created from"
                            />
                            <input
                              type="date"
                              value={userRoleFilters.createdTo}
                              onChange={(event) => onUserRoleFilterChange("createdTo", event.target.value)}
                              aria-label="Filter created to"
                            />
                          </div>
                        </th>
                        <th />
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUserRoles.length > 0 ? (
                        filteredUserRoles.map((row, index) => {
                          const roleName = String(row?.role_name || "user").toLowerCase();
                          const roleTone =
                            roleName === "admin" ? "danger" : roleName === "nutritionist" ? "warning" : "info";
                          return (
                            <tr key={`${row?.user_id || "uid"}-${index}`}>
                              <td className="user-recipe-id">{row?.user_id || "-"}</td>
                              <td>
                                <div className="user-role-name-cell">
                                  <strong>{row?.display_name || row?.name || "-"}</strong>
                                  <small>{row?.name || "-"}</small>
                                </div>
                              </td>
                              <td>{row?.email || "-"}</td>
                              <td>
                                <span className={`recipe-status-badge tone-${roleTone}`}>{roleName}</span>
                              </td>
                              <td>{row?.account_status || "-"}</td>
                              <td>{formatDateTime(row?.created_at)}</td>
                              <td>{formatDateTime(row?.last_login)}</td>
                              <td>
                                <select
                                  className={`user-recipe-visibility-select tone-${roleTone}`}
                                  value={roleName}
                                  onChange={(event) => handleUserRoleChange(row, event.target.value)}
                                  disabled={isLoading}
                                  aria-label={`Change role for user ${row?.user_id}`}
                                >
                                  <option value="user">User</option>
                                  <option value="nutritionist">Nutritionist</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="admin-empty-cell">
                            No users match the current filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {activeTab === "library" ? (
              <div className="admin-module-panel">

                <form className="admin-form" onSubmit={handleImportDishNames}>
                  <label className="span-2">
                    Dish Names (one per line)
                    <textarea
                      value={importForm.names}
                      onChange={(e) => onImportFormChange("names", e.target.value)}
                      rows={5}
                      placeholder={"Chicken Curry\nBeef Pho\nMediterranean Chickpea Salad"}
                    />
                  </label>
                  <label>
                    Meal Type Hint
                    <select
                      value={importForm.meal_type}
                      onChange={(e) => onImportFormChange("meal_type", e.target.value)}
                    >
                      <option value="">auto</option>
                      <option value="breakfast">breakfast</option>
                      <option value="lunch">lunch</option>
                      <option value="dinner">dinner</option>
                      <option value="other">other</option>
                    </select>
                  </label>
                  <label>
                    Cuisine Hint
                    <input
                      value={importForm.cuisine_hint}
                      onChange={(e) => onImportFormChange("cuisine_hint", e.target.value)}
                      placeholder="e.g. Vietnamese"
                    />
                  </label>
                  <label>
                    Cooking Method Hint
                    <input
                      value={importForm.cooking_method_hint}
                      onChange={(e) => onImportFormChange("cooking_method_hint", e.target.value)}
                      placeholder="e.g. simmered"
                    />
                  </label>
                  <label>
                    Enrich Batch Size (per round)
                    <input
                      value={enrichmentLimit}
                      onChange={(e) => setEnrichmentLimit(e.target.value)}
                      placeholder="10"
                    />
                  </label>
                  <label>
                    Auto enrich after import
                    <select
                      value={autoEnrichOnImport ? "on" : "off"}
                      onChange={(e) => setAutoEnrichOnImport(e.target.value === "on")}
                    >
                      <option value="on">On</option>
                      <option value="off">Off</option>
                    </select>
                  </label>
                  <label className="span-2">
                    Admin Notes
                    <textarea
                      value={importForm.admin_notes}
                      onChange={(e) => onImportFormChange("admin_notes", e.target.value)}
                      rows={2}
                    />
                  </label>
                  <label>
                    Recipe Name (optional)
                    <input
                      value={importForm.recipe_name}
                      onChange={(e) => onImportFormChange("recipe_name", e.target.value)}
                      placeholder="e.g. Lean Beef Pho"
                    />
                  </label>
                  <label>
                    Servings (optional)
                    <input
                      value={importForm.servings}
                      onChange={(e) => onImportFormChange("servings", e.target.value)}
                      placeholder="e.g. 2"
                    />
                  </label>
                  <label>
                    Calories (optional)
                    <input
                      value={importForm.calories}
                      onChange={(e) => onImportFormChange("calories", e.target.value)}
                      placeholder="e.g. 520"
                    />
                  </label>
                  <label className="span-2">
                    Description (optional)
                    <textarea
                      value={importForm.description}
                      onChange={(e) => onImportFormChange("description", e.target.value)}
                      rows={2}
                    />
                  </label>
                  <label className="span-2">
                    Ingredients JSON (optional)
                    <textarea
                      value={importForm.ingredients}
                      onChange={(e) => onImportFormChange("ingredients", e.target.value)}
                      rows={3}
                      placeholder='[{"name":"chicken","quantity":300,"unit":"g"}]'
                    />
                  </label>
                  <label className="span-2">
                    Instructions JSON (optional)
                    <textarea
                      value={importForm.instructions}
                      onChange={(e) => onImportFormChange("instructions", e.target.value)}
                      rows={3}
                      placeholder='["Step 1","Step 2","Step 3"]'
                    />
                  </label>
                  <div className="admin-actions span-2">
                    <button type="submit" disabled={isLoading}>
                      Import Dish Names
                    </button>
                    <button
                      type="button"
                      className="muted"
                      onClick={() => setImportForm(DEFAULT_IMPORT_FORM)}
                      disabled={isLoading}
                    >
                      Clear
                    </button>
                  </div>
                </form>

                <form className="admin-form compact" onSubmit={handleOpenImportPreview}>
                  <label className="span-2">
                    Import Excel/CSV File
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(event) => setImportFile(event.target.files?.[0] || null)}
                    />
                  </label>
                  <div className="admin-actions span-2">
                    <button type="submit" disabled={isLoading || isImportPreviewLoading || !importFile}>
                      {isImportPreviewLoading ? "Preparing Preview..." : "Import"}
                    </button>
                    <button type="button" onClick={handleDownloadImportTemplate} disabled={isLoading}>
                      Download Excel Template
                    </button>
                    <button type="button" className="muted" onClick={() => setImportFile(null)} disabled={isLoading}>
                      Clear File
                    </button>
                  </div>
                </form>

                {isImportPreviewOpen ? (
                  <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
                    <section className="admin-modal-card">
                      <div className="admin-modal-header">
                        <h3>Import Preview</h3>
                        <div>
                          <span>{importFile?.name || "Selected file"}</span>
                          <button
                            type="button"
                            className="admin-modal-close"
                            onClick={handleCloseImportPreview}
                            disabled={isLoading}
                            aria-label="Close import preview"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                      {importPreviewError ? (
                        <p className="admin-banner error">{importPreviewError}</p>
                      ) : null}
                      <div className="admin-modal-summary">
                        <article>
                          <strong>{importPreviewRows.length}</strong>
                          <span>Total rows</span>
                        </article>
                        <article>
                          <strong>{importPreviewRows.filter((row) => String(row.dish_name || "").trim()).length}</strong>
                          <span>Valid dish rows</span>
                        </article>
                        <article>
                          <strong>{importPreviewRows.filter((row) => !String(row.dish_name || "").trim()).length}</strong>
                          <span>Invalid rows</span>
                        </article>
                      </div>
                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Dish</th>
                              <th>Meal Type</th>
                              <th>Cuisine Hint</th>
                              <th>Method Hint</th>
                              <th>Recipe Name</th>
                              <th>Servings</th>
                              <th>Calories</th>
                              <th>Notes</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importPreviewRows.map((row, index) => (
                              <tr key={row.previewId || `preview-${index}`}>
                                {[
                                  "dish_name",
                                  "meal_type",
                                  "cuisine_hint",
                                  "cooking_method_hint",
                                  "recipe_name",
                                  "servings",
                                  "calories",
                                  "admin_notes",
                                ].map((field) => {
                                  const isEditing =
                                    editingPreviewCell?.previewId === row.previewId &&
                                    editingPreviewCell?.field === field;
                                  const cellValue = row[field] || "";
                                  return (
                                    <td
                                      key={`${row.previewId}-${field}`}
                                      className={field === "admin_notes" ? "truncate-cell" : undefined}
                                      onDoubleClick={() => setEditingPreviewCell({ previewId: row.previewId, field })}
                                    >
                                      {isEditing ? (
                                        field === "meal_type" ? (
                                          <select
                                            value={cellValue}
                                            autoFocus
                                            onChange={(event) => updatePreviewRow(row.previewId, field, event.target.value)}
                                            onBlur={() => setEditingPreviewCell(null)}
                                          >
                                            {IMPORT_QUEUE_MEAL_TYPES.map((mealType) => (
                                              <option key={`preview-meal-${mealType || "auto"}`} value={mealType}>
                                                {mealType || "auto"}
                                              </option>
                                            ))}
                                          </select>
                                        ) : (
                                          <input
                                            value={cellValue}
                                            autoFocus
                                            onChange={(event) => updatePreviewRow(row.previewId, field, event.target.value)}
                                            onBlur={() => setEditingPreviewCell(null)}
                                            onKeyDown={(event) => {
                                              if (event.key === "Enter" || event.key === "Escape") {
                                                setEditingPreviewCell(null);
                                              }
                                            }}
                                          />
                                        )
                                      ) : (
                                        cellValue || "-"
                                      )}
                                    </td>
                                  );
                                })}
                                <td className="table-actions">
                                  <button type="button" className="danger icon-action" onClick={() => removePreviewRow(row.previewId)}>
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="admin-modal-actions">
                        <button type="button" className="muted" onClick={handleCloseImportPreview} disabled={isLoading}>
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmImportDishFile}
                          disabled={isLoading || importPreviewRows.filter((row) => String(row.dish_name || "").trim()).length <= 0}
                        >
                          Import
                        </button>
                      </div>
                    </section>
                  </div>
                ) : null}

                {editingQueueRow ? (
                  <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
                    <section className="admin-modal-card">
                      <div className="admin-modal-header">
                        <h3>Edit Imported Item</h3>
                        <div>
                          <span>{editingQueueRow?.dish_name || editingQueueRow?.id}</span>
                          <button
                            type="button"
                            className="admin-modal-close"
                            onClick={closeQueueEditModal}
                            disabled={isLoading}
                            aria-label="Close queue edit"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                      <form
                        className="admin-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleSaveQueueEdit();
                        }}
                      >
                        <label>
                          Dish
                          <input
                            value={queueEditForm.dish_name}
                            onChange={(event) => setQueueEditForm((prev) => ({ ...prev, dish_name: event.target.value }))}
                            required
                          />
                        </label>
                        <label>
                          Meal Type
                          <select
                            value={queueEditForm.meal_type}
                            onChange={(event) => setQueueEditForm((prev) => ({ ...prev, meal_type: event.target.value }))}
                          >
                            {IMPORT_QUEUE_MEAL_TYPES.map((mealType) => (
                              <option key={`queue-edit-${mealType || "auto"}`} value={mealType}>
                                {mealType || "auto"}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Cuisine Hint
                          <input
                            value={queueEditForm.cuisine_hint}
                            onChange={(event) => setQueueEditForm((prev) => ({ ...prev, cuisine_hint: event.target.value }))}
                          />
                        </label>
                        <label>
                          Method Hint
                          <input
                            value={queueEditForm.cooking_method_hint}
                            onChange={(event) =>
                              setQueueEditForm((prev) => ({ ...prev, cooking_method_hint: event.target.value }))
                            }
                          />
                        </label>
                        <label>
                          Recipe Name
                          <input
                            value={queueEditForm.recipe_name}
                            onChange={(event) => setQueueEditForm((prev) => ({ ...prev, recipe_name: event.target.value }))}
                          />
                        </label>
                        <label>
                          Servings
                          <input
                            value={queueEditForm.servings}
                            onChange={(event) => setQueueEditForm((prev) => ({ ...prev, servings: event.target.value }))}
                          />
                        </label>
                        <label>
                          Calories
                          <input
                            value={queueEditForm.calories}
                            onChange={(event) => setQueueEditForm((prev) => ({ ...prev, calories: event.target.value }))}
                          />
                        </label>
                        <label>
                          Image URL
                          <input
                            value={queueEditForm.image_url}
                            onChange={(event) => setQueueEditForm((prev) => ({ ...prev, image_url: event.target.value }))}
                          />
                        </label>
                        <label className="span-2">
                          Description
                          <textarea
                            value={queueEditForm.description}
                            onChange={(event) => setQueueEditForm((prev) => ({ ...prev, description: event.target.value }))}
                            rows={2}
                          />
                        </label>
                        <label className="span-2">
                          Ingredients JSON
                          <textarea
                            value={queueEditForm.ingredients}
                            onChange={(event) => setQueueEditForm((prev) => ({ ...prev, ingredients: event.target.value }))}
                            rows={4}
                          />
                        </label>
                        <label className="span-2">
                          Instructions JSON
                          <textarea
                            value={queueEditForm.instructions}
                            onChange={(event) => setQueueEditForm((prev) => ({ ...prev, instructions: event.target.value }))}
                            rows={4}
                          />
                        </label>
                        <label className="span-2">
                          Admin Notes
                          <textarea
                            value={queueEditForm.admin_notes}
                            onChange={(event) => setQueueEditForm((prev) => ({ ...prev, admin_notes: event.target.value }))}
                            rows={2}
                          />
                        </label>
                        <div className="admin-actions span-2">
                          <button type="button" className="muted" onClick={closeQueueEditModal} disabled={isLoading}>
                            Cancel
                          </button>
                          <button type="submit" disabled={isLoading}>
                            Save
                          </button>
                        </div>
                      </form>
                    </section>
                  </div>
                ) : null}

                <section className="import-status-panel">
                  <div className="import-status-header">
                    <h3>Import Status</h3>
                    <span>{formatDateTime(importProgress.updatedAt)}</span>
                  </div>
                  <p className={`import-status-message ${importProgress.phase}`}>
                    {importProgress.message}
                  </p>
                  <div className="import-status-progress-track" aria-live="polite">
                    <div
                      className={`import-status-progress-fill ${importProgress.running ? "running" : ""}`}
                      style={{ width: `${importProgressPercent}%` }}
                    />
                  </div>
                  <div className="import-status-metrics">
                    <article>
                      <strong>{importQueueStats.pending}</strong>
                      <span>Pending</span>
                    </article>
                    <article>
                      <strong>{importQueueStats.enriching}</strong>
                      <span>In progress</span>
                    </article>
                    <article>
                      <strong>{importQueueStats.canceled}</strong>
                      <span>Canceled</span>
                    </article>
                    <article>
                      <strong>{importQueueStats.failed}</strong>
                      <span>Failed</span>
                    </article>
                    <article>
                      <strong>{importQueueStats.enriched}</strong>
                      <span>Ready to approve</span>
                    </article>
                  </div>
                </section>

                <p className="admin-note">
                  Progress only tracks AI enrichment for selected rows with missing data. Rows with enough data can be approved manually.
                </p>
                <p className="admin-note">
                  List of items pending review ({missingDataQueueRows.length} rows)
                </p>
                <div className="admin-bulk-toolbar">
                  <span>{selectedMissingQueueCount} selected</span>
                  <button
                    type="button"
                    onClick={() => handleEnrichSelectedQueueRows(selectedMissingQueueIds)}
                    disabled={
                      selectedMissingQueueCount === 0 ||
                      isLoading ||
                      !missingDataQueueRows.some(
                        (row) =>
                          selectedMissingQueueIds.includes(getQueueRowId(row)) &&
                          normalizeQueueCompleteness(row?.completeness_status) === "missing_data"
                      )
                    }
                  >
                    AI enrich selected
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveSelectedQueueRows(selectedMissingQueueIds)}
                    disabled={selectedMissingQueueCount === 0 || isLoading}
                  >
                    Approve selected
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={handleBulkTrashImportQueueRows}
                    disabled={selectedMissingQueueCount === 0 || isLoading}
                  >
                    Delete selected
                  </button>
                  <button
                    type="button"
                    className="muted"
                    onClick={() => setSelectedMissingQueueIds([])}
                    disabled={selectedMissingQueueCount === 0 || isLoading}
                  >
                    Clear selection
                  </button>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th className="select-cell">
                          <input
                            type="checkbox"
                            aria-label="Select all missing-data queue rows"
                            checked={
                              missingDataQueueRows.length > 0 &&
                              selectedMissingQueueCount === missingDataQueueRows.length
                            }
                            onChange={(event) => {
                              const ids = missingDataQueueRows.map((row) => getQueueRowId(row)).filter(Boolean);
                              setSelectedMissingQueueIds((prev) => {
                                if (event.target.checked) return Array.from(new Set([...prev, ...ids]));
                                return prev.filter((id) => !ids.includes(id));
                              });
                            }}
                            disabled={missingDataQueueRows.length === 0}
                          />
                        </th>
                        <th>Dish</th>
                        <th>Status</th>
                        <th>Data Status</th>
                        <th>Missing Fields</th>
                        <th>Error</th>
                        <th>Actions</th>
                      </tr>
                      <tr className="excel-filter-row">
                        <th className="select-cell"></th>
                        <th>
                          <input
                            value={missingQueueFilters.dish}
                            onChange={(event) => onMissingQueueFilterChange("dish", event.target.value)}
                            placeholder="Filter dish"
                            aria-label="Filter review rows by dish"
                          />
                        </th>
                        <th>
                          <select
                            value={missingQueueFilters.status}
                            onChange={(event) => onMissingQueueFilterChange("status", event.target.value)}
                            aria-label="Filter review rows by status"
                          >
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="ready to approve">Ready to approve</option>
                            <option value="import failed">Import failed</option>
                          </select>
                        </th>
                        <th>
                          <select
                            value={missingQueueFilters.dataStatus}
                            onChange={(event) => onMissingQueueFilterChange("dataStatus", event.target.value)}
                            aria-label="Filter review rows by data status"
                          >
                            <option value="">All</option>
                            <option value="ready">Ready</option>
                            <option value="missing_data">Missing Data</option>
                          </select>
                        </th>
                        <th>
                          <input
                            value={missingQueueFilters.missingFields}
                            onChange={(event) => onMissingQueueFilterChange("missingFields", event.target.value)}
                            placeholder="Filter fields"
                            aria-label="Filter review rows by missing fields"
                          />
                        </th>
                        <th>
                          <input
                            value={missingQueueFilters.error}
                            onChange={(event) => onMissingQueueFilterChange("error", event.target.value)}
                            placeholder="Filter error"
                            aria-label="Filter review rows by error"
                          />
                        </th>
                        <th>
                          <button
                            type="button"
                            className="excel-clear-button"
                            onClick={resetMissingQueueFilters}
                            disabled={!Object.values(missingQueueFilters).some((value) => String(value || "").trim())}
                          >
                            Clear
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {missingDataQueueRows.map((row, index) => {
                        const queueId = getQueueRowId(row);
                        const isReady = normalizeQueueCompleteness(row?.completeness_status) === "ready";
                        const errorText = String(row?.error_message || "").trim();
                        return (
                        <tr key={`missing-${queueId || index}`}>
                          <td className="select-cell">
                            <input
                              type="checkbox"
                              aria-label={`Select missing data row ${queueId || index}`}
                              checked={selectedMissingQueueIds.includes(queueId)}
                              onChange={(event) => toggleMissingQueueSelection(queueId, event.target.checked)}
                            />
                          </td>
                          <td>{row.dish_name || "-"}</td>
                          <td>{getQueueReviewStatusLabel(row)}</td>
                          <td>{getCompletenessLabel(row.completeness_status)}</td>
                          <td>{Array.isArray(row.missing_fields) && row.missing_fields.length ? row.missing_fields.join(", ") : "-"}</td>
                          <td className="truncate-cell" title={errorText}>
                            {errorText || "-"}
                          </td>
                          <td className="table-actions">
                            <button type="button" onClick={() => handleEnrichSelectedQueueRows([queueId])} disabled={isLoading || !queueId || isReady}>
                              AI enrich
                            </button>
                            <button type="button" onClick={() => openQueueEditModal(row)} disabled={isLoading}>
                              Edit
                            </button>
                            <button type="button" onClick={() => handleApproveSelectedQueueRows([queueId])} disabled={isLoading || !queueId}>
                              Approve
                            </button>
                            <button type="button" className="danger" onClick={() => handleTrashImportQueueRow(row)} disabled={isLoading}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>

                <p className="admin-note">
                  Recipe Library ({filteredRecipeLibrary.length} rows)
                </p>
                <div className="admin-bulk-toolbar">
                  <span>{selectedVisibleRecipeLibraryCount} selected</span>
                  <button
                    type="button"
                    onClick={handleBulkPublishRecipeLibrary}
                    disabled={isLoading || selectedVisibleRecipeLibraryCount === 0}
                  >
                    Publish selected
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkUnpublishRecipeLibrary}
                    disabled={isLoading || selectedVisibleRecipeLibraryCount === 0}
                  >
                    Unpublish selected
                  </button>
                  <button
                    type="button"
                    onClick={handleFetchMissingRecipeImages}
                    disabled={
                      isLoading ||
                      !visibleRecipeLibraryRows.some((row) => !hasRecipeImage(row))
                    }
                  >
                    Fetch missing images
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={handleBulkDeleteRecipeLibrary}
                    disabled={isLoading || selectedVisibleRecipeLibraryCount === 0}
                  >
                    Move selected to Trash
                  </button>
                  <button
                    type="button"
                    className="muted"
                    onClick={() => setSelectedRecipeLibraryIds([])}
                    disabled={isLoading || selectedVisibleRecipeLibraryCount === 0}
                  >
                    Clear selection
                  </button>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th className="select-cell">
                          <input
                            type="checkbox"
                            aria-label="Select all visible recipe library rows"
                            checked={
                              visibleRecipeLibraryRows.length > 0 &&
                              selectedVisibleRecipeLibraryCount === visibleRecipeLibraryRows.length
                            }
                            onChange={(event) => {
                              const visibleIds = visibleRecipeLibraryRows.map((row) => String(row?.id));
                              setSelectedRecipeLibraryIds((prev) => {
                                if (event.target.checked) return Array.from(new Set([...prev, ...visibleIds]));
                                return prev.filter((id) => !visibleIds.includes(id));
                              });
                            }}
                            disabled={visibleRecipeLibraryRows.length === 0}
                          />
                        </th>
                        <th>ID</th>
                        <th>Recipe</th>
                        <th>Visibility</th>
                        <th>Status</th>
                        <th>Image</th>
                        <th>Meal</th>
                        <th>Actions</th>
                      </tr>
                      <tr className="excel-filter-row">
                        <th className="select-cell"></th>
                        <th>
                          <input
                            value={recipeLibraryFilters.id}
                            onChange={(event) => onRecipeLibraryFilterChange("id", event.target.value)}
                            placeholder="Filter ID"
                            aria-label="Filter recipe library by ID"
                          />
                        </th>
                        <th>
                          <input
                            value={recipeLibraryFilters.recipe}
                            onChange={(event) => onRecipeLibraryFilterChange("recipe", event.target.value)}
                            placeholder="Filter recipe"
                            aria-label="Filter recipe library by recipe"
                          />
                        </th>
                        <th>
                          <select
                            value={recipeLibraryFilters.visibility}
                            onChange={(event) => onRecipeLibraryFilterChange("visibility", event.target.value)}
                            aria-label="Filter recipe library by visibility"
                          >
                            <option value="">All</option>
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                          </select>
                        </th>
                        <th>
                          <select
                            value={recipeLibraryFilters.status}
                            onChange={(event) => onRecipeLibraryFilterChange("status", event.target.value)}
                            aria-label="Filter recipe library by status"
                          >
                            <option value="">All</option>
                            <option value="needs_review">Need review</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="published">Published</option>
                            <option value="private">Private</option>
                            <option value="draft">Draft</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </th>
                        <th>
                          <select
                            value={recipeLibraryFilters.imageStatus}
                            onChange={(event) => onRecipeLibraryFilterChange("imageStatus", event.target.value)}
                            aria-label="Filter recipe library by image status"
                          >
                            <option value="">All</option>
                            <option value="has">Has image</option>
                            <option value="missing">Missing</option>
                          </select>
                        </th>
                        <th>
                          <select
                            value={recipeLibraryFilters.mealType}
                            onChange={(event) => onRecipeLibraryFilterChange("mealType", event.target.value)}
                            aria-label="Filter recipe library by meal"
                          >
                            <option value="">All</option>
                            <option value="breakfast">breakfast</option>
                            <option value="lunch">lunch</option>
                            <option value="dinner">dinner</option>
                            <option value="other">other</option>
                          </select>
                        </th>
                        <th>
                          <button
                            type="button"
                            className="excel-clear-button"
                            onClick={resetRecipeLibraryFilters}
                            disabled={!Object.values(recipeLibraryFilters).some((value) => String(value || "").trim())}
                          >
                            Clear
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRecipeLibraryRows.map((row) => (
                        <tr key={`lib-${row.id}`}>
                          <td className="select-cell">
                            <input
                              type="checkbox"
                              aria-label={`Select recipe library row ${row.id}`}
                              checked={selectedRecipeLibraryIds.includes(String(row.id))}
                              onChange={(event) =>
                                toggleRecipeLibrarySelection(row.id, event.target.checked)
                              }
                            />
                          </td>
                          <td>{row.id}</td>
                          <td>
                            <strong>{row.recipe_name}</strong>
                            <br />
                            <small>{row.dish_name}</small>
                          </td>
                          <td>
                            <span className={`recipe-status-badge tone-${getRecipeLibraryVisibilityTone(row.visibility)}`}>
                              {getRecipeLibraryVisibilityLabel(row.visibility)}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`recipe-status-badge tone-${getRecipeLibraryStatusTone(
                                row.data_status
                              )}`}
                            >
                              {getRecipeLibraryStatusLabel(row.data_status)}
                            </span>
                          </td>
                          <td>
                            <span className={`recipe-status-badge tone-${hasRecipeImage(row) ? "good" : "danger"}`}>
                              {hasRecipeImage(row) ? "Has image" : "Missing"}
                            </span>
                          </td>
                          <td>{row.meal_type}</td>
                          <td className="table-actions">
                            {row.visibility === "public" ? (
                              <button type="button" onClick={() => handleUnpublishCatalog(row)}>
                                Unpublish
                              </button>
                            ) : (
                              <button type="button" onClick={() => handlePublishCatalog(row)} disabled={!hasRecipeImage(row)}>
                                Publish
                              </button>
                            )}
                            <button type="button" onClick={() => handleOpenRecipeLibraryPage(row)}>
                              Preview
                            </button>
                            <button type="button" onClick={() => handleEditRecipeLibrary(row)}>
                              Edit
                            </button>
                            <button type="button" className="danger" onClick={() => handleDeleteRecipeLibrary(row)}>
                              Trash
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {activeTab === "community" ? (
              <div className="admin-module-panel">
                <div className="community-review-hero">
                  <div>
                    <span className="admin-eyebrow">Community comments moderation</span>
                    <h3>Review and remove invalid community comments</h3>
                    
                  </div>
                  <div className="community-review-stat-grid">
                    <article>
                      <strong>{communityReviewSummary.reviewCount || 0}</strong>
                      <span>total reviews</span>
                    </article>
                    <article>
                      <strong>{communityReviewSummary.reviewedRecipeCount || 0}</strong>
                      <span>recipes reviewed</span>
                    </article>
                    <article>
                      <strong>{communityReviewBreakdown[5] || 0}</strong>
                      <span>5-star reviews</span>
                    </article>
                    <article>
                      <strong>
                        {communityReviewSummary.averageRating ? communityReviewSummary.averageRating.toFixed(1) : "-"}
                      </strong>
                      <span>average rating</span>
                    </article>
                  </div>
                </div>

                <div className="community-feedback-panel">
                  <div className="community-feedback-head">
                    <div>
                      <h4>Latest community comments</h4>
                      <p>
                        {visibleCommunityReviewRows.length} visible / {communityReviewSummary.reviewCount || 0} total
                        reviews
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadCommunityReviewFeed(communityReviewFilters)}
                      disabled={isCommunityReviewLoading}
                    >
                      {isCommunityReviewLoading ? "Loading..." : "Refresh feedback"}
                    </button>
                  </div>

                  <div className="community-feedback-controls">
                    <label>
                      Search
                      <input
                        value={communityReviewFilters.query}
                        onChange={(event) => onCommunityReviewFilterChange("query", event.target.value)}
                        placeholder="Search recipe, reviewer, or comment"
                      />
                    </label>
                    <label>
                      Source
                      <select
                        value={communityReviewFilters.sourceType}
                        onChange={(event) => onCommunityReviewFilterChange("sourceType", event.target.value)}
                      >
                        <option value="all">All sources</option>
                        <option value="recipe_library">Recipe Library</option>
                        <option value="community">Community</option>
                      </select>
                    </label>
                    <label>
                      Stars
                      <select
                        value={communityReviewFilters.rating}
                        onChange={(event) => onCommunityReviewFilterChange("rating", event.target.value)}
                      >
                        <option value="all">All ratings</option>
                        <option value="5">5 stars</option>
                        <option value="4">4 stars</option>
                        <option value="3">3 stars</option>
                        <option value="2">2 stars</option>
                        <option value="1">1 star</option>
                      </select>
                    </label>
                    <label>
                      Sort
                      <select
                        value={communityReviewFilters.sort}
                        onChange={(event) => onCommunityReviewFilterChange("sort", event.target.value)}
                      >
                        <option value="newest">Newest reviews</option>
                        <option value="oldest">Oldest reviews</option>
                      </select>
                    </label>
                    <button
                      type="button"
                      className="community-feedback-reset"
                      onClick={resetCommunityReviewFilters}
                      disabled={
                        communityReviewFilters.query === DEFAULT_COMMUNITY_REVIEW_FILTERS.query &&
                        communityReviewFilters.sourceType === DEFAULT_COMMUNITY_REVIEW_FILTERS.sourceType &&
                        communityReviewFilters.rating === DEFAULT_COMMUNITY_REVIEW_FILTERS.rating &&
                        communityReviewFilters.sort === DEFAULT_COMMUNITY_REVIEW_FILTERS.sort
                      }
                    >
                      Reset
                    </button>
                  </div>

                  <div className="community-feedback-summary-grid">
                    <article>
                      <strong>
                        {communityReviewSummary.averageRating ? communityReviewSummary.averageRating.toFixed(1) : "-"}
                      </strong>
                      <span>avg rating</span>
                    </article>
                    <article>
                      <strong>{communityReviewSummary.reviewCount || 0}</strong>
                      <span>total reviews</span>
                    </article>
                    <article>
                      <strong>{communityReviewSummary.reviewedRecipeCount || 0}</strong>
                      <span>recipes reviewed</span>
                    </article>
                    <article>
                      <strong>{communityReviewBreakdown[5] || 0}</strong>
                      <span>5-star reviews</span>
                    </article>
                  </div>

                  <div className="admin-table-wrap community-feedback-table-wrap">
                    <table className="admin-table community-feedback-table">
                      <thead>
                        <tr>
                          <th>Source</th>
                          <th>Recipe</th>
                          <th>Reviewer</th>
                          <th>Stars</th>
                          <th>Comment</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleCommunityReviewRows.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="admin-empty-cell">
                              No comment/review matches your filters.
                            </td>
                          </tr>
                        ) : (
                          visibleCommunityReviewRows.map((row) => (
                            <tr key={`review-${row.id}`}>
                              <td>
                                <span
                                  className={`recipe-status-badge tone-${
                                    normalizeReviewSourceType(row?.sourceType) === "recipe_library" ? "info" : "warning"
                                  }`}
                                >
                                  {getReviewSourceLabel(row?.sourceType)}
                                </span>
                              </td>
                              <td>
                                <div className="community-review-recipe">
                                  <strong>{row?.recipe?.title || "-"}</strong>
                                  <small>{row?.recipe?.cuisine || "Global"}</small>
                                </div>
                              </td>
                              <td>
                                <div className="community-review-user">
                                  <strong>{row?.userName || `User ${row?.userId || "-"}`}</strong>
                                  <small>ID {row?.userId || "-"}</small>
                                </div>
                              </td>
                              <td>
                                <div className="community-review-stars">
                                  <span>{"★".repeat(Math.max(0, Math.min(5, Number(row?.rating) || 0)))}</span>
                                  <small>{Number(row?.rating || 0).toFixed(1)}</small>
                                </div>
                              </td>
                              <td>
                                <p className="community-review-comment">{row?.comment || "-"}</p>
                              </td>
                              <td>{formatDateTime(row?.createdAt)}</td>
                              <td className="table-actions">
                                <button
                                  type="button"
                                  className="danger"
                                  onClick={() => handleDeleteCommunityReview(row)}
                                  disabled={isCommunityReviewLoading}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === "trash" ? (
              <div className="admin-module-panel">
                <p className="admin-note">
                  Trash contains items deleted from Recipe Library and Imported Item. You can recover or permanently delete them.
                </p>
                <p className="admin-note">Recipe Library Trash ({filteredRecipeLibraryTrash.length} rows)</p>
                <div className="admin-bulk-toolbar">
                  <span>{selectedVisibleRecipeLibraryTrashCount} selected</span>
                  <button
                    type="button"
                    onClick={handleBulkRecoverRecipeLibraryTrashRows}
                    disabled={isLoading || selectedVisibleRecipeLibraryTrashCount === 0}
                  >
                    Recover selected
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={handleBulkPermanentDeleteRecipeLibraryTrashRows}
                    disabled={isLoading || selectedVisibleRecipeLibraryTrashCount === 0}
                  >
                    Delete selected permanently
                  </button>
                  <button
                    type="button"
                    className="muted"
                    onClick={() => setSelectedRecipeLibraryTrashIds([])}
                    disabled={isLoading || selectedVisibleRecipeLibraryTrashCount === 0}
                  >
                    Clear selection
                  </button>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th className="select-cell">
                          <input
                            type="checkbox"
                            aria-label="Select all visible recipe trash rows"
                            checked={
                              visibleRecipeLibraryTrashRows.length > 0 &&
                              selectedVisibleRecipeLibraryTrashCount === visibleRecipeLibraryTrashRows.length
                            }
                            onChange={(event) => {
                              const visibleIds = visibleRecipeLibraryTrashRows.map((row) => String(row?.id));
                              setSelectedRecipeLibraryTrashIds((prev) => {
                                if (event.target.checked) return Array.from(new Set([...prev, ...visibleIds]));
                                return prev.filter((id) => !visibleIds.includes(id));
                              });
                            }}
                            disabled={visibleRecipeLibraryTrashRows.length === 0}
                          />
                        </th>
                        <th>ID</th>
                        <th>Recipe</th>
                        <th>Visibility</th>
                        <th>Status</th>
                        <th>Trashed At</th>
                        <th>Reason</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRecipeLibraryTrashRows.map((row) => (
                        <tr key={`recipe-trash-${row.id}`}>
                          <td className="select-cell">
                            <input
                              type="checkbox"
                              aria-label={`Select recipe trash row ${row.id}`}
                              checked={selectedRecipeLibraryTrashIds.includes(String(row.id))}
                              onChange={(event) =>
                                toggleRecipeLibraryTrashSelection(row.id, event.target.checked)
                              }
                            />
                          </td>
                          <td>{row.id}</td>
                          <td>
                            <strong>{row.recipe_name}</strong>
                            <br />
                            <small>{row.dish_name}</small>
                          </td>
                          <td>
                            <span className={`recipe-status-badge tone-${getRecipeLibraryVisibilityTone(row.visibility)}`}>
                              {getRecipeLibraryVisibilityLabel(row.visibility)}
                            </span>
                          </td>
                          <td>
                            <span className="recipe-status-badge tone-danger">Trash</span>
                            <br />
                            <small className="trash-cell-muted">Was {getRecipeLibraryStatusLabel(row.data_status)}</small>
                          </td>
                          <td>{formatDateTime(row.trashed_at || row.updated_at || row.created_at)}</td>
                          <td className="truncate-cell">{row.trash_reason || row.moderation_reason || "-"}</td>
                          <td className="table-actions">
                            <button type="button" onClick={() => handleOpenRecipeLibraryPage(row)}>
                              Detail
                            </button>
                            <button type="button" onClick={() => handleRecoverRecipeLibrary(row)}>
                              Recover
                            </button>
                            <button type="button" className="danger" onClick={() => handlePermanentDeleteRecipeLibrary(row)}>
                              Delete permanently
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="admin-note">Trash Queue ({filteredTrashQueue.length} rows)</p>
                <div className="admin-bulk-toolbar">
                  <span>{selectedVisibleTrashCount} selected</span>
                  <button type="button" onClick={handleBulkRecoverTrashRows} disabled={isLoading || selectedVisibleTrashCount === 0}>
                    Recover selected
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={handleBulkPermanentDeleteTrashRows}
                    disabled={isLoading || selectedVisibleTrashCount === 0}
                  >
                    Delete selected permanently
                  </button>
                  <button type="button" className="muted" onClick={() => setSelectedTrashQueueIds([])} disabled={isLoading || selectedVisibleTrashCount === 0}>
                    Clear selection
                  </button>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th className="select-cell">
                          <input
                            type="checkbox"
                            aria-label="Select all visible Trash rows"
                            checked={visibleTrashQueueRows.length > 0 && selectedVisibleTrashCount === visibleTrashQueueRows.length}
                            onChange={(event) => {
                              const visibleIds = visibleTrashQueueRows.map((row) => getQueueRowId(row)).filter(Boolean);
                              setSelectedTrashQueueIds((prev) => {
                                if (event.target.checked) return Array.from(new Set([...prev, ...visibleIds]));
                                return prev.filter((id) => !visibleIds.includes(id));
                              });
                            }}
                          />
                        </th>
                        <th>ID</th>
                        <th>Dish</th>
                        <th>Meal Type</th>
                        <th>Cuisine Hint</th>
                        <th>Method Hint</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleTrashQueueRows.map((row, index) => {
                        const queueId = getQueueRowId(row);
                        return (
                        <tr key={`trash-${queueId || index}`}>
                          <td className="select-cell">
                            <input
                              type="checkbox"
                              aria-label={`Select Trash row ${queueId || index}`}
                              checked={selectedTrashQueueIds.includes(queueId)}
                              onChange={(event) => toggleTrashSelection(queueId, event.target.checked)}
                            />
                          </td>
                          <td>{queueId || "-"}</td>
                          <td>{row.dish_name}</td>
                          <td>{row.meal_type || "-"}</td>
                          <td>{row.cuisine_hint || "-"}</td>
                          <td>{row.cooking_method_hint || "-"}</td>
                          <td>{row.status || "-"}</td>
                          <td>{formatDateTime(row.created_at)}</td>
                          <td className="table-actions">
                            <button type="button" onClick={() => handleRecoverImportQueueRow(row)}>
                              Recover
                            </button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => handlePermanentDeleteImportQueueRow(row)}
                            >
                              Delete Permanently
                            </button>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {activeTab === "references" ? (
              <div className="admin-module-panel">
          <p className="admin-note">
            Cuisines / Ingredients / Cooking Methods currently only have GET API. To enable CRUD operations, additional BE endpoints or backend service roles are needed.
          </p>

          <div className="ref-grid">
            <article>
              <h3>Cuisines ({filteredReferenceData.cuisines.length})</h3>
              <ul>
                {filteredReferenceData.cuisines.slice(0, 80).map((item) => (
                  <li key={`c-${item.id}`}>{item.id} - {item.name}</li>
                ))}
              </ul>
            </article>
            <article>
              <h3>Cooking Methods ({filteredReferenceData.cookingMethods.length})</h3>
              <ul>
                {filteredReferenceData.cookingMethods.slice(0, 80).map((item) => (
                  <li key={`m-${item.id}`}>{item.id} - {item.name}</li>
                ))}
              </ul>
            </article>
            <article>
              <h3>Ingredients ({filteredReferenceData.ingredients.length})</h3>
              <ul>
                {filteredReferenceData.ingredients.slice(0, 120).map((item) => (
                  <li key={`i-${item.id}`}>{item.id} - {item.name} ({item.category || "N/A"})</li>
                ))}
              </ul>
            </article>
          </div>
              </div>
            ) : null}
          </section>
        </section>
      </main>
    </div>
  );
}
