import React, { useState, useEffect } from "react";
import "./SearchRecipes.css";
import RecipeCardList from "./RecipeCardList";
import SearchIcon from "../../images/icon-search.png";
import { fetchRecipes } from "./fetchRecipes";

function SearchRecipes() {
  const [recipeNameSearchTerm, setRecipeNameSearchTerm] = useState("");
  const [recipes, setRecipes] = useState([]);

  // Fetching recipes on component mount
  useEffect(() => {
    async function loadRecipes() {
      const fetchedRecipes = await fetchRecipes();
      setRecipes(fetchedRecipes.recipes || []);
    }

    loadRecipes();
  }, []);

  // Handle search input change
  const onSearchRecipeNameChange = (e) => {
    setRecipeNameSearchTerm(e.target.value);
  };

  // Filter recipes based on search term, check if recipes is not undefined
  const filteredRecipes = recipes.length > 0 ? recipes.filter((recipe) =>
    recipe.recipe_name.toLowerCase().includes(recipeNameSearchTerm.toLowerCase())
  ) : [];

  return (
    <div className="container mt-5">
      <h2>Recipes</h2>

      <div className="search-input">
        <input
          className="search-box recipe-search-box"
          type="text"
          placeholder={"Search Recipes"}
          onChange={onSearchRecipeNameChange}
          value={recipeNameSearchTerm}
        />
        <img src={SearchIcon} alt="search-icon" />
      </div>

      <h2 className="popular-title">Popular Recipes</h2>
      <RecipeCardList recipes={filteredRecipes} />
    </div>
  );
}

export default SearchRecipes;
