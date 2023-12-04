import React from 'react'
import './Field.css'
import Prompt from './Prompt'
import MultipleLineTextInput from './MultipleLineTextInput'

// "Instructions" field for the Create Recipe page
const InstructionsField = (props) => (
    <div className='field-div'>
        <Prompt text="Instructions" />
        <MultipleLineTextInput
            instructions={props.instructions}
            onInstructionsChange={props.onInstructionsChange}
        />
    </div>
)

export default InstructionsField