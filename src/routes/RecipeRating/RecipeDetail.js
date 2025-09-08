import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaClock, FaFire, FaArrowLeft } from 'react-icons/fa';
import './RecipeDetail.css';
import FeedbackPopup from './FeedbackPopup';
import { Fetching } from './Fetching';

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showFeedback, setShowFeedback] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [serving, setServing] = useState(null);
  const [partial, setPartial] = useState(null);

    const recipes = [
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
        },
        {
            id: 5,
            title: 'Mediterranean Platter',
            description: 'Olives, feta cheese, grilled vegetables and pita bread with tzatziki sauce',
            tags: ['Mediterranean', 'Low Carb', 'Vegetarian'],
            rating: 4.5,
            prepTime: 15,
            calories: 350,
        },
        {
            id: 6,
            title: 'Asian Stir-Fry Special',
            description: 'Tofu and mixed vegetables in teriyaki sauce served with jasmine rice',
            tags: ['Asian', 'Vegan', 'Quick'],
            rating: 4.3,
            prepTime: 20,
            calories: 450,
        },
        {
            id: 7,
            title: 'Protein Power Smoothie',
            description: 'Banana, peanut butter, protein powder and almond milk blended to perfection',
            tags: ['High Protein', 'Quick', 'Breakfast'],
            rating: 4.1,
            prepTime: 5,
            calories: 280,
        },
        {
            id: 8,
            title: 'Classic Beef Burger',
            description: 'Grass-fed beef patty with cheese, lettuce and special sauce on brioche bun',
            tags: ['High Protein', 'Comfort Food', 'American'],
            rating: 4.6,
            prepTime: 30,
            calories: 650,
        },
        {
            id: 9,
            title: 'Detox Green Salad',
            description: 'Kale, spinach, avocado and superfood seeds with lemon vinaigrette',
            tags: ['Low Calorie', 'Detox', 'Vegan'],
            rating: 3.9,
            prepTime: 10,
            calories: 220,
        },
        {
            id: 10,
            title: 'Italian Pasta Primavera',
            description: 'Fresh pasta with seasonal vegetables in light cream sauce',
            tags: ['Italian', 'Vegetarian', 'Comfort Food'],
            rating: 4.4,
            prepTime: 25,
            calories: 480,
        },
        {
            id: 11,
            title: 'Basic Vegetable Soup',
            description: 'Simple vegetable soup with minimal seasoning',
            tags: ['Low Fat', 'Low Protein'],
            rating: 1.8,
            prepTime: 15,
            calories: 150,
        }
    ];

    useEffect(() => {
        const foundRecipe = recipes.find(r => r.id === parseInt(id));
        setRecipe(foundRecipe);

        if (foundRecipe && foundRecipe.rating <= 2.0) {
            const timer = setTimeout(() => {
                setShowFeedback(true);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [id]);

    if (!recipe) {
        return <div className="recipe-not-found">Recipe not found!</div>;
    }

    const handleChange = (event) =>{
        const {name , value} = event.target;
        if(name === "Serving")
        setServing(value);
        else if(name === "Partial")
        setPartial(value);
    }
    const handleSubmit = async (event) =>{
        event.preventDefault();
        console.log("recipe id: "+id);
        /*console.log("serving size: "+serving);
        console.log("partial id: "+partial);*/
        try{
        const json = await Fetching(id, serving, partial)
        setData(json);
        alert("The high cost is: " + json.high_cost.price +"\nThe low cost is: "+ json.low_cost.price);
        }
        catch(err){
            setError(err.message);
        }
    }
    const renderStars = () => {
        const stars = [];
        const fullStars = Math.floor(recipe.rating);
        const hasHalfStar = recipe.rating % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<FaStar key={i} className="star filled" />);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<FaStar key={i} className="star half-filled" />);
            } else {
                stars.push(<FaStar key={i} className="star" />);
            }
        }

        return (
            <div className="rating">
                {stars}
                <span className="rating-value">{recipe.rating.toFixed(1)}</span>
            </div>
        );
    };

    return (
        <div className="recipe-detail-container">
            {showFeedback && (
                <FeedbackPopup
                    rating={recipe.rating}
                    tags={recipe.tags}
                    onClose={() => setShowFeedback(false)}
                />
            )}

            <div className="recipe-header">
                <h1>{recipe.title}</h1>
                <p className="recipe-description">{recipe.description}</p>
            </div>

            <div className="recipe-meta">
                <div className="meta-item">
                    <FaClock className="meta-icon" />
                    <span>Prep Time: {recipe.prepTime} minutes</span>
                </div>
                <div className="meta-item">
                    <FaFire className="meta-icon" />
                    <span>Calories: {recipe.calories}</span>
                </div>
            </div>

            {renderStars()}

            <div className="tag-group">
                {recipe.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                ))}
            </div>

            <div className="recipe-content">
                <h2>Ingredients</h2>
                <ul className="ingredients-list">
                    <li>Ingredient 1</li>
                    <li>Ingredient 2</li>
                    <li>Ingredient 3</li>
                </ul>

                <h2>Instructions</h2>
                <ol className="instructions-list">
                    <li>Step 1: Prepare the ingredients</li>
                    <li>Step 2: Cook the main components</li>
                    <li>Step 3: Combine and serve</li>
                </ol>
            </div>

            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back to Recipes
            </button>
            <label htmlFor="userInput">Enter Serving Size:</label>
        <input
            name = "Serving"
            type="text"
            value={serving} 
            onChange={handleChange} 
        />
        <label htmlFor="userInput">Enter Ingredients to remove:</label>
        <input
            name = "Partial"
            type="text"
            value={partial} 
            onChange={handleChange} 
        />
            <button className="back-button" onClick={handleSubmit}>
                CostEstimate
            </button>

        </div>
    );
}
export default RecipeDetail;