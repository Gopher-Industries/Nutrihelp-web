import './CreateRecipe.css'

import IngredientsField from './IngredientsField'
import React from 'react'
import SectionHeader from './SectionHeader'

// Define a component for the "Ingredients" section of a form
const IngredientsSection = (props) => {

    return (
        <div className='form-section'>
            <SectionHeader text='Ingredients' />
            <div>
                <IngredientsField
                    ingredients={props.ingredients}
                    onIngredientsChange={props.onIngredientsChange}
                />
            </div>
        </div>
    )
}

export default IngredientsSection