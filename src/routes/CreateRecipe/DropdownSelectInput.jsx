import React, { useState, useEffect } from 'react';
import './Input.css';

// Dropdown select input component
const DropdownSelectInput = (props) => {
    // Set a default value for options if not provided
    const options = props.options;

    // Initialise selectedValue state.
    const [selectedValue, setSelectedValue] = useState('');

    // Update selectedValue state if prop changes.
    useEffect(() => {
        if (props.cuisine) {
            setSelectedValue(props.cuisine);
        }
    }, [props.cuisine]);

    // Update state and inform parent component when selection changes.
    const handleChange = (e) => {
        setSelectedValue(e.target.value);

        // Inform parent component of the change.
        if (props.onCuisineChange) {
            props.onCuisineChange(e.target.value);
        }
    }

    // Render a dropdown select element with options.
    return (
        <select
            className='dropdown-select-input'
            value={selectedValue}
            onChange={handleChange}
        >
            {/* Map each option to a <option> element */}
            {options.map((option, index) => (
                <option key={index} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}

export default DropdownSelectInput;
