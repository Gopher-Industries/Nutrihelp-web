import React, { useState } from "react";
import "./createrecipestyle.css";

const CreateRecipe = () => {
  const [recipeData, setRecipeData] = useState({
    name: "",
    introduction: "",
    cuisine: "",
    ingredients: "",
    cookingTime: "",
    directions: "",
    carbs: "",
    calories: "",
    fat: "",
    protein: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setRecipeData((prevState) => ({
      ...prevState,
      [id.replace("recipe-", "")]: value, // remove "recipe-" from the key
    }));
  };

  const validateInputs = () => {
    let formErrors = {};
    if (!recipeData.name) formErrors.name = "Recipe name is required.";
    if (!recipeData.introduction)
      formErrors.introduction = "Introduction is required.";
    if (!recipeData.cuisine) formErrors.cuisine = "Cuisine type is required.";
    if (!recipeData.ingredients)
      formErrors.ingredients = "Ingredients are required.";
    if (!recipeData.cookingTime || recipeData.cookingTime <= 0)
      formErrors.cookingTime = "Cooking time must be greater than zero.";
    if (!recipeData.directions)
      formErrors.directions = "Directions are required.";

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0; // returns true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) {
      return; // Stop submission if validation fails
    }

    try {
      const response = await fetch("YOUR_API_ENDPOINT_HERE", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipeData),
      });

      if (response.ok) {
        // Handle success (e.g., show a success message, clear the form, etc.)
        console.log("Recipe submitted successfully");
        setRecipeData({
          name: "",
          introduction: "",
          cuisine: "",
          ingredients: "",
          cookingTime: "",
          directions: "",
          carbs: "",
          calories: "",
          fat: "",
          protein: "",
        });
        setErrors({});
        setApiError("");
      } else {
        const errorData = await response.json();
        setApiError(errorData.message || "Failed to submit the recipe.");
      }
    } catch (error) {
      setApiError("An error occurred: " + error.message);
    }
  };

  return (
    <div className="formcontainer">
      <h1 className="recipe-form-title">CREATE RECIPE</h1>
      <div className="recipe-form-container">
        <form className="recipe-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="recipe-name">Name of the Recipe</label>
            <input
              type="text"
              id="recipe-name"
              value={recipeData.name}
              onChange={handleChange}
            />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="recipe-introduction">
              Brief Introduction of Recipe
            </label>
            <input
              type="text"
              id="recipe-introduction"
              value={recipeData.introduction}
              onChange={handleChange}
            />
            {errors.introduction && (
              <p className="error">{errors.introduction}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="recipe-cuisine">Cuisine</label>
            <input
              type="text"
              id="recipe-cuisine"
              value={recipeData.cuisine}
              onChange={handleChange}
            />
            {errors.cuisine && <p className="error">{errors.cuisine}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="recipe-ingredients">Ingredients</label>
            <textarea
              id="recipe-ingredients"
              value={recipeData.ingredients}
              onChange={handleChange}
            ></textarea>
            {errors.ingredients && (
              <p className="error">{errors.ingredients}</p>
            )}
          </div>

          <div className="form-group cooking-time">
            <label htmlFor="recipe-cooking-time">Cooking Time</label>
            <input
              type="number"
              id="recipe-cooking-time"
              value={recipeData.cookingTime}
              onChange={handleChange}
            />
            <span>Minutes</span>
            {errors.cookingTime && (
              <p className="error">{errors.cookingTime}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="recipe-directions">Directions</label>
            <textarea
              id="recipe-directions"
              value={recipeData.directions}
              onChange={handleChange}
            ></textarea>
            {errors.directions && <p className="error">{errors.directions}</p>}
          </div>

          <div className="form-group nutrition-facts">
            <label>Nutrition Facts</label>
            <div className="nutrition-inputs">
              <div className="nutrition-group">
                <label htmlFor="recipe-carbs">Carbs</label>
                <input
                  type="number"
                  id="recipe-carbs"
                  value={recipeData.carbs}
                  onChange={handleChange}
                />
              </div>
              <div className="nutrition-group">
                <label htmlFor="recipe-calories">Calories</label>
                <input
                  type="number"
                  id="recipe-calories"
                  value={recipeData.calories}
                  onChange={handleChange}
                />
              </div>
              <div className="nutrition-group">
                <label htmlFor="recipe-fat">Fat</label>
                <input
                  type="number"
                  id="recipe-fat"
                  value={recipeData.fat}
                  onChange={handleChange}
                />
              </div>
              <div className="nutrition-group">
                <label htmlFor="recipe-protein">Protein</label>
                <input
                  type="number"
                  id="recipe-protein"
                  value={recipeData.protein}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {apiError && <p className="api-error">{apiError}</p>}

          <div className="submit-div">
            <button type="submit" className="submit-button">
              Submit Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRecipe;
