import React from "react";
import "./RecipeCard.css";

function RecipeCard({ recipe_name, cuisine_name, description, imageUrl }) {
  return (
    <div className="recipe-card-div">
      <div className="image">
        <img src={imageUrl} alt={recipe_name} />
      </div>
      {/* Recipe name in a separate box with spacing */}
      <div className="name-box">{recipe_name}</div>
      <p className="meta">{cuisine_name}</p>
      <p className="description">{description}</p>  {/* Description will now be bold */}
    </div>
  );
}

export default RecipeCard;
