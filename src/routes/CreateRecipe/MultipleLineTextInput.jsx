import React, { useState, useEffect } from 'react'
import './Input.css'

// Component for multi-line text input
const MultipleLineTextInput = (props) => {

    // Maintain a piece of state for the value of the input
    const [inputValue, setInputValue] = useState('')

    // Use effect hook to set the input value based on incoming props, when they change
    useEffect(() => {
        if (props.recipeNotes) {
            setInputValue(props.recipeNotes);
        }
        if (props.ingredients) {
            setInputValue(props.ingredients);
        }
        if (props.instructions) {
            setInputValue(props.instructions);
        }
    }, [props.recipeNotes, props.ingredients, props.instructions]);

    // Handle changes to the input value
    const handleChange = (e) => {
        setInputValue(e.target.value);

        // Conditionally call relevant callback prop when input changes
        if (props.onRecipeNotesChange) {
            props.onRecipeNotesChange(e.target.value);
        }
        if (props.onIngredientsChange) {
            props.onIngredientsChange(e.target.value);
        }
        if (props.onInstructionsChange) {
            props.onInstructionsChange(e.target.value);
        }
    }

    // Render a textarea with relevant props and event handlers
    return (
        <textarea className='multiple-line-text-input'
            // Assign a dynamic ID, name, and placeholder to cater for different use cases (optional)
            id={props.id || ""}
            name={props.name || ""}
            rows="5"
            cols="50"
            value={inputValue}
            placeholder={props.placeholder}
            onChange={handleChange}>
        </textarea>
    )
}

export default MultipleLineTextInput