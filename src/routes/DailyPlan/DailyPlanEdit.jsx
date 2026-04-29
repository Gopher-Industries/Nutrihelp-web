import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Clock3,
  Moon,
  Plus,
  Sun,
  Trash2,
  Users,
} from "lucide-react";
import "./DailyPlanEdit.css";

const STORAGE_KEY = "nutrihelp_add_meal_selections_by_date_v1";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MEAL_SECTIONS = [
  { key: "breakfast", label: "Breakfast", icon: Sun, iconClass: "icon-breakfast" },
  { key: "lunch", label: "Lunch", icon: Cloud, iconClass: "icon-lunch" },
  { key: "dinner", label: "Dinner", icon: Moon, iconClass: "icon-dinner" },
];

const FALLBACK_TAGS = {
  breakfast: ["Balanced Meal", "Heart-Healthy"],
  lunch: ["Full Meal", "High Protein"],
  dinner: ["Light Meal", "Low Fat"],
  others: ["Snack", "Quick Bite"],
};

const NUTRITION_TARGETS = {
  calories: 2000,
  protein: 80,
  carbs: 250,
  fat: 65,
};

const NUTRITION_BY_TYPE = {
  breakfast: { calories: 300, protein: 18, carbs: 42, fat: 10 },
  lunch: { calories: 470, protein: 30, carbs: 55, fat: 16 },
  dinner: { calories: 560, protein: 34, carbs: 50, fat: 20 },
  others: { calories: 210, protein: 8, carbs: 24, fat: 7 },
};

const LEVEL_FACTOR = {
  easy: 1,
  medium: 1.12,
  hard: 1.24,
};

const IMAGE_FALLBACK = "/images/meal-mock/placeholder.svg";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
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

function pad(number) {
  return String(number).padStart(2, "0");
}

function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromISODate(isoDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(isoDate || ""))) return new Date();
  const [year, month, day] = isoDate.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function shiftDate(isoDate, offset) {
  const date = fromISODate(isoDate);
  date.setDate(date.getDate() + offset);
  return toISODate(date);
}

function readSelectionsByDate() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function getMealNutrition(meal) {
  const type = normalizeMealType(meal?.mealType);
  const level = normalize(meal?.level);
  const factor = LEVEL_FACTOR[level] || 1;
  const base = NUTRITION_BY_TYPE[type] || NUTRITION_BY_TYPE.breakfast;

  const nutrition = meal?.nutrition && typeof meal.nutrition === "object" ? meal.nutrition : {};

  return {
    calories: Math.round(parseNumber(nutrition.calories) || base.calories * factor),
    protein: Math.round(parseNumber(nutrition.protein) || base.protein * factor),
    carbs: Math.round(
      parseNumber(nutrition.carbs ?? nutrition.carbohydrates) || base.carbs * factor,
    ),
    fat: Math.round(parseNumber(nutrition.fat) || base.fat * factor),
  };
}

function toTitleCase(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getHealthTip(progressMap) {
  if (progressMap.protein < 60) {
    return "Consider adding one more protein-rich dish to improve muscle recovery and satiety.";
  }

  if (progressMap.carbs < 55) {
    return "Your carb intake is still low. Add whole grains or fruit for balanced energy.";
  }

  if (progressMap.fat > 105) {
    return "Fat intake is above target. Prioritize lean proteins and lighter cooking methods.";
  }

  if (progressMap.calories < 70) {
    return "You are still below daily energy target. A nutrient-dense snack can help complete your plan.";
  }

  return "Great progress today. Keep hydration consistent to support digestion and nutrient absorption.";
}

export default function DailyPlanEdit() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [selectionsByDate, setSelectionsByDate] = useState(() => readSelectionsByDate());

  const selectedDateObj = useMemo(() => fromISODate(selectedDate), [selectedDate]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 9 }, (_, index) => currentYear - 2 + index);
  }, []);

  const selectedMonth = selectedDateObj.getMonth();
  const selectedYear = selectedDateObj.getFullYear();

  const dayRail = useMemo(() => {
    return Array.from({ length: 16 }, (_, index) => {
      const offset = index - 7;
      const date = fromISODate(selectedDate);
      date.setDate(date.getDate() + offset);
      return {
        iso: toISODate(date),
        label: pad(date.getDate()),
      };
    });
  }, [selectedDate]);

  const selectedEntries = useMemo(() => {
    const byDate = selectionsByDate[selectedDate] || {};
    return Object.entries(byDate).map(([entryId, meal]) => ({
      entryId,
      meal: meal || {},
    }));
  }, [selectionsByDate, selectedDate]);

  const groupedMeals = useMemo(() => {
    const grouped = {
      breakfast: [],
      lunch: [],
      dinner: [],
      others: [],
    };

    selectedEntries.forEach(({ entryId, meal }) => {
      const mealType = normalizeMealType(meal?.mealType);
      grouped[mealType].push({ entryId, meal });
    });

    return grouped;
  }, [selectedEntries]);

  const displaySections = useMemo(() => {
    if ((groupedMeals.others || []).length > 0) {
      return [...MEAL_SECTIONS, { key: "others", label: "Snacks", icon: Clock3, iconClass: "icon-snack" }];
    }
    return MEAL_SECTIONS;
  }, [groupedMeals]);

  const nutritionTotals = useMemo(() => {
    return selectedEntries.reduce(
      (accumulator, { meal }) => {
        const values = getMealNutrition(meal);
        return {
          calories: accumulator.calories + values.calories,
          protein: accumulator.protein + values.protein,
          carbs: accumulator.carbs + values.carbs,
          fat: accumulator.fat + values.fat,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [selectedEntries]);

  const nutritionProgress = useMemo(() => {
    const caloriesPercent = Math.round((nutritionTotals.calories / NUTRITION_TARGETS.calories) * 100);
    const proteinPercent = Math.round((nutritionTotals.protein / NUTRITION_TARGETS.protein) * 100);
    const carbsPercent = Math.round((nutritionTotals.carbs / NUTRITION_TARGETS.carbs) * 100);
    const fatPercent = Math.round((nutritionTotals.fat / NUTRITION_TARGETS.fat) * 100);

    return {
      calories: Number.isFinite(caloriesPercent) ? caloriesPercent : 0,
      protein: Number.isFinite(proteinPercent) ? proteinPercent : 0,
      carbs: Number.isFinite(carbsPercent) ? carbsPercent : 0,
      fat: Number.isFinite(fatPercent) ? fatPercent : 0,
    };
  }, [nutritionTotals]);

  const healthTip = useMemo(() => getHealthTip(nutritionProgress), [nutritionProgress]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectionsByDate));
  }, [selectionsByDate]);

  const handleMonthChange = (event) => {
    const nextMonth = Number(event.target.value);
    const currentDay = selectedDateObj.getDate();
    const maxDay = new Date(selectedYear, nextMonth + 1, 0).getDate();
    const nextDate = new Date(selectedYear, nextMonth, Math.min(currentDay, maxDay));
    setSelectedDate(toISODate(nextDate));
  };

  const handleYearChange = (event) => {
    const nextYear = Number(event.target.value);
    const currentDay = selectedDateObj.getDate();
    const maxDay = new Date(nextYear, selectedMonth + 1, 0).getDate();
    const nextDate = new Date(nextYear, selectedMonth, Math.min(currentDay, maxDay));
    setSelectedDate(toISODate(nextDate));
  };

  const handleRemoveMeal = (entryId) => {
    setSelectionsByDate((previous) => {
      const currentDateMap = { ...(previous[selectedDate] || {}) };
      if (!currentDateMap[entryId]) return previous;

      delete currentDateMap[entryId];

      const next = { ...previous };
      if (Object.keys(currentDateMap).length === 0) {
        delete next[selectedDate];
      } else {
        next[selectedDate] = currentDateMap;
      }
      return next;
    });
  };

  const handleAddMeal = (mealType) => {
    const normalizedMealType = normalizeMealType(mealType);
    navigate(`/meal/${encodeURIComponent(normalizedMealType)}?date=${encodeURIComponent(selectedDate)}`, {
      state: {
        defaultMealType: normalizedMealType,
        planDate: selectedDate,
      },
    });
  };

  const renderMealCard = (section) => {
    const meals = groupedMeals[section.key] || [];
    const SectionIcon = section.icon;

    return (
      <section key={section.key} className="dpe-meal-block">
        <div className="dpe-meal-block-head">
          <span className={`dpe-meal-icon ${section.iconClass || ""}`} aria-hidden="true">
            {SectionIcon ? <SectionIcon size={18} strokeWidth={2.2} /> : null}
          </span>
          <h3>{section.label}</h3>
        </div>

        {meals.length === 0 ? (
          <div className="dpe-meal-empty">No dish selected for this meal yet.</div>
        ) : (
          <div className="dpe-meal-items">
            {meals.map(({ entryId, meal }) => {
              const tags = Array.isArray(meal?.tags) && meal.tags.length > 0
                ? meal.tags.slice(0, 2)
                : FALLBACK_TAGS[section.key] || FALLBACK_TAGS.others;

              return (
                <article key={entryId} className="dpe-selected-meal-card">
                  <div className="dpe-item-thumb">
                    <img
                      src={meal?.image || IMAGE_FALLBACK}
                      alt={meal?.title || meal?.name || "Meal"}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = IMAGE_FALLBACK;
                      }}
                    />
                  </div>

                  <div className="dpe-item-content">
                    <h4>{meal?.title || meal?.name || "Untitled dish"}</h4>

                    <div className="dpe-item-tags">
                      {tags.map((tag) => (
                        <span key={`${entryId}-${tag}`}>{tag}</span>
                      ))}
                    </div>

                    <div className="dpe-item-meta">
                      <span>
                        <Users size={14} />
                        {meal?.servings || "1 Serving"}
                      </span>
                      <span>
                        <Clock3 size={14} />
                        {meal?.time || "N/A"}
                      </span>
                      <span>
                        <BarChart3 size={14} />
                        {toTitleCase(meal?.level || "Easy")}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="dpe-remove-item"
                    onClick={() => handleRemoveMeal(entryId)}
                    aria-label={`Remove ${meal?.title || meal?.name || "meal"}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              );
            })}
          </div>
        )}

        <button type="button" className="dpe-add-meal-btn" onClick={() => handleAddMeal(section.key)}>
          <Plus size={20} />
          Add Meal
        </button>
      </section>
    );
  };

  return (
    <div className="dpe-page">
      <div className="dpe-shell">
        
        <div className="dpe-breadcrumb" aria-label="breadcrumb">
          <button type="button" onClick={() => navigate(-1)}>
            <ChevronLeft size={14} />
            Back
          </button>
          <span>/</span>
          <span>Meal Planning</span>
          <span>/</span>
          <strong>Daily Meal</strong>
        </div>

        <h1 className="dpe-page-title" style={{ margin: "28px 0"}}>
          Daily Plan
        </h1>

        <div className="dpe-calendar-row">
          <div className="dpe-date-toolbar">
            <select value={selectedMonth} onChange={handleMonthChange} aria-label="Month">
              {MONTHS.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>

            <select value={selectedYear} onChange={handleYearChange} aria-label="Year">
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="dpe-day-strip" aria-label="Select day">
            <button
              type="button"
              className="dpe-strip-nav"
              onClick={() => setSelectedDate((previous) => shiftDate(previous, -1))}
              aria-label="Previous day"
            >
              <ChevronLeft size={26} />
            </button>

            <div className="dpe-strip-days">
              {dayRail.map((day) => {
                const isActive = day.iso === selectedDate;
                return (
                  <button
                    key={day.iso}
                    type="button"
                    className={`dpe-day-chip ${isActive ? "active" : ""}`}
                    onClick={() => setSelectedDate(day.iso)}
                    aria-pressed={isActive}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="dpe-strip-nav"
              onClick={() => setSelectedDate((previous) => shiftDate(previous, 1))}
              aria-label="Next day"
            >
              <ChevronRight size={26} />
            </button>
          </div>
        </div>

        <div className="dpe-main-grid">
          <div className="dpe-left-column">
            {displaySections.map((section) => renderMealCard(section))}
          </div>

          <aside className="dpe-right-column">
            <section className="dpe-nutrition-card">
              <h2>Today’s Nutrition</h2>

              <div className="dpe-kpi-row">
                <div className="dpe-kpi-head">
                  <span>Calories</span>
                  <strong>{nutritionProgress.calories}%</strong>
                </div>
                <div className="dpe-kpi-track">
                  <span style={{ width: `${Math.min(100, Math.max(0, nutritionProgress.calories))}%` }} />
                </div>
                <p>{nutritionTotals.calories}/{NUTRITION_TARGETS.calories} kcal</p>
              </div>

              <div className="dpe-kpi-row">
                <div className="dpe-kpi-head">
                  <span>Protein</span>
                  <strong>{nutritionProgress.protein}%</strong>
                </div>
                <div className="dpe-kpi-track protein">
                  <span style={{ width: `${Math.min(100, Math.max(0, nutritionProgress.protein))}%` }} />
                </div>
                <p>{nutritionTotals.protein}/{NUTRITION_TARGETS.protein}g</p>
              </div>

              <div className="dpe-kpi-row">
                <div className="dpe-kpi-head">
                  <span>Carbohydrates</span>
                  <strong>{nutritionProgress.carbs}%</strong>
                </div>
                <div className="dpe-kpi-track carbs">
                  <span style={{ width: `${Math.min(100, Math.max(0, nutritionProgress.carbs))}%` }} />
                </div>
                <p>{nutritionTotals.carbs}/{NUTRITION_TARGETS.carbs}g</p>
              </div>

              <div className="dpe-kpi-row">
                <div className="dpe-kpi-head">
                  <span>Fat</span>
                  <strong>{nutritionProgress.fat}%</strong>
                </div>
                <div className="dpe-kpi-track fat">
                  <span style={{ width: `${Math.min(100, Math.max(0, nutritionProgress.fat))}%` }} />
                </div>
                <p>{nutritionTotals.fat}/{NUTRITION_TARGETS.fat}g</p>
              </div>

              <div className="dpe-health-tip">
                <h4>Health Tip</h4>
                <p>{healthTip}</p>
              </div>

              <div className="dpe-selected-date-note">
                <CalendarDays size={15} />
                <span>{selectedDate}</span>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
