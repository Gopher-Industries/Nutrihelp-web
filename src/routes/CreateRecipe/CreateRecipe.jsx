import React from "react";
import "./createrecipestyle.css";

const CreateRecipe = () => {
  return (
    <div className="formcontainer">
      <h1 className="recipe-form-title">CREATE RECIPE</h1>
      <div className="recipe-form-container">
        <form className="recipe-form">
          <div className="form-group">
            <label htmlFor="recipe-name">Name of the Recipe</label>
            <input type="text" id="recipe-name" />
          </div>

          <div className="form-group">
            <label htmlFor="recipe-introduction">
              Brief Introduction of Recipe
            </label>
            <input type="text" id="recipe-introduction" />
          </div>

          <div className="form-group">
            <label htmlFor="recipe-cuisine">Cuisine</label>
            <input type="text" id="recipe-cuisine" />
          </div>

          <div className="form-group">
            <label htmlFor="recipe-ingredients">Ingredients</label>
            <textarea id="recipe-ingredients"></textarea>
          </div>

          <div className="form-group cooking-time">
            <label htmlFor="recipe-cooking-time">Cooking Time</label>
            <input type="number" id="recipe-cooking-time" />
            <span>Minutes</span>
          </div>

          <div className="form-group">
            <label htmlFor="recipe-directions">Directions</label>
            <textarea id="recipe-directions"></textarea>
          </div>

          <div className="form-group nutrition-facts">
            <label>Nutrition Facts</label>
            <div className="nutrition-inputs">
              <div className="nutrition-group">
                <label htmlFor="recipe-carbs">Carbs</label>
                <input type="number" id="recipe-carbs" />
              </div>
              <div className="nutrition-group">
                <label htmlFor="recipe-calories">Calories</label>
                <input type="number" id="recipe-calories" />
              </div>
              <div className="nutrition-group">
                <label htmlFor="recipe-fat">Fat</label>
                <input type="number" id="recipe-fat" />
              </div>
              <div className="nutrition-group">
                <label htmlFor="recipe-protein">Protein</label>
                <input type="number" id="recipe-protein" />
              </div>
            </div>
          </div>

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
