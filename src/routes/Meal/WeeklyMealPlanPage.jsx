import React from 'react';
import WeeklyMealPlan from './WeeklyMealPlan';
import { useNavigate } from 'react-router-dom';

const WeeklyMealPlanPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', minHeight: '100vh' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{
          background: 'none',
          border: 'none',
          color: '#005BBB',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          padding: '8px 0',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.color = '#003D8F'}
        onMouseLeave={(e) => e.target.style.color = '#005BBB'}
      >
        <span style={{ fontSize: '18px' }}>←</span>
        <span>Back to Meals</span>
      </button>

      <div className="weekly-container">
        <h2 style={{ textAlign: "center", color: '#000000ff' }}>🌱 Weekly Meal Plan 🌱</h2>
        <WeeklyMealPlan />
      </div>
    </div>
  );
};

export default WeeklyMealPlanPage;