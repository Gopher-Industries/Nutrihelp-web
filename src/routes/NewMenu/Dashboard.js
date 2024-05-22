import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Grid, GridColumn, GridRow } from 'semantic-ui-react';
import DashboardGraph from '../../components/Dashboard-Graph';

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

  const renderMealItems = (mealType) => {
    return selectedItems
      .filter(item => item.mealType === mealType)
      .map((item, index) => <div className="selected-recipe-box" key={index}>{item.name}</div>);
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
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />

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

        <div className="dashboard-grid">
          <div className="widgetBox dashboard-grid-1">
            <i className="fa-solid fa-palette"></i>
            <i className="fa-solid fa-paintbrush"></i>
            <i className="fa-solid fa-caret-down"></i>
            <i className="fa-solid fa-sun"></i>
            <i className="fa-solid fa-moon"></i>
            <i className="fa-solid fa-sliders"></i>
          </div>
          <div className="dashboard-grid-2">
            <Grid columns={3} divided>
              <GridRow className="menu-grid-wrap">
                <GridColumn>
                  <div className="menu-grid-box">
                    <h3>Breakfast</h3>
                    {renderMealItems('breakfast')}
                  </div>
                </GridColumn>
                <GridColumn>
                  <div className="menu-grid-box">
                    <h3>Lunch</h3>
                    {renderMealItems('lunch')}
                  </div>
                </GridColumn>
                <GridColumn>
                  <div className="menu-grid-box">
                    <h3>Dinner</h3>
                    {renderMealItems('dinner')}
                  </div>
                </GridColumn>
              </GridRow>
            </Grid>
          </div>

          <div className="widgetBox2 dashboard-grid-3">
            <i className="fa-solid fa-circle-plus"></i>
            <i className="fa-solid fa-caret-down"></i>
            <i className="fa-solid fa-utensils"></i>
            <i className="fa-solid fa-heart-pulse"></i>
            <i className="fa-solid fa-carrot"></i>
            <i className="fa-solid fa-calendar-check"></i>
            <i className="fa-solid fa-bars"></i>
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
