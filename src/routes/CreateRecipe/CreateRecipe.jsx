import React from "react";
import { useForm } from "react-hook-form";
import "./CreateRecipe.css"; // Import the CSS file

const CreateRecipe = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h1 className="form-title">CREATE RECIPE</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="form-content">
          <div className="form-group">
            <label className="form-label">Name of the Recipe</label>
            <input
              className="form-input"
              {...register("recipeName", { required: true })}
            />
            {errors.recipeName && (
              <p className="form-error">This field is required</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Brief Introduction of Recipe</label>
            <input
              className="form-input"
              {...register("introduction", { required: true })}
            />
            {errors.introduction && (
              <p className="form-error">This field is required</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Cuisine</label>
            <input
              className="form-input"
              {...register("cuisine", { required: true })}
            />
            {errors.cuisine && (
              <p className="form-error">This field is required</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Ingredients</label>
            <textarea
              className="form-input form-textarea"
              {...register("ingredients", { required: true })}
              rows="4"
            />
            {errors.ingredients && (
              <p className="form-error">This field is required</p>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cooking Time</label>
              <input
                type="number"
                className="form-input"
                {...register("cookingTime", { required: true })}
              />
              {errors.cookingTime && (
                <p className="form-error">This field is required</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Minutes</label>
              <input
                type="number"
                className="form-input"
                {...register("minutes", { required: true })}
              />
              {errors.minutes && (
                <p className="form-error">This field is required</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Directions</label>
            <textarea
              className="form-input form-textarea"
              {...register("directions", { required: true })}
              rows="4"
            />
            {errors.directions && (
              <p className="form-error">This field is required</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Nutrition Facts</label>
            <div className="form-grid">
              <div>
                <label className="form-sublabel">Carbs</label>
                <input
                  type="number"
                  className="form-input"
                  {...register("carbs", { required: true })}
                />
                {errors.carbs && (
                  <p className="form-error">This field is required</p>
                )}
              </div>
              <div>
                <label className="form-sublabel">Calories</label>
                <input
                  type="number"
                  className="form-input"
                  {...register("calories", { required: true })}
                />
                {errors.calories && (
                  <p className="form-error">This field is required</p>
                )}
              </div>
              <div>
                <label className="form-sublabel">Fat</label>
                <input
                  type="number"
                  className="form-input"
                  {...register("fat", { required: true })}
                />
                {errors.fat && (
                  <p className="form-error">This field is required</p>
                )}
              </div>
              <div>
                <label className="form-sublabel">Protein</label>
                <input
                  type="number"
                  className="form-input"
                  {...register("protein", { required: true })}
                />
                {errors.protein && (
                  <p className="form-error">This field is required</p>
                )}
              </div>
            </div>
          </div>

          <div className="form-submit-container">
            <button type="submit" className="form-submit-button">
              Submit Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRecipe;
