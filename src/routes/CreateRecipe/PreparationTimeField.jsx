import './Field.css'

import NumberInput from './NumberInput'
import Prompt from './Prompt'
import React from 'react'

// "Preparation Time" field for the Create Recipe page
const PreparationTimeField = (props) => (

    <div className='form-div'>
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