import React, { createContext, useState, useEffect, useContext } from 'react';
import { UserContext } from './user.context';
import mealPlanApi from '../services/mealPlanApi';

export const TodayMenuContext = createContext();

export const TodayMenuProvider = ({ children }) => {
  const { currentUser } = useContext(UserContext);

  const [todayMenu, setTodayMenu] = useState({
    items: [],
    totalNutrition: {
      calories: 0,
      proteins: 0,
      fats: 0,
      vitamins: 0,
      sodium: 0,
    },
    savedAt: null,
    dateKey: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const getTodayDateKey = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const getStorageKey = (userId) => `todayMenu_${userId}`;

  const parseApiMealPlans = (mealPlans) => {
    const items = [];
    const totalNutrition = { calories: 0, proteins: 0, fats: 0, vitamins: 0, sodium: 0 };

    mealPlans.forEach(plan => {
      if (Array.isArray(plan.recipes)) {
        plan.recipes.forEach(recipe => {
          items.push({
            id: recipe.recipe_id,
            name: recipe.recipe_name,
            mealType: plan.meal_type,
            details: {
              calories: recipe.calories || 0,
              proteins: recipe.protein || 0,
              fats: recipe.fat || 0,
              vitamins: (recipe.vitamin_a || 0) + (recipe.vitamin_b || 0) + (recipe.vitamin_c || 0),
              sodium: recipe.sodium || 0
            }
          });

          totalNutrition.calories += recipe.calories || 0;
          totalNutrition.proteins += recipe.protein || 0;
          totalNutrition.fats += recipe.fat || 0;
          totalNutrition.vitamins += (recipe.vitamin_a || 0) + (recipe.vitamin_b || 0) + (recipe.vitamin_c || 0);
          totalNutrition.sodium += recipe.sodium || 0;
        });
      }
    });

    return { items, totalNutrition };
  };

  const loadMenu = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);
    try {
      const todayKey = getTodayDateKey();
      const userId = currentUser.user_id || currentUser.id || currentUser.uid;
      const storageKey = getStorageKey(userId);

      const savedData = localStorage.getItem(storageKey);
      let loadedValidLocalData = false;

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Phase 1 local fallback Check
        if (parsedData.dateKey === todayKey) {
          setTodayMenu(parsedData);
          loadedValidLocalData = true;
        } else {
          clearMenuLocal();
        }
      }

      // API Integration
      try {
        const apiData = await mealPlanApi.getMealPlans();
        if (apiData && apiData.length > 0) {
          const parsed = parseApiMealPlans(apiData);
          if (parsed.items.length > 0) {
            setTodayMenu({
              items: parsed.items,
              totalNutrition: parsed.totalNutrition,
              savedAt: new Date().toISOString(),
              dateKey: todayKey
            });
            return; // Safely loaded from BE
          }
        }
      } catch (apiErr) {
        console.warn("API GET failed. Utilizing local phase 1 persistence framework.", apiErr);
      }

    } catch (err) {
      setError("Failed to load today's menu");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveMenu = async (items, totalNutrition) => {
    if (!currentUser) {
      setError("Must be logged in to save.");
      return false;
    }

    if (!items || items.length === 0) {
      setError("Cannot save an empty menu.");
      return false;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const newMenu = {
        items,
        totalNutrition,
        savedAt: new Date().toISOString(),
        dateKey: getTodayDateKey()
      };

      const userId = currentUser.user_id || currentUser.id || currentUser.uid;
      const storageKey = getStorageKey(userId);

      // Phase 1: local persistence fallback
      localStorage.setItem(storageKey, JSON.stringify(newMenu));
      setTodayMenu(newMenu);

      // Phase 2: attempt to group by category and post arrays of IDs to BE payload
      const grouped = items.reduce((acc, current) => {
        const type = current.mealType;
        if (!acc[type]) acc[type] = [];
        if (current.id) acc[type].push(current.id);
        return acc;
      }, {});

      for (const mealType of Object.keys(grouped)) {
        // API expects recipe_ids array, if using dummy UI data without IDs they drop off
        const recipeIds = grouped[mealType];
        if (recipeIds.length > 0) {
          try {
            await mealPlanApi.saveMealPlan(mealType, recipeIds);
          } catch (err) {
            console.warn(`API save failed for ${mealType}, Phase 1 persistence ensured.`, err);
          }
        }
      }

      setSuccess(true);
      return true;
    } catch (err) {
      setError("Failed to save today's menu.");
      console.error(err);
      return false;
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const clearMenuLocal = () => {
    setTodayMenu({
      items: [],
      totalNutrition: { calories: 0, proteins: 0, fats: 0, vitamins: 0, sodium: 0 },
      savedAt: null,
      dateKey: null,
    });
  };

  useEffect(() => {
    if (currentUser) {
      loadMenu();
    } else {
      clearMenuLocal();
    }
  }, [currentUser]);

  return (
    <TodayMenuContext.Provider value={{ todayMenu, loading, error, success, saveMenu, loadMenu }}>
      {children}
    </TodayMenuContext.Provider>
  );
};