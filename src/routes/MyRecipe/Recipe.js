import { useEffect, useState } from "react";
import { Clock3, RefreshCcwIcon, Sparkles, Users, ChefHat, ArrowRight, Trash2, Globe2, X } from "lucide-react";
import recipeApi from "../../services/recepieApi";
import "../../styles/recipe.css";

const DEFAULT_RECIPE_IMAGE = "/images/meal-mock/placeholder.svg";

function formatValue(value, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
}

function resolveRecipeImage(item) {
  return (
    item?.image_url ||
    item?.uploaded_image_url ||
    item?.recipe_image_url ||
    item?.imageUrl ||
    item?.image ||
    DEFAULT_RECIPE_IMAGE
  );
}

function Recipe() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [refresh, setRefetch] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [sharingId, setSharingId] = useState(null);
  const [shareModal, setShareModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await recipeApi.getRecepie();
        setRecipes(Array.isArray(data) ? data : []);
      } catch (err) {
        const message = err.message || "Failed to load recipes";
        if (message.includes("404") || message.toLowerCase().includes("not found")) {
          setRecipes([]);
          setError(null);
          return;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refresh]);

  const handleDeleteRecipe = async (event, recipe) => {
    event.stopPropagation();
    if (!recipe?.id) return;
    if (!window.confirm(`Delete "${recipe.recipe_name || "this recipe"}"?`)) return;

    setDeletingId(recipe.id);
    try {
      await recipeApi.deleteRecepie(recipe.id);
      setRecipes((prev) => prev.filter((item) => item.id !== recipe.id));
    } catch (err) {
      setError(err.message || "Failed to delete recipe");
    } finally {
      setDeletingId(null);
    }
  };

  const getVisibilityLabel = (recipe) => {
    const normalized = String(recipe?.recipe_visibility || "").trim().toLowerCase();
    if (normalized === "community") return "Community";
    if (normalized === "community_pending") return "Community Pending";
    if (normalized === "community_rejected") return "Community Rejected";
    return "Private";
  };

  const isSharedRecipe = (recipe) => {
    const normalized = String(recipe?.recipe_visibility || "").trim().toLowerCase();
    return normalized === "community" || normalized === "community_pending";
  };

  const handleShareRecipe = async (event, recipe) => {
    event.stopPropagation();
    if (!recipe?.id) return;

    setSharingId(recipe.id);
    setError(null);
    setActionError(null);
    try {
      if (isSharedRecipe(recipe)) {
        const shouldStopSharing = window.confirm(
          `Stop sharing "${recipe.recipe_name || "this recipe"}" with the community?`
        );
        if (!shouldStopSharing) return;

        await recipeApi.unshareFromCommunity(recipe.id);
        setRecipes((prev) =>
          prev.map((item) =>
            Number(item.id) === Number(recipe.id)
              ? { ...item, recipe_visibility: "user_private" }
              : item
          )
        );
        return;
      }

      await recipeApi.shareToCommunity(recipe.id);
      setRecipes((prev) =>
        prev.map((item) =>
          Number(item.id) === Number(recipe.id)
            ? { ...item, recipe_visibility: "community_pending" }
            : item
        )
      );
      setShareModal({
        recipeId: recipe.id,
        recipeName: recipe.recipe_name || "Untitled Recipe",
      });
    } catch (err) {
      setActionError(err.message || "Failed to update community sharing");
    } finally {
      setSharingId(null);
    }
  };

  return (
    <main className="my-recipes-page" id="no-bg">
      <div className="my-recipes-shell" id="no-bg">
        <section className="my-recipes-hero" id="no-bg">
          <div className="my-recipes-hero-copy" id="no-bg">
            <span className="my-recipes-kicker" id="no-bg">
              <Sparkles size={16} />
              Private Recipe Studio
            </span>
            <h1 id="no-bg">My Recipes</h1>
            <p id="no-bg">
              Your personal recipe collection lives here. Review what you created, open details,
              and reuse your recipes across NutriHelp meal planning.
            </p>
          </div>

          <div className="my-recipes-hero-card" id="no-bg">
            <strong id="no-bg">{recipes.length}</strong>
            <span id="no-bg">recipes saved</span>
            <button
              id="no-bg"
              type="button"
              className="my-recipes-refresh-btn"
              onClick={() => setRefetch((prev) => !prev)}
              disabled={loading}
            >
              <RefreshCcwIcon size={18} className={loading ? "is-spinning" : ""} />
              Refresh
            </button>
          </div>
        </section>

        {loading ? (
          <section className="my-recipes-state" id="no-bg" aria-live="polite">
            <span className="my-recipes-loader" id="no-bg" />
            <h2 id="no-bg">Loading your recipes</h2>
            <p id="no-bg">Fetching your latest saved recipes.</p>
          </section>
        ) : null}

        {!loading && error ? (
          <section className="my-recipes-state my-recipes-state-error" id="no-bg" role="alert">
            <h2 id="no-bg">Could not load recipes</h2>
            <p id="no-bg">{error}</p>
            <button id="no-bg" type="button" onClick={() => setRefetch((prev) => !prev)}>
              Try again
            </button>
          </section>
        ) : null}

        {!loading && !error && actionError ? (
          <section className="my-recipes-action-error" id="no-bg" role="alert">
            <strong id="no-bg">Could not submit community request.</strong>
            <span id="no-bg">{actionError}</span>
            <button id="no-bg" type="button" onClick={() => setActionError(null)}>
              Dismiss
            </button>
          </section>
        ) : null}

        {!loading && !error && recipes.length === 0 ? (
          <section className="my-recipes-state" id="no-bg">
            <span className="my-recipes-empty-icon" id="no-bg">
              <ChefHat size={34} />
            </span>
            <h2 id="no-bg">No recipes yet</h2>
            <p id="no-bg">Create your first recipe and it will appear in this private library.</p>
            <button id="no-bg" type="button" onClick={() => { window.location.href = "/createRecipe"; }}>
              Create Recipe
            </button>
          </section>
        ) : null}

        {!loading && !error && recipes.length > 0 ? (
          <section className="my-recipes-grid" id="no-bg" aria-label="My saved recipes">
            {recipes.map((item) => {
              const imageSrc = resolveRecipeImage(item);
              return (
                <article
                  key={item.id || item.recipe_name}
                  id="no-bg"
                  className="my-recipe-card"
                  onClick={() => { window.location.href = `/recipe/${item.id}`; }}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      window.location.href = `/recipe/${item.id}`;
                    }
                  }}
                >
                  <div className="my-recipe-media" id="no-bg">
                    <img
                      src={imageSrc}
                      alt={item.recipe_name || "Recipe"}
                      id="no-bg"
                      onError={(event) => {
                        if (event.currentTarget.src.endsWith(DEFAULT_RECIPE_IMAGE)) return;
                        event.currentTarget.src = DEFAULT_RECIPE_IMAGE;
                      }}
                    />
                    <div className="my-recipe-badges" id="no-bg">
                      <span className="my-recipe-badge" id="no-bg">{getVisibilityLabel(item)}</span>
                    </div>
                    <button
                      id="no-bg"
                      type="button"
                      className={`my-recipe-share-btn ${isSharedRecipe(item) ? "is-shared" : ""}`}
                      onClick={(event) => handleShareRecipe(event, item)}
                      disabled={sharingId === item.id}
                      title={isSharedRecipe(item) ? "Stop sharing this recipe" : "Share recipe to community"}
                      aria-label={
                        isSharedRecipe(item)
                          ? `Stop sharing ${item.recipe_name || "recipe"}`
                          : `Share ${item.recipe_name || "recipe"} to community`
                      }
                    >
                      <Globe2 size={20} />
                    </button>
                  </div>

                  <div className="my-recipe-body" id="no-bg">
                    <div className="my-recipe-meta" id="no-bg">
                      <span id="no-bg">
                        <Clock3 size={15} />
                        {formatValue(item.preparation_time, 0)} min
                      </span>
                      <span id="no-bg">
                        <Users size={15} />
                        {formatValue(item.total_servings, 1)} servings
                      </span>
                      <span id="no-bg">
                        <ChefHat size={15} />
                        Easy
                      </span>
                    </div>

                    <h2 id="no-bg">{item.recipe_name || "Untitled Recipe"}</h2>
                    <p id="no-bg" className="my-recipe-cuisine">
                      {item.cuisine_name || "Personal recipe"}
                    </p>

                    <div className="my-recipe-actions" id="no-bg">
                      <span className="my-recipe-view" id="no-bg">
                        View Recipe
                        <ArrowRight size={16} />
                      </span>

                      <button
                        id="no-bg"
                        type="button"
                        className="my-recipe-delete-btn"
                        onClick={(event) => handleDeleteRecipe(event, item)}
                        disabled={deletingId === item.id}
                      >
                        <Trash2 size={16} />
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}
      </div>
      {shareModal ? (
        <div className="my-recipe-modal-backdrop" role="dialog" aria-modal="true">
          <section className="my-recipe-share-modal">
            <button
              type="button"
              className="my-recipe-modal-close"
              onClick={() => setShareModal(null)}
              aria-label="Close share status modal"
            >
              <X size={18} />
            </button>
            <span className="my-recipe-modal-icon">
              <Globe2 size={28} />
            </span>
            <h2>Community review pending</h2>
            <p>
              Your recipe has been submitted to the community queue. It will only be published after
              admin approval.
            </p>
            <div className="my-recipe-modal-code">
              Recipe ID <strong>{shareModal.recipeId}</strong>
            </div>
            <small>{shareModal.recipeName}</small>
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default Recipe;
