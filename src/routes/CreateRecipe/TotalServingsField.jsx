import React from 'react'
import './Field.css'
import Prompt from './Prompt'
import NumberInput from './NumberInput'

// "Preparation Time" field for the Create Recipe page
const TotalServingsField = (props) => (

    <div className='field-div'>
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