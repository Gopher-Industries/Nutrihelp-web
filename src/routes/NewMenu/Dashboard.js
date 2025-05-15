import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Grid, GridColumn, GridRow } from 'semantic-ui-react';
import DashboardGraph from '../../components/Dashboard-Graph';
import Card from './MenuCard';
import './MenuCard.css';
import imageMapping from './importImages.js';
import WaterTracker from '../../components/WaterTracker';


const Dashboard = () => {
  const location = useLocation();
  const selectedItems = location.state?.selectedItems || [];
  const totalNutrition = location.state?.totalNutrition || {
    calories: 0,
    proteins: 0,
    fats: 0,
    vitamins: 0,
    sodium: 0,
  };


  const [activeTab, setActiveTab] = useState('breakfast');
  const [groupedItems, setGroupedItems] = useState({
    breakfast: [],
    lunch: [],
    dinner: []
  });

  useEffect(() => {
    const newGroupedItems = {
      breakfast: selectedItems.filter(item => item.mealType === 'breakfast'),
      lunch: selectedItems.filter(item => item.mealType === 'lunch'),
      dinner: selectedItems.filter(item => item.mealType === 'dinner'),
    };
    setGroupedItems(newGroupedItems);
  }, [selectedItems]);


  const renderMealItems = (mealType) => {
    const items = groupedItems[mealType];

    if (!items || items.length === 0) {
      return <div>No items available</div>;
    }

    return (
      <div className="cards-container">
        {items.map((item, index) => (
          <Card key={index} item={item} imageMapping={imageMapping}/>
        ))}
      </div>
    );
  };



  const menuGraphComponent = () => (
    <div className="nutrition-summary">
      <DashboardGraph
        totalNutritionCalorie={totalNutrition.calories}
        totalNutritionProtiens={totalNutrition.proteins}
        totalNutritionFats={totalNutrition.fats}
        totalNutritionVitamins={totalNutrition.vitamins}
        totalNutritionSodium={totalNutrition.sodium}
      />
    </div>
  );

  return (
    <main>
      <div className="mainBox">
        <div className="Title">
          <h2>MENU</h2>
        </div>
        <Link to="/appointment" className="button-link">
          <button className="appointment-btn">Book an Appointment</button>
        </Link>

        <div className="daySelctionText">
          <h3>Today</h3>
        </div>


        {/* Tabs Navigation */}
        <nav>
          <a
            className={`breakfast-btn ${activeTab === 'breakfast' ? 'active' : ''}`}
            onClick={() => setActiveTab('breakfast')}
          >
            Breakfast
          </a>
          <a
            className={`lunch-btn ${activeTab === 'lunch' ? 'active' : ''}`}
            onClick={() => setActiveTab('lunch')}
          >
            Lunch
          </a>
          <a
            className={`dinner-btn ${activeTab === 'dinner' ? 'active' : ''}`}
            onClick={() => setActiveTab('dinner')}
          >
            Dinner
          </a>
          <div className="tab-underline"></div>
        </nav>


        <div className="dashboard-grid">
          <div className="menu-grid-box">
            {renderMealItems(activeTab)}
          </div>
        </div>

        <div className="dashboard-graph">
          {menuGraphComponent()}
        </div>
        <div className="dashboard-water-tracker">
          <WaterTracker />
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
