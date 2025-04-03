import React, { useState } from 'react';
import './MealPlanB.css';  // Make sure the CSS file is correctly linked

// Importing images for use in the meal plan
import Oatmeal from './images/oatmeal.jpg';
import Salad from './images/salad.jpg';
import Steak from './images/steak.jpg';
import Greek from './images/greek.jpg';
import DriedFruits from './images/Driedfruits.jpg';
import Soup from './images/soup.jpg';
import Fish from './images/fish.jpg';
import Rice from './images/rice.jpg';
import Nuts from './images/nuts.jpg';
import IceCream from './images/icecream.jpg';
import Potatoes from './images/potatoes.jpg';
import Pastasalad from './images/pastasalad.jpg';
import Chicken from './images/chicken.avif';
import Ricecakes from './images/ricecakes.avif';

// Meals data structured by meal type
const meals = {
    breakfast: [
        { name: "Oatmeal", description: "Rich in fiber and serves as a hearty start to the day.", img: Oatmeal },
        { name: "Greek Yogurt", description: "Packed with protein and probiotics for digestive health.", img: Greek },
        { name: "Fruit Salad", description: "A variety of fresh fruits providing essential vitamins.", img: DriedFruits }
    ],
    lunch: [
        { name: "Caesar Salad", description: "Fresh greens with a protein punch of chicken.", img: Salad },
        { name: "Tomato Soup", description: "Light yet nourishing with ripe tomatoes.", img: Soup },
        { name: "Grilled Salmon", description: "Rich in omega-3 fatty acids and great for heart health.", img: Fish }
    ],
    dinner: [
        { name: "Steak", description: "High in protein and essential nutrients like iron.", img: Steak },
        { name: "Pasta Salad", description: "Perfect blend of carbs, veggies, and proteins.", img: Pastasalad },
        { name: "Roasted Chicken", description: "A low-fat, high-protein option that's very versatile.", img: Chicken }
    ],
    snacks: [
        { name: "Rice Cakes", description: "Light and airy, perfect for a quick snack without the guilt.", img: Ricecakes },
        { name: "Mixed Nuts", description: "Energy-dense and packed with healthy fats.", img: Nuts },
        { name: "Ice Cream", description: "A sweet treat for occasional indulgence.", img: IceCream }
    ]
};

const MealPlanB = () => {
    const [selectedMealTime, setSelectedMealTime] = useState('breakfast');

    return (
        <div className="meal-plan-b">
            <h1>Meal Plan B: Well-Balanced Meals</h1>
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

export default MealPlanB;
