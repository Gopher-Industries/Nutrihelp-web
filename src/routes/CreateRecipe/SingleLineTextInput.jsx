import React, { useState, useEffect } from 'react';
import './Input.css';

// Input for single line text
const SingleLineTextInput = (props) => {

    // Initialise inputValue state.
    const [inputValue, setInputValue] = useState('');

    // Update inputValue state if prop changes.
    useEffect(() => {
        if (props.recipeName) {
            setInputValue(props.recipeName);
        }
        if (props.experienceIn) {
            setInputValue(props.experienceIn);
        }
    }, [props.recipeName, props.experienceIn]);

    // Update state and inform parent component when input changes.
    const handleChange = (e) => {
        setInputValue(e.target.value);

        if (props.onRecipeNameChange) {
            props.onRecipeNameChange(e.target.value);
        }
        if (props.onExperienceInChange) {
            props.onExperienceInChange(e.target.value);
        }
    }

    // Render a text input element.
    return (
        <input
            className='single-line-text-input'
            type="text"
            value={inputValue}
            onChange={handleChange}
        />
    );
}

export default SingleLineTextInput;