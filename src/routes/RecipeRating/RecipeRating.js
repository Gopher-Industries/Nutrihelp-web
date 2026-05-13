import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ChefHat,
  Clock3,
  Filter,
  MessageCircle,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { fetchRecipeReviewFeed } from "../../services/recipeReviewApi";
import "./RecipeRating.css";

const FALLBACK_IMAGE = "/images/meal-mock/placeholder.svg";
const SOURCE_OPTIONS = [
  { value: "all", label: "All sources" },
  { value: "recipe_library", label: "Recipe Library" },
  { value: "community", label: "Community" },
];
const RATING_OPTIONS = ["all", 5, 4, 3, 2, 1];

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function formatDate(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name, fallback = "U") {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return String(fallback || "U").slice(0, 2).toUpperCase();
}

function formatMealType(value) {
  const normalized = normalizeText(value) || "other";
  return normalized.replace(/^\w/, (char) => char.toUpperCase());
}

function sourceLabel(value) {
  return value === "community" ? "Community" : "Recipe Library";
}

function ReviewStars({ value = 0, compact = false }) {
  const rating = Number(value) || 0;
  return (
    <span className={`rating-stars ${compact ? "compact" : ""}`} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={compact ? 14 : 18} fill={star <= rating ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

function RatingBreakdown({ summary, activeRating, onSelect }) {
  const total = Number(summary?.reviewCount || 0);
  const breakdown = summary?.ratingBreakdown || {};

  return (
    <div className="rating-breakdown-card">
      <div className="rating-breakdown-head">
        <span>Rating spread</span>
        <strong>{total} review{total === 1 ? "" : "s"}</strong>
      </div>
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = Number(breakdown[rating] || 0);
        const percent = total ? Math.round((count / total) * 100) : 0;
        return (
          <button
            key={rating}
            type="button"
            className={`rating-breakdown-row ${Number(activeRating) === rating ? "active" : ""}`}
            onClick={() => onSelect(rating)}
          >
            <span>{rating} <Star size={13} fill="currentColor" /></span>
            <div className="rating-breakdown-track"><i style={{ width: `${percent}%` }} /></div>
            <strong>{count}</strong>
          </button>
        );
      })}
    </div>
  );
}

function ReviewCard({ item, onView }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const recipe = item.recipe || {};
  const image = !imageFailed && recipe.imageUrl ? recipe.imageUrl : FALLBACK_IMAGE;

  return (
    <article className="rating-review-card">
      <div className="rating-review-image-wrap">
        <img src={image} alt={recipe.title} loading="lazy" onError={() => setImageFailed(true)} />
        <span className="rating-source-badge">{sourceLabel(recipe.sourceType || item.sourceType)}</span>
        <span className="rating-score-badge"><Star size={15} fill="currentColor" /> {Number(item.rating).toFixed(1)}</span>
      </div>

      <div className="rating-review-content">
        <div className="rating-review-topline">
          <span className="rating-meal-chip">{formatMealType(recipe.mealType)}</span>
          <span className="rating-cuisine-chip">{recipe.cuisine || "Global"}</span>
        </div>

        <h2>{recipe.title}</h2>
        {recipe.description ? <p className="rating-recipe-description">{recipe.description}</p> : null}

        <div className="rating-recipe-meta">
          {recipe.prepTime ? <span><Clock3 size={15} /> {recipe.prepTime} mins</span> : null}
          {recipe.calories ? <span><ChefHat size={15} /> {Math.round(recipe.calories)} cal</span> : null}
          <span><CalendarDays size={15} /> {formatDate(item.createdAt)}</span>
        </div>

        <div className="rating-comment-panel">
          <div className="rating-author">
            <div className="rating-author-avatar">
              {item.userAvatar && !avatarFailed ? (
                <img src={item.userAvatar} alt={item.userName} loading="lazy" onError={() => setAvatarFailed(true)} />
              ) : (
                <span>{getInitials(item.userName, item.userId)}</span>
              )}
            </div>
            <div>
              <strong>{item.userName || `User ${item.userId}`}</strong>
              <ReviewStars value={item.rating} compact />
            </div>
          </div>
          <p>{item.comment}</p>
        </div>

        <button type="button" className="rating-view-btn" onClick={() => onView(item)}>
          View recipe <ArrowRight size={17} />
        </button>
      </div>
    </article>
  );
}

function RecipeRating() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ averageRating: null, reviewCount: 0, reviewedRecipeCount: 0, ratingBreakdown: {} });
  const [sort, setSort] = useState("newest");
  const [rating, setRating] = useState("all");
  const [sourceType, setSourceType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRatings() {
      setLoading(true);
      setError("");
      try {
        const result = await fetchRecipeReviewFeed({ sort, rating, sourceType, limit: 240 });
        if (!isMounted) return;
        setItems(result.items || []);
        setSummary(result.summary || { averageRating: null, reviewCount: 0, reviewedRecipeCount: 0, ratingBreakdown: {} });
      } catch (err) {
        if (!isMounted) return;
        setItems([]);
        setSummary({ averageRating: null, reviewCount: 0, reviewedRecipeCount: 0, ratingBreakdown: {} });
        setError(err.message || "Unable to load recipe reviews.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRatings();
    return () => {
      isMounted = false;
    };
  }, [sort, rating, sourceType]);

  const filteredItems = useMemo(() => {
    const term = normalizeText(searchTerm);
    if (!term) return items;
    return items.filter((item) => {
      const recipe = item.recipe || {};
      return normalizeText([
        recipe.title,
        recipe.description,
        recipe.cuisine,
        recipe.mealType,
        item.userName,
        item.comment,
      ].filter(Boolean).join(" ")).includes(term);
    });
  }, [items, searchTerm]);

  const averageRating = Number(summary.averageRating || 0);

  const handleViewRecipe = (item) => {
    const recipe = item.recipe || {};
    const detailRecipe = {
      id: `${recipe.sourceType || item.sourceType}-${recipe.id || item.recipeId}`,
      recipeId: recipe.id || item.recipeId,
      title: recipe.title,
      name: recipe.title,
      dishName: recipe.title,
      image: recipe.imageUrl || FALLBACK_IMAGE,
      time: recipe.prepTime ? `${recipe.prepTime} Mins` : "Ready",
      servings: "1 Serving",
      level: "Easy",
      mealType: recipe.mealType || "other",
      source: recipe.sourceType || item.sourceType,
      sourceType: recipe.sourceType || item.sourceType,
      visibility: recipe.visibility || "public",
      description: recipe.description || "",
      tags: [recipe.cuisine, sourceLabel(recipe.sourceType || item.sourceType)].filter(Boolean),
      ingredients: [],
      instructions: [],
      rawRecipe: recipe,
    };

    try {
      sessionStorage.setItem("selectedMealDetail", JSON.stringify(detailRecipe));
    } catch {
      // Navigation should not depend on storage availability.
    }

    navigate(`/recipe/${encodeURIComponent(String(detailRecipe.recipeId || "recipe"))}`, {
      state: { meal: detailRecipe },
    });
  };

  return (
    <main className="recipe-rating-page">
      <section className="rating-hero">
        <div className="rating-hero-copy">
          <span className="rating-kicker"><Sparkles size={16} /> User feedback</span>
          <h1>Recipe Ratings</h1>
        </div>
        <div className="rating-hero-stats">
          <div className="rating-stat-card featured">
            <span>Average score</span>
            <strong>{averageRating ? averageRating.toFixed(1) : "NA"}</strong>
            {averageRating ? <ReviewStars value={Math.round(averageRating)} /> : null}
          </div>
          <div className="rating-stat-card">
            <span>Total reviews</span>
            <strong>{summary.reviewCount || 0}</strong>
          </div>
          <div className="rating-stat-card">
            <span>Recipes rated</span>
            <strong>{summary.reviewedRecipeCount || 0}</strong>
          </div>
        </div>
      </section>

      <section className="rating-control-panel">
        <div className="rating-search-box">
          <Search size={19} />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search recipe, cuisine, reviewer, or comment"
          />
        </div>

        <div className="rating-control-row">
          <div className="rating-filter-group" aria-label="Filter by rating">
            <span><Filter size={16} /> Stars</span>
            {RATING_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={String(rating) === String(option) ? "active" : ""}
                onClick={() => setRating(option)}
              >
                {option === "all" ? "All" : <>{option} <Star size={13} fill="currentColor" /></>}
              </button>
            ))}
          </div>

          <div className="rating-selects">
            <label>
              Source
              <select value={sourceType} onChange={(event) => setSourceType(event.target.value)}>
                {SOURCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label>
              Sort
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="newest">Newest reviews</option>
                <option value="oldest">Oldest reviews</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="rating-content-grid">
        <aside className="rating-sidebar">
          <RatingBreakdown summary={summary} activeRating={rating} onSelect={setRating} />
          <div className="rating-help-card">
            <MessageCircle size={22} />
            <h3>How ratings work</h3>
            <p>Scores come from real user reviews on public Recipe Library items and approved Community recipes.</p>
          </div>
        </aside>

        <section className="rating-results-section">
          <div className="rating-results-head">
            <div>
              <span><Users size={17} /> {filteredItems.length} visible review{filteredItems.length === 1 ? "" : "s"}</span>
              <h2>Latest recipe feedback</h2>
            </div>
            <button type="button" onClick={() => { setSearchTerm(""); setRating("all"); setSourceType("all"); setSort("newest"); }}>
              <RefreshCw size={16} /> Reset filters
            </button>
          </div>

          {loading ? (
            <div className="rating-state-card">Loading real recipe reviews...</div>
          ) : error ? (
            <div className="rating-state-card error">
              <h3>Could not load ratings</h3>
              <p>{error}</p>
              <small>If this is a new environment, run the `recipe_reviews` SQL migration first.</small>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rating-state-card empty">
              <h3>No reviews match this filter</h3>
              <p>Try a different star rating, source, search term, or sort order.</p>
            </div>
          ) : (
            <div className="rating-review-list">
              {filteredItems.map((item) => (
                <ReviewCard key={`${item.sourceType}-${item.recipeId}-${item.id}`} item={item} onView={handleViewRecipe} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default RecipeRating;
