import "./CreateRecipe.css";

import React, { useEffect, useState } from "react";

import { Image } from "semantic-ui-react";
import IngredientsSection from "./SectionIngredients";
import RecipeDescriptionSection from "./SectionRecipeDescription";
import SubHeading from "../../components/general_components/headings/SubHeading";
import { SubmitButton } from "./Inputs";
import backgroundLeft from "../../images/bg-left.png";
import backgroundRight from "../../images/bg-right.png";
import { useNavigate } from "react-router-dom";
import { getCuisineList, cuisineListDB, ingredientListDB, getIngredientsList } from './Config.js'


// Create Recipe page
function CreateRecipe() {
  const navigate = useNavigate();

  //SectionRecipeDescription 
  const [recipeName, setRecipeName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [preparationTime, setPreparationTime] = useState("");
  const [totalServings, setTotalServings] = useState("");

  //SectionIngredients 
  const [ingredientCategory, setIngredientCategory] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [ingredientQuantity, setIngredientQuantity] = useState("");
  const [instructions, setInstructions] = useState("");
  const [tableData, setRecipeTable] = useState([])
  const [isEditing, setIsEditing] = useState("");


  //==================== Handle changes to the fields ====================

  //--------------- Recipe Description Section -----------------

  //Handle changes to the Recipe Name field
  const handleRecipeNameChange = (value) => {
    setRecipeName(value);
    console.log("Recipe Name: " + value);
  };

  //Handle changes to the Cuisine field
  const handleCuisineChange = (value) => {
    setCuisine(value);
    console.log("Cuisine: " + value);
  };

  //--------------- Cooking Details Section -----------------

  //Handle changes to the Preparation Time field
  const handlePreparationTimeChange = (value) => {
    setPreparationTime(value);
    console.log("Preparation Time: " + value);
  };

  //Handle changes to the Total Servings field
  const handleTotalServingsChanges = (value) => {
    setTotalServings(value);
    console.log("Total Servings: " + value);
  };

  //--------------- Ingredients Section -----------------


  const handleIngredientCategoryChange = (value) => {
    setIngredientCategory(value);
    console.log("setIngredientCategory: " + value);
  };

  const handleIngredientQuantityChange = (value) => {
    setIngredientQuantity(value);
    console.log("setIngredientQuantity: " + value);
  };

  const handleIngredientChange = (value) => {
    setIngredient(value);
    console.log("setIngredient: " + value);
  };


  const handleIsEditingChange = (value) => {
    setIsEditing(value);
    console.log("isEditing: " + value);
  };

  if (cuisineListDB.length < 2) {
    getCuisineList()
  }

  if (ingredientListDB.ingredient.length < 2) {
    getIngredientsList()
  }



  //--------------- Instructions Section -----------------

  //Handle changes to the Instructions field
  const handleInstructionsChange = (value) => {
    setInstructions(value);
    console.log("Instructions: " + value);
  };

  //==================== Send data to the Supabase ====================
  const sendDataToSupabase = async () => {
    try {
      if (!isFormValid()) {
        setAttemptedSubmit(true);
        window.scrollTo(0, 0); // Scroll to the top of the page
        return; // Prevent further execution if the form is not valid
      }

      setAttemptedSubmit(false); // Reset the flag if the form is valid

      const ingredientId = [];
      const ingredientQuantity = [];
      let cuisineId;
      const userId = 15;

      cuisineListDB.forEach((element) => {
        if (cuisine == element.label) {
          cuisineId = element.id
        }
      })

      tableData.forEach((row) => {
        ingredientListDB.ingredient.forEach((element) => {
          if (row.ingredient == element.label) {

            ingredientId.push(element.id)
            ingredientQuantity.push(parseInt(row.ingredientQuantity))
          }
        })
      })

      const formData = {
        user_id: userId,
        recipe_name: recipeName,
        cuisine_id: cuisineId,
        preparation_time: preparationTime,
        total_servings: totalServings,
        ingredient_id: ingredientId,
        ingredient_quantity: ingredientQuantity,
        instructions: instructions,
      };

      fetch('http://localhost:80/api/recipe/', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Origin': 'http://localhost:3000/',
          'Content-Type': 'application/json'
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.statusCode == 201) {
            console.log("Data successfully written to Supabase!");
            alert("Recipe Creation was successful!");
            navigate("/searchRecipes");
          }
          else {
            console.log(data)
            alert("Recipe Creation was unsuccessful! Please try Again");
          }
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });

    } catch (error) {
      console.error("Error writing document: ", error);
    }

  };

  // Function to validate all fields are filled
  const isFormValid = () => {


    return (
      recipeName &&
      cuisine &&
      totalServings &&
      preparationTime &&
      tableData &&
      instructions
      // isImageAdded
    );
  };

  const [isImageAdded, setIsImageAdded] = useState(false);

  const handleImageAdded = () => {
    setIsImageAdded(true);
  };

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);


  //==================== Render the component ====================
  return (
    <div className="create-recipe-container">
      <br />
      <SubHeading text="Create Recipe" />
      <div className="create-recipe-form">
        <Image className="vector-bg-left" src={backgroundLeft} />
        <Image className="vector-bg-right" src={backgroundRight} />
        <div className="create-recipe-form-wrap">
          {attemptedSubmit && !isFormValid() && (
            <p style={{ color: "red", fontSize: "22px" }}>
              {" "}
              {/* Adjust font size here */}
              **Please fill in all fields and upload an image before
              submitting.**
            </p>
          )}

          <RecipeDescriptionSection
            recipeName={recipeName}
            onRecipeNameChange={handleRecipeNameChange}
            cuisine={cuisine}
            onCuisineChange={handleCuisineChange}
            cuisineListDB={cuisineListDB}
            preparationTime={preparationTime}
            onPreparationTimeChange={handlePreparationTimeChange}
            totalServings={totalServings}
            onTotalServingsChange={handleTotalServingsChanges}
          />

          <IngredientsSection
            ingredient={ingredient}
            onIngredientChange={handleIngredientChange}
            ingredientCategory={ingredientCategory}
            onIngredientCategoryChange={handleIngredientCategoryChange}
            ingredientQuantity={ingredientQuantity}
            onIngredientQuantityChange={handleIngredientQuantityChange}
            tableData={tableData}
            isEditing={isEditing}
            ingredientListDB={ingredientListDB}
            onIsEditingChange={handleIsEditingChange}
            instructions={instructions}
            onInstructionsChange={handleInstructionsChange}
            onImageAdded={handleImageAdded}
          />

          <SubmitButton text="Create Recipe" onSubmit={sendDataToSupabase} />
        </div>
      </div>
    </div>
  );
}

export default CreateRecipe;
