import './CreateRecipe.css'

import CuisineField from './CuisineField'
import React from 'react'
import RecipeNameField from './RecipeNameField'
import SectionHeader from './SectionHeader'

// Define a component for the "Recipe Description" section of a form
const RecipeDescriptionSection = (props) => {

    return (
        <div className='form-section'>
            <SectionHeader text='Recipe Description' />
            <div>
                <RecipeNameField
                    recipeName={props.recipeName}
                    onRecipeNameChange={props.onRecipeNameChange}
                />

                <CuisineField
                    cuisine={props.cuisine}
                    onCuisineChange={props.onCuisineChange}
                />
            </div>
        </div>
    )
}

export default RecipeDescriptionSection