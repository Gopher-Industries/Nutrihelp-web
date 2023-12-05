import React, { useState } from 'react';
import { Card, Icon } from 'semantic-ui-react'
import './RecipeCard.css'
import RecipeCardExtension from './RecipeCardExtension';

const RecipeCard = (props) => {
    const [isVisible, setIsVisible] = useState(true); // Introduce local state

    const [isExpanded, setIsExpanded] = useState(false);

    // If the card is not visible, return null to prevent rendering
    if (!isVisible) return null;

    //Handle clicks on deleting/removing a Recipe card
    const handleDeleteClick = (e) => {
        setIsVisible(false)
    }

    //Handle clicks on a Recipe card
    const handleCardClick = (e) => {
        setIsExpanded(!isExpanded)
    }

    return (
        <div className='recipe-card-container'
            onClick={handleCardClick}
        >
            <Card className='recipe-card-div'
                image={props.imageUrl} //Display Picture
                header={props.recipeName} //Recipe Name
                meta={props.cuisine} //Recipe Description
                description={props.recipeNotes} //Recipe Notes
            />

            {/* Display more information (i.e., expand the RecipeCard)
            if and only if the isExpanded variable is "true"*/}
            {isExpanded == true &&
                <RecipeCardExtension
                    preparationTime={props.preparationTime}
                    totalServings={props.totalServings}
                    caloriesPerServing={props.caloriesPerServing}
                    ingredients={props.ingredients}
                    instructions={props.instructions}
                />}

            <button className='delete-button' onClick={handleDeleteClick}>Remove Recipe</button> {/* Add onClick handler */}
        </div>
    )
}

export default RecipeCard