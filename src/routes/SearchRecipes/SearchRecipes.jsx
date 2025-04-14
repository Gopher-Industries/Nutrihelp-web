import React, { useState, useEffect } from "react";
import "./SearchRecipes.css";
import RecipeCardList from "./RecipeCardList";
import RecipeCardExtension from "./RecipeCardExtension";
import { fetchRecipes } from "./fetchRecipes";

// Category images (replace with your actual asset paths)
import chineseImg from "../../images/chinese.jpg";
import indianImg from "../../images/indian.jpg";
import mexicanImg from "../../images/mexican.jpg";
import saladsImg from "../../images/salads.jpg";
import thaiImg from "../../images/thai.jpg";
import italianImg from "../../images/italian.jpg";
import middleEasternImg from "../../images/middle_eastern.jpg";
import dessertsImg from "../../images/desserts.jpg";

function SearchRecipes() {
  const [recipeNameSearchTerm, setRecipeNameSearchTerm] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetching recipes once when the component mounts.
  useEffect(() => {
    async function loadRecipes() {
      try {
        // Using a default user id or updating fetchRecipes to not require one.
        const fetchedRecipes = await fetchRecipes("defaultUser");
        setRecipes(fetchedRecipes.recipes || []);
      } catch (error) {
        console.error("Error loading recipes: ", error);
      }
    }
    loadRecipes();
  }, []);

  // Filter recipes based on the search term
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.recipe_name.toLowerCase().includes(recipeNameSearchTerm.toLowerCase())
  );

  // Handle recipe card click to open modal
  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedRecipe(null);
    setIsModalOpen(false);
  };

  // Optional: additional logic on Search button click
  const handleSearch = () => {
    console.log("Search button clicked!");
    // You can add additional logic here if needed
  };

  return (
    <div className="search-recipes-page">
      {/* Main Title */}
      <h1 className="main-title">Recipes</h1>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search"
          className="search-input"
          value={recipeNameSearchTerm}
          onChange={(e) => setRecipeNameSearchTerm(e.target.value)}
        />
      </div>

      {/* Popular Recipes */}
      <h2 className="section-title">Popular Recipes</h2>
      <div className="popular-recipes">
        <button onClick={() => setRecipeNameSearchTerm("Chicken Tikka")}>
          Chicken Tikka
        </button>
        <button onClick={() => setRecipeNameSearchTerm("Spaghetti")}>
          Spaghetti
        </button>
        <button onClick={() => setRecipeNameSearchTerm("Kebab")}>
          Kebab
        </button>
      </div>

      {/* Top Categories Grid */}
      <h2 className="section-title">Top Categories</h2>
      <div className="categories-grid">
        <div className="category-card">
          <img src={chineseImg} alt="Chinese" />
          <h3>Chinese</h3>
        </div>
        <div className="category-card">
          <img src={indianImg} alt="Indian" />
          <h3>Indian</h3>
        </div>
        <div className="category-card">
          <img src={mexicanImg} alt="Mexican" />
          <h3>Mexican</h3>
        </div>
        <div className="category-card">
          <img src={saladsImg} alt="Salads" />
          <h3>Salads</h3>
        </div>
        <div className="category-card">
          <img src={thaiImg} alt="Thai" />
          <h3>Thai</h3>
        </div>
        <div className="category-card">
          <img src={italianImg} alt="Italian" />
          <h3>Italian</h3>
        </div>
        <div className="category-card">
          <img src={middleEasternImg} alt="Middle Eastern" />
          <h3>Middle Eastern</h3>
        </div>
        <div className="category-card">
          <img src={dessertsImg} alt="Desserts" />
          <h3>Desserts</h3>
        </div>
      </div>

      {/* Big Search Button */}
      <button className="search-button" onClick={handleSearch}>
        Search
      </button>

      {/* Recipe Cards List */}
      <div className="recipes-list">
        <RecipeCardList recipes={filteredRecipes} onRecipeClick={handleRecipeClick} />
      </div>

      {/* Modal for Recipe Details */}
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