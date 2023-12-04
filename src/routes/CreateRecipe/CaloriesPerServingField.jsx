import React from 'react'
import './Field.css'
import Prompt from './Prompt'
import NumberInput from './NumberInput'

// "Calories Per Serving" field for the Create Recipe page
const CaloriesPerServingField = (props) => (

    <div className='field-div'>
        <Prompt text="Calories Per Serving" />
        <NumberInput
            caloriesPerServing={props.caloriesPerServing}
            min="0"
            max="5000"
            steps="100"
            onCaloriesPerServingChange={props.onCaloriesPerServingChange}
        />
    </div>
)

export default CaloriesPerServingField