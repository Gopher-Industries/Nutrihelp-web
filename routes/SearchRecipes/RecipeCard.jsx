import React from "react";
import "./RecipeCard.css";

const defaultImageUrl = "https://img.freepik.com/premium-vector/cooking-logo-design_636083-140.jpg"; // Use a default image URL


function RecipeCard({ recipe, onClick }) {
  return (
    <div className="recipe-card-div" onClick={onClick}>
      <div className="image">
      <img src={recipe.recipe_image || defaultImageUrl} alt={recipe.recipe_name} /> {/* Fallback to default image */}
      </div>
      <div className="name-box">{recipe.recipe_name}</div>
      <p className="meta">{recipe.cuisine_name}</p>
      <p className="description">{recipe.instructions}</p>
    </div>
  );
}

export default RecipeCard;
