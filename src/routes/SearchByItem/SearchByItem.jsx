// SearchByItem.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./SearchByItem.css";

const SearchByItem = () => {
  const [ingredientsList, setIngredientsList] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [showIngredients, setShowIngredients] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const addIngredient = () => {
    if (inputValue.trim()) {
      setIngredientsList([...ingredientsList, inputValue.trim()]);
      setInputValue("");
      setShowIngredients(true);
    }
  };

  const handleFindRecipes = async () => {
    if (ingredientsList.length > 0) {
      // Redirect to SearchByItemRecipes page with ingredients
      navigate("/SearchByItemRecipe", {
        state: { ingredients: ingredientsList }
      });
    } else {
      alert("Please add at least one ingredient.");
    }
  };

  const removeIngredient = (index) => {
    const newIngredients = ingredientsList.filter((_, i) => i !== index);
    setIngredientsList(newIngredients);
    if (newIngredients.length === 0) {
      setShowIngredients(false);
    }
  };

  return (
    <div className="kitchen-container">
      <h1 className="kitchen-title">What's in Your Kitchen?</h1>
      
      <div className="input-group">
        <input
          type="text"
          className="ingredient-input"
          placeholder="e.g., tomato, onion, pasta"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addIngredient()}
        />
        <button className="add-btn" onClick={addIngredient}>
          Add
        </button>
      </div>

      {showIngredients && (
        <div className="ingredients-container">
          <div className="ingredients-list">
            {ingredientsList.map((ingredient, index) => (
              <div className="ingredient-item" key={index}>
                <span>{ingredient}</span>
                <button className="remove-btn" onClick={() => removeIngredient(index)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="find-recipes-btn" onClick={handleFindRecipes}>
        Find Recipes
      </button>
    </div>
  );
};

export default SearchByItem;