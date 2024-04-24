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
      <GridColumn>
        {/* <Card>
          <Image src={props.imageUrl} wrapped ui={false} />
          <CardContent>
            <CardHeader style={{cursor: "pointer"}}  onClick={handleCardClick}>{props.recipeName}</CardHeader>
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
        </Card> */}

        <Card
          className="recipe-card-wrap"
          style={{ backgroundImage: `url(${props.imageUrl})` }}
        >
          <span class="recipe-card-overlay"></span>
          <CardContent className="recipe-card-content">
            <CardHeader style={{ cursor: "pointer" }} onClick={handleCardClick}>
              {props.recipeName}
            </CardHeader>
            <CardMeta>
              <span className="date">{props.cuisine}</span>
            </CardMeta>
            <button className="recipe-card-btn" onClick={handleCardClick}>
              View Recipe
            </button>
          </CardContent>
        </Card>
      </GridColumn>

      {isExpanded == true && (
        <RecipeCardExtension
          recipeName={props.recipeName}
          preparationTime={props.preparationTime}
          totalServings={props.totalServings}
          caloriesPerServing={props.caloriesPerServing}
          ingredients={props.ingredients}
          instructions={props.instructions}
          handleCardClick={handleCardClick}
          handleDeleteClick={handleDeleteClick}
        />
      )}
    </>
  );
};

export default RecipeCard;
