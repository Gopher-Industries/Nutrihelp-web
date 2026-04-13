import React, { useState, useEffect, useContext, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { TodayMenuContext } from "../../context/TodayMenuContext";
import DashboardGraph from "../../components/Dashboard-Graph";
import Card from "./MenuCard";
import "./MenuCard.css";
import "./Menustyles.css";
import imageMapping from "./importImages.js";
import WaterTracker from "../../components/WaterTracker";

const Dashboard = () => {
  const location = useLocation();
  const { todayMenu } = useContext(TodayMenuContext);
  
  const selectedItems = useMemo(() => 
    todayMenu?.items?.length > 0 ? todayMenu.items : (location.state?.selectedItems || []),
    [todayMenu?.items, location.state?.selectedItems]
  );

  const totalNutrition = useMemo(() => 
    todayMenu?.items?.length > 0 ? todayMenu.totalNutrition : (location.state?.totalNutrition || {
      calories: 0,
      proteins: 0,
      fats: 0,
      vitamins: 0,
      sodium: 0,
    }),
    [todayMenu?.items, todayMenu?.totalNutrition, location.state?.totalNutrition, location.state?.selectedItems]
  );

  const [activeTab, setActiveTab] = useState("breakfast");
  const [groupedItems, setGroupedItems] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
  });

  useEffect(() => {
    setGroupedItems({
      breakfast: selectedItems.filter((i) => i.mealType === "breakfast"),
      lunch: selectedItems.filter((i) => i.mealType === "lunch"),
      dinner: selectedItems.filter((i) => i.mealType === "dinner"),
    });
  }, [selectedItems]);

  const renderMealItems = (mealType) => {
    const items = groupedItems[mealType];
    if (!items || items.length === 0) return <div className="no-items">No items available</div>;

    return (
      <div className="cards-container">
        {items.map((item, idx) => (
          <Card key={idx} item={item} imageMapping={imageMapping} />
        ))}
      </div>
    );
  };

  if (selectedItems.length === 0) {
      return (
        <main>
          <div className="mainBox">
            <div className="Title"><h2>TODAY'S MENU</h2></div>
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <h3 style={{ color: "var(--text-primary)" }}>No Menu Saved for Today</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>You haven't selected or saved any meals for today yet.</p>
              <Link to="/meal">
                <button className="appointment-btn" style={{ width: "auto", padding: "12px 24px" }}>
                  Choose Meals
                </button>
              </Link>
            </div>
           </div>
        </main>
      );
  }

  return (
    <main>
      <div className="mainBox">
        <div className="Title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>MENU</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/meal" state={{ editMode: true }} style={{ textDecoration: 'none' }}>
              <button className="appointment-btn" style={{ padding: '8px 16px', width: 'auto', margin: 0 }}>
                Edit Today Menu
              </button>
            </Link>
            <Link to="/meal" style={{ textDecoration: 'none' }}>
              <button className="appointment-btn" style={{ padding: '8px 16px', width: 'auto', margin: 0, background: '#6b7280' }}>
                Back to Meal Selection
              </button>
            </Link>
          </div>
        </div>

        <Link to="/appointment" className="button-link">
          <button className="appointment-btn">Book an Appointment</button>
        </Link>

        <div style={{ height: 16 }} />

        {/* Row 1: Today aligned to the middle (Lunch) column, width matches the meal pane only */}
        <div className="today-row">
          <div className="today-align-grid">
            <div />
            <div className="today-text">Today</div>
            <div />
          </div>
          <div className="today-row-spacer" />
        </div>

        {/* Row 2: Meals (tabs+cards) + Water (same height as tabs+cards, NOT including Today) */}
        <div className="meal-water-row">
          <div className="meal-pane">
            <nav className="meal-nav-tabs" role="tablist" aria-label="Meal tabs">
              <button
                type="button"
                className={`nav-tab-btn ${activeTab === "breakfast" ? "active" : ""}`}
                onClick={() => setActiveTab("breakfast")}
                aria-selected={activeTab === "breakfast"}
              >
                Breakfast
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${activeTab === "lunch" ? "active" : ""}`}
                onClick={() => setActiveTab("lunch")}
                aria-selected={activeTab === "lunch"}
              >
                Lunch
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${activeTab === "dinner" ? "active" : ""}`}
                onClick={() => setActiveTab("dinner")}
                aria-selected={activeTab === "dinner"}
              >
                Dinner
              </button>
            </nav>

            <div className="meal-scroll-wrapper">{renderMealItems(activeTab)}</div>
          </div>

          {/* Water card: no extra wrapper card, and stretched to match meal-pane height */}
          <div className="water-panel">
            <div className="water-fill">
              <WaterTracker />
            </div>
          </div>
        </div>

        {/* Graph area: keep content, but NO shadow card outer frame */}
        <div className="dashboard-graph-section">
          <div className="nutrition-summary">
            <DashboardGraph
              totalNutritionCalorie={totalNutrition.calories}
              totalNutritionProtiens={totalNutrition.proteins}
              totalNutritionFats={totalNutrition.fats}
              totalNutritionVitamins={totalNutrition.vitamins}
              totalNutritionSodium={totalNutrition.sodium}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
