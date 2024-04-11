import './Field.css'

import NumberInput from './NumberInput'
import Prompt from './Prompt'
import React from 'react'

// "Preparation Time" field for the Create Recipe page
const TotalServingsField = (props) => (

    <div className='form-div'>
        <Prompt text="Total Servings" />
        <NumberInput
            totalServings={props.totalServings}
            min="0"
            max="100"
            steps="0.5"
            onTotalServingsChange={props.onTotalServingsChange}
        />
    </div>
)

export default TotalServingsField