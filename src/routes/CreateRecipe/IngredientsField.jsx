import './Field.css'

import MultipleLineTextInput from './MultipleLineTextInput'
import Prompt from './Prompt'
import React from 'react'

// "Recipe Notes" field for the Create Recipe page
const IngredientsField = (props) => (
    <div className='form-div'>
        <Prompt text="Ingredients" />
        <MultipleLineTextInput
            ingredients={props.ingredients}
            onIngredientsChange={props.onIngredientsChange}
        />
    </div>
)

export default IngredientsField