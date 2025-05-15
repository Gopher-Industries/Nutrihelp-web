// SearchByItemRecipe.jsx
import React from "react";
import "./SearchByItemRecipe.css";

const recipeData = [
  {
    id: 1,
    name: "Grilled Chicken",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNmZg4KavoPUQRNVVzYmDOnJy1oTUpleYebg&s",
    matchPercentage: 100
  },
  {
    id: 2,
    name: "Soya Curry",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQUmN5lpt-djXWx56VvldflviFRBPasOpfYQ&s",
    matchPercentage: 86
  },
  {
    id: 3,
    name: "Vegetable Stir Fry",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ2lA1ONnlrGJh8n77HFni8EexOiDdv_v34Q&s",
    matchPercentage: 75
  },
  {
    id: 4,
    name: "Oatmeal",
    image: "https://fitfoodiefinds.com/wp-content/uploads/2015/10/classic-oatmeal.jpg",
    matchPercentage: 92
  }
];

const SearchByItemRecipe = () => {
  return (
    <div className="recipe-container">
      <h1 className="recipe-title">Recipes You Can Make</h1>
      <div className="recipe-grid">
        {recipeData.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <img src={recipe.image} alt={recipe.name} className="recipe-image" />
            <div className="recipe-info">
              <h2 className="recipe-name">{recipe.name}</h2>
              <div className="match-indicator">
                <span className="match-text">Ingredient Match: </span>
                <span className={`match-value ${getMatchClass(recipe.matchPercentage)}`}>
                  {recipe.matchPercentage}%
                </span>
              </div>
              <button className="view-btn">View Recipe</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  function getMatchClass(percentage) {
    if (percentage >= 90) return "match-high";
    if (percentage >= 70) return "match-medium";
    return "match-low";
  }
};

export default SearchByItemRecipe;