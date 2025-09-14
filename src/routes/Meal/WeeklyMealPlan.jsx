// src/routes/Meal/WeeklyMealPlan.jsx
import React, { useEffect, useState } from 'react';
import { fetchWeeklyMealPlan } from './WeeklyMealUtils';
import { exportMealPlanAsPDF } from './PDFExport';

const WeeklyMealPlan = () => {
  const [mealPlan, setMealPlan] = useState([]);
  const [ingredientsByRecipe, setIngredientsByRecipe] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const { plan, ingredients } = await fetchWeeklyMealPlan();
        setMealPlan(plan || []);
        setIngredientsByRecipe(ingredients || {});
        // Optional: surface empty-state hint
        if ((plan || []).every(d => !d.breakfast && !d.lunch && !d.dinner)) {
          setError('No recipes returned. Check Supabase RLS and data (meal_type casing / is_published).');
        }
      } catch (err) {
        console.error('Error generating meal plan:', err?.message || err);
        setError('Failed to generate weekly meal plan.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  if (loading) return <p>Loading weekly meal plan...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const getIngredientName = (ing) =>
    ing.ingredient_name || ing.name || ing.ingredient || 'Ingredient';
  const getIngredientQty = (ing) =>
    ing.quantity ?? ing.qty ?? ing.amount ?? '';

  const DayRow = ({ dayPlan }) => {
    const meals = ['breakfast', 'lunch', 'dinner'];

    return (
      <div style={{ marginBottom: '24px' }}>
        <h2 className="day-header" style={{
          fontSize: 20, marginTop: 20, color: '#1a237e',
          borderBottom: '1px solid #ccc', paddingBottom: 6, marginBottom: 12
        }}>
          {dayPlan.day}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))',
          gap: '16px',
          width: '100%',
        }}>
          {meals.map((mealKey) => {
            const recipe = dayPlan[mealKey];
            const rId = recipe?.id;
            const ingList = rId ? (ingredientsByRecipe[rId] || []) : [];
            return (
              <div key={mealKey} style={{
                border: '1px solid #ddd', borderRadius: 10, padding: 14,
                backgroundColor: '#f9f9f9', boxShadow: '0 4px 8px rgba(0,0,0,0.05)', minWidth: 0
              }}>
                <h3 className="meal-header" style={{
                  margin: '4px 0 8px', color: '#ffc0b8ff', textDecoration: 'underline', fontSize: 16
                }}>
                  {mealKey.charAt(0).toUpperCase() + mealKey.slice(1)}
                </h3>

                <p style={{ fontWeight: 700, margin: '0 0 6px' }}>
                  {recipe?.recipe_name || 'N/A'}
                </p>
                <p style={{ fontSize: 14, color: '#333', margin: '0 0 10px', whiteSpace: 'pre-wrap' }}>
                  {recipe?.instructions || 'No instructions available.'}
                </p>

                {rId && ingList.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <p style={{ margin: '0 0 6px', fontWeight: 600 }}>Ingredients</p>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: '#fff', border: '1px solid #e0e0e0' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #e0e0e0' }}>Ingredient</th>
                          <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #e0e0e0' }}>Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ingList.map((ing, idx) => (
                          <tr key={idx}>
                            <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>{getIngredientName(ing)}</td>
                            <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>{getIngredientQty(ing)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {rId && ingList.length === 0 && (
                  <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Ingredients not available for this recipe.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px', fontFamily: 'Segoe UI, sans-serif', overflowX: 'hidden', width: '100%'
    }}>
      <h2 style={{ color: '#2e7d32', textAlign: 'center' }}>Weekly Meal Plan</h2>
      <button
        onClick={() => exportMealPlanAsPDF('meal-plan-pdf')}
        style={{ backgroundColor: '#2e7d32', color: 'white', border: 'none', padding: '10px 20px', margin: '20px 0', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' }}
      >
        Export as PDF
      </button>

      <div id="meal-plan-pdf" style={{ width: '100%', maxWidth: 1200 }}>
        {mealPlan.map((dayPlan, idx) => <DayRow key={idx} dayPlan={dayPlan} />)}
      </div>
    </div>
  );
};

export default WeeklyMealPlan;
