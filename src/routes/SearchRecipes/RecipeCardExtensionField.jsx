import React from 'react';
import './RecipeCardExtensionField.css'

const RecipeCardExtensionField = (props) => {

    return (
        <div className='recipe-card-extension-field-div'>
            <h4>{props.fieldName}: </h4>
            &nbsp; &nbsp;
            <p> {props.fieldValue}</p>

        </div>
    )
}

export default RecipeCardExtensionField