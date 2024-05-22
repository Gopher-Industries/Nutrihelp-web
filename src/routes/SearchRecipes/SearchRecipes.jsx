import "./SearchRecipes.css";

import React, { useState } from "react";

import RecipeCardList from "./RecipeCardList";
import SearchIcon from "../../images/icon-search.png";
import SubHeading from "../../components/general_components/headings/SubHeading";

function SearchRecipes() {
  //Use destructuring to set the value of "searchTerm" to ''
  // and the function "setSearchTerm" to set/update the value of "searchTerm"
  const [recipeNameSearchTerm, setRecipeNameSearchTerm] = useState("");
  const [cuisineSearchTerm, setCusineSearchTerm] = useState("");

  //==================== Set listener for Search Title/Position input box ====================
  //Function to be called by listener
  const onSearchRecipeNameChange = (e) => {
    setRecipeNameSearchTerm(e.target.value); //Assign the value of "searchTerm" to the value
    //                              typed into the input box
  };

  //==================== Set listener for Search Skills input box ====================
  //Function to be called by listener
  const onSearchCuisineChange = (e) => {
    setCusineSearchTerm(e.target.value); //Assign the value of "searchTerm" to the value
    //                              typed into the input box
  };

  //==================== Render the component ====================
  return (
    <div className="container mt-5">
      <SubHeading text="Search Recipes" />

      <br></br>

      <div className="search-input">
        <input
          className="search-box recipe-search-box"
          type="text"
          placeholder={"Search Recipe Name"}
          onChange={onSearchRecipeNameChange}
          value={recipeNameSearchTerm}
        />
        {/* Adding Resuable Search Icon on input */}
        <img src={SearchIcon} alt="search-img" />
      </div>

      <br></br>

      <div className="search-input">
        <input
          className="search-box recipe-search-box"
          type="text"
          placeholder="Search Cuisine"
          onChange={onSearchCuisineChange}
          value={cuisineSearchTerm}
        />
        <img src={SearchIcon} alt="search-img" />
      </div>

      <br></br>

      <RecipeCardList
        recipeNameSearchTerm={recipeNameSearchTerm}
        cuisineSearchTerm={cuisineSearchTerm}
      />
    </div>
  );
}

export default SearchRecipes;
