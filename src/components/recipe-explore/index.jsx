import React, { useState } from "react";
import { recipes } from "./data";

const RecipeExplorer = () => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [dietFilter, setDietFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [randomMeal, setRandomMeal] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesDiet = dietFilter === "all" || recipe.diet === dietFilter;
    const matchesSearch =
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDiet && matchesSearch;
  });

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeDetails = () => {
    setSelectedRecipe(null);
  };

  const pickRandomMeal = () => {
    setIsSpinning(true);
    let spins = 0;
    const maxSpins = 10;
    const spinInterval = setInterval(() => {
      const tempRandomIndex = Math.floor(
        Math.random() * filteredRecipes.length
      );
      setRandomMeal(filteredRecipes[tempRandomIndex]);
      spins++;
      if (spins >= maxSpins) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        const finalRandomIndex = Math.floor(
          Math.random() * filteredRecipes.length
        );
        setRandomMeal(filteredRecipes[finalRandomIndex]);
      }
    }, 100);
  };

  return (
    <div
      id="no-bg"
      className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6"
    >
      <header id="no-bg" className="text-center mb-8">
        <h1 id="no-bg" className="text-4xl font-bold text-green-700 mb-2">
          🍽️ Recipe Explorer
        </h1>
        <p id="no-bg" className="text-gray-600">
          Discover healthy meals and let fate decide your next dish!
        </p>
      </header>

      <div id="no-bg" className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 id="no-bg" className="text-2xl font-semibold text-green-600 mb-4">
          🎲 Random Meal Picker
        </h2>
        <div id="no-bg" className="flex flex-col items-center">
          <button
            id="no-bg"
            onClick={pickRandomMeal}
            disabled={isSpinning || filteredRecipes.length === 0}
            className={`px-6 py-3 rounded-full text-white font-bold mb-4 transition-all ${
              isSpinning ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
            } shadow-lg transform hover:scale-105`}
          >
            {isSpinning ? "Spinning..." : "🎯 Pick a Meal for Me!"}
          </button>

          {randomMeal && (
            <div
              id="no-bg"
              className="w-full max-w-md bg-green-50 rounded-lg p-4 border border-green-200"
            >
              <h3 id="no-bg" className="text-xl font-bold text-green-700 mb-2">
                {randomMeal.name}
              </h3>
              <p id="no-bg" className="text-gray-600 mb-3">
                {randomMeal.description}
              </p>
              <button
                id="no-bg"
                onClick={() => setSelectedRecipe(randomMeal)}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Show Recipe Details →
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        id="no-bg"
        className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4"
      >
        <div id="no-bg" className="w-full md:w-1/2">
          <input
            id="no-bg"
            type="text"
            placeholder="🔍 Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div id="no-bg" className="w-full md:w-1/2">
          <select
            id="no-bg"
            value={dietFilter}
            onChange={(e) => setDietFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option id="no-bg" value="all">
              All Diets
            </option>
            <option id="no-bg" value="vegan">
              🌱 Vegan
            </option>
            <option id="no-bg" value="low-carb">
              🥑 Low-Carb
            </option>
            <option id="no-bg" value="high-protein">
              💪 High Protein
            </option>
          </select>
        </div>
      </div>

      {filteredRecipes.length === 0 ? (
        <div id="no-bg" className="text-center py-10">
          <p id="no-bg" className="text-gray-500 text-lg">
            No recipes match your search criteria. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div
          id="no-bg"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {filteredRecipes.map((recipe) => (
            <div
              id="no-bg"
              key={recipe.id}
              onClick={() => handleRecipeClick(recipe)}
              className="bg-white w-2/3 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer transform hover:-translate-y-1"
            >
              <div id="no-bg" className="h-48 overflow-hidden">
                <img
                  id="no-bg"
                  src={recipe.image}
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div id="no-bg" className="p-4">
                <h3 id="no-bg" className="text-xl font-bold text-gray-800 mb-2">
                  {recipe.name}
                </h3>
                <p id="no-bg" className="text-gray-600 mb-3">
                  {recipe.description}
                </p>
                <div
                  id="no-bg"
                  className="flex justify-between items-center text-sm text-gray-500"
                >
                  <span id="no-bg" className="capitalize">
                    {recipe.diet}
                  </span>
                  <span id="no-bg">⏱️ {recipe.prepTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRecipe && (
        <div
          id="no-bg"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <div
            id="no-bg"
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div id="no-bg" className="relative">
              <img
                id="no-bg"
                src={selectedRecipe.image}
                alt={selectedRecipe.name}
                className="w-full h-64 object-cover"
              />
              <button
                id="no-bg"
                onClick={closeDetails}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
              >
                <svg
                  id="no-bg"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    id="no-bg"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div id="no-bg" className="p-6">
              <h2 id="no-bg" className="text-3xl font-bold text-gray-800 mb-2">
                {selectedRecipe.name}
              </h2>
              <p id="no-bg" className="text-gray-600 mb-4">
                {selectedRecipe.description}
              </p>

              <div id="no-bg" className="flex gap-4 mb-6">
                <span
                  id="no-bg"
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm capitalize"
                >
                  {selectedRecipe.diet}
                </span>
                <span
                  id="no-bg"
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  ⏱️ {selectedRecipe.prepTime}
                </span>
              </div>

              <div id="no-bg" className="mb-6">
                <h3
                  id="no-bg"
                  className="text-xl font-semibold text-gray-800 mb-3"
                >
                  Ingredients
                </h3>
                <ul id="no-bg" className="list-disc pl-5 space-y-1">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <li id="no-bg" key={index} className="text-gray-700">
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>

              <div id="no-bg">
                <h3
                  id="no-bg"
                  className="text-xl font-semibold text-gray-800 mb-3"
                >
                  Preparation Steps
                </h3>
                <ol id="no-bg" className="list-decimal pl-5 space-y-2">
                  {selectedRecipe.steps.map((step, index) => (
                    <li id="no-bg" key={index} className="text-gray-700">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeExplorer;
