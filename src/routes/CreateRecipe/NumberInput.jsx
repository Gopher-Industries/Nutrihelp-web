import React, { useState, useEffect } from 'react'
import './Input.css'

// Input field for numbers
const NumberInput = (props) => {

    // Initialise state for the input value
    const [inputValue, setInputValue] = useState('') //Set the input value

    // Update input value based on external changes to props.initialValue
    useEffect(
        () => {
            if (props.preparationTime) {
                setInputValue(props.preparationTime);
            }
            if (props.totalServings) {
                setInputValue(props.totalServings);
            }
            if (props.caloriesPerServing) {
                setInputValue(props.caloriesPerServing);
            }
        },
        [props.preparationTime, props.totalServings, props.caloriesPerServing]
    );

    // Handle changes to the input value
    const handleChange = (e) => {
        setInputValue(e.target.value);

        // Call the callback function from the parent component
        if (props.onPreparationTimeChange) {
            props.onPreparationTimeChange(e.target.value);
        }

        // Call the callback function from the parent component
        if (props.onTotalServingsChange) {
            props.onTotalServingsChange(e.target.value);
        }

        // Call the callback function from the parent component
        if (props.onCaloriesPerServingChange) {
            props.onCaloriesPerServingChange(e.target.value);
        }
    }

    return (
        <input
            className='number-input'
            type="number"
            id=""
            name=""
            min={props.min}
            max={props.max}
            step={props.step}
            onChange={handleChange}
            value={inputValue}
        />
    )
}

export default NumberInput