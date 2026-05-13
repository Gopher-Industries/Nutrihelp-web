import "./AdminRecipeLibraryPage.css";

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ChefHat,
  Clock3,
  Eye,
  FileText,
  ImagePlus,
  PencilLine,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  fetchRecipeLibraryItem,
  permanentlyDeleteRecipeLibraryItem,
  publishRecipeLibraryCatalog,
  recoverRecipeLibraryItem,
  updateRecipeLibraryItem,
} from "../../services/adminDataApi";

const DEFAULT_IMAGE = "/images/meal-mock/placeholder.svg";

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeMealType(value, fallback = "breakfast") {
  const normalized = normalizeText(value).toLowerCase();
  if (!normalized) return fallback;
  if (["breakfast", "lunch", "dinner", "other"].includes(normalized)) return normalized;
  if (["others", "snack", "snacks", "dessert", "desserts", "drink", "drinks", "beverage", "beverages"].includes(normalized)) {
    return "other";
  }
  return fallback;
}

function humanize(value) {
  return normalizeText(value).replace(/_/g, " ");
}

function toList(value) {
  if (Array.isArray(value)) return value.map((item) => normalizeText(item)).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/,|\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function toJsonText(value, fallback = "[]") {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2);
    } catch (_error) {
      return trimmed;
    }
  }

  if (Array.isArray(value) || (value && typeof value === "object")) {
    return JSON.stringify(value, null, 2);
  }

  return fallback;
}

function toInstructionText(value) {
  if (Array.isArray(value)) return value.map((item) => normalizeText(item)).filter(Boolean).join("\n");
  if (typeof value === "string") return value.trim();
  return "";
}

function safeArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return [parsed];
    } catch (_error) {
      return toList(value).map((item) => ({ name: item }));
    }
  }
  if (value && typeof value === "object") return [value];
  return [];
}

function safeInstructions(value) {
  if (Array.isArray(value)) return value.map((item) => normalizeText(item)).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((item) => item.trim().replace(/^\d+[.)]\s*/, ""))
      .filter(Boolean);
  }
  return [];
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function formatStatusLabel(status) {
  const normalized = normalizeText(status).toLowerCase();
  if (normalized === "needs_review") return "Need review";
  if (normalized === "reviewed") return "Reviewed";
  if (normalized === "published") return "Published";
  if (normalized === "user_private" || normalized === "private") return "Private";
  if (normalized === "rejected") return "Rejected";
  if (!normalized) return "-";
  return humanize(normalized);
}

function getStatusTone(status) {
  const normalized = normalizeText(status).toLowerCase();
  if (normalized === "published" || normalized === "reviewed") return "good";
  if (normalized === "needs_review") return "warning";
  if (normalized === "rejected") return "danger";
  if (normalized === "private" || normalized === "user_private" || normalized === "draft") return "neutral";
  return "info";
}

function formatVisibilityLabel(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === "public") return "Public";
  if (normalized === "community") return "Community";
  if (normalized === "community_pending") return "Community pending";
  if (normalized === "private" || normalized === "user_private") return "Private";
  if (!normalized) return "-";
  return humanize(normalized);
}

function getVisibilityTone(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === "public") return "good";
  if (normalized === "community") return "info";
  if (normalized === "community_pending") return "warning";
  if (normalized === "private" || normalized === "user_private") return "neutral";
  return "info";
}

function formatConfidence(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return number > 1 ? `${Math.round(number)}%` : `${Math.round(number * 100)}%`;
}

function formatTiming(recipe) {
  const prep = Number(recipe?.prep_time_minutes);
  const cook = Number(recipe?.cook_time_minutes);
  const prepLabel = Number.isFinite(prep) && prep > 0 ? `${Math.round(prep)}m prep` : null;
  const cookLabel = Number.isFinite(cook) && cook > 0 ? `${Math.round(cook)}m cook` : null;
  return [prepLabel, cookLabel].filter(Boolean).join(" / ") || "Time not set";
}

function formatCalories(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? `${Math.round(number)} kcal` : "Calories not set";
}

function formatServings(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "Servings not set";
  return `${number}${number === 1 ? " serving" : " servings"}`;
}

function formatIngredientLine(item, index) {
  const name = normalizeText(item?.name || item?.ingredient || item?.ingredient_name) || `Ingredient ${index + 1}`;
  const amount = normalizeText(item?.quantity || item?.amount);
  const unit = normalizeText(item?.unit);
  const notes = normalizeText(item?.notes);
  const amountLabel = [amount, unit].filter(Boolean).join(" ");
  return {
    title: name,
    detail: [amountLabel, notes].filter(Boolean).join(" • "),
  };
}

function buildDraft(recipe) {
  return {
    recipe_name: normalizeText(recipe?.recipe_name),
    dish_name: normalizeText(recipe?.dish_name),
    display_name: normalizeText(recipe?.display_name),
    description: normalizeText(recipe?.description),
    meal_type: normalizeMealType(recipe?.meal_type, "breakfast"),
    cuisine_name_snapshot: normalizeText(recipe?.cuisine_name_snapshot),
    cooking_method_name_snapshot: normalizeText(recipe?.cooking_method_name_snapshot),
    difficulty: normalizeText(recipe?.difficulty),
    spice_level: normalizeText(recipe?.spice_level),
    prep_time_minutes: normalizeText(recipe?.prep_time_minutes),
    cook_time_minutes: normalizeText(recipe?.cook_time_minutes),
    servings: normalizeText(recipe?.servings),
    serving_size: normalizeText(recipe?.serving_size),
    ingredients: toJsonText(recipe?.ingredients),
    instructions: toInstructionText(recipe?.instructions),
    equipment: toList(recipe?.equipment).join(", "),
    tips: toList(recipe?.tips).join(", "),
    storage_instructions: normalizeText(recipe?.storage_instructions),
    reheating_instructions: normalizeText(recipe?.reheating_instructions),
    notes: normalizeText(recipe?.notes),
    dietary_tags: toList(recipe?.dietary_tags).join(", "),
    health_tags: toList(recipe?.health_tags).join(", "),
    allergens: toList(recipe?.allergens).join(", "),
    avoid_for_conditions: toList(recipe?.avoid_for_conditions).join(", "),
    suitable_goals: toList(recipe?.suitable_goals).join(", "),
    calories: normalizeText(recipe?.calories),
    protein: normalizeText(recipe?.protein),
    fat: normalizeText(recipe?.fat),
    saturated_fat: normalizeText(recipe?.saturated_fat),
    carbohydrates: normalizeText(recipe?.carbohydrates),
    fiber: normalizeText(recipe?.fiber),
    sugar: normalizeText(recipe?.sugar),
    sodium: normalizeText(recipe?.sodium),
    potassium: normalizeText(recipe?.potassium),
    calcium: normalizeText(recipe?.calcium),
    iron: normalizeText(recipe?.iron),
    vitamin_a: normalizeText(recipe?.vitamin_a),
    vitamin_c: normalizeText(recipe?.vitamin_c),
    image_url: normalizeText(recipe?.image_url),
    image_original_url: normalizeText(recipe?.image_original_url),
    image_source: normalizeText(recipe?.image_source),
    image_source_url: normalizeText(recipe?.image_source_url),
    image_attribution: normalizeText(recipe?.image_attribution),
    image_license: normalizeText(recipe?.image_license),
    image_confidence: normalizeText(recipe?.image_confidence),
  };
}

function SummaryCard({ icon: Icon, label, value, note, tone = "info" }) {
  return (
    <article className={`recipe-admin-summary-card tone-${tone}`}>
      <div className="recipe-admin-summary-icon">
        <Icon size={18} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {note ? <small>{note}</small> : null}
      </div>
    </article>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "", help = "", multiline = false, rows = 4, className = "", children, disabled = false }) {
  return (
    <label className={`recipe-admin-field ${className}`.trim()}>
      <span>{label}</span>
      {children ? (
        children
      ) : multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      {help ? <p className="recipe-admin-field-help">{help}</p> : null}
    </label>
  );
}

function ReadonlyItem({ label, value, className = "" }) {
  return (
    <article className={`recipe-admin-readonly-item ${className}`.trim()}>
      <span>{label}</span>
      <strong>{normalizeText(value) || "-"}</strong>
    </article>
  );
}

function RecipeBadge({ label, tone = "info" }) {
  return <span className={`recipe-admin-badge tone-${tone}`}>{label}</span>;
}

export default function AdminRecipeLibraryPage({ mode = "view" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: rawId } = useParams();
  const isEditRoute = mode === "edit";

  const recipeId = useMemo(() => String(rawId || "").trim(), [rawId]);
  const [recipe, setRecipe] = useState(null);
  const [draft, setDraft] = useState(() => buildDraft(null));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isTrashed = Boolean(recipe?.trashed_at);
  const canEditRecipe = isEditRoute && !isTrashed;

  useEffect(() => {
    let active = true;

    const loadRecipe = async () => {
      if (!recipeId) {
        setError("Recipe id is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");
      setSuccess("");

      try {
        const data = await fetchRecipeLibraryItem(recipeId);
        if (!active) return;
        setRecipe(data);
        setDraft(buildDraft(data));
      } catch (loadError) {
        if (!active) return;
        setError(loadError.message || "Failed to load recipe library entry.");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadRecipe();

    return () => {
      active = false;
    };
  }, [recipeId]);

  useEffect(() => {
    if (!recipe) return;
    const anchor = String(location.hash || "").replace(/^#/, "");
    if (!anchor) return;

    const target = document.getElementById(anchor);
    if (target) {
      window.requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.hash, recipe]);

  const imageSrc = normalizeText(draft.image_url) || normalizeText(recipe?.image_url) || DEFAULT_IMAGE;
  const ingredients = useMemo(() => safeArray(recipe?.ingredients), [recipe]);
  const instructions = useMemo(() => safeInstructions(recipe?.instructions), [recipe]);
  const aiResponse = useMemo(() => {
    const raw = recipe?.ai_raw_response;
    if (raw === null || raw === undefined || raw === "") return "";
    if (typeof raw === "string") return raw;
    try {
      return JSON.stringify(raw, null, 2);
    } catch (_error) {
      return String(raw);
    }
  }, [recipe]);

  const handleFieldChange = (field) => (event) => {
    setDraft((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const nextValue = String(reader.result || "");
      setDraft((prev) => ({
        ...prev,
        image_url: nextValue,
        image_source: prev.image_source || "admin_upload",
      }));
      setSuccess(`Loaded ${file.name} into the preview.`);
    };
    reader.readAsDataURL(file);
  };

  const goBack = () => {
    navigate("/admin");
  };

  const openRecipeSection = () => {
    const target = document.getElementById("recipe-section");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openEditPage = () => {
    if (!recipeId) return;
    navigate(`/admin/recipe-library/${recipeId}/edit`);
  };

  const handleRecover = async () => {
    if (!recipeId) return;
    const title = recipe?.recipe_name || recipe?.dish_name || `recipe #${recipeId}`;
    if (!window.confirm(`Recover ${title} from Trash?`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await recoverRecipeLibraryItem(recipeId);
      const refreshed = await fetchRecipeLibraryItem(recipeId);
      setRecipe(refreshed);
      setDraft(buildDraft(refreshed));
      setSuccess(`${title} was recovered from Trash.`);
    } catch (recoverError) {
      setError(recoverError.message || "Failed to recover recipe.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!recipeId) return;
    const title = recipe?.recipe_name || recipe?.dish_name || `recipe #${recipeId}`;
    if (!window.confirm(`Permanently delete ${title}? This cannot be undone.`)) return;

    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await permanentlyDeleteRecipeLibraryItem(recipeId);
      navigate("/admin");
    } catch (deleteError) {
      setError(deleteError.message || "Failed to permanently delete recipe.");
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!recipeId) return;
    if (isTrashed) {
      setError("Recover this recipe from Trash before publishing.");
      return;
    }
    const title = recipe?.recipe_name || recipe?.dish_name || `recipe #${recipeId}`;
    if (!window.confirm(`Publish ${title} to the public catalog?`)) return;

    setError("");
    setSuccess("");
    setIsPublishing(true);
    try {
      await publishRecipeLibraryCatalog(recipeId);
      const refreshed = await fetchRecipeLibraryItem(recipeId);
      setRecipe(refreshed);
      setDraft(buildDraft(refreshed));
      setSuccess(`${title} was published to the public catalog.`);
    } catch (publishError) {
      setError(publishError.message || "Failed to publish recipe.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!recipeId) return;
    if (isTrashed) {
      setError("Recover this recipe from Trash before editing.");
      return;
    }

    const recipeName = normalizeText(draft.recipe_name);
    const dishName = normalizeText(draft.dish_name);
    if (!recipeName) {
      setError("Recipe name is required.");
      return;
    }

    if (normalizeText(draft.ingredients)) {
      try {
        const parsedIngredients = JSON.parse(draft.ingredients);
        if (!Array.isArray(parsedIngredients)) throw new Error("Ingredients must be a JSON array.");
      } catch (_error) {
        setError("Ingredients must be valid JSON.");
        return;
      }
    }

    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const payload = {
        recipe_name: recipeName,
        dish_name: dishName || recipeName,
        display_name: normalizeText(draft.display_name),
        description: normalizeText(draft.description),
        meal_type: normalizeMealType(draft.meal_type, "breakfast"),
        cuisine_name_snapshot: normalizeText(draft.cuisine_name_snapshot),
        cooking_method_name_snapshot: normalizeText(draft.cooking_method_name_snapshot),
        difficulty: normalizeText(draft.difficulty),
        spice_level: normalizeText(draft.spice_level),
        prep_time_minutes: draft.prep_time_minutes,
        cook_time_minutes: draft.cook_time_minutes,
        servings: draft.servings,
        serving_size: normalizeText(draft.serving_size),
        ingredients: draft.ingredients,
        instructions: draft.instructions,
        equipment: draft.equipment,
        tips: draft.tips,
        storage_instructions: normalizeText(draft.storage_instructions),
        reheating_instructions: normalizeText(draft.reheating_instructions),
        notes: normalizeText(draft.notes),
        dietary_tags: draft.dietary_tags,
        health_tags: draft.health_tags,
        allergens: draft.allergens,
        avoid_for_conditions: draft.avoid_for_conditions,
        suitable_goals: draft.suitable_goals,
        calories: draft.calories,
        protein: draft.protein,
        fat: draft.fat,
        saturated_fat: draft.saturated_fat,
        carbohydrates: draft.carbohydrates,
        fiber: draft.fiber,
        sugar: draft.sugar,
        sodium: draft.sodium,
        potassium: draft.potassium,
        calcium: draft.calcium,
        iron: draft.iron,
        vitamin_a: draft.vitamin_a,
        vitamin_c: draft.vitamin_c,
        image_url: normalizeText(draft.image_url),
        image_original_url: normalizeText(draft.image_original_url),
        image_source: normalizeText(draft.image_source),
        image_source_url: normalizeText(draft.image_source_url),
        image_attribution: normalizeText(draft.image_attribution),
        image_license: normalizeText(draft.image_license),
        image_confidence: draft.image_confidence,
      };

      const updated = await updateRecipeLibraryItem(recipeId, payload);
      setRecipe(updated);
      setDraft(buildDraft(updated));
      setSuccess(`Saved changes for ${updated?.recipe_name || recipeName}.`);
    } catch (saveError) {
      setError(saveError.message || "Failed to update recipe.");
    } finally {
      setIsSaving(false);
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        icon: Eye,
        label: "Visibility",
        value: formatVisibilityLabel(recipe?.visibility),
        note: humanize(recipe?.source || ""),
        tone: getVisibilityTone(recipe?.visibility),
      },
      {
        icon: Sparkles,
        label: "Review status",
        value: isTrashed ? "In Trash" : formatStatusLabel(recipe?.data_status),
        note: isTrashed
          ? recipe?.trash_reason || `Trashed ${formatDate(recipe?.trashed_at)}`
          : recipe?.moderation_status
            ? humanize(recipe.moderation_status)
            : "Moderation state",
        tone: isTrashed ? "danger" : getStatusTone(recipe?.data_status),
      },
      {
        icon: Clock3,
        label: "Timing",
        value: formatTiming(recipe),
        note: `Updated ${formatDate(recipe?.updated_at)}`,
        tone: "info",
      },
      {
        icon: ChefHat,
        label: "Servings",
        value: formatServings(recipe?.servings),
        note: formatCalories(recipe?.calories),
        tone: "neutral",
      },
    ],
    [isTrashed, recipe]
  );

  const coreInfo = useMemo(
    () => [
      { label: "Recipe name", value: recipe?.recipe_name },
      { label: "Dish name", value: recipe?.dish_name },
      { label: "Display name", value: recipe?.display_name },
      { label: "Meal type", value: humanize(recipe?.meal_type) },
      { label: "Cuisine snapshot", value: recipe?.cuisine_name_snapshot },
      { label: "Cooking method snapshot", value: recipe?.cooking_method_name_snapshot },
      { label: "Difficulty", value: humanize(recipe?.difficulty) },
      { label: "Spice level", value: humanize(recipe?.spice_level) },
      { label: "Prep time", value: recipe?.prep_time_minutes ? `${recipe.prep_time_minutes} min` : "-" },
      { label: "Cook time", value: recipe?.cook_time_minutes ? `${recipe.cook_time_minutes} min` : "-" },
      { label: "Source", value: humanize(recipe?.source) },
      { label: "Slug", value: recipe?.slug },
      ...(isTrashed
        ? [
            { label: "Trashed at", value: formatDate(recipe?.trashed_at) },
            { label: "Trash reason", value: recipe?.trash_reason || "-" },
          ]
        : []),
    ],
    [isTrashed, recipe]
  );

  const nutritionInfo = useMemo(
    () => [
      { label: "Calories", value: recipe?.calories ? `${recipe.calories} kcal` : "-" },
      { label: "Protein", value: recipe?.protein ? `${recipe.protein} g` : "-" },
      { label: "Fat", value: recipe?.fat ? `${recipe.fat} g` : "-" },
      { label: "Sat. fat", value: recipe?.saturated_fat ? `${recipe.saturated_fat} g` : "-" },
      { label: "Carbs", value: recipe?.carbohydrates ? `${recipe.carbohydrates} g` : "-" },
      { label: "Fiber", value: recipe?.fiber ? `${recipe.fiber} g` : "-" },
      { label: "Sugar", value: recipe?.sugar ? `${recipe.sugar} g` : "-" },
      { label: "Sodium", value: recipe?.sodium ? `${recipe.sodium} mg` : "-" },
      { label: "Potassium", value: recipe?.potassium ? `${recipe.potassium} mg` : "-" },
      { label: "Calcium", value: recipe?.calcium ? `${recipe.calcium} mg` : "-" },
      { label: "Iron", value: recipe?.iron ? `${recipe.iron} mg` : "-" },
      { label: "Vitamin A", value: recipe?.vitamin_a ? `${recipe.vitamin_a} mg` : "-" },
      { label: "Vitamin C", value: recipe?.vitamin_c ? `${recipe.vitamin_c} mg` : "-" },
    ],
    [recipe]
  );

  const tagGroups = useMemo(
    () => [
      { label: "Dietary tags", values: toList(recipe?.dietary_tags) },
      { label: "Health tags", values: toList(recipe?.health_tags) },
      { label: "Allergens", values: toList(recipe?.allergens) },
      { label: "Avoid for conditions", values: toList(recipe?.avoid_for_conditions) },
      { label: "Suitable goals", values: toList(recipe?.suitable_goals) },
      { label: "Equipment", values: toList(recipe?.equipment) },
      { label: "Tips", values: toList(recipe?.tips) },
    ],
    [recipe]
  );

  if (isLoading) {
    return (
      <div className="recipe-admin-page">
        <main className="recipe-admin-shell">
          <section className="recipe-admin-loading-card">
            <Sparkles size={22} />
            <div>
              <strong>Loading recipe library entry</strong>
              <span>Please wait while the admin record is loaded.</span>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-admin-page">
        <main className="recipe-admin-shell">
          <header className="recipe-admin-topline">
            <button type="button" className="recipe-admin-back-button" onClick={goBack}>
              <ArrowLeft size={16} />
              Back to admin
            </button>
          </header>
          <section className="recipe-admin-empty-state">
            <Sparkles size={28} />
            <h1>Recipe not found</h1>
            <p>The selected recipe library entry could not be loaded.</p>
          </section>
        </main>
      </div>
    );
  }

  const showPublishButton = !isTrashed && normalizeText(recipe?.visibility).toLowerCase() !== "public";

  return (
    <div className="recipe-admin-page">
      <main className="recipe-admin-shell">
        <header className="recipe-admin-topline">
          <button type="button" className="recipe-admin-back-button" onClick={goBack}>
            <ArrowLeft size={16} />
            Back to admin
          </button>
          <div className="recipe-admin-topline-meta">
            <RecipeBadge label={`ID ${recipe.id}`} tone="info" />
            <RecipeBadge label={formatVisibilityLabel(recipe.visibility)} tone={getVisibilityTone(recipe.visibility)} />
            <RecipeBadge label={isTrashed ? "In Trash" : formatStatusLabel(recipe.data_status)} tone={isTrashed ? "danger" : getStatusTone(recipe.data_status)} />
          </div>
        </header>

        {error ? <p className="recipe-admin-banner error">{error}</p> : null}
        {success ? <p className="recipe-admin-banner success">{success}</p> : null}
        {isTrashed ? (
          <p className="recipe-admin-banner warning">
            This recipe is in Trash. Recover it before editing or publishing.
          </p>
        ) : null}

        <section className="recipe-admin-hero">
          <div className="recipe-admin-hero-media">
            <img
              src={imageSrc}
              alt={recipe?.recipe_name || recipe?.dish_name || "Recipe"}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = DEFAULT_IMAGE;
              }}
            />
            <div className="recipe-admin-hero-media-overlay">
              <RecipeBadge label={isTrashed ? "In Trash" : formatStatusLabel(recipe.data_status)} tone={isTrashed ? "danger" : getStatusTone(recipe.data_status)} />
              {recipe?.ai_generated ? <RecipeBadge label="AI enriched" tone="info" /> : null}
            </div>
          </div>

          <div className="recipe-admin-hero-copy">
            <span className="recipe-admin-eyebrow">Recipe Library</span>
            <h1>{recipe?.recipe_name || recipe?.dish_name || "Untitled recipe"}</h1>
            <p>{recipe?.description || "This enriched recipe is ready for review, editing and publishing."}</p>

            <div className="recipe-admin-summary-grid">
              {summaryCards.map((item) => (
                <SummaryCard
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  note={item.note}
                  tone={item.tone}
                />
              ))}
            </div>

            <div className="recipe-admin-key-meta">
              <RecipeBadge label={humanize(recipe?.meal_type) || "Meal type"} tone="neutral" />
              <RecipeBadge label={recipe?.cuisine_name_snapshot || "Cuisine unknown"} tone="info" />
              <RecipeBadge label={recipe?.cooking_method_name_snapshot || "Method unknown"} tone="info" />
              <RecipeBadge label={formatServings(recipe?.servings)} tone="neutral" />
              <RecipeBadge label={humanize(recipe?.source || "")} tone="neutral" />
            </div>

            <div className="recipe-admin-hero-actions">
              {isTrashed ? (
                <>
                  <button type="button" className="recipe-admin-primary-button" onClick={handleRecover}>
                    <RotateCcw size={16} />
                    Recover
                  </button>
                  <button type="button" className="recipe-admin-danger-button" onClick={handlePermanentDelete}>
                    <Trash2 size={16} />
                    Delete permanently
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="recipe-admin-ghost-button" onClick={openRecipeSection}>
                    <BookOpen size={16} />
                    Recipe
                  </button>
                  {!isEditRoute ? (
                    <button type="button" className="recipe-admin-primary-button" onClick={openEditPage}>
                      <PencilLine size={16} />
                      Edit
                    </button>
                  ) : (
                    <button type="button" className="recipe-admin-ghost-button" onClick={() => navigate(`/admin/recipe-library/${recipeId}`)}>
                      <Eye size={16} />
                      View detail
                    </button>
                  )}
                  {showPublishButton ? (
                    <button
                      type="button"
                      className="recipe-admin-accent-button"
                      onClick={handlePublish}
                      disabled={isPublishing}
                    >
                      {isPublishing ? "Publishing..." : "Publish"}
                    </button>
                  ) : null}
                  {canEditRecipe ? (
                    <button type="submit" form="recipe-admin-form" className="recipe-admin-primary-button" disabled={isSaving}>
                      <Save size={16} />
                      {isSaving ? "Saving..." : "Save changes"}
                    </button>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </section>

        {canEditRecipe ? (
          <form id="recipe-admin-form" className="recipe-admin-grid recipe-admin-grid-edit" onSubmit={handleSave}>
            <section className="recipe-admin-card">
              <div className="recipe-admin-card-header">
                <div>
                  <ChefHat size={18} />
                  <h2>Core details</h2>
                </div>
                <span>Primary content and classification</span>
              </div>

              <div className="recipe-admin-fields-grid">
                <Field label="Recipe name" value={draft.recipe_name} onChange={handleFieldChange("recipe_name")} placeholder="Moroccan Chickpea Bowl" />
                <Field label="Dish name" value={draft.dish_name} onChange={handleFieldChange("dish_name")} placeholder="Chickpea bowl" />
                <Field label="Display name" value={draft.display_name} onChange={handleFieldChange("display_name")} placeholder="Moroccan Chickpea Bowl with Mint Yogurt" />
                <Field label="Meal type" className="field-select">
                  <select value={draft.meal_type} onChange={handleFieldChange("meal_type")}>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Difficulty" className="field-select">
                  <select value={draft.difficulty} onChange={handleFieldChange("difficulty")}>
                    <option value="">Not set</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </Field>
                <Field label="Spice level" className="field-select">
                  <select value={draft.spice_level} onChange={handleFieldChange("spice_level")}>
                    <option value="">Not set</option>
                    <option value="none">None</option>
                    <option value="mild">Mild</option>
                    <option value="medium">Medium</option>
                    <option value="hot">Hot</option>
                  </select>
                </Field>
                <Field label="Cuisine snapshot" value={draft.cuisine_name_snapshot} onChange={handleFieldChange("cuisine_name_snapshot")} placeholder="Mediterranean" />
                <Field label="Method snapshot" value={draft.cooking_method_name_snapshot} onChange={handleFieldChange("cooking_method_name_snapshot")} placeholder="Baked" />
                <Field label="Prep time (min)" type="number" value={draft.prep_time_minutes} onChange={handleFieldChange("prep_time_minutes")} />
                <Field label="Cook time (min)" type="number" value={draft.cook_time_minutes} onChange={handleFieldChange("cook_time_minutes")} />
                <Field label="Servings" type="number" value={draft.servings} onChange={handleFieldChange("servings")} />
                <Field label="Serving size" value={draft.serving_size} onChange={handleFieldChange("serving_size")} placeholder="1 bowl" />
                <Field label="Description" className="span-2" multiline rows={4} value={draft.description} onChange={handleFieldChange("description")} placeholder="Short summary shown to admins and users." />
              </div>
            </section>

            <section className="recipe-admin-card span-2" id="recipe-section">
              <div className="recipe-admin-card-header">
                <div>
                  <FileText size={18} />
                  <h2>Recipe content</h2>
                </div>
                <span>Ingredients and step-by-step method</span>
              </div>

              <div className="recipe-admin-fields-grid">
                <Field
                  label="Ingredients JSON"
                  className="span-2"
                  multiline
                  rows={10}
                  value={draft.ingredients}
                  onChange={handleFieldChange("ingredients")}
                  help="Use a JSON array so quantity, unit and notes are preserved when saving."
                  placeholder='[{"name":"Chickpeas","quantity":400,"unit":"g","notes":"drained"}]'
                />
                <Field
                  label="Instructions"
                  className="span-2"
                  multiline
                  rows={8}
                  value={draft.instructions}
                  onChange={handleFieldChange("instructions")}
                  help="One step per line. Numbered steps are accepted."
                  placeholder="1. Preheat the oven...\n2. Toss the vegetables..."
                />
                <Field label="Equipment" multiline rows={3} value={draft.equipment} onChange={handleFieldChange("equipment")} placeholder="Baking tray, mixing bowl, saucepan" />
                <Field label="Tips" multiline rows={3} value={draft.tips} onChange={handleFieldChange("tips")} placeholder="Toast the spices briefly for extra depth." />
                <Field label="Storage instructions" multiline rows={3} value={draft.storage_instructions} onChange={handleFieldChange("storage_instructions")} placeholder="Refrigerate in an airtight container for 3 days." />
                <Field label="Reheating instructions" multiline rows={3} value={draft.reheating_instructions} onChange={handleFieldChange("reheating_instructions")} placeholder="Reheat gently in a pan or microwave until hot." />
                <Field label="Notes" className="span-2" multiline rows={3} value={draft.notes} onChange={handleFieldChange("notes")} placeholder="Any admin notes or context." />
                <Field label="Dietary tags" multiline rows={3} value={draft.dietary_tags} onChange={handleFieldChange("dietary_tags")} placeholder="vegetarian, high-protein" />
                <Field label="Health tags" multiline rows={3} value={draft.health_tags} onChange={handleFieldChange("health_tags")} placeholder="heart healthy, balanced" />
                <Field label="Allergens" multiline rows={3} value={draft.allergens} onChange={handleFieldChange("allergens")} placeholder="nuts, dairy" />
                <Field label="Avoid for conditions" multiline rows={3} value={draft.avoid_for_conditions} onChange={handleFieldChange("avoid_for_conditions")} placeholder="low-FODMAP, renal support" />
                <Field label="Suitable goals" multiline rows={3} value={draft.suitable_goals} onChange={handleFieldChange("suitable_goals")} placeholder="weight loss, muscle gain" />
              </div>
            </section>

            <section className="recipe-admin-card">
              <div className="recipe-admin-card-header">
                <div>
                  <Sparkles size={18} />
                  <h2>Nutrition & media</h2>
                </div>
                <span>Calorie values and image replacement</span>
              </div>

              <div className="recipe-admin-fields-grid compact">
                <Field label="Calories" type="number" value={draft.calories} onChange={handleFieldChange("calories")} />
                <Field label="Protein" type="number" value={draft.protein} onChange={handleFieldChange("protein")} />
                <Field label="Fat" type="number" value={draft.fat} onChange={handleFieldChange("fat")} />
                <Field label="Saturated fat" type="number" value={draft.saturated_fat} onChange={handleFieldChange("saturated_fat")} />
                <Field label="Carbohydrates" type="number" value={draft.carbohydrates} onChange={handleFieldChange("carbohydrates")} />
                <Field label="Fiber" type="number" value={draft.fiber} onChange={handleFieldChange("fiber")} />
                <Field label="Sugar" type="number" value={draft.sugar} onChange={handleFieldChange("sugar")} />
                <Field label="Sodium" type="number" value={draft.sodium} onChange={handleFieldChange("sodium")} />
                <Field label="Potassium" type="number" value={draft.potassium} onChange={handleFieldChange("potassium")} />
                <Field label="Calcium" type="number" value={draft.calcium} onChange={handleFieldChange("calcium")} />
                <Field label="Iron" type="number" value={draft.iron} onChange={handleFieldChange("iron")} />
                <Field label="Vitamin A" type="number" value={draft.vitamin_a} onChange={handleFieldChange("vitamin_a")} />
                <Field label="Vitamin C" type="number" value={draft.vitamin_c} onChange={handleFieldChange("vitamin_c")} />
                <Field label="Image URL" className="span-2" value={draft.image_url} onChange={handleFieldChange("image_url")} placeholder="https://..." help="Paste a new image URL or load a local file below." />
                <Field label="Upload replacement image" className="span-2">
                  <div className="recipe-admin-upload-row">
                    <input type="file" accept="image/*" onChange={handleImageFileChange} />
                    <p>Local files are loaded into the preview and saved as the current image URL.</p>
                  </div>
                </Field>
                <Field label="Original image URL" className="span-2" value={draft.image_original_url} onChange={handleFieldChange("image_original_url")} placeholder="Original image source link" />
                <Field label="Image source" value={draft.image_source} onChange={handleFieldChange("image_source")} placeholder="unsplash, uploaded, admin_upload" />
                <Field label="Source URL" value={draft.image_source_url} onChange={handleFieldChange("image_source_url")} placeholder="https://source.example.com" />
                <Field label="Image attribution" className="span-2" value={draft.image_attribution} onChange={handleFieldChange("image_attribution")} placeholder="Photo by ..." />
                <Field label="Image license" value={draft.image_license} onChange={handleFieldChange("image_license")} placeholder="Unsplash license" />
                <Field label="Image confidence" type="number" value={draft.image_confidence} onChange={handleFieldChange("image_confidence")} />
              </div>
            </section>

            <section className="recipe-admin-card span-2">
              <div className="recipe-admin-card-header">
                <div>
                  <ImagePlus size={18} />
                  <h2>AI metadata</h2>
                </div>
                <span>Read-only enrichment details</span>
              </div>

              <div className="recipe-admin-fields-grid compact">
                <ReadonlyItem label="AI generated" value={recipe?.ai_generated ? "Yes" : "No"} />
                <ReadonlyItem label="Provider" value={recipe?.ai_provider} />
                <ReadonlyItem label="Model" value={recipe?.ai_model} />
                <ReadonlyItem label="Prompt version" value={recipe?.ai_prompt_version} />
                <ReadonlyItem label="AI confidence" value={formatConfidence(recipe?.ai_confidence)} />
                <ReadonlyItem label="Reviewed at" value={formatDate(recipe?.reviewed_at)} />
                <ReadonlyItem label="Published at" value={formatDate(recipe?.published_at)} />
                <ReadonlyItem label="Updated at" value={formatDate(recipe?.updated_at)} />
              </div>

              {aiResponse ? (
                <details className="recipe-admin-details-block">
                  <summary>Raw AI payload</summary>
                  <pre className="recipe-admin-json-box">{aiResponse}</pre>
                </details>
              ) : null}
            </section>
          </form>
        ) : (
          <div className="recipe-admin-grid recipe-admin-grid-view">
            <section className="recipe-admin-card">
              <div className="recipe-admin-card-header">
                <div>
                  <FileText size={18} />
                  <h2>Overview</h2>
                </div>
                <span>Recipe metadata and review context</span>
              </div>

              <div className="recipe-admin-readonly-grid">
                {coreInfo.map((item) => (
                  <ReadonlyItem key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            </section>

            <section className="recipe-admin-card" id="recipe-section">
              <div className="recipe-admin-card-header">
                <div>
                  <BookOpen size={18} />
                  <h2>Recipe</h2>
                </div>
                <span>Ingredients and instructions</span>
              </div>

              <div className="recipe-admin-stack">
                <div>
                  <h3>Ingredients</h3>
                  {ingredients.length ? (
                    <div className="recipe-admin-list">
                      {ingredients.map((item, index) => {
                        const formatted = formatIngredientLine(item, index);
                        return (
                          <article key={`${formatted.title}-${index}`} className="recipe-admin-list-item">
                            <strong>{formatted.title}</strong>
                            <span>{formatted.detail || "No quantity or note supplied."}</span>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="recipe-admin-empty-copy">No ingredients recorded yet.</p>
                  )}
                </div>

                <div>
                  <h3>Instructions</h3>
                  {instructions.length ? (
                    <ol className="recipe-admin-step-list">
                      {instructions.map((step, index) => (
                        <li key={`${step}-${index}`}>{step}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="recipe-admin-empty-copy">No instructions recorded yet.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="recipe-admin-card">
              <div className="recipe-admin-card-header">
                <div>
                  <Sparkles size={18} />
                  <h2>Nutrition & tags</h2>
                </div>
                <span>Values, safety flags and dietary context</span>
              </div>

              <div className="recipe-admin-readonly-grid compact">
                {nutritionInfo.map((item) => (
                  <ReadonlyItem key={item.label} label={item.label} value={item.value} />
                ))}
              </div>

              <div className="recipe-admin-tag-groups">
                {tagGroups.map((group) => (
                  <div key={group.label} className="recipe-admin-tag-group">
                    <span>{group.label}</span>
                    {group.values.length ? (
                      <div className="recipe-admin-tag-row">
                        {group.values.map((value) => (
                          <RecipeBadge key={value} label={value} tone="neutral" />
                        ))}
                      </div>
                    ) : (
                      <p className="recipe-admin-empty-copy">No {humanize(group.label).toLowerCase()} recorded.</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="recipe-admin-card">
              <div className="recipe-admin-card-header">
                <div>
                  <ImagePlus size={18} />
                  <h2>Media & AI</h2>
                </div>
                <span>Image provenance and enrichment payload</span>
              </div>

              <div className="recipe-admin-media-grid">
                <img
                  src={imageSrc}
                  alt={recipe?.recipe_name || recipe?.dish_name || "Recipe"}
                  className="recipe-admin-preview-image"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = DEFAULT_IMAGE;
                  }}
                />

                <div className="recipe-admin-media-meta">
                  <ReadonlyItem label="Image source" value={recipe?.image_source || "-"} />
                  <ReadonlyItem label="Source URL" value={recipe?.image_source_url || "-"} />
                  <ReadonlyItem label="Original image URL" value={recipe?.image_original_url || "-"} />
                  <ReadonlyItem label="Attribution" value={recipe?.image_attribution || "-"} />
                  <ReadonlyItem label="License" value={recipe?.image_license || "-"} />
                  <ReadonlyItem label="Image confidence" value={formatConfidence(recipe?.image_confidence)} />
                </div>
              </div>

              {aiResponse ? (
                <details className="recipe-admin-details-block">
                  <summary>Raw AI payload</summary>
                  <pre className="recipe-admin-json-box">{aiResponse}</pre>
                </details>
              ) : null}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
