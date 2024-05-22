import './Field.css'

import NumberInput from './NumberInput'
import Prompt from './Prompt'
import React from 'react'

// "Calories Per Serving" field for the Create Recipe page
const CaloriesPerServingField = (props) => (

    <div className='form-div'>
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