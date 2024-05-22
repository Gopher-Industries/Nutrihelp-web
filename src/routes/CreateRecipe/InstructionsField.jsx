import './Field.css'

import MultipleLineTextInput from './MultipleLineTextInput'
import Prompt from './Prompt'
import React from 'react'

// "Instructions" field for the Create Recipe page
const InstructionsField = (props) => (
    <div className='form-div'>
        <Prompt text="Instructions" />
        <MultipleLineTextInput
            instructions={props.instructions}
            onInstructionsChange={props.onInstructionsChange}
        />
    </div>
)

export default InstructionsField