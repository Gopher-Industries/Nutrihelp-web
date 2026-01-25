// src/routes/Meal/WeeklyMealPlanPage.jsx
import React from 'react';
import WeeklyMealPlan from './WeeklyMealPlan';
import { exportMealPlanAsPDF } from './PDFExport'; 
import { useNavigate } from 'react-router-dom';

const WeeklyMealPlanPage = () => {
  const navigate = useNavigate();
  const handleExport = () => {
    exportMealPlanAsPDF('meal-plan-pdf');
  };

  return (
    <div style={{ padding: 'clamp(10px, 3vw, 20px)', backgroundColor: '#fff', minHeight: '100vh', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Back to Meals Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          color: '#005BBB',
          fontSize: '1rem',
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
        <span style={{ fontSize: '1.125rem' }}>←</span>
        <span>Back to Meals</span>
      </button>

      <div className="weekly-container">
        <h2 style={{ 
          textAlign: "center", 
          color: '#000000ff',
          fontSize: "clamp(1.375rem, 4vw, 2.25rem)",  
          lineHeight: 1.3,
          margin: "0 0 20px 0"
        }}>
          🌱 Weekly Meal Plan 🌱
        </h2>
        
        <WeeklyMealPlan 
          onExport={handleExport} 
          showExport={true} 
        />
      </div>
    </div>
  );
};

export default WeeklyMealPlanPage;