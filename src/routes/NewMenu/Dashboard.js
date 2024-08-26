import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Grid, GridColumn, GridRow } from 'semantic-ui-react';
import DashboardGraph from '../../components/Dashboard-Graph';
import Card from './Card';


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
    // Update groupedItems when selectedItems changes
    const newGroupedItems = {
      breakfast: selectedItems.filter(item => item.mealType === 'breakfast'),
      lunch: selectedItems.filter(item => item.mealType === 'lunch'),
      dinner: selectedItems.filter(item => item.mealType === 'dinner'),
    };
    setGroupedItems(newGroupedItems);
  }, [selectedItems]);


  const renderMealItems = (mealType) => {
    const items = groupedItems[mealType];
    // console.log(`Items for ${mealType}:`, items);
    if (!items || items.length === 0) {
      return <div>No items available</div>;
    }
    return items.map((item, index) => (
      <div className="selected-recipe-box" key={index}>
        <img src={item.imageUrl} alt={item.name} style={{ width: '100px', height: '100px' }} />
        <div>{item.name}</div>
      </div>
    ));
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
          <button>Book an Appointment</button>
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
          <div className="dashboard-grid-2">
            <Grid columns={3} divided>
              <GridRow className="menu-grid-wrap">
                <GridColumn>
                  <div className="menu-grid-box">
                    <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                    {renderMealItems(activeTab)}
                  </div>
                </GridColumn>
              </GridRow>
            </Grid>
          </div>
        </div>

        <div className="dashboard-graph">
          {menuGraphComponent()}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
