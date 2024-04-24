import './CreateRecipe.css'

import CaloriesPerServingField from './CaloriesPerServingField'
import React from 'react'
import RecipeNotesField from './RecipeNotesField'
import SectionHeader from './SectionHeader'

// Define a component for the "Cooking Details" section of a form
const OtherDetailsSection = (props) => {

    return (
        <div className='form-section'>
            <SectionHeader text='Other Details' />
            <div>
                <CaloriesPerServingField
                    caloriesPerServing={props.caloriesPerServing}
                    onCaloriesPerServingChange={props.onCaloriesPerServingChange}
                />

                <RecipeNotesField
                    recipeNotes={props.recipeNotes}
                    onRecipeNotesChange={props.onRecipeNotesChange}
                />
            </div>
        </div>
    )
}

export default OtherDetailsSection