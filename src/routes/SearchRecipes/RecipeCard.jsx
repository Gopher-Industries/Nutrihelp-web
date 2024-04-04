import "./RecipeCard.css";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardMeta,
  GridColumn,
  Image,
} from "semantic-ui-react";
import React, { useState } from "react";

import RecipeCardExtension from "./RecipeCardExtension";

const RecipeCard = (props) => {
  const [open, setOpen] = React.useState(false);

  const [isVisible, setIsVisible] = useState(true); // Introduce local state

  const [isExpanded, setIsExpanded] = useState(false);

  // If the card is not visible, return null to prevent rendering
  if (!isVisible) return null;

  //Handle clicks on deleting/removing a Recipe card
  const handleDeleteClick = (e) => {
    setIsVisible(false);
  };

  //Handle clicks on a Recipe card
  const handleCardClick = (e) => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <GridColumn onClick={handleCardClick}>
        {/* <Card className='recipe-card-div'
                image={props.imageUrl} //Display Picture
                header={props.recipeName} //Recipe Name
                meta={props.cuisine} //Recipe Description
                description={props.recipeNotes} //Recipe Notes
            /> */}
        {/* New Card Design */}
        <Card>
          <Image src={props.imageUrl} wrapped ui={false} />
          <CardContent>
            <CardHeader>{props.recipeName}</CardHeader>
            <CardMeta>
              <span className="date">{props.cuisine}</span>
            </CardMeta>
            <CardDescription>{props.recipeNotes}</CardDescription>
          </CardContent>
          <CardContent extra>
            <div className="recipe-card-btn-wrap">
              <button className="button-primary" onClick={handleCardClick}>
                View Recipe
              </button>
              <button className="button-secondary" onClick={handleDeleteClick}>
                Remove Recipe
              </button>
            </div>
          </CardContent>
        </Card>
        {/* Display more information (i.e., expand the RecipeCard)
            if and only if the isExpanded variable is "true"*/}
        {isExpanded == true && (
          <RecipeCardExtension
            recipeName={props.recipeName}
            preparationTime={props.preparationTime}
            totalServings={props.totalServings}
            caloriesPerServing={props.caloriesPerServing}
            ingredients={props.ingredients}
            instructions={props.instructions}
          />
        )}
      </GridColumn>
    </>
  );
};

export default RecipeCard;
