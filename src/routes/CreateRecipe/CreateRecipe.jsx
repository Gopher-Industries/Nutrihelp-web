import React, { useState, useEffect } from 'react';
import { firestore } from '../../utils/firebase';
import { collection, doc, setDoc, addDoc } from 'firebase/firestore';
import RecipeDescriptionSection from './RecipeDescriptionSection';
import CookingDetailsSection from './CookingDetailsSection';
import OtherDetailsSection from './OtherDetailsSection';
import IngredientsSection from './IngredientsSection';
import InstructionsSection from './InstructionsSection';
import SubmitButton from './SubmitButton';


// Post Job page
function CreateRecipe() {

    //Recipe Description Section
    const [recipeName, setRecipeName] = useState('');
    const [cuisine, setCuisine] = useState('');

    //Cooking Details Section
    const [preparationTime, setPreparationTime] = useState('');
    const [totalServings, setTotalServings] = useState('');

    //Other Details Section
    const [caloriesPerServing, setCaloriesPerServing] = useState('');
    const [recipeNotes, setRecipeNotes] = useState('');

    //Ingredients Section
    const [ingredients, setIngredients] = useState('');

    //Instructions Section
    const [instructions, setInstructions] = useState('');


    //==================== Handle changes to the fields ====================

    //--------------- Recipe Description Section -----------------

    //Handle changes to the Recipe Name field
    const handleRecipeNameChange = (value) => {
        setRecipeName(value);
        console.log('Recipe Name: ' + value);
    }

    //Handle changes to the Cuisine field
    const handleCuisineChange = (value) => {
        setCuisine(value);
        console.log('Cuisine: ' + value);
    }

    //--------------- Cooking Details Section -----------------

    //Handle changes to the Preparation Time field
    const handlePreparationTimeChange = (value) => {
        setPreparationTime(value);
        console.log('Preparation Time: ' + value);
    }

    //Handle changes to the Total Servings field
    const handleTotalServingsChanges = (value) => {
        setTotalServings(value);
        console.log('Total Servings: ' + value);
    }

    //--------------- Other Details Section -----------------

    //Handle changes to the Calories Per Serving field
    const handleCaloriesPerServingChange = (value) => {
        setCaloriesPerServing(value);
        console.log('Calories Per Serving: ' + value);
    }

    //Handle changes to the Recipe Notes field
    const handleRecipeNotesChanges = (value) => {
        setRecipeNotes(value);
        console.log('Recipe Notes: ' + value);
    }

    //--------------- Ingredients Section -----------------

    //Handle changes to the Ingredients field
    const handleIngredientsChange = (value) => {
        setIngredients(value);
        console.log('Ingredients: ' + value);
    }

    //--------------- Instructions Section -----------------

    //Handle changes to the Ingredients field
    const handleInstructionsChange = (value) => {
        setInstructions(value);
        console.log('Instructions: ' + value);
    }

    //==================== Send data to the Firestore ====================
    const sendDataToFirestore = async () => {
        try {
            const dataCollection = collection(firestore, 'recipesData');

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

            console.log('Data successfully written to Firestore with custom ID!');
        } catch (error) {
            console.error('Error writing document: ', error);
        }
    };

    //==================== Render the component ====================
    return (

        <div>
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

            <SubmitButton
                text="Create Recipe"
                onSubmit={sendDataToFirestore}
            />
        </div>
    );
}

export default CreateRecipe