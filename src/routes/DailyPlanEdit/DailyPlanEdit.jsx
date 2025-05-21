import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaRegCalendarAlt } from "react-icons/fa";

// Import food pictures
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

// Import pop-up component
import OverviewModal from "./modals/OverviewModal";
import RecipeDetailsModal from "./modals/RecipeDetailsModal";
import CreateMealModal from "./modals/CreateMealModal";
import CopyMealModal from "./modals/CopyMealModal";
import ExerciseInfoModal from "./modals/ExerciseInfoModal";
import WorkoutRoutinesModal from "./modals/WorkoutRoutinesModal";
import CreateExerciseModal from "./modals/CreateExerciseModal";
import AllExerciseModal from "./modals/AllExerciseModal";

const DailyPlanEdit = () => {
    // State Management
    const [showOverview, setShowOverview] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState("Breakfast");
    const [showRecipeDetails, setShowRecipeDetails] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [showCreateMeal, setShowCreateMeal] = useState(false);
    const [showCopyMeal, setShowCopyMeal] = useState(false); 
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showWorkout, setShowWorkout] = useState(false);
    const [showCreateExercise, setShowCreateExercise] = useState(false);
    const [showAllExercise, setShowAllExercise] = useState(false);
    const [waterIntake, setWaterIntake] = useState("");
    const [showExerciseInfo, setShowExerciseInfo] = useState(false);
    const [dailyMealPlans, setDailyMealPlans] = useState({});
    const [selectedRecipes, setSelectedRecipes] = useState([]);
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [selectedCopyMeals, setSelectedCopyMeals] = useState([]);
    const [copyMealDate, setCopyMealDate] = useState(new Date());
    const [availableExercises] = useState([
        { id: 1, name: 'Push-ups', type: 'Strength', duration: '3 sets of 15' },
        { id: 2, name: 'Squats', type: 'Strength', duration: '3 sets of 20' },
        { id: 3, name: 'Plank', type: 'Core', duration: '1 minute' },
        { id: 4, name: 'Jumping Jacks', type: 'Cardio', duration: '10 sets' },
        { id: 5, name: 'Mountain Climbers', type: 'Cardio', duration: '30 seconds' },
        { id: 6, name: 'Lunges', type: 'Strength', duration: '2 sets of 12 per leg' },
        { id: 7, name: 'Burpees', type: 'Mixed', duration: '8 reps' },
        { id: 8, name: 'Forward Bend', type: 'Flexibility', duration: '3 minutes' },
        { id: 9, name: 'Seated Twist', type: 'Flexibility', duration: '2 minutes' },
        { id: 10, name: 'High Knees', type: 'Cardio', duration: '1 minute' },
        { id: 11, name: 'Wall Sits', type: 'Strength', duration: '45 seconds' },
        { id: 12, name: 'Arm Circles', type: 'Warm-up', duration: '2 minutes' },
    ]);

    useEffect(() => {
        const dateKey = selectedDate.toISOString().split('T')[0];
        if (!dailyMealPlans[dateKey]) {
            setDailyMealPlans(prev => ({
                ...prev,
                [dateKey]: {
                    meals: [],
                    water: 0,
                    exercises: []
                }
            }));
        }
    }, [selectedDate]);
    
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

    // Define the recipe data for each meal
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

    // Get recipes for the selected meal
    const getRecipesForMealType = () => {
        return mealRecipes[selectedMealType] || mealRecipes.Breakfast;
    };

    // Handling menu button clicks
    const handleMealButtonClick = (mealType) => {
        setSelectedMealType(mealType);
    };

    // Handling View Button Clicks
    const handleViewRecipe = (recipe) => {
        setSelectedRecipe(recipe);
        setShowRecipeDetails(true);
    };

    // Close the date picker
    const closeDatePicker = (input) => {
        // For Safari
        if (input && typeof input.blur === 'function') {
            input.blur();
        }
    };

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
        const dateKey = selectedDate.toISOString().split('T')[0];
        const newMeal = {
            id: Date.now(),
            name: recipeName,
            type: selectedMealType,
            calories: 350, // Simulating data
            isCustom: false
        };
        
        setDailyMealPlans(prev => ({
            ...prev,
            [dateKey]: {
                ...prev[dateKey],
                meals: [...(prev[dateKey]?.meals || []), newMeal]
            }
        }));
        
        alert(`You have added ${recipeName} to your ${selectedMealType} plan for ${selectedDate.toLocaleDateString('en-CA')}.`);
    };

    // Get meals for a specific date
    const getMealsForDate = (date) => {
        // Here you should get the meal data for the specified date from the backend or local storage
        // Currently using simulated data, it should be replaced by API calls in actual development
        
        // Simulate different meal data on different dates
        const dateString = date.toISOString().split('T')[0];
        
        // Mock data - should actually be obtained from the backend
        const mockMealData = {
            '2025-05-11': [
                { id: 1, name: 'Breakfast', type: 'Morning Meal', calories: 320, isCustom: false },
                { id: 2, name: 'Lunch', type: 'Afternoon Meal', calories: 450, isCustom: false },
                { id: 3, name: 'Power Dinner', type: 'Evening Meal', calories: 520, isCustom: true },
                { id: 4, name: 'Healthy Snacks', type: 'Between Meals', calories: 150, isCustom: true },
            ],
            '2025-05-10': [
                { id: 5, name: 'Quick Breakfast', type: 'Morning Meal', calories: 280, isCustom: true },
                { id: 6, name: 'Lunch', type: 'Afternoon Meal', calories: 500, isCustom: false },
                { id: 7, name: 'Dinner', type: 'Evening Meal', calories: 600, isCustom: false },
            ],
            'default': [
                { id: 8, name: 'Breakfast', type: 'Morning Meal', calories: 320, isCustom: false },
                { id: 9, name: 'Lunch', type: 'Afternoon Meal', calories: 450, isCustom: false },
                { id: 10, name: 'Dinner', type: 'Evening Meal', calories: 520, isCustom: false },
                { id: 11, name: 'Snacks', type: 'Between Meals', calories: 150, isCustom: false },
            ]
        };
        
        // Returns the meal data for the specified date, or returns the default data if none exists
        return mockMealData[dateString] || mockMealData['default'];
    };

    // Processing water addition
    const handleWaterAdd = () => {
        const dateKey = selectedDate.toISOString().split('T')[0];
        setDailyMealPlans(prev => ({
            ...prev,
            [dateKey]: {
                ...prev[dateKey],
                water: (prev[dateKey]?.water || 0) + parseInt(waterIntake || 0)
            }
        }));
        alert(`You have added ${waterIntake} ml of water for ${selectedDate.toLocaleDateString('en-CA')}.`);
        setWaterIntake("");
    };

    // Processing of creating new meals
    const handleCreateMeal = (mealData) => {
        const dateKey = mealData.plannedDate;
        const newMeal = {
            id: Date.now(),
            name: mealData.mealName,
            type: mealData.mealTime,
            calories: selectedRecipes.reduce((sum, recipe) => sum + recipe.calories, 0),
            isCustom: true,
            recipes: selectedRecipes
        };
        
        setDailyMealPlans(prev => ({
            ...prev,
            [dateKey]: {
                ...prev[dateKey],
                meals: [...(prev[dateKey]?.meals || []), newMeal]
            }
        }));
        
        alert('Meal created successfully! Your meal has been added to the meal plan.');
        setSelectedRecipes([]);
        setShowCreateMeal(false);
    };

    // Handling duplicate meals
    const handleCopyMeals = () => {
        if (selectedCopyMeals.length > 0) {
            const dateKey = selectedDate.toISOString().split('T')[0];
            setDailyMealPlans(prev => ({
                ...prev,
                [dateKey]: {
                    ...prev[dateKey],
                    meals: [...(prev[dateKey]?.meals || []), ...selectedCopyMeals.map(meal => ({
                        ...meal,
                        id: Date.now() + Math.random()
                    }))]
                }
            }));
            alert('Meals copied successfully! The selected meals have been added to today\'s meal plan.');
            setSelectedCopyMeals([]);
            setShowCopyMeal(false);
        }
    };

    // Processing Adding Exercises
    const handleAddExercises = () => {
        if (selectedExercises.length > 0) {
            const dateKey = selectedDate.toISOString().split('T')[0];
            setDailyMealPlans(prev => ({
                ...prev,
                [dateKey]: {
                    ...prev[dateKey],
                    exercises: [...(prev[dateKey]?.exercises || []), ...selectedExercises]
                }
            }));
            alert('Custom workout routine generated successfully! Your combination has been saved to your daily plan.');
            setSelectedExercises([]);
            setShowAllExercise(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-10">
                {/* Top area */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                    <h2 className="text-4xl font-serif font-bold text-purple-900">EDIT</h2>
                    
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrevDate} className="bg-transparent border-none text-purple-900 text-2xl hover:text-purple-600">
                            <FaChevronLeft />
                        </button>
                        <div className="bg-white rounded-lg px-5 py-2 min-w-[150px] text-center text-purple-900 font-medium border border-gray-200">
                            {selectedDate.toLocaleDateString('en-CA')}
                        </div>
                        
                        {/* Hidden input box, only used to open the date picker */}
                        <input
                            type="date"
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value){
                                    setSelectedDate(new Date(e.target.value));
                                }else{
                                    setSelectedDate(new Date());
                                }
                                closeDatePicker(e.target);
                            }}
                            ref={(input) => (window.hiddenDateInput = input)}
                            className="opacity-0 absolute w-0 h-0 pointer-events-none"
                        />
                        <button
                            className="bg-transparent border-none text-purple-900 text-2xl hover:text-purple-600"
                            onClick={() => window.hiddenDateInput && window.hiddenDateInput.showPicker()}
                        >
                            <FaRegCalendarAlt />
                        </button>
                        <button onClick={handleNextDate} className="bg-transparent border-none text-purple-900 text-2xl hover:text-purple-600">
                            <FaChevronRight />
                        </button>
                    </div>
                    
                    <button 
                        className="bg-purple-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-600"
                        onClick={() => setShowOverview(true)}
                    >
                        Overview
                    </button>
                </div>

                {/* Meal button */}
                <div className="flex gap-3 justify-center mb-8">
                    {["Breakfast", "Lunch", "Dinner", "Snacks"].map((meal) => (
                        <button 
                            key={meal} 
                            className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                                selectedMealType === meal 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-blue-100 text-purple-900 hover:bg-purple-200'
                            }`}
                            onClick={() => handleMealButtonClick(meal)}
                        >
                            {meal}
                        </button>
                    ))}
                </div>
                
                {/* Recommended recipe area */}
                <div className="bg-white border border-blue-100 rounded-xl p-6 mb-8 ">
                    <h3 className="text-2xl text-purple-900 font-bold mb-6 text-center">Recommend Recipe for {selectedMealType}</h3>
                    {/* Show added items */}
                    {(() => {
                        const currentMeals = dailyMealPlans[selectedDate.toISOString().split('T')[0]]?.meals?.filter(meal => meal.type === selectedMealType) || [];
                        return (
                            currentMeals.length > 0 && (
                                <div className="mb-4 p-3 bg-green-50 rounded">
                                    <h4 className="text-sm font-semibold text-green-800 mb-2">Added to {selectedMealType}:</h4>
                                    {currentMeals.map(meal => (
                                        <div key={meal.id} className="text-sm text-green-700">• {meal.name}</div>
                                    ))}
                                </div>
                            )
                        );
                    })()}
                    
                    <div className="flex gap-4 justify-start items-start">
                        <div className="flex gap-4 justify-start items-start">
                            {getRecipesForMealType().map((recipe, index) => (
                                <div key={index} className="bg-blue-100 rounded-xl p-3 w-40 text-center shadow-md relative h-60">
                                    <img src={recipe.img} alt={recipe.name} className="w-full h-24 object-cover rounded-lg mb-3" />
                                    <div className="h-14 overflow-hidden flex items-center justify-center">
                                        <h4 className="text-purple-900 font-semibold text-center text-sm leading-tight mb-4">{recipe.name}</h4>
                                    </div>
                                    <div className="absolute bottom-14 left-0 right-0 px-3">
                                        <span 
                                            className="text-purple-900 text-sm cursor-pointer hover:text-purple-600 block text-center"
                                            onClick={() => handleViewRecipe(recipe)}
                                        >
                                            View
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => handleRecipeAdd(recipe.name)}
                                        className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-md bg-blue-100 text-purple-900 font-medium hover:bg-purple-600 hover:text-white transition-colors text-sm"
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-4 ml-2">
                            <button 
                                onClick={() => setShowCreateMeal(true)}
                                className="flex items-center gap-3 bg-blue-100 px-4 py-3 rounded-xl font-semibold shadow-md hover:bg-purple-600 hover:text-white transition-colors whitespace-nowrap"
                            >
                                <img src={createMealIcon} alt="Create Meal" className="w-16 h-20" />
                                <span>Create a Meal</span>
                            </button>
                            <button 
                                onClick={() => setShowCopyMeal(true)}
                                className="flex items-center gap-3 bg-blue-100 px-4 py-3 rounded-xl font-semibold shadow-md hover:bg-purple-600 hover:text-white transition-colors whitespace-nowrap"
                            > 
                                <img src={copyMealIcon} alt="Copy Meal" className="w-16 h-20" />
                                <span>Copy Previous Meal</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Workout and Hydration Zones */}
                <div className="flex gap-6">
                    <div className="flex-1 bg-white border border-blue-100 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl text-purple-900 font-bold mb-6">Exercise</h3>
                            <button
                                onClick={() => setShowExerciseInfo(true)}
                                className="w-6 h-6 rounded-full bg-gray-300 text-white text-sm flex items-center justify-center hover:bg-gray-400 transition-colors"
                            >
                                !
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowWorkout(true)}
                                className="flex-1 bg-blue-100 p-3 rounded-xl flex flex-col items-center gap-3 font-semibold text-purple-900 hover:bg-purple-600 hover:text-white transition-colors"
                            >
                                <img src={workoutIcon} alt="Workout" className="w-16 h-16" />
                                <span>Workout Routines</span>
                            </button>
                            <button 
                                onClick={() => setShowCreateExercise(true)}
                                className="flex-1 bg-blue-100 p-3 rounded-xl flex flex-col items-center gap-3 font-semibold text-purple-900 hover:bg-purple-600 hover:text-white transition-colors"
                            >
                                <img src={createExerciseIcon} alt="Create Exercise" className="w-16 h-16" />
                                <span>Create My Exercise</span>
                            </button>
                            <button 
                                onClick={() => setShowAllExercise(true)}
                                className="flex-1 bg-blue-100 p-3 rounded-xl flex flex-col items-center gap-3 font-semibold text-purple-900 hover:bg-purple-600 hover:text-white transition-colors"
                            >
                                <img src={allExerciseIcon} alt="All Exercise" className="w-16 h-16" />
                                <span>All Exercise</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-white border border-blue-100 rounded-xl p-6 flex flex-col items-center justify-center">
                        <h3 className="text-2xl text-purple-900 font-bold mb-6">Water</h3>
                        <div className="flex items-center justify-center gap-4">
                            <img src={waterCupIcon} alt="Water" className="w-16 h-16" />
                            <input
                                type="number"
                                placeholder="Enter Input"
                                value={waterIntake}
                                onChange={(e) => setWaterIntake(e.target.value)}
                                className="w-44 px-3 py-2 border-2 border-gray-300 rounded-3xl text-center"
                            />
                            <span className="text-purple-900">ML</span>
                            <button 
                                onClick={handleWaterAdd}
                                className="bg-blue-500 text-white w-10 h-10 rounded-full text-xl flex items-center justify-center hover:bg-green-600 transition-colors"
                            >
                                +
                            </button>
                        </div>
                        <p className="mt-4 text-purple-900 text-sm text-center">
                            Recommendation: 1 cup ≈ 240 ml, 8 cups ≈ 1920 ml
                        </p>
                    </div>
                </div>
            </div>

            {/* Pop-up component */}
            <OverviewModal 
                show={showOverview}
                onClose={() => setShowOverview(false)}
                selectedDate={selectedDate}
                dailyMealPlans={dailyMealPlans}
            />
            
            <RecipeDetailsModal 
                show={showRecipeDetails}
                onClose={() => setShowRecipeDetails(false)}
                recipe={selectedRecipe}
                recipeDescriptions={recipeDescriptions}
                onAddRecipe={handleRecipeAdd}
            />
            
            <CreateMealModal 
                show={showCreateMeal}
                onClose={() => setShowCreateMeal(false)}
                selectedRecipes={selectedRecipes}
                setSelectedRecipes={setSelectedRecipes}
                onCreateMeal={handleCreateMeal}
            />
            
            <CopyMealModal 
                show={showCopyMeal}
                onClose={() => setShowCopyMeal(false)}
                copyMealDate={copyMealDate}
                setCopyMealDate={setCopyMealDate}
                selectedCopyMeals={selectedCopyMeals}
                setSelectedCopyMeals={setSelectedCopyMeals}
                getMealsForDate={getMealsForDate}
                onCopyMeals={handleCopyMeals}
            />
            
            <ExerciseInfoModal
                show={showExerciseInfo}
                onClose={() => setShowExerciseInfo(false)}
            />
            
            <WorkoutRoutinesModal
                show={showWorkout}
                onClose={() => setShowWorkout(false)}
            />
            
            <CreateExerciseModal
                show={showCreateExercise}
                onClose={() => setShowCreateExercise(false)}
            />
            
            <AllExerciseModal
                show={showAllExercise}
                onClose={() => setShowAllExercise(false)}
                availableExercises={availableExercises}
                selectedExercises={selectedExercises}
                setSelectedExercises={setSelectedExercises}
                onAddExercises={handleAddExercises}
            />
        </div>
    );
};

export default DailyPlanEdit;