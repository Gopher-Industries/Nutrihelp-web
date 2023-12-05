import React from 'react'
import './Field.css' // Importing CSS for styling
import Prompt from './Prompt' // Importing Prompt component for displaying the label
import DropdownSelectInput from './DropdownSelectInput' // Importing DropdownSelectInput component for the dropdown

// CuisineField component definition
const CuisineField = (props) => {
    return (
        <div className='field-div'>

            {/* Display the prompt text*/}
            <Prompt text="Cuisine" />

            {/* DropdownSelectInput component for selecting cuisine type.
                - 'cuisine' prop is used to set the current selected value in the dropdown.
                - 'onCuisineChange' prop is a function that handles changes in the dropdown.
                - 'options' prop provides a list of cuisines to choose from in the dropdown. */}
            <DropdownSelectInput
                cuisine={props.cuisine}
                onCuisineChange={props.onCuisineChange}
                options={[
                    { value: 'Universal', label: 'Universal' },
                    { value: 'French', label: 'French' },
                    { value: 'Chinese', label: 'Chinese' },
                    { value: 'Japanese', label: 'Japanese' },
                    { value: 'Italian', label: 'Italian' },
                    { value: 'Greek', label: 'Greek' },
                    { value: 'Spanish', label: 'Spanish' },
                    { value: 'Lebanese', label: 'Lebanese' },
                    { value: 'Turkey', label: 'Turkey' },
                    { value: 'Thai', label: 'Thai' },
                    { value: 'Indian', label: 'Indian' },
                    { value: 'Mexican', label: 'Mexican' },
                    { value: 'Vietnamese', label: 'Vietnamese' },
                    { value: 'Australian', label: 'Australian' },
                    { value: 'Other', label: 'Other' }
                ]}
            />
        </div>
    )
}

export default CuisineField // Exporting CuisineField for use in other parts of the app

