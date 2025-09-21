// src/components/mealPlan/NutriSnapshot.jsx
import React, { useMemo } from "react";
import { DAILY_MENU_PLAN } from "./utils/dailyMenuPlan";

function collectMeals() {
  return [...DAILY_MENU_PLAN.breakfast, ...DAILY_MENU_PLAN.lunch, ...DAILY_MENU_PLAN.dinner];
}

function sumNutrition(meals) {
  return meals.reduce(
    (acc, m) => {
      const n = m.nutrition || {};
      acc.calories += n.calories || 0;
      acc.protein += n.protein || 0;
      acc.carbs   += n.carbs   || 0;
      acc.fat     += n.fat     || 0;
      acc.fiber   += n.fiber   || 0;
      acc.sodium  += n.sodium  || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 }
  );
}

function Bar({ label, value, goal, unit }) {
  const pct = Math.min(100, Math.round((value / (goal || 1)) * 100));
  return (
    <div className="ns-row">
      <div className="ns-label">
        <strong>{label}</strong> <span className="ns-small">({value}{unit})</span>
      </div>
      <div className="ns-bar">
        <div className="ns-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="ns-goal">{goal}{unit}</div>
    </div>
  );
}

/** Optional default goals; you can make these user-editable later */
const DEFAULT_GOALS = { calories: 2000, protein: 90, carbs: 250, fat: 70, fiber: 28, sodium: 1500 };

export default function NutriSnapshot({ goals = DEFAULT_GOALS }) {
  const meals = useMemo(() => collectMeals(), []);
  const totals = useMemo(() => sumNutrition(meals), [meals]);

  return (
    <section className="section">
      <div className="meal-card ns-card">
        <div className="meal-title">📊 Calorie & Macros Dashboard</div>

        <div className="ns-grid">
          <Bar label="Calories" value={totals.calories} goal={goals.calories} unit=" kcal" />
          <Bar label="Protein"  value={totals.protein}  goal={goals.protein}  unit=" g" />
          <Bar label="Carbs"    value={totals.carbs}    goal={goals.carbs}    unit=" g" />
          <Bar label="Fat"      value={totals.fat}      goal={goals.fat}      unit=" g" />
          <Bar label="Fiber"    value={totals.fiber}    goal={goals.fiber}    unit=" g" />
          <Bar label="Sodium"   value={totals.sodium}   goal={goals.sodium}   unit=" mg" />
        </div>

        
      </div>
    </section>
  );
}
