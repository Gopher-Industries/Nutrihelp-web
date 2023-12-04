import React from 'react'
import './Section.css'
import SectionHeader from './SectionHeader'
import IngredientsField from './IngredientsField'

// Define a component for the "Ingredients" section of a form
const IngredientsSection = (props) => {

    return (
        <div className='section'>
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