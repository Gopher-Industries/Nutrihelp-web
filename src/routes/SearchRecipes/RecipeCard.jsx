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
import RecipeImage from "../../images/recipe_image.jpg"

function RecipeCard({ recipe }) {
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

        <Card
          className="recipe-card-wrap"
          style={{ backgroundImage: `url(${RecipeImage})` }}
        >
          <span class="recipe-card-overlay"></span>
          <CardContent className="recipe-card-content">
            <CardHeader style={{ cursor: "pointer" }} onClick={handleCardClick}>
            {recipe.recipe_name}
            </CardHeader>
           
            <button className="recipe-card-btn" onClick={handleCardClick}>
              View Recipe
            </button>
          </CardContent>
        </Card>
      </GridColumn>

      {isExpanded == true && (
        <RecipeCardExtension
          recipeName={recipe.recipe_name}
          preparationTime={recipe.preparation_time}
          totalServings={recipe.total_servings}
          caloriesPerServing={recipe.calories}
          ingredients={recipe.ingredients}
          instructions={recipe.instructions}
          handleCardClick={handleCardClick}
          handleDeleteClick={handleDeleteClick}
        />
      )}
    </>
  );
};

export default RecipeCard;



