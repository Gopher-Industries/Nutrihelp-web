import React from "react";
import RecipeCard from "./RecipeCard";

function RecipeCardList({ recipes }) {
  return (
    <div className="recipes-container">
      {recipes.length > 0 ? (
        recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe_name={recipe.recipe_name}
            cuisine_name={recipe.cuisine_name}
            description={recipe.instructions}
            imageUrl={recipe.imageUrl}
          />
        ))
      ) : (
        <p>No recipes found.</p>
      )}
    </div>
  );
}

export default RecipeCardList;
