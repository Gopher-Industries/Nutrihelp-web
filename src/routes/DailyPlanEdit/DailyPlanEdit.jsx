import React, { useState } from "react";
import "./DailyPlanEdit.css";

import { FaChevronLeft, FaChevronRight, FaRegCalendarAlt } from "react-icons/fa";


import oatmealImg from "../../images/daily_plan_edit_img/oatmeal.png";
import omeletteImg from "../../images/daily_plan_edit_img/omelette.png";
import smoothieImg from "../../images/daily_plan_edit_img/smoothie.png";
import friedeggImg from "../../images/daily_plan_edit_img/friedegg.png";
import saladImg from "../../images/daily_plan_edit_img/salad.png";
import pastaImg from "../../images/daily_plan_edit_img/pasta.png";
import sushiImg from "../../images/daily_plan_edit_img/sushi.png";
import veggiesoupImg from "../../images/daily_plan_edit_img/veggiesoup.png";
import steakImg from "../../images/daily_plan_edit_img/steak.png";
import chickenbreastsImg from "../../images/daily_plan_edit_img/chickenbreasts.png";
import lambchopsImg from "../../images/daily_plan_edit_img/lambchops.png";
import salmonImg from "../../images/daily_plan_edit_img/salmon.png";
import chewyfruitImg from "../../images/daily_plan_edit_img/chewyfruit.png";
import nutsImg from "../../images/daily_plan_edit_img/nuts.png";
import yogurtImg from "../../images/daily_plan_edit_img/yogurt.png";
import wheatcrackersImg from "../../images/daily_plan_edit_img/wheatcrackers.png";
import createMealIcon from "../../images/daily_plan_edit_img/create_meal.png";
import copyMealIcon from "../../images/daily_plan_edit_img/copy_meal.png";
import workoutIcon from "../../images/daily_plan_edit_img/workout.png";
import createExerciseIcon from "../../images/daily_plan_edit_img/create_exercise.png";
import allExerciseIcon from "../../images/daily_plan_edit_img/all_exercise.png";
import waterCupIcon from "../../images/daily_plan_edit_img/water_cup.png";

const DailyPlanEdit = () => {
    const [showOverview, setShowOverview] = useState(false);
    // Meal selection status
    const [selectedMealType, setSelectedMealType] = useState("Breakfast"); // Breakfast is selected by default

    // Recipe details modal window state
    const [showRecipeDetails, setShowRecipeDetails] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    // Recipe Description Data
    const recipeDescriptions = {
        "Oatmeal": "A healthy breakfast made with rolled oats cooked in milk or water. Rich in fiber and can be topped with fruits, nuts, and honey.",
        "Omelette": "Beaten eggs cooked with various fillings like cheese, vegetables, and meats. A protein-rich breakfast option.",
        "Breakfast Smoothie": "A nutritious blend of fruits, yogurt, and milk. Quick and easy to prepare, perfect for a busy morning.",
        "Fried Egg": "Eggs fried in butter or oil until the whites are set. Can be served sunny-side up or over easy.",
        "Salad": "A fresh mix of vegetables, often served with dressing. Great for a light, nutritious lunch.",
        "Pasta": "Italian staple made from wheat flour and water. Can be served with various sauces and toppings.",
        "Sushi": "Japanese dish featuring vinegared rice with fish, vegetables, and seaweed. A delicious and healthy lunch option.",
        "Veggie soup": "A warming soup made with a variety of vegetables. Perfect for a cold day.",
        "Steak": "A high-quality cut of beef, usually grilled or pan-seared. Rich in protein and flavor.",
        "Chicken Breasts": "Lean cuts of chicken meat, versatile and can be prepared in numerous ways.",
        "Lamb Chops": "Tender cuts of lamb, usually grilled or roasted. Rich in flavor and protein.",
        "Salmon": "Fatty fish rich in omega-3, can be baked, grilled, or pan-seared for a healthy dinner.",
        "Chewy fruit": "Dried fruits with a chewy texture. A sweet and nutritious snack option.",
        "Yogurt": "Fermented dairy product rich in probiotics. A healthy snack that can be enjoyed plain or with toppings.",
        "Mixed Nuts": "Assortment of nuts like almonds, walnuts, and cashews. High in healthy fats and protein.",
        "Wheat Crackers": "Crispy crackers made from wheat flour. A light snack that pairs well with cheese or spreads."
    };

    // Define recipe data for each meal type
    const mealRecipes = {
        Breakfast: [
            { img: oatmealImg, name: "Oatmeal" },
            { img: omeletteImg, name: "Omelette" },
            { img: smoothieImg, name: "Breakfast Smoothie" },
            { img: friedeggImg, name: "Fried Egg" }
        ],
        Lunch: [
            { img: saladImg, name: "Salad" },
            { img: pastaImg, name: "Pasta" },
            { img: sushiImg, name: "Sushi" },
            { img: veggiesoupImg, name: "Veggie soup" }
        ],
        Dinner: [
            { img: steakImg, name: "Steak" },
            { img: chickenbreastsImg, name: "Chicken Breasts" },
            { img: lambchopsImg, name: "Lamb Chops" },
            { img: salmonImg, name: "Salmon" }
        ],
        Snacks: [
            { img: chewyfruitImg, name: "Chewy fruit" },
            { img: yogurtImg, name: "Yogurt" },
            { img: nutsImg, name: "Mixed Nuts" },
            { img: wheatcrackersImg, name: "Wheat Crackers" }
        ]
    };
    // Get the corresponding recipes according to the selected meal
    const getRecipesForMealType = () => {
        return mealRecipes[selectedMealType] || mealRecipes.Breakfast;
    };
    // Handling meal button clicks
    const handleMealButtonClick = (mealType) => {
        setSelectedMealType(mealType);
    };

    // Handling View Button Clicks
    const handleViewRecipe = (recipe) => {
        setSelectedRecipe(recipe);
        setShowRecipeDetails(true);
    };

    const [showCreateMeal, setShowCreateMeal] = useState(false);
    const [showCopyMeal, setShowCopyMeal] = useState(false); 
    const [selectedDate, setSelectedDate] = useState(new Date());
    // 添加这个函数来关闭日期选择器
    const closeDatePicker = (input) => {
        // 这对 Safari 有效
        if (input && typeof input.blur === 'function') {
        input.blur();
        }
    };
    // Add the state of the Exercise button
    const [showWorkout, setShowWorkout] = useState(false);
    const [showCreateExercise, setShowCreateExercise] = useState(false);
    const [showAllExercise, setShowAllExercise] = useState(false);
    const [waterIntake, setWaterIntake] = useState("");

    // Left arrow: date minus 1 day
    const handlePrevDate = () => {
        const prev = new Date(selectedDate);
        prev.setDate(prev.getDate() - 1);
        setSelectedDate(prev);
    };
  
    // Right arrow: date plus 1 day
    const handleNextDate = () => {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + 1);
        setSelectedDate(next);
    };

    // Processing recipe additions
    const handleRecipeAdd = (recipeName) => {
        alert(`You have added ${recipeName} to your ${selectedMealType} plan for ${selectedDate.toLocaleDateString('en-CA')}.`);
    };

    const handleWaterAdd = () => {
        alert(`You have added ${waterIntake} ml of water for ${selectedDate}.`);
    };

    return (
        <div className="daily-plan-container">
            {/*Top area */}
            <div className="header-section">
                <h2 className="header-title">EDIT</h2>
                <div className="date-picker">
                    <button onClick={handlePrevDate}><FaChevronLeft /></button>
                    <div className="date-display">
                        {selectedDate.toLocaleDateString('en-CA')}  {/* YYYY-MM-DD format */}
                    </div>
                
                    {/* Hidden input, used only to open the date picker*/}
                    <input
                        type="date"
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={(e) => {
                            setSelectedDate(new Date(e.target.value));
                            closeDatePicker(e.target); // 这将在Safari中关闭选择器
                        }}
                        ref={(input) => (window.hiddenDateInput = input)}  // Expose to button
                        style={{
                            opacity: 0,
                            position: "absolute",
                            width: 0,
                            height: 0,
                            pointerEvents: "none"
                        }}
                    />
                    <button
                        className="calendar-icon-button"
                        onClick={() => window.hiddenDateInput && window.hiddenDateInput.showPicker()}
                    >
                        <FaRegCalendarAlt />
                    </button>
                    <button onClick={handleNextDate}><FaChevronRight /></button>
                </div>
                <button className="save-button" onClick={() => setShowOverview(true)}>
                    Overview
                </button>
                {showOverview && (
                    <div className="overview-modal-overlay" onClick={() => setShowOverview(false)}>
                        <div className="overview-modal" onClick={(e) => e.stopPropagation()}>
                            <h3>Today's Summary</h3>
                            <span className="date-display">Date: {selectedDate.toLocaleDateString('en-CA')}</span>
                            <ul>
                                <li>Meals added: (simulate data or connect real data)</li>
                                <li>Water intake: {waterIntake ? `${waterIntake} ml` : 'Not added yet'}</li>
                                <li>Exercises planned: (simulate data or connect real data)</li>
                            </ul>
                            <button onClick={() => setShowOverview(false)}>Close</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Meal button */}
            <div className="meal-buttons">
                {["Breakfast", "Lunch", "Dinner", "Snacks"].map((meal) => (
                <button 
                    key={meal} 
                    className={`meal-button ${selectedMealType === meal ? 'active-meal-button' : ''}`}
                    onClick={() => handleMealButtonClick(meal)}
                >
                    {meal}
                </button>
                ))}
            </div>
            
            {/* Recommended recipe area */}
            <div className="recommend-section">
                <h3 className="section-title">Recommend Recipe for {selectedMealType}</h3>
                <div className="recipe-list">
                    {getRecipesForMealType().map((recipe, index) => (
                    <div key={index} className="recipe-card">
                        <img src={recipe.img} alt={recipe.name} />
                        <h4 className="recipe-name">{recipe.name}</h4>
                        <span 
                            className="text-link-view" 
                            onClick={() => handleViewRecipe(recipe)}
                        >
                            View
                        </span>
                        <button onClick={() => handleRecipeAdd(recipe.name)}>Add</button>
                    </div>))}
                    <div className="extra-buttons">
                        <button onClick={() => setShowCreateMeal(true)}>
                            <img src={createMealIcon} alt="Create Meal" />
                            <span>Create a Meal</span>
                        </button>
                        <button onClick={() => setShowCopyMeal(true)}> 
                            <img src={copyMealIcon} alt="Copy Meal" />
                            <span>Copy Previous Meal</span>
                        </button>
                    </div>
                </div>
            </div>
            {/* Recipe details pop-up */}
            {showRecipeDetails && selectedRecipe && (
                <div className="overview-modal-overlay" onClick={() => setShowRecipeDetails(false)}>
                    <div className="create-meal-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>{selectedRecipe.name}</h3>
                        <div className="recipe-details-image">
                            <img src={selectedRecipe.img} alt={selectedRecipe.name} />
                        </div>
                        <p>{recipeDescriptions[selectedRecipe.name] || "Detailed recipe information coming soon!"}</p>
                        <div className="recipe-details-nutritional">
                            <h4>Nutritional Information</h4>
                            <ul>
                                <li>Calories: 300-400 kcal</li>
                                <li>Protein: 15-20g</li>
                                <li>Carbs: 25-35g</li>
                                <li>Fat: 10-15g</li>
                            </ul>
                        </div>
                        <button onClick={() => handleRecipeAdd(selectedRecipe.name)}>Add to Meal Plan</button>
                        <button onClick={() => setShowRecipeDetails(false)}>Close</button>
                    </div>
                </div>
            )}
            {/* Create a Meal pop-up */}
            {showCreateMeal && (
                <div className="overview-modal-overlay" onClick={() => setShowCreateMeal(false)}>
                    <div className="create-meal-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Create a Meal</h3>
                        <p>Here you can create your custom meal. (Feature under development)</p>
                        <button onClick={() => setShowCreateMeal(false)}>Close</button>
                    </div>
                </div>
            )}

            {/* Copy Previous Meal pop-up */}
            {showCopyMeal && (
                <div className="overview-modal-overlay" onClick={() => setShowCopyMeal(false)}>
                    <div className="create-meal-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Copy Previous Meal</h3>
                        <p>Select a meal from previous days to copy to today's plan. (Feature under development)</p>
                        <button onClick={() => setShowCopyMeal(false)}>Close</button>
                    </div>
                </div>
            )}

            {/* Exercise & Water Area */}
            <div className="bottom-section">
                <div className="exercise-section">
                    <h3 className="section-title">Exercise</h3>
                    <div className="exercise-buttons">
                        <button onClick={() => setShowWorkout(true)}>
                            <img src={workoutIcon} alt="Workout" />
                            <span>Workout Routines</span>
                        </button>
                        <button onClick={() => setShowCreateExercise(true)}>
                            <img src={createExerciseIcon} alt="Create Exercise" />
                            <span>Create My Exercise</span>
                        </button>
                        <button onClick={() => setShowAllExercise(true)}>
                            <img src={allExerciseIcon} alt="All Exercise" />
                            <span>All Exercise</span>
                        </button>
                    </div>
                </div>

                <div className="water-section">
                    <h3 className="section-title">Water</h3>
                    <div className="water-input">
                        <img src={waterCupIcon} alt="Water" />
                        <input
                        type="number"
                        placeholder="Enter Input"
                        value={waterIntake}
                        onChange={(e) => setWaterIntake(e.target.value)}
                        />
                        <span>ML</span>
                        <button onClick={handleWaterAdd}>+</button>
                    </div>
                    <p>Recommendation: 1 cup ≈ 240 ml, 8 cups ≈ 1920 ml</p>
                </div>
            </div>

            {/* Workout Routines pop-up */}
            {showWorkout && (
                <div className="overview-modal-overlay" onClick={() => setShowWorkout(false)}>
                    <div className="create-meal-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Workout Routines</h3>
                        <p>Browse and select from our predefined workout routines. (Feature under development)</p>
                        <button onClick={() => setShowWorkout(false)}>Close</button>
                    </div>
                </div>
            )}
            {/* Create My Exercise pop-up */}
            {showCreateExercise && (
                <div className="overview-modal-overlay" onClick={() => setShowCreateExercise(false)}>
                    <div className="create-meal-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Create My Exercise</h3>
                        <p>(Feature under development)</p>
                        <button onClick={() => setShowCreateExercise(false)}>Close</button>
                    </div>
                </div>
            )}
            {/* All Exercise pop-up */}
            {showAllExercise && (
                <div className="overview-modal-overlay" onClick={() => setShowAllExercise(false)}>
                    <div className="create-meal-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>All Exercise</h3>
                        <p>(Feature under development)</p>
                        <button onClick={() => setShowAllExercise(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyPlanEdit;
