import React from 'react'
import './Section.css'
import SectionHeader from './SectionHeader'
import CaloriesPerServingField from './CaloriesPerServingField'
import RecipeNotesField from './RecipeNotesField'


// Define a component for the "Cooking Details" section of a form
const OtherDetailsSection = (props) => {

    return (
        <div className='section'>
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