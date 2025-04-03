import React, { useState } from 'react';
import './MealPlanC.css'; // Ensure the CSS file is linked correctly

// Importing images for use in the meal plan
import Salad from './images/salad.jpg';
import Smoothie from './images/smoothie.webp';
import VeggieSoup from './images/veggiesoup.jpg';
import GrilledChicken from './images/grilledchicken.jpg';
import ZucchiniNoodles from './images/zucchininoodles.webp';
import Greek from './images/greek.jpg';
import Hummus from './images/hummus.jpg';
import Hummsveg from './images/hummsveg.jpg';
import Fruitsalad from './images/fruitsalad.jpg';
import CauliflowerRice from './images/cauliflowerrice.jpg';

// Meals data structured by meal type
const meals = {
    breakfast: [
        { name: "Greek Yogurt", description: "Low in calories but high in protein, helps keep you full.", img: Greek },
        { name: "Smoothie", description: "A nutrient-packed smoothie made with fruits and vegetables.", img: Smoothie },
        { name: "Zucchini Noodles", description: "A low-carb alternative to pasta, light but satisfying.", img: ZucchiniNoodles }
    ],
    lunch: [
        { name: "Salad", description: "A fresh vegetable salad with a light vinaigrette.", img: Salad },
        { name: "Veggie Soup", description: "A comforting bowl of soup filled with a variety of vegetables.", img: VeggieSoup },
        { name: "Cauliflower Rice", description: "A fantastic low-calorie substitute for traditional rice.", img: CauliflowerRice }
    ],
    dinner: [
        { name: "Grilled Chicken", description: "Lean protein that's filling with minimal calories.", img: GrilledChicken },
        { name: "Hummus with Veggies", description: "A healthy snack or side dish that's both filling and low in calories.", img: Hummsveg },
        { name: "Zucchini Noodles", description: "Use it as a dinner base for a variety of sauces.", img: ZucchiniNoodles }
    ],
    snacks: [
        { name: "Greek Yogurt", description: "Perfect for a quick, low-calorie snack anytime.", img: Greek },
        { name: "Hummus", description: "Pair with raw veggies for a healthy, crunchy treat.", img: Hummus },
        { name: "Fruit Salad", description: "Keep it varied with seasonal fruits for freshness.", img: Fruitsalad }
    ]
};

const MealPlanC = () => {
    const [selectedMealTime, setSelectedMealTime] = useState('breakfast');

    return (
        <div className="meal-plan-c">
            <h1>Meal Plan C: Low-Calorie Meals</h1>
            <div className="meal-time-buttons">
                {Object.keys(meals).map(mealTime => (
                    <button key={mealTime} onClick={() => setSelectedMealTime(mealTime)}>
                        {mealTime.charAt(0).toUpperCase() + mealTime.slice(1)}
                    </button>
                ))}
            </div>
            <div className="meals-container">
                {meals[selectedMealTime].map((meal, index) => (
                    <div key={index} className="meal-item">
                        <img src={meal.img} alt={meal.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                        <h3>{meal.name}</h3>
                        <p>{meal.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MealPlanC;
