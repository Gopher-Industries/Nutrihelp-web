import './CreateRecipe.css'

import InstructionsField from './InstructionsField'
import React from 'react'
import SectionHeader from './SectionHeader'

// Define a component for the "Instructions" section of a form
const InstructionsSection = (props) => {

    return (
        <div className='form-section'>
            <SectionHeader text='Instructions' />
            <div>
                <InstructionsField
                    instructions={props.instructions}
                    onInstructionsChange={props.onInstructionsChange}
                />
            </div>
        </div>
    )
}

export default InstructionsSection