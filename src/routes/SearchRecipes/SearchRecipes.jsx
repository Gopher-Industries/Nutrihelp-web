import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, ChefHat, Clock3, Globe2, Search, Star, Users, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./SearchRecipes.css";
import { fetchRecipeLibraryForAddMeal } from "../../services/recipeLibraryApi";
import recipeApi from "../../services/recepieApi";
import { fetchRecipeReviewSummaries, getRecipeReviewKey } from "../../services/recipeReviewApi";

const FALLBACK_IMAGE = "/images/meal-mock/placeholder.svg";

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getCuisine(recipe) {
  return (
    recipe?.rawRecipe?.cuisine_name_snapshot ||
    recipe?.rawRecipe?.cuisine_name ||
    recipe?.tags?.find(Boolean) ||
    "Global"
  );
}

function formatMealType(value) {
  const normalized = normalizeText(value);
  if (!normalized) return "Other";
  return normalized.replace(/^\w/, (char) => char.toUpperCase());
}

function mapCommunityRecipe(row) {
  const title = row?.recipe_name || "Untitled Recipe";
  const minutes = Number(row?.preparation_time || row?.total_time_minutes || 0);
  const servings = Number(row?.total_servings || row?.servings || 1);
  const authorName = row?.author_name || (row?.author_user_id ? `User ${row.author_user_id}` : "NutriHelp user");
  return {
    id: `community-${row.id}`,
    recipeId: row.id,
    title,
    name: title,
    dishName: title,
    image: row?.image_url || FALLBACK_IMAGE,
    time: minutes > 0 ? `${minutes} Mins` : "Ready",
    servings: `${servings || 1} ${(servings || 1) === 1 ? "Serving" : "Servings"}`,
    level: row?.difficulty_level || "Easy",
    mealType: row?.meal_type || "other",
    source: "community",
    visibility: "community",
    description: `Community recipe #${row.id}`,
    tags: [row?.cuisine_name, "Community"].filter(Boolean),
    ingredients: row?.ingredients?.name || row?.ingredients || [],
    instructions: row?.instructions || [],
    authorId: row?.author_user_id || row?.user_id || row?.author_id || null,
    authorName,
    authorAvatar: row?.author_avatar_url || "",
    rawRecipe: row,
  };
}

function getAuthorInitials(name, id) {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return String(id || "U").slice(0, 2).toUpperCase();
}

function RecipeAuthor({ recipe, compact = false }) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  if (!recipe?.authorName && !recipe?.authorId) return null;
  const label = recipe.authorName || `User ${recipe.authorId}`;
  return (
    <div className={`search-recipe-author-row ${compact ? "compact" : ""}`}>
      <span className="search-recipe-author-label">Created by:</span>
      <div className={`search-recipe-author ${compact ? "compact" : ""}`}> 
        {recipe.authorAvatar && !avatarFailed ? (
          <img src={recipe.authorAvatar} alt={label} loading="lazy" onError={() => setAvatarFailed(true)} />
        ) : (
          <span className="search-recipe-author-initials">{getAuthorInitials(label, recipe.authorId)}</span>
        )}
        <span>{label}</span>
      </div>
    </div>
  );
}

function getReviewSourceType(recipe) {
  if (recipe?.source === "community" || recipe?.sourceType === "community") return "community";
  if (recipe?.source === "recipe_library" || recipe?.sourceType === "recipe_library") return "recipe_library";
  return "";
}

function getReviewSummary(recipe) {
  const summary = recipe?.reviewSummary || {};
  const count = Number(summary.reviewCount || summary.count || 0);
  const rating = Number(summary.averageRating || summary.rating || 0);
  if (!count || !rating) return null;
  return { count, rating };
}

function RecipeRatingBadge({ recipe, compact = false }) {
  const summary = getReviewSummary(recipe);
  if (!summary) return null;
  return (
    <span className={`search-recipe-rating-badge ${compact ? "compact" : ""}`}>
      <Star size={compact ? 12 : 14} fill="currentColor" />
      {summary.rating.toFixed(1)}/5
      {!compact ? <small>{summary.count} review{summary.count > 1 ? "s" : ""}</small> : null}
    </span>
  );
}

function renderListValue(value, emptyLabel) {
  if (Array.isArray(value)) {
    if (value.length === 0) return emptyLabel;
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        return [item?.quantity, item?.unit, item?.name || item?.ingredient_name || item?.text]
          .filter(Boolean)
          .join(" ");
      })
      .filter(Boolean)
      .join(", ");
  }
  return value || emptyLabel;
}

function SearchRecipes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeSource, setRecipeSource] = useState("library");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRecipes() {
      setIsLoading(true);
      setError("");
      try {
        const items =
          recipeSource === "community"
            ? (await recipeApi.getCommunityRecipes(500)).map(mapCommunityRecipe)
            : await fetchRecipeLibraryForAddMeal({ limit: 500, cacheBust: true });
        const summaries = await fetchRecipeReviewSummaries(
          items.map((item) => ({
            sourceType: getReviewSourceType(item),
            recipeId: item.recipeId,
          }))
        ).catch(() => ({}));
        const recipesWithReviews = items.map((item) => ({
          ...item,
          reviewSummary: summaries[getRecipeReviewKey(getReviewSourceType(item), item.recipeId)] || {
            averageRating: null,
            reviewCount: 0,
          },
        }));
        if (!isMounted) return;
        setRecipes(recipesWithReviews);
      } catch (err) {
        if (!isMounted) return;
        setRecipes([]);
        setError(err.message || "Unable to load Recipe Library.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRecipes();

    return () => {
      isMounted = false;
    };
  }, [recipeSource]);

  const cuisines = useMemo(() => {
    const counts = recipes.reduce((map, recipe) => {
      const cuisine = getCuisine(recipe);
      map.set(cuisine, (map.get(cuisine) || 0) + 1);
      return map;
    }, new Map());

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    const term = normalizeText(searchTerm);

    return recipes.filter((recipe) => {
      const cuisine = getCuisine(recipe);
      const matchesCuisine = selectedCuisine === "all" || cuisine === selectedCuisine;
      if (!matchesCuisine) return false;
      if (!term) return true;

      const haystack = [
        recipe.title,
        recipe.dishName,
        cuisine,
        recipe.mealType,
        recipe.level,
        ...(Array.isArray(recipe.tags) ? recipe.tags : []),
      ]
        .filter(Boolean)
        .join(" ");

      return normalizeText(haystack).includes(term);
    });
  }, [recipes, searchTerm, selectedCuisine]);

  const featuredRecipes = useMemo(() => filteredRecipes.slice(0, 8), [filteredRecipes]);
  const allRecipes = useMemo(() => filteredRecipes.slice(0, 60), [filteredRecipes]);

  const handleCuisineClick = (cuisine) => {
    setSelectedCuisine(cuisine);
    setSelectedRecipe(null);
  };

  const handleImageError = (event) => {
    if (event.currentTarget.src.endsWith(FALLBACK_IMAGE)) return;
    event.currentTarget.src = FALLBACK_IMAGE;
  };

  const handleViewRecipe = (recipe) => {
    if (!recipe) return;

    try {
      sessionStorage.setItem("selectedMealDetail", JSON.stringify(recipe));
    } catch {
      // Keep navigation working if browser storage is unavailable.
    }

    const targetRecipeId = recipe.recipeId || recipe.id || "recipe";
    navigate(`/recipe/${encodeURIComponent(String(targetRecipeId))}`, {
      state: { meal: recipe },
    });
  };

  return (
    <div className="search-recipes-page">
      <div className="search-recipes-shell">
        <div className="search-recipes-breadcrumb" aria-label="breadcrumb">
          <span className="crumb-muted">Recipe Library</span>
          <span className="crumb-divider">/</span>
          <span className="crumb-current">Search Recipes</span>
        </div>

        <section className="search-recipes-hero">
          <div>
            <span className="search-recipes-kicker">
              <ChefHat size={16} />
              {recipeSource === "community" ? "Community Explore" : "Recipe Library"}
            </span>
            <h1>Search Recipes</h1>
            <p>
              {recipeSource === "community"
                ? "Browse recipes shared by NutriHelp users after admin approval."
                : "Browse published meals from the Recipe Library by cuisine, meal type, or recipe name."}
            </p>
          </div>
          <div className="search-recipes-hero-card">
            <strong>{recipes.length}</strong>
            <span>recipes loaded</span>
          </div>
        </section>

        <div className="search-recipes-toolbar">
          <label className="search-recipes-search" htmlFor="search-recipes-input">
            <Search size={22} strokeWidth={2.2} className="search-icon" />
            <input
              id="search-recipes-input"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by recipe, cuisine, tag, or meal type"
            />
          </label>
          <button
            type="button"
            className={`community-explore-btn ${recipeSource === "community" ? "active" : ""}`}
            onClick={() => {
              setRecipeSource((prev) => (prev === "community" ? "library" : "community"));
              setSelectedRecipe(null);
              setSelectedCuisine("all");
            }}
          >
            <Globe2 size={18} />
            {recipeSource === "community" ? "Recipe Library" : "Community Explore"}
          </button>
        </div>

        <section className="search-recipes-section">
          <div className="section-title-row">
            <h2 className="section-title">Search by Cuisine</h2>
            <span className="search-result-count">{filteredRecipes.length} results</span>
          </div>

          <div className="cuisine-chip-row" aria-label="Cuisine filters">
            <button
              type="button"
              className={`cuisine-chip ${selectedCuisine === "all" ? "active" : ""}`}
              onClick={() => handleCuisineClick("all")}
            >
              <Globe2 size={15} />
              All cuisines
              <span>{recipes.length}</span>
            </button>
            {cuisines.slice(0, 14).map((cuisine) => (
              <button
                key={cuisine.name}
                type="button"
                className={`cuisine-chip ${selectedCuisine === cuisine.name ? "active" : ""}`}
                onClick={() => handleCuisineClick(cuisine.name)}
              >
                {cuisine.name}
                <span>{cuisine.count}</span>
              </button>
            ))}
          </div>
        </section>

        {isLoading ? (
          <p className="search-empty-state">Loading Recipe Library...</p>
        ) : error ? (
          <p className="search-empty-state">{error}</p>
        ) : filteredRecipes.length === 0 ? (
          <p className="search-empty-state">No recipes matched your search.</p>
        ) : (
          <>
            <section className="search-recipes-section">
              <h2 className="section-title">Featured Recipes</h2>
              <div className="search-recommended-row">
                {featuredRecipes.map((recipe) => (
                  <article
                    key={`featured-${recipe.id}`}
                    className="search-recommend-card"
                    onClick={() => handleViewRecipe(recipe)}
                  >
                    <div className="search-recommend-image">
                      <img src={recipe.image || FALLBACK_IMAGE} alt={recipe.title} loading="lazy" onError={handleImageError} />
                      <span className={`meal-type-badge type-${normalizeText(recipe.mealType)}`}>
                        {formatMealType(recipe.mealType)}
                      </span>
                      <RecipeRatingBadge recipe={recipe} compact />
                      <span className="recommend-time">
                        <Clock3 size={13} />
                        {recipe.time}
                      </span>
                    </div>
                    <div className="search-recommend-content">
                      <h3>{recipe.title}</h3>
                      <p>{getCuisine(recipe)}</p>
                      <RecipeAuthor recipe={recipe} compact />
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="search-recipes-section">
              <div className="section-title-row">
                <h2 className="section-title">All Recipes</h2>
                <span className="search-result-count">Showing {allRecipes.length}</span>
              </div>

              <div className="search-recipes-grid">
                {allRecipes.map((recipe) => (
                  <article
                    key={recipe.id}
                    className={`search-recipe-card ${selectedRecipe?.id === recipe.id ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      handleViewRecipe(recipe);
                    }}
                  >
                    <div className="search-recipe-image">
                      <img src={recipe.image || FALLBACK_IMAGE} alt={recipe.title} loading="lazy" onError={handleImageError} />
                      <span className={`meal-type-badge type-${normalizeText(recipe.mealType)}`}>
                        {formatMealType(recipe.mealType)}
                      </span>
                      <RecipeRatingBadge recipe={recipe} />
                    </div>

                    <div className="search-recipe-content">
                      <h3>{recipe.title}</h3>
                      <p className="search-recipe-cuisine">{getCuisine(recipe)}</p>

                      <div className="recipe-meta">
                        <span>
                          <Clock3 size={16} />
                          {recipe.time}
                        </span>
                        <span>
                          <Users size={16} />
                          {recipe.servings}
                        </span>
                        <span>
                          <BarChart3 size={16} />
                          {recipe.level}
                        </span>
                      </div>

                      <RecipeAuthor recipe={recipe} />

                      <button
                        type="button"
                        className="search-preview-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedRecipe(recipe);
                          handleViewRecipe(recipe);
                        }}
                      >
                        View
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {selectedRecipe ? (
          <aside className="search-preview-panel" aria-label="Recipe preview">
            <div>
              <span className="preview-eyebrow">
                <Utensils size={15} />
                Preview
              </span>
              <h2>{selectedRecipe.title}</h2>
              <p>{selectedRecipe.description || selectedRecipe.dishName || getCuisine(selectedRecipe)}</p>
            </div>
            <div className="preview-meta-grid">
              <span>{selectedRecipe.time}</span>
              <span>{selectedRecipe.servings}</span>
              <span>{selectedRecipe.level}</span>
              <span>{formatMealType(selectedRecipe.mealType)}</span>
            </div>
            <div className="preview-copy">
              <strong>Ingredients</strong>
              <p>{renderListValue(selectedRecipe.ingredients, "No ingredients provided.")}</p>
            </div>
            <div className="preview-copy">
              <strong>Instructions</strong>
              <p>{renderListValue(selectedRecipe.instructions, "No instructions provided.")}</p>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

export default SearchRecipes;
