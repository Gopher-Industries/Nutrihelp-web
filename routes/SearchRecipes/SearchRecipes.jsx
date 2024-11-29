import React, { useState, useEffect } from "react";
import "./SearchRecipes.css";
import RecipeCardList from "./RecipeCardList";
import SearchIcon from "../../images/icon-search.png";
import RecipeCardExtension from "./RecipeCardExtension";
import { fetchRecipes } from "./fetchRecipes";

function SearchRecipes() {
  const [userId, setUserId] = useState(""); // New state for user ID
  const [recipeNameSearchTerm, setRecipeNameSearchTerm] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch recipes when user ID changes
  useEffect(() => {
    async function loadRecipes() {
      if (userId) {
        try {
          const fetchedRecipes = await fetchRecipes(userId); // Pass user ID to the API
          setRecipes(fetchedRecipes.recipes || []);
        } catch (error) {
          console.error("Error loading recipes: ", error);
        }
      }
    }
    loadRecipes();
  }, [userId]);

  // Handle search input change
  const onSearchRecipeNameChange = (e) => {
    setRecipeNameSearchTerm(e.target.value);
  };

  // Handle when a recipe is clicked to show modal
  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedRecipe(null);
    setIsModalOpen(false);
  };

  // Filter recipes based on search term
  const filteredRecipes =
    recipes.length > 0
      ? recipes.filter((recipe) =>
          recipe.recipe_name
            .toLowerCase()
            .includes(recipeNameSearchTerm.toLowerCase())
        )
      : [];

  return (
    <div className="container mt-5">
      <h2>Recipes</h2>

      <div className="search-input">
        <input
          className="search-box recipe-search-box"
          type="text"
          placeholder={"Enter User ID"}
          onChange={(e) => setUserId(e.target.value)} // Update user ID
          value={userId}
        />
      </div>

      <div className="search-input">
        <input
          className="search-box recipe-search-box"
          type="text"
          placeholder={"Search Recipes"}
          onChange={onSearchRecipeNameChange}
          value={recipeNameSearchTerm}
          disabled={!userId} // Disable search if no user ID is provided
        />
        <img src={SearchIcon} alt="search-icon" />
      </div>

      <h2 className="popular-title">Popular Recipes</h2>
      <RecipeCardList recipes={filteredRecipes} onRecipeClick={handleRecipeClick} />

      {isModalOpen && selectedRecipe && (
        <RecipeCardExtension
          recipeName={selectedRecipe?.recipe_name}
          instructions={selectedRecipe?.instructions}
          preparationTime={selectedRecipe?.preparation_time}
          totalServings={selectedRecipe?.total_servings}
          ingredients={selectedRecipe?.ingredients}
          handleCardClick={handleCloseModal}
        />
      )}
    </div>
  );
}

export default SearchRecipes;
