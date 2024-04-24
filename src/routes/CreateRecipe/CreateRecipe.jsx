import "./CreateRecipe.css";

import React, { useEffect, useState } from "react";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";

import AddAnImageSection from "./AddAnImageSection";
import CookingDetailsSection from "./CookingDetailsSection";
import { Image } from "semantic-ui-react";
import IngredientsSection from "./IngredientsSection";
import InstructionsSection from "./InstructionsSection";
import OtherDetailsSection from "./OtherDetailsSection";
import RecipeDescriptionSection from "./RecipeDescriptionSection";
import SubHeading from "../../components/general_components/headings/SubHeading";
import SubmitButton from "./SubmitButton";
import backgroundLeft from "../../images/bg-left.png";
import backgroundRight from "../../images/bg-right.png";
import { firestore } from "../../utils/firebase";
import { useNavigate } from "react-router-dom";

// Create Recipe page
function CreateRecipe() {
  const navigate = useNavigate();

  //Recipe Description Section
  const [recipeName, setRecipeName] = useState("");
  const [cuisine, setCuisine] = useState("Universal");

  //Cooking Details Section
  const [preparationTime, setPreparationTime] = useState("");
  const [totalServings, setTotalServings] = useState("");

  //Other Details Section
  const [caloriesPerServing, setCaloriesPerServing] = useState("");
  const [recipeNotes, setRecipeNotes] = useState("");

  //Ingredients Section
  const [ingredients, setIngredients] = useState("");

  //Instructions Section
  const [instructions, setInstructions] = useState("");

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

  //--------------- Other Details Section -----------------

  //Handle changes to the Calories Per Serving field
  const handleCaloriesPerServingChange = (value) => {
    setCaloriesPerServing(value);
    console.log("Calories Per Serving: " + value);
  };

  //Handle changes to the Recipe Notes field
  const handleRecipeNotesChanges = (value) => {
    setRecipeNotes(value);
    console.log("Recipe Notes: " + value);
  };

  //--------------- Ingredients Section -----------------

  //Handle changes to the Ingredients field
  const handleIngredientsChange = (value) => {
    setIngredients(value);
    console.log("Ingredients: " + value);
  };

  //--------------- Instructions Section -----------------

  //Handle changes to the Instructions field
  const handleInstructionsChange = (value) => {
    setInstructions(value);
    console.log("Instructions: " + value);
  };

  //==================== Send data to the Firestore ====================
  const sendDataToFirestore = async () => {
    try {
      if (!isFormValid()) {
        setAttemptedSubmit(true);
        window.scrollTo(0, 0); // Scroll to the top of the page
        return; // Prevent further execution if the form is not valid
      }

      setAttemptedSubmit(false); // Reset the flag if the form is valid

      const dataCollection = collection(firestore, "recipesData");

      // Create a specific document ID
      const documentId = Date.now().toString();

      // Create a reference to the document with the specific ID
      const docRef = doc(dataCollection, documentId);

      // Set the data at the specified location
      await setDoc(docRef, {
        recipeName: recipeName,
        cuisine: cuisine,
        preparationTime: preparationTime,
        totalServings: totalServings,
        caloriesPerServing: caloriesPerServing,
        recipeNotes: recipeNotes,
        ingredients: ingredients,
        instructions: instructions,
      });

      console.log("Data successfully written to Firestore with custom ID!");
      // Show success alert
      alert("Recipe Creation was successful!");

      // Navigate to /searchRecipes route
      navigate("/searchRecipes");
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  };

  // Function to validate all fields are filled
  const isFormValid = () => {
    return (
      recipeName &&
      cuisine &&
      preparationTime &&
      totalServings &&
      caloriesPerServing &&
      recipeNotes &&
      ingredients &&
      instructions &&
      isImageAdded
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
      <br />
      <p className="text-center">Please fill out the form below to create your favorite recipe</p>
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
          />

          <CookingDetailsSection
            preparationTime={preparationTime}
            onPreparationTimeChange={handlePreparationTimeChange}
            totalServings={totalServings}
            onTotalServingsChange={handleTotalServingsChanges}
          />

          <OtherDetailsSection
            caloriesPerServing={caloriesPerServing}
            onCaloriesPerServingChange={handleCaloriesPerServingChange}
            recipeNotes={recipeNotes}
            onRecipeNotesChange={handleRecipeNotesChanges}
          />

          <IngredientsSection
            ingredients={ingredients}
            onIngredientsChange={handleIngredientsChange}
          />

          <InstructionsSection
            instructions={instructions}
            onInstructionsChange={handleInstructionsChange}
          />

          <AddAnImageSection onImageAdded={handleImageAdded} />

          <SubmitButton text="Create Recipe" onSubmit={sendDataToFirestore} />
        </div>
      </div>
    </div>
  );
}

export default CreateRecipe;
