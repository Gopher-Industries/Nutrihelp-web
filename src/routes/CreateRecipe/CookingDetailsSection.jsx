import React from 'react'
import './Section.css'
import SectionHeader from './SectionHeader'
import PreparationTimeField from './PreparationTimeField'
import TotalServingsField from './TotalServingsField'

// Define a component for the "Cooking Details" section of a form
const CookingDetailsSection = (props) => {

    return (
        <div className='section'>
            <SectionHeader text='Cooking Details' />
            <div>
                <PreparationTimeField
                    preparationTime={props.preparationTime}
                    onPreparationTimeChange={props.onPreparationTimeChange}
                />

                <TotalServingsField
                    totalServings={props.totalServings}
                    onTotalServingsChange={props.onTotalServingsChange}
                />
            </div>
        </div>
    )
}

export default CookingDetailsSection