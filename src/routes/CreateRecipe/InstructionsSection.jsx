import React from 'react'
import './Section.css'
import SectionHeader from './SectionHeader'
import InstructionsField from './InstructionsField'

// Define a component for the "Instructions" section of a form
const InstructionsSection = (props) => {

    return (
        <div className='section'>
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