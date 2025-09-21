// src/components/mealPlan/MealPlan.jsx
import React, { useState } from "react";
import { DAILY_MENU_PLAN } from "./utils/dailyMenuPlan";
import RecipeDetailsModal from "./RecipeDetailsModal";
import QuickMealDetailsModal from "./QuickMealDetailsModal";

const MealCard = ({ title, items, onShowQuick, onShowRecipe }) => {
  const [eaten, setEaten] = useState(false);

  // Choose which recipe to show when pressing Details/Recipe.
  // Here we open the first item; you can change to any selection logic you like.
  const primary = items[0];

  return (
    <div className="meal-card">
      <div className="meal-title">{title}</div>

      {/* Items list (no per-item buttons) */}
      <ul style={{ marginBottom: 12 }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: 8 }}>{item.title}</li>
        ))}
      </ul>

      {/* ONE action row for the whole meal section */}
      <div className="meal-actions one-row">
        <div className="recipe-btns">
          <button onClick={() => setEaten((v) => !v)}>
            {eaten ? "✅ Eaten" : "Mark as Eaten"}
          </button>
          <button onClick={() => onShowQuick(primary)}>Details</button>
          <button onClick={() => onShowRecipe(primary)}>Recipe</button>
        </div>
      </div>
    </div>
  );
};

export default function MealPlan() {
  const [quickOpen, setQuickOpen] = useState(false);
  const [recipeOpen, setRecipeOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const showQuick = (meal) => { setSelected(meal); setQuickOpen(true); };
  const showRecipe = (meal) => { setSelected(meal); setRecipeOpen(true); };

  return (
    <div className="section">
      <MealCard
        title="🍽️ Breakfast"
        items={DAILY_MENU_PLAN.breakfast}
        onShowQuick={showQuick}
        onShowRecipe={showRecipe}
      />
      <MealCard
        title="🍱 Lunch"
        items={DAILY_MENU_PLAN.lunch}
        onShowQuick={showQuick}
        onShowRecipe={showRecipe}
      />
      <MealCard
        title="🍲 Dinner"
        items={DAILY_MENU_PLAN.dinner}
        onShowQuick={showQuick}
        onShowRecipe={showRecipe}
      />

      {/* Compact details (times + nutrition only) */}
      <QuickMealDetailsModal
        open={quickOpen}
        meal={selected}
        onClose={() => setQuickOpen(false)}
      />

      {/* Full recipe (steps + ingredients) */}
      <RecipeDetailsModal
        open={recipeOpen}
        recipe={selected}
        onClose={() => setRecipeOpen(false)}
      />
    </div>
  );
}
