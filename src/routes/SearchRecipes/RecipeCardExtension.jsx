import { Card, Icon } from 'semantic-ui-react'

import React from 'react';
import RecipeCardExtensionField from './RecipeCardExtensionField';

const RecipeCardExtension = (props) => {

    return (
        <div>
            <Card className='recipe-card-div'

            >
                <RecipeCardExtensionField
                    fieldName='Preparation Time'
                    fieldValue={props.preparationTime}
                />

                <RecipeCardExtensionField
                    fieldName='Total Servings'
                    fieldValue={props.totalServings}
                />

                <RecipeCardExtensionField
                    fieldName='Calories Per Serving'
                    fieldValue={props.caloriesPerServing}
                />

                <RecipeCardExtensionField
                    fieldName='Recipe Notes'
                    fieldValue={props.recipeNotes}
                />

                <RecipeCardExtensionField
                    fieldName='Ingredients'
                    fieldValue={props.ingredients}
                />

                <RecipeCardExtensionField
                    fieldName='Instructions'
                    fieldValue={props.instructions}
                />

            </Card>
        </div>
    )
}

export default RecipeCardExtension