import React, { useState } from 'react';
import {
    Routes,
    Route
} from "react-router-dom";
import RecipeCard from './RecipeCard';
import RecipeDetail from './RecipeDetail';
import './RecipeRating.css';

function RecipeRating() {
    const [recipes] = useState([
        {
            id: 18,
            title: 'Tomato pesto chicken pasta',
            description: 'Whole wheat bread with brewed coffee and low-sugar cola, providing morning energy',
            tags: ['High Fat', 'High Salt', 'Quick'],
            rating: 3.5,
            prepTime: 10,
            calories: 320,
        },
        {
            id: 22,
            title: 'Quinoa Salmon Bowl',
            description: 'Fresh salad with grilled chicken breast and fresh juice, a healthy low-fat high-protein option',
            tags: ['Low Fat', 'High Fiber', 'Fitness'],
            rating: 4.2,
            prepTime: 25,
            calories: 420,
        },
        {
            id: 261,
            title: 'Southern-style Chicken Salad',
            description: 'Pan-seared salmon with seasonal vegetables and multigrain rice, rich in omega-3 and dietary fiber',
            tags: ['High Protein', 'Balanced', 'Seafood'],
            rating: 4.7,
            prepTime: 35,
            calories: 580,
        },
        {
            id: 263,
            title: 'Asian Chicken Noodles',
            description: 'Quinoa base with roasted vegetables and hummus, 100% plant-based protein source',
            tags: ['Vegetarian', 'High Fiber', 'Gluten-Free'],
            rating: 4.0,
            prepTime: 20,
            calories: 380,
        }
    ]);

    return (
        <div className="recipe-rating-container">
            <header className="page-header">
                <h1>Recipe rating</h1>
                <p>Discover the healthy recipes that best suit your taste and needs</p>
            </header>

            <div className="recipe-container">
                {recipes.map((recipe) => (
                    <RecipeCard
                        key={recipe.id}
                        {...recipe}
                    />
                ))}
            </div>
        </div>
    );
}

export default RecipeRating;