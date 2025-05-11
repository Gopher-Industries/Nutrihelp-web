import React, { useState } from "react";
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

    // 添加这个函数来关闭日期选择器
    const closeDatePicker = (input) => {
        // 这对 Safari 有效
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
        alert(`You have added ${recipeName} to your ${selectedMealType} plan for ${selectedDate.toLocaleDateString('en-CA')}.`);
    };

    const [selectedRecipes, setSelectedRecipes] = useState([]);
    const [selectedExercises, setSelectedExercises] = useState([]);
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

    const [selectedCopyMeals, setSelectedCopyMeals] = useState([]);
    const [copyMealDate, setCopyMealDate] = useState(new Date());
    // 在组件中添加这个函数
    const getMealsForDate = (date) => {
        // 这里应该从后端或本地存储中获取指定日期的 Meal 数据
        // 目前使用模拟数据，实际开发中应该替换为 API 调用
        
        // 模拟不同日期的不同 Meal 数据
        const dateString = date.toISOString().split('T')[0];
        
        // 模拟数据 - 实际应该从后端获取
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
        
        // 返回指定日期的 Meal 数据，如果没有则返回默认数据
        return mockMealData[dateString] || mockMealData['default'];
        
        // 实际实现应该如下：
        // return await fetchMealsForDate(date); // 从后端获取数据
    };

    const handleWaterAdd = () => {
        alert(`You have added ${waterIntake} ml of water for ${selectedDate}.`);
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
                        
                        {/* Hidden input, used only to open the date picker*/}
                        <input
                            type="date"
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={(e) => {
                                setSelectedDate(new Date(e.target.value));
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

                {/* Meal buttons */}
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

                {/* Exercise & Water Area */}
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

            {/* Overview pop-up */}
            {showOverview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
                        <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">Today's Summary</h3>
                        <div className="text-center text-gray-600 font-medium mb-6">
                            Date: {selectedDate.toLocaleDateString('en-CA')}
                        </div>
                        <ul className="list-none space-y-3 mb-6">
                            <li className="text-gray-700 relative pl-8">
                                <span className="absolute left-2">•</span>
                                Meals added: (simulate data or connect real data)
                            </li>
                            <li className="text-gray-700 relative pl-8">
                                <span className="absolute left-2">•</span>
                                Water intake: {waterIntake ? `${waterIntake} ml` : 'Not added yet'}
                            </li>
                            <li className="text-gray-700 relative pl-8">
                                <span className="absolute left-2">•</span>
                                Exercises planned: (simulate data or connect real data)
                            </li>
                        </ul>
                        <button 
                            onClick={() => setShowOverview(false)}
                            className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Recipe details pop-up */}
            {showRecipeDetails && selectedRecipe && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
                        <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">{selectedRecipe.name}</h3>
                        <div className="mb-4">
                            <img src={selectedRecipe.img} alt={selectedRecipe.name} className="w-full h-48 object-cover rounded-lg" />
                        </div>
                        <p className="text-gray-700 mb-6">{recipeDescriptions[selectedRecipe.name] || "Detailed recipe information coming soon!"}</p>
                        
                        <div className="mb-6">
                            <h4 className="font-bold text-purple-900 mb-3">Nutritional Information</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-green-600">Carbohydrates</span>
                                    <span className="text-gray-600">32g</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded">
                                    <div className="h-2 rounded bg-green-500" style={{ width: '80%' }}></div>
                                </div>
                                
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-blue-600">Fat</span>
                                    <span className="text-gray-600">8g</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded">
                                    <div className="h-2 rounded bg-blue-500" style={{ width: '53%' }}></div>
                                </div>
                                
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-yellow-600">Protein</span>
                                    <span className="text-gray-600">12g</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded">
                                    <div className="h-2 rounded bg-yellow-500" style={{ width: '60%' }}></div>
                                </div>
                                
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-orange-600">Sugar</span>
                                    <span className="text-gray-600">5g</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded">
                                    <div className="h-2 rounded bg-orange-500" style={{ width: '50%' }}></div>
                                </div>
                                
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-cyan-600">Fiber</span>
                                    <span className="text-gray-600">4g</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded">
                                    <div className="h-2 rounded bg-cyan-500" style={{ width: '50%' }}></div>
                                </div>
                                
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-pink-600">Sodium</span>
                                    <span className="text-gray-600">320mg</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded">
                                    <div className="h-2 rounded bg-pink-500" style={{ width: '53%' }}></div>
                                </div>
                                
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-red-600">Cholesterol</span>
                                    <span className="text-gray-600">15mg</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded">
                                    <div className="h-2 rounded bg-red-500" style={{ width: '25%' }}></div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => handleRecipeAdd(selectedRecipe.name)}
                                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                            >
                                Add to Meal Plan
                            </button>
                            <button 
                                onClick={() => setShowRecipeDetails(false)}
                                className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create a Meal pop-up */}
            {showCreateMeal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-5xl shadow-lg">
                        <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">Create a Meal</h3>
                        <p className="text-gray-700 text-center mb-6">Combine recipes from our library to create your perfect meal.</p>
                        
                        <form className="space-y-6" onSubmit={(e) => {
                            e.preventDefault();
                            alert('Meal created successfully! Your meal has been added to the meal plan.');
                            setSelectedRecipes([]);
                            setShowCreateMeal(false);
                        }}>
                            {/* Meal Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meal Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Healthy Power Lunch"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meal Time</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                                        <option value="">Select Meal Time</option>
                                        <option value="breakfast">Breakfast</option>
                                        <option value="lunch">Lunch</option>
                                        <option value="dinner">Dinner</option>
                                        <option value="snacks">Snacks</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Planned Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            id="mealPlannedDate"
                                            defaultValue={new Date().toISOString().split('T')[0]}
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        <style jsx>{`
                                            #mealPlannedDate::-webkit-calendar-picker-indicator {
                                                display: none;
                                            }
                                        `}</style>
                                        {/* 自定义的日历图标 */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const input = document.getElementById('mealPlannedDate');
                                                if (input) {
                                                    input.focus();
                                                    input.showPicker();
                                                }
                                            }}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-auto z-10"
                                        >
                                            <FaRegCalendarAlt className="text-gray-400 h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Recipe Selection Area */}
                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold text-purple-900 mb-4">Select Recipes</h4>
                                <div className="flex gap-6 h-80">
                                    {/* Left - Available Recipes */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-3">
                                            <h5 className="text-sm font-medium text-gray-700">Available Recipes</h5>
                                            <div className="flex gap-2">
                                                <button type="button" className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded">Platform</button>
                                                <button type="button" className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded">My Recipes</button>
                                            </div>
                                        </div>
                                        <div className="h-72 overflow-y-auto border rounded p-3 space-y-2">
                                            {/* Simulated recipe library */}
                                            {[
                                                { id: 1, name: 'Grilled Chicken Breast', type: 'Main', calories: 280, carbs: 0, protein: 53, fat: 6, source: 'Platform' },
                                                { id: 2, name: 'Quinoa Salad', type: 'Side', calories: 222, carbs: 39, protein: 8, fat: 4, source: 'Platform' },
                                                { id: 3, name: 'Steamed Broccoli', type: 'Vegetable', calories: 55, carbs: 11, protein: 4, fat: 0, source: 'Platform' },
                                                { id: 4, name: 'Greek Yogurt', type: 'Dairy', calories: 150, carbs: 9, protein: 20, fat: 4, source: 'Platform' },
                                                { id: 5, name: 'My Special Sauce', type: 'Sauce', calories: 80, carbs: 5, protein: 1, fat: 6, source: 'My Recipes' },
                                                { id: 6, name: 'Avocado Toast', type: 'Main', calories: 290, carbs: 32, protein: 7, fat: 16, source: 'My Recipes' },
                                            ].map((recipe) => (
                                                <div key={recipe.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded border">
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="font-medium">{recipe.name}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    {recipe.type} • {recipe.calories} kcal • C{recipe.carbs}g P{recipe.protein}g F{recipe.fat}g
                                                                </div>
                                                            </div>
                                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{recipe.source}</span>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            if (!selectedRecipes.find(r => r.id === recipe.id)) {
                                                                setSelectedRecipes([...selectedRecipes, recipe]);
                                                            }
                                                        }}
                                                        className="ml-3 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                                                        disabled={selectedRecipes.find(r => r.id === recipe.id)}
                                                    >
                                                        {selectedRecipes.find(r => r.id === recipe.id) ? 'Added' : 'Add'}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Right - Selected Recipes for Meal */}
                                    <div className="flex-1">
                                        <h5 className="text-sm font-medium text-gray-700 mb-3">Recipes in This Meal</h5>
                                        <div className="h-72 overflow-y-auto border rounded p-3 bg-gray-50">
                                            {selectedRecipes.length === 0 ? (
                                                <div className="text-center text-gray-400 py-12">
                                                    <p>Add recipes to build your meal</p>
                                                    <p className="text-sm mt-2">Click "Add" from the left to include recipes</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {selectedRecipes.map((recipe) => (
                                                        <div key={recipe.id} className="flex items-center justify-between p-3 bg-white rounded border">
                                                            <div className="flex-1">
                                                                <div className="font-medium">{recipe.name}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    {recipe.type} • {recipe.calories} kcal • C{recipe.carbs}g P{recipe.protein}g F{recipe.fat}g
                                                                </div>
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedRecipes(selectedRecipes.filter(r => r.id !== recipe.id));
                                                                }}
                                                                className="ml-3 px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Nutritional Summary */}
                            <div className="border rounded-lg p-4 bg-purple-50">
                                <h4 className="font-semibold text-purple-900 mb-3">Meal Nutritional Summary</h4>
                                <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-600">Calories</div>
                                        <div className="text-lg font-bold text-purple-900">
                                            {selectedRecipes.reduce((sum, recipe) => sum + recipe.calories, 0)}
                                        </div>
                                        <div className="text-xs text-gray-500">kcal</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-600">Carbs</div>
                                        <div className="text-lg font-bold text-green-600">
                                            {selectedRecipes.reduce((sum, recipe) => sum + recipe.carbs, 0)}
                                        </div>
                                        <div className="text-xs text-gray-500">g</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-600">Protein</div>
                                        <div className="text-lg font-bold text-yellow-600">
                                            {selectedRecipes.reduce((sum, recipe) => sum + recipe.protein, 0)}
                                        </div>
                                        <div className="text-xs text-gray-500">g</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-600">Fat</div>
                                        <div className="text-lg font-bold text-blue-600">
                                            {selectedRecipes.reduce((sum, recipe) => sum + recipe.fat, 0)}
                                        </div>
                                        <div className="text-xs text-gray-500">g</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-600">Sugar</div>
                                        <div className="text-lg font-bold text-orange-600">0</div>
                                        <div className="text-xs text-gray-500">g</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-600">Fiber</div>
                                        <div className="text-lg font-bold text-cyan-600">0</div>
                                        <div className="text-xs text-gray-500">g</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-600">Sodium</div>
                                        <div className="text-lg font-bold text-pink-600">0</div>
                                        <div className="text-xs text-gray-500">mg</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-600">Cholesterol</div>
                                        <div className="text-lg font-bold text-red-600">0</div>
                                        <div className="text-xs text-gray-500">mg</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Optional Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meal Notes (Optional)</label>
                                <textarea
                                    placeholder="Add any special instructions, dietary considerations, or preferences..."
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                ></textarea>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button 
                                    type="submit"
                                    className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                                >
                                    Save Meal to Plan
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setSelectedRecipes([]);
                                        setShowCreateMeal(false);
                                    }}
                                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Copy Previous Meal pop-up */}
            {showCopyMeal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-4xl shadow-lg">
                        <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">Copy Previous Meal</h3>
                        <p className="text-gray-700 text-center mb-6">Select a date and copy meals from your previous plans.</p>
                        
                        {/* Date selector */}
                        <div className="mb-6 flex justify-center">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700">Select Date:</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        id="copyMealDate"
                                        value={copyMealDate.toISOString().split('T')[0]}
                                        onChange={(e) => setCopyMealDate(new Date(e.target.value))}
                                        className="px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <style jsx>{`
                                        #copyMealDate::-webkit-calendar-picker-indicator {
                                            display: none;
                                        }
                                    `}</style>
                                    {/* 自定义的日历图标 */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const input = document.getElementById('copyMealDate');
                                            if (input) {
                                                input.focus();
                                                input.showPicker();
                                            }
                                        }}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-auto z-10"
                                    >
                                        <FaRegCalendarAlt className="text-gray-400 h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-6 h-96">
                            {/* Left side - Previous meals */}
                            <div className="flex-1 border rounded-lg p-4">
                                <h4 className="font-semibold text-purple-900 mb-3">Meals from {copyMealDate.toLocaleDateString()}</h4>
                                <div className="h-80 overflow-y-auto space-y-2">
                                    {/* 根据日期获取对应的 Meal 计划 */}
                                    {/* 这里需要根据 copyMealDate 从后端或本地存储中获取该日期的 Meal 数据 */}
                                    {getMealsForDate(copyMealDate).map((meal) => (
                                        <div key={meal.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                            <div>
                                                <div className="font-medium">{meal.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {meal.type} • {meal.calories} kcal • 
                                                    {meal.isCustom ? ' Custom Meal' : ' Standard Meal'}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    if (!selectedCopyMeals.find(m => m.id === meal.id)) {
                                                        setSelectedCopyMeals([...selectedCopyMeals, meal]);
                                                    }
                                                }}
                                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                                disabled={selectedCopyMeals.find(m => m.id === meal.id)}
                                            >
                                                {selectedCopyMeals.find(m => m.id === meal.id) ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {/* 如果没有找到任何 Meal 数据 */}
                                    {getMealsForDate(copyMealDate).length === 0 && (
                                        <div className="text-center text-gray-400 py-8">
                                            <p>No meals found for this date</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Right side - Selected meals */}
                            <div className="flex-1 border rounded-lg p-4">
                                <h4 className="font-semibold text-purple-900 mb-3">Meals to Copy</h4>
                                <div className="h-80 overflow-y-auto">
                                    {selectedCopyMeals.length === 0 ? (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <p>Select meals from the left to copy to today</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedCopyMeals.map((meal) => (
                                                <div key={meal.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <div>
                                                        <div className="font-medium">{meal.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {meal.type} • {meal.calories} kcal
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedCopyMeals(selectedCopyMeals.filter(m => m.id !== meal.id));
                                                        }}
                                                        className="px-2 py-1 text-red-600 bg-red-100 hover:bg-red-50 rounded"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 space-y-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button 
                                    className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                                    disabled={selectedCopyMeals.length === 0}
                                    onClick={() => {
                                        if (selectedCopyMeals.length > 0) {
                                            alert('Meals copied successfully! The selected meals have been added to today\'s meal plan.');
                                            setSelectedCopyMeals([]);
                                            setShowCopyMeal(false);
                                        }
                                    }}
                                >
                                    Add to Today's Plan
                                </button>
                                <button 
                                    className="flex-1 py-3 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400"
                                    disabled={selectedCopyMeals.length === 0}
                                    onClick={() => setSelectedCopyMeals([])}
                                >
                                    Clear All
                                </button>
                            </div>
                            <button 
                                onClick={() => setShowCopyMeal(false)}
                                className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Exercise Info pop-up */}
            {showExerciseInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
                        <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">Exercise Features</h3>
                        <div className="space-y-4 text-gray-700">
                            <div>
                                <h4 className="font-semibold text-purple-900">Workout Routines</h4>
                                <p className="text-sm">Recommended fitness plans based on your HealthGoal. Preview and add curated workout routines designed specifically for your goals.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-purple-900">Create My Exercise</h4>
                                <p className="text-sm">Create your own custom exercises. Design unique workouts not available in our library by filling in your own content and details.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-purple-900">All Exercise</h4>
                                <p className="text-sm">Browse our complete exercise library organized by HealthGoal. Mix and match individual exercises to create your personalized workout plan.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowExerciseInfo(false)}
                            className="w-full mt-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Workout Routines pop-up */}
            {showWorkout && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-lg">
                        <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">Workout Routines</h3>
                        <p className="text-gray-700 text-center mb-6">Browse recommended workout routines for Weight Loss goal.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* 4 different workout plans for the same health goal (Weight Loss) */}
                            <div className="border rounded-lg p-4 hover:bg-gray-50">
                                <h4 className="font-bold text-purple-900 mb-2">Beginner Weight Loss</h4>
                                <ul className="text-sm text-gray-700 space-y-1 mb-3">
                                    <li>• Walking - 20 minutes</li>
                                    <li>• Basic Squats - 2 sets of 10</li>
                                    <li>• Wall Push-ups - 2 sets of 8</li>
                                    <li>• Standing Side Crunches - 15 each side</li>
                                </ul>
                                <button className="w-full py-2 bg-purple-600 text-white rounded hover:bg-green-600 transition-colors">
                                    Add Routine
                                </button>
                            </div>
                            
                            <div className="border rounded-lg p-4 hover:bg-gray-50">
                                <h4 className="font-bold text-purple-900 mb-2">Cardio Burn</h4>
                                <ul className="text-sm text-gray-700 space-y-1 mb-3">
                                    <li>• Jumping Jacks - 3 sets of 30 seconds</li>
                                    <li>• High Knees - 2 minutes</li>
                                    <li>• Burpees - 2 sets of 8</li>
                                    <li>• Mountain Climbers - 1 minute</li>
                                </ul>
                                <button className="w-full py-2 bg-purple-600 text-white rounded hover:bg-green-600 transition-colors">
                                    Add Routine
                                </button>
                            </div>
                            
                            <div className="border rounded-lg p-4 hover:bg-gray-50">
                                <h4 className="font-bold text-purple-900 mb-2">Strength & Fat Burn</h4>
                                <ul className="text-sm text-gray-700 space-y-1 mb-3">
                                    <li>• Squats - 3 sets of 15</li>
                                    <li>• Push-ups - 3 sets of 10</li>
                                    <li>• Lunges - 3 sets of 12 per leg</li>
                                    <li>• Plank - 2 sets of 45 seconds</li>
                                </ul>
                                <button className="w-full py-2 bg-purple-600 text-white rounded hover:bg-green-600 transition-colors">
                                    Add Routine
                                </button>
                            </div>
                            
                            <div className="border rounded-lg p-4 hover:bg-gray-50">
                                <h4 className="font-bold text-purple-900 mb-2">HIIT Fat Blaster</h4>
                                <ul className="text-sm text-gray-700 space-y-1 mb-3">
                                    <li>• Sprint in Place - 30 seconds on/off × 8</li>
                                    <li>• Jump Squats - 4 sets of 15</li>
                                    <li>• Plank to Push-up - 3 sets of 8</li>
                                    <li>• Side Plank - 30 seconds each side</li>
                                </ul>
                                <button className="w-full py-2 bg-purple-600 text-white rounded hover:bg-green-600 transition-colors">
                                    Add Routine
                                </button>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setShowWorkout(false)}
                            className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Create My Exercise pop-up */}
            {showCreateExercise && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-lg">
                        <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">Create My Exercise</h3>
                        <p className="text-gray-700 text-center mb-6">Create your own custom exercise not found in our library.</p>
                        
                        <form className="space-y-4" onSubmit={(e) => {
                            e.preventDefault();
                            alert('Exercise created successfully! Your custom exercise has been added to the library.');
                            setShowCreateExercise(false);
                        }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Custom Cardio Routine"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Type</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                                        <option value="">Select Type</option>
                                        <option>Strength</option>
                                        <option>Cardio</option>
                                        <option>Flexibility</option>
                                        <option>Balance</option>
                                        <option>Mixed</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        placeholder="e.g., 30"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Repetitions/Sets</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 3 sets of 15"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Intensity Level</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                                        <option>Low</option>
                                        <option>Moderate</option>
                                        <option>High</option>
                                        <option>Very High</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Calories Burned</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="e.g., 200"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kilojoules (optional)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="e.g., 837"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    placeholder="Describe how to perform this exercise..."
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                ></textarea>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Needed</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Dumbbells, Yoga Mat, None"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button 
                                    type="submit"
                                    className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                                >
                                    Create Exercise
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowCreateExercise(false)}
                                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* All Exercise pop-up */}
            {showAllExercise && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-4xl shadow-lg">
                        <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">All Exercise</h3>
                        <p className="text-gray-700 text-center mb-6">Mix and match exercises to create your custom routine.</p>
                        
                        <div className="flex gap-6 h-96">
                            {/* Left side - Available exercises */}
                            <div className="flex-1 border rounded-lg p-4">
                                <h4 className="font-semibold text-purple-900 mb-3">Available Exercises</h4>
                                <div className="h-80 overflow-y-auto space-y-2">
                                    {availableExercises.map((exercise) => (
                                        <div key={exercise.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                            <div>
                                                <div className="font-medium">{exercise.name}</div>
                                                <div className="text-sm text-gray-500">{exercise.type} • {exercise.duration}</div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    if (!selectedExercises.find(ex => ex.id === exercise.id)) {
                                                        setSelectedExercises([...selectedExercises, exercise]);
                                                    }
                                                }}
                                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                                disabled={selectedExercises.find(ex => ex.id === exercise.id)}
                                            >
                                                {selectedExercises.find(ex => ex.id === exercise.id) ? 'Added' : 'Add'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Right side - Selected exercises */}
                            <div className="flex-1 border rounded-lg p-4">
                                <h4 className="font-semibold text-purple-900 mb-3">Your Custom Routine</h4>
                                <div className="h-80 overflow-y-auto">
                                    {selectedExercises.length === 0 ? (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <p>Select exercises from the left to build your routine</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedExercises.map((exercise) => (
                                                <div key={exercise.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <div>
                                                        <div className="font-medium">{exercise.name}</div>
                                                        <div className="text-sm text-gray-500">{exercise.type} • {exercise.duration}</div>
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedExercises(selectedExercises.filter(ex => ex.id !== exercise.id));
                                                        }}
                                                        className="px-2 py-1 text-red-600 bg-red-100 hover:bg-red-200 rounded"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 space-y-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button 
                                    className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                                    disabled={selectedExercises.length === 0}
                                    onClick={() => {
                                        if (selectedExercises.length > 0) {
                                            alert('Custom workout routine generated successfully! Your combination has been saved to your daily plan.');
                                            setSelectedExercises([]);
                                            setShowAllExercise(false);
                                        }
                                    }}
                                >
                                    Generate Combination
                                </button>
                                <button 
                                    className="flex-1 py-3 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400"
                                    disabled={selectedExercises.length === 0}
                                    onClick={() => setSelectedExercises([])}
                                >
                                    Clear All
                                </button>
                            </div>
                            <button 
                                onClick={() => setShowAllExercise(false)}
                                className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyPlanEdit;