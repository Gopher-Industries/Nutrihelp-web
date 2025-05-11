import React, { useState } from "react";
import "./SearchByItem.css";

const SearchByItem = () => {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);

  const handleSearch = async () => {
    // Placeholder fetch logic (to be connected with backend API)
    try {
      const response = await fetch("http://localhost/api/searchbyitems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients: ingredients.split(",") }),
      });
      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (err) {
      console.error("Error fetching recipes:", err);
    }
  };

  return (
    <div className="search-by-item-container">
      <h1>Search Recipes by Ingredients</h1>

      <input
        type="text"
        className="ingredient-input"
        placeholder="Enter ingredients, separated by commas (e.g. tomato, rice)"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />

      <button className="search-button" onClick={handleSearch}>
        Find Recipes
      </button>

      <div className="recipe-results">
        {recipes.length > 0 ? (
          <ul>
            {recipes.map((recipe, idx) => (
              <li key={idx}>{recipe.recipe_name}</li>
            ))}
          </ul>
        ) : (
          <p>No recipes found. Try different ingredients.</p>
        )}
      </div>
    </div>
  );
};

export default SearchByItem;
