import React from 'react'
import './Field.css'
import Prompt from './Prompt'
import MultipleLineTextInput from './MultipleLineTextInput'

// "Recipe Notes" field for the Create Recipe page
const IngredientsField = (props) => (
    <div className='field-div'>
        <Prompt text="Ingredients" />
        <MultipleLineTextInput
            ingredients={props.ingredients}
            onIngredientsChange={props.onIngredientsChange}
        />
    </div>
)

export default IngredientsField