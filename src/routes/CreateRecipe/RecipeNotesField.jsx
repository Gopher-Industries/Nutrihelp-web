import './Field.css'

import MultipleLineTextInput from './MultipleLineTextInput'
import Prompt from './Prompt'
import React from 'react'

// "Recipe Notes" field for the Create Recipe page
const RecipeNotesField = (props) => (
    <div className='form-div'>
        <Prompt text="Recipe Notes" />
        <MultipleLineTextInput
            recipeNotes={props.recipeNotes}
            onRecipeNotesChange={props.onRecipeNotesChange}
        />
    </div>
)

export default RecipeNotesField