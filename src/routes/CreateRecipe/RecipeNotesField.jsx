import React from 'react'
import './Field.css'
import Prompt from './Prompt'
import MultipleLineTextInput from './MultipleLineTextInput'

// "Recipe Notes" field for the Create Recipe page
const RecipeNotesField = (props) => (
    <div className='field-div'>
        <Prompt text="Recipe Notes" />
        <MultipleLineTextInput
            recipeNotes={props.recipeNotes}
            onRecipeNotesChange={props.onRecipeNotesChange}
        />
    </div>
)

export default RecipeNotesField