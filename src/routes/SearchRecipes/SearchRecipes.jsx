import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, ChefHat, CircleHelp, Clock3, Globe2, Search, Star, Users, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./SearchRecipes.css";
import { fetchRecipeLibraryForAddMeal } from "../../services/recipeLibraryApi";
import recipeApi from "../../services/recepieApi";
import { fetchRecipeReviewSummaries, getRecipeReviewKey } from "../../services/recipeReviewApi";
import GuidedTour from "../../components/GuidedTour/GuidedTour";
import {
  clearCrossPageTourFlow,
  readCrossPageTourFlow,
  setCrossPageTourFlowStage,
} from "../../utils/crossPageTourFlow";

const FALLBACK_IMAGE = "/images/meal-mock/placeholder.svg";
const CREATE_SEARCH_TOUR_FLOW_ID = "create-to-search-recipes";
const SEARCH_RECIPES_TOUR_STATE_KEY = "nutrihelp_search_recipes_tour_state_v1";

const SEARCH_RECIPES_TOUR_STEPS = [
  {
    targetId: "search-recipes-hero-section",
    title: "Welcome to Search Recipes",
    description: "Great. Now let's find recipes quickly.",
    spotlightSize: 220,
  },
  {
    targetId: "search-recipes-search-input",
    title: "Search here",
    description: "Type a recipe name, meal type, or tag.",
    spotlightSize: 210,
  },
  {
    targetId: "search-recipes-all-cuisine-button",
    title: "Filter by cuisine",
    description: "Use these chips to narrow results.",
    spotlightSize: 190,
  },
  {
    targetIds: ["search-recipes-first-featured-card", "search-recipes-first-all-card"],
    title: "Choose a recipe card",
    description: "Click a card to open full recipe details.",
    spotlightSize: 210,
  },
  {
    targetId: "search-recipes-first-view-button",
    title: "Open from View button",
    description: "You can also press View on any recipe card.",
    spotlightSize: 200,
  },
  {
    targetId: "search-recipes-guide-button",
    title: "Replay guide any time",
    description: "Need help again? Press Guide here.",
    spotlightSize: 170,
  },
];

function readSearchRecipesTourStateFromStorage() {
  if (typeof window === "undefined") return "";

  try {
    return localStorage.getItem(SEARCH_RECIPES_TOUR_STATE_KEY) || "";
  } catch {
    return "";
  }
}

function writeSearchRecipesTourStateToStorage(nextState) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SEARCH_RECIPES_TOUR_STATE_KEY, nextState);
  } catch {
    // Ignore localStorage write failures in restricted environments.
  }
}

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageJumpInput, setPageJumpInput] = useState("");
  const [isSearchRecipesTourOpen, setIsSearchRecipesTourOpen] = useState(false);
  const [searchRecipesTourRestartKey, setSearchRecipesTourRestartKey] = useState(0);
  const [hasSeenSearchRecipesTour, setHasSeenSearchRecipesTour] = useState(false);
  const [isSearchRecipesTourStateReady, setIsSearchRecipesTourStateReady] = useState(false);

  const prepareSearchRecipesTourView = useCallback(() => {
    setRecipeSource("library");
    setSelectedCuisine("all");
    setSearchTerm("");
    setSelectedRecipe(null);
    setCurrentPage(1);
  }, []);

  const closeSearchRecipesTour = useCallback((nextState, options = {}) => {
    const { clearFlow = false } = options;
    setIsSearchRecipesTourOpen(false);

    if (nextState) {
      writeSearchRecipesTourStateToStorage(nextState);
      setHasSeenSearchRecipesTour(true);
    }

    if (clearFlow) {
      clearCrossPageTourFlow();
    }
  }, []);

  const handleOpenSearchRecipesTour = useCallback(() => {
    prepareSearchRecipesTourView();
    setIsSearchRecipesTourOpen(true);
    setSearchRecipesTourRestartKey((previous) => previous + 1);
  }, [prepareSearchRecipesTourView]);

  const handleFinishSearchRecipesTour = useCallback(() => {
    closeSearchRecipesTour("completed", { clearFlow: true });
  }, [closeSearchRecipesTour]);

  const handleSkipSearchRecipesTour = useCallback(() => {
    closeSearchRecipesTour("skipped", { clearFlow: true });
  }, [closeSearchRecipesTour]);

  useEffect(() => {
    const persistedState = readSearchRecipesTourStateFromStorage();
    setHasSeenSearchRecipesTour(persistedState === "completed" || persistedState === "skipped");
    setIsSearchRecipesTourStateReady(true);
  }, []);

  useEffect(() => {
    if (!isSearchRecipesTourStateReady) return;
    if (isSearchRecipesTourOpen) return;

    const flow = readCrossPageTourFlow();
    const hasPendingCrossPageFlow =
      flow?.flowId === CREATE_SEARCH_TOUR_FLOW_ID && flow?.stage === "search-pending";
    if (!hasPendingCrossPageFlow) return;

    const timerId = window.setTimeout(() => {
      prepareSearchRecipesTourView();
      setCrossPageTourFlowStage(CREATE_SEARCH_TOUR_FLOW_ID, "search-started");
      setIsSearchRecipesTourOpen(true);
      setSearchRecipesTourRestartKey((previous) => previous + 1);
    }, 450);

    return () => window.clearTimeout(timerId);
  }, [isSearchRecipesTourOpen, isSearchRecipesTourStateReady, prepareSearchRecipesTourView]);

  useEffect(() => {
    if (!isSearchRecipesTourStateReady) return;
    if (hasSeenSearchRecipesTour) return;
    if (isSearchRecipesTourOpen) return;

    const flow = readCrossPageTourFlow();
    const hasPendingCrossPageFlow =
      flow?.flowId === CREATE_SEARCH_TOUR_FLOW_ID && flow?.stage === "search-pending";
    if (hasPendingCrossPageFlow) return;

    const timerId = window.setTimeout(() => {
      prepareSearchRecipesTourView();
      setIsSearchRecipesTourOpen(true);
      setSearchRecipesTourRestartKey((previous) => previous + 1);
    }, 500);

    return () => window.clearTimeout(timerId);
  }, [
    hasSeenSearchRecipesTour,
    isSearchRecipesTourOpen,
    isSearchRecipesTourStateReady,
    prepareSearchRecipesTourView,
  ]);

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
  const allRecipes = useMemo(() => filteredRecipes, [filteredRecipes]);
  const itemsPerPage = 12;
  const totalPages = Math.max(1, Math.ceil(allRecipes.length / itemsPerPage));
  const paginatedRecipes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allRecipes.slice(startIndex, startIndex + itemsPerPage);
  }, [allRecipes, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCuisine, recipeSource]);

  useEffect(() => {
    setPageJumpInput("");
  }, [currentPage, totalPages]);

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

  const goToPreviousPage = () => {
    setCurrentPage((previous) => Math.max(1, previous - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((previous) => Math.min(totalPages, previous + 1));
  };

  const handlePageJumpInputChange = (event) => {
    const nextValue = event.target.value.replace(/[^\d]/g, "");
    setPageJumpInput(nextValue);
  };

  const handleSubmitPageJump = () => {
    if (!pageJumpInput) return;
    const parsedPage = Number.parseInt(pageJumpInput, 10);
    if (!Number.isFinite(parsedPage)) return;
    const clampedPage = Math.min(totalPages, Math.max(1, parsedPage));
    setCurrentPage(clampedPage);
    setPageJumpInput("");
  };

  const handlePageJumpKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleSubmitPageJump();
  };

  return (
    <div className="search-recipes-page">
      <div className="search-recipes-shell">
        <div className="search-recipes-topbar">
          <div className="search-recipes-breadcrumb" aria-label="breadcrumb">
            <span className="crumb-muted">Recipe Library</span>
            <span className="crumb-divider">/</span>
            <span className="crumb-current">Search Recipes</span>
          </div>
          <button
            type="button"
            className="search-recipes-guide-btn"
            onClick={handleOpenSearchRecipesTour}
            data-tour-id="search-recipes-guide-button"
            aria-label="Open Search Recipes guide"
          >
            <CircleHelp size={18} />
            Guide
          </button>
        </div>

        <section className="search-recipes-hero" data-tour-id="search-recipes-hero-section">
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
          <label
            className="search-recipes-search"
            htmlFor="search-recipes-input"
            data-tour-id="search-recipes-search-input"
          >
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
              data-tour-id="search-recipes-all-cuisine-button"
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
                {featuredRecipes.map((recipe, index) => (
                  <article
                    key={`featured-${recipe.id}`}
                    className="search-recommend-card"
                    onClick={() => handleViewRecipe(recipe)}
                    data-tour-id={index === 0 ? "search-recipes-first-featured-card" : undefined}
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
                <span className="search-result-count">Showing {paginatedRecipes.length} / {allRecipes.length}</span>
              </div>

              <div className="search-recipes-grid">
                {paginatedRecipes.map((recipe, index) => (
                  <article
                    key={recipe.id}
                    className={`search-recipe-card ${selectedRecipe?.id === recipe.id ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      handleViewRecipe(recipe);
                    }}
                    data-tour-id={index === 0 ? "search-recipes-first-all-card" : undefined}
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
                        data-tour-id={index === 0 ? "search-recipes-first-view-button" : undefined}
                      >
                        View
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {totalPages > 1 ? (
                <div className="search-recipes-pagination" aria-label="Search recipes pagination">
                  <button
                    type="button"
                    className="search-pagination-nav"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>

                  <div className="search-pagination-jump">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="search-pagination-jump-input"
                      value={pageJumpInput}
                      onChange={handlePageJumpInputChange}
                      onKeyDown={handlePageJumpKeyDown}
                      placeholder={`${currentPage}`}
                      aria-label={`Jump to page. Current page ${currentPage} of ${totalPages}`}
                    />
                    <span className="search-pagination-total-pages" aria-label={`Total pages ${totalPages}`}>
                      / {totalPages}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="search-pagination-nav"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              ) : null}
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

      <GuidedTour
        open={isSearchRecipesTourOpen}
        steps={SEARCH_RECIPES_TOUR_STEPS}
        restartKey={searchRecipesTourRestartKey}
        onFinish={handleFinishSearchRecipesTour}
        onSkip={handleSkipSearchRecipesTour}
      />
    </div>
  );
}

export default SearchRecipes;
