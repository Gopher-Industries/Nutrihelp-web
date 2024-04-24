import './Field.css'

import React, { useState } from 'react'

import Prompt from './Prompt'
import SingleLineTextInput from './SingleLineTextInput'

// "Recipe Name" field for the Create Recipe page
const RecipeNameField = (props) => {
    return (
        <div className='form-div'>
            <Prompt text="Recipe Name" />
            <SingleLineTextInput
                recipeName={props.recipeName}
                onRecipeNameChange={props.onRecipeNameChange} />
        </div>
    )
}

export default RecipeNameField