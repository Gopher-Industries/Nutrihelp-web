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
                    { value: 'french', label: 'French' },
                    { value: 'chinese', label: 'Chinese' },
                    { value: 'japanese', label: 'Japanese' },
                    { value: 'italian', label: 'Italian' },
                    { value: 'greek', label: 'Greek' },
                    { value: 'spanish', label: 'Spanish' },
                    { value: 'lebanese', label: 'Lebanese' },
                    { value: 'turkey', label: 'Turkey' },
                    { value: 'thai', label: 'Thai' },
                    { value: 'indian', label: 'Indian' },
                    { value: 'mexican', label: 'Mexican' },
                    { value: 'vietnamese', label: 'Vietnamese' },
                    { value: 'australian', label: 'Australian' },
                    { value: 'other', label: 'Other' }
                ]}
            />
        </div>
    )
}

export default CuisineField // Exporting CuisineField for use in other parts of the app

