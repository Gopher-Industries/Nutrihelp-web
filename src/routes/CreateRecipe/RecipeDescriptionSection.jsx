import React from 'react'
import './Section.css'
import SectionHeader from './SectionHeader'
import RecipeNameField from './RecipeNameField'
import CuisineField from './CuisineField'

// Define a component for the "Recipe Description" section of a form
const RecipeDescriptionSection = (props) => {

    return (
        <div className='section'>
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