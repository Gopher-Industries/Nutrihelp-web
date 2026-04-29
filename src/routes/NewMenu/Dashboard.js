import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardGraph from "../../components/Dashboard-Graph";
import Card from "./MenuCard";
import "./MenuCard.css";
import "./Menustyles.css";
import imageMapping from "./importImages.js";
import WaterTracker from "../../components/WaterTracker";

const MEAL_SELECTIONS_STORAGE_KEY = "nutrihelp_add_meal_selections_by_date_v1";

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

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getTodayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function readSelectionsByDate() {
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

function normalizeMealType(value) {
  const normalized = normalize(value);
  if (normalized === "breakfast" || normalized === "lunch" || normalized === "dinner") {
    return normalized;
  }
  if (normalized === "snack" || normalized === "snacks" || normalized === "other") {
    return "others";
  }
  return "others";
}

function parseNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const source = String(value ?? "").replace(/,/g, "");
  const matched = source.match(/-?\d+(?:\.\d+)?/);
  if (!matched) return 0;
  const parsed = Number(matched[0]);
  return Number.isFinite(parsed) ? parsed : 0;
}

function estimateMealNutrition(meal) {
  const mealType = normalizeMealType(meal?.mealType);
  const level = normalize(meal?.level);
  const factor = LEVEL_FACTOR[level] || 1;
  const base = NUTRITION_BY_TYPE[mealType] || NUTRITION_BY_TYPE.breakfast;
  const nutrition = meal?.nutrition && typeof meal.nutrition === "object" ? meal.nutrition : {};

  return {
    calories: Math.round(parseNumber(nutrition.calories) || base.calories * factor),
    proteins: Math.round(parseNumber(nutrition.proteins ?? nutrition.protein) || base.proteins * factor),
    fats: Math.round(parseNumber(nutrition.fats ?? nutrition.fat) || base.fats * factor),
    vitamins: Math.round(parseNumber(nutrition.vitamins ?? nutrition.fiber) || base.vitamins * factor),
    sodium: Math.round(parseNumber(nutrition.sodium) || base.sodium * factor),
  };
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("breakfast");
  const [selectionsByDate, setSelectionsByDate] = useState(() => readSelectionsByDate());

  const todayIso = useMemo(() => getTodayISO(), []);

  useEffect(() => {
    const syncSelections = () => {
      setSelectionsByDate(readSelectionsByDate());
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncSelections();
      }
    };

    window.addEventListener("storage", syncSelections);
    window.addEventListener("focus", syncSelections);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("storage", syncSelections);
      window.removeEventListener("focus", syncSelections);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const selectedItems = useMemo(() => {
    const todayMap = selectionsByDate[todayIso] || {};
    return Object.values(todayMap);
  }, [selectionsByDate, todayIso]);

  const groupedItems = useMemo(
    () => ({
      breakfast: selectedItems.filter((item) => normalizeMealType(item?.mealType) === "breakfast"),
      lunch: selectedItems.filter((item) => normalizeMealType(item?.mealType) === "lunch"),
      dinner: selectedItems.filter((item) => normalizeMealType(item?.mealType) === "dinner"),
      snack: selectedItems.filter((item) => normalizeMealType(item?.mealType) === "others"),
    }),
    [selectedItems],
  );

  const addMealTab = useMemo(() => (activeTab === "snack" ? "others" : activeTab), [activeTab]);

  const totalNutrition = useMemo(
    () =>
      selectedItems.reduce(
        (accumulator, meal) => {
          const nutrition = estimateMealNutrition(meal);
          return {
            calories: accumulator.calories + nutrition.calories,
            proteins: accumulator.proteins + nutrition.proteins,
            fats: accumulator.fats + nutrition.fats,
            vitamins: accumulator.vitamins + nutrition.vitamins,
            sodium: accumulator.sodium + nutrition.sodium,
          };
        },
        {
          calories: 0,
          proteins: 0,
          fats: 0,
          vitamins: 0,
          sodium: 0,
        },
      ),
    [selectedItems],
  );

  const renderMealItems = (mealType) => {
    const items = groupedItems[mealType];
    if (!items || items.length === 0) return <div className="no-items">No items available</div>;

    return (
      <div className="cards-container">
        {items.map((item, idx) => (
          <Card key={item?.id || item?.recipeId || idx} item={item} imageMapping={imageMapping} />
        ))}
      </div>
    );
  };

  return (
    <main>
      <div className="mainBox">
        <div className="Title">
          <h2>MENU</h2>
        </div>

        <Link to="/appointment" className="button-link">
          <button className="appointment-btn">Book an Appointment</button>
        </Link>

        <div style={{ height: 16 }} />

        {/* Row 1: Today aligned to the middle (Lunch) column, width matches the meal pane only */}
        <div className="today-row">
          <div className="today-align-grid">
            <div className="today-text">Today · {todayIso}</div>
            <Link
              to={`/meal/${addMealTab}?date=${encodeURIComponent(todayIso)}`}
              state={{ defaultMealType: addMealTab, planDate: todayIso }}
              className="edit-menu-btn"
            >
              Edit Menu
            </Link>
          </div>
          <div className="today-row-spacer" />
        </div>

        {/* Row 2: Meals (tabs+cards) + Water (same height as tabs+cards, NOT including Today) */}
        <div className="meal-water-row">
          <div className="meal-pane">
            <nav className="meal-nav-tabs" role="tablist" aria-label="Meal tabs">
              <button
                type="button"
                className={`nav-tab-btn ${activeTab === "breakfast" ? "active" : ""}`}
                onClick={() => setActiveTab("breakfast")}
                aria-selected={activeTab === "breakfast"}
              >
                Breakfast
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${activeTab === "lunch" ? "active" : ""}`}
                onClick={() => setActiveTab("lunch")}
                aria-selected={activeTab === "lunch"}
              >
                Lunch
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${activeTab === "dinner" ? "active" : ""}`}
                onClick={() => setActiveTab("dinner")}
                aria-selected={activeTab === "dinner"}
              >
                Dinner
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${activeTab === "snack" ? "active" : ""}`}
                onClick={() => setActiveTab("snack")}
                aria-selected={activeTab === "snack"}
              >
                Snack
              </button>
            </nav>

            <div className="meal-scroll-wrapper">{renderMealItems(activeTab)}</div>
          </div>

          {/* Water card: no extra wrapper card, and stretched to match meal-pane height */}
          <div className="water-panel">
            <div className="water-fill">
              <WaterTracker />
            </div>
          </div>
        </div>

        {/* Graph area: keep content, but NO shadow card outer frame */}
        <div className="dashboard-graph-section">
          <div className="nutrition-summary">
            <DashboardGraph
              totalNutritionCalorie={totalNutrition.calories}
              totalNutritionProtiens={totalNutrition.proteins}
              totalNutritionFats={totalNutrition.fats}
              totalNutritionVitamins={totalNutrition.vitamins}
              totalNutritionSodium={totalNutrition.sodium}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
