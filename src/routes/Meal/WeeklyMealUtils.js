// src/routes/Meal/WeeklyMealUtils.js

import { supabase } from '../../supabaseClient';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTypes = ['breakfast', 'lunch', 'dinner'];

export async function fetchWeeklyMealPlan() {
  let plan = [];
  let recipeIdSet = new Set();

  for (let day of daysOfWeek) {
    let dayPlan = { day };

    for (let meal of mealTypes) {
      const { data, error } = await supabase
        .from('weeklyrecipes')
        .select('*')
        .eq('meal_type', meal)
        .eq('is_published', true);

      if (error || !data || data.length === 0) {
        console.error(`Error fetching ${meal} for ${day}:`, error?.message);
        dayPlan[meal] = null;
        continue;
      }

      const randomRecipe = data[Math.floor(Math.random() * data.length)];
      dayPlan[meal] = randomRecipe;
      if (randomRecipe?.id) recipeIdSet.add(randomRecipe.id);
    }

    plan.push(dayPlan);
  }

  // Fetch all ingredients in one go
  const { data: ingredientsData, error: ingredientsError } = await supabase
    .from('weekly_recipe_ingredient')
    .select('*')
    .in('recipe_id', Array.from(recipeIdSet));

  if (ingredientsError) {
    console.error('Error fetching ingredients:', ingredientsError.message);
  }

  // Group ingredients by recipe_id
  const ingredientsByMeal = {};
  for (let item of ingredientsData || []) {
    if (!ingredientsByMeal[item.recipe_id]) {
      ingredientsByMeal[item.recipe_id] = [];
    }
    ingredientsByMeal[item.recipe_id].push(item);
  }

  return { plan, ingredients: ingredientsByMeal };
}
