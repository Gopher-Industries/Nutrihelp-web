import "./RecipeCard.css";

import { Grid, GridRow } from "semantic-ui-react";
import React, { useEffect, useState } from "react";

import RecipeCard from "./RecipeCard";
import { fetchRecipes } from "./fetchRecipes";

//Component to display a list of cards representing recipes
function RecipeCardComponent(recipe) {
  return (
    <RecipeCard
      imageUrl={recipe.imageUrl}
      recipeName={recipe.recipeName}
      cuisine={recipe.cuisine}
      preparationTime={recipe.preparationTime}
      totalServings={recipe.totalServings}
      caloriesPerServing={recipe.caloriesPerServing}
      recipeNotes={recipe.recipeNotes}
      ingredients={recipe.ingredients}
      instructions={recipe.instructions}
    />
  );
}

function RecipeCardList(props) {
  const [recipeList, setRecipeList] = useState([]); // Initial state as empty array

  useEffect(() => {
    // Fetch the recipes and update the state
    fetchRecipes().then((recipes) => {
      setRecipeList(recipes);
    });
  }, []); // Empty dependency array ensures this runs once when component mounts

  const filteredRecipe = recipeList.filter((recipe) => {
    return (
      recipe.recipeName
        .toLowerCase()
        .includes(props.recipeNameSearchTerm.toLowerCase()) &&
      recipe.cuisine
        .toLowerCase()
        .includes(props.cuisineSearchTerm.toLowerCase())
    );
  });

  //Render the component
  return (
    <Grid className="recide-card-grid">
      <GridRow columns={3}>{filteredRecipe.map(RecipeCardComponent)}</GridRow>
    </Grid>
  );
}

export default RecipeCardList;
