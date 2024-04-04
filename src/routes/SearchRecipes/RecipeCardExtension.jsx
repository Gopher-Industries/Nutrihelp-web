import { Grid, GridColumn, GridRow, Icon, Image } from "semantic-ui-react";

import React from "react";
import RecipeCardExtensionField from "./RecipeCardExtensionField";
import backgroundLeft from "../../images/bg-left.png";
import backgroundRight from "../../images/bg-right.png";

const RecipeCardExtension = (props) => {
  return (
    <div className="recipe-card-modal">
      <div className="recipe-modal-content">
        <Icon name="close" />
        <Image className="vector-bg-left" src={backgroundLeft} />
        <Image className="vector-bg-right" src={backgroundRight} />
        <div className="recipe-modal-box">
          <h2>{props.recipeName}</h2>
          <br />
          <Grid divided="vertically">
            <GridRow>
              <GridColumn className="recipe-modal-column" width={7}>
                <div className="column-box">
                  <RecipeCardExtensionField
                    fieldName="Preparation Time"
                    fieldValue={props.preparationTime}
                  />

                  <RecipeCardExtensionField
                    fieldName="Total Servings"
                    fieldValue={props.totalServings}
                  />

                  <RecipeCardExtensionField
                    fieldName="Calories Per Serving"
                    fieldValue={props.caloriesPerServing}
                  />

                  <RecipeCardExtensionField
                    fieldName="Ingredients"
                    fieldValue={props.ingredients}
                  />
                </div>
              </GridColumn>
              <GridColumn className="recipe-modal-column" width={7}>
                <div className="column-box">
                  <RecipeCardExtensionField
                    fieldName="Instructions"
                    fieldValue={props.instructions}
                  />
                  <RecipeCardExtensionField
                    fieldName="Recipe Notes"
                    fieldValue={props.recipeNotes}
                  />
                </div>
              </GridColumn>
            </GridRow>
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default RecipeCardExtension;
