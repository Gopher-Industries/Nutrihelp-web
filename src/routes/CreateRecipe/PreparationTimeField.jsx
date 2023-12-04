import React from 'react'
import './Field.css'
import Prompt from './Prompt'
import NumberInput from './NumberInput'

// "Preparation Time" field for the Create Recipe page
const PreparationTimeField = (props) => (

    <div className='field-div'>
        <Prompt text="Preparation Time" />
        <NumberInput
            preparationTime={props.preparationTime}
            min="0"
            max="100"
            steps="0.5"
            onPreparationTimeChange={props.onPreparationTimeChange}
        />
    </div>
)

export default PreparationTimeField