// src/routes/Meal/WeeklyMealPlan.jsx

import React, { useEffect, useState } from 'react';
import { fetchWeeklyMealPlan } from './WeeklyMealUtils';
import { exportMealPlanAsPDF } from './PDFExport';

const WeeklyMealPlan = () => {
  const [mealPlan, setMealPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const { plan } = await fetchWeeklyMealPlan();
        setMealPlan(plan);
      } catch (err) {
        console.error('Error generating meal plan:', err.message);
        setError('Failed to generate weekly meal plan.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  if (loading) return <p>Loading weekly meal plan...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'Segoe UI, sans-serif',
      overflowX: 'hidden'
    }}>
      <h2 style={{ color: '#2e7d32', textAlign: 'center' }}>Weekly Meal Plan</h2>

      <button
        onClick={() => exportMealPlanAsPDF('meal-plan-pdf')}
        style={{
          backgroundColor: '#2e7d32',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          margin: '20px 0',
          cursor: 'pointer',
          borderRadius: '5px',
          fontWeight: 'bold'
        }}
      >
        Export as PDF
      </button>

      <div
        id="meal-plan-pdf"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          width: '100%',
        }}
      >
        {mealPlan.map((dayPlan, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ddd',
              borderRadius: '10px',
              padding: '20px',
              backgroundColor: '#f9f9f9',
              boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
              wordWrap: 'break-word'
            }}
          >
            <h3 style={{
              color: '#1a237e',
              borderBottom: '1px solid #ccc',
              paddingBottom: '5px',
              marginBottom: '10px'
            }}>{dayPlan.day}</h3>

            {['breakfast', 'lunch', 'dinner'].map((meal) => (
              <div key={meal} style={{ marginBottom: '15px' }}>
                <p style={{ margin: '5px 0', color: '#2e7d32', fontWeight: 'bold' }}>
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </p>
                <p style={{ fontWeight: 'bold' }}>{dayPlan[meal]?.recipe_name || 'N/A'}</p>
                <p style={{ fontSize: '14px', color: '#333' }}>{dayPlan[meal]?.instructions || 'No instructions available.'}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyMealPlan;
