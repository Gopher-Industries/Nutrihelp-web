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
import { Grid, GridRow } from "semantic-ui-react";
import React, { useEffect, useState } from "react";

import RecipeCard from "./RecipeCard";
import { fetchRecipes } from "./fetchRecipes";

function RecipeCardList(props) {
  const [recipeList, setRecipeList] = useState([]); 
  const [filteredRecipeList, setFilteredRecipeList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchRecipes();
      setRecipeList(data);
      setFilteredRecipeList(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filteredRecipes = recipeList.filter((recipe) =>
      recipe.recipe_name
        .toLowerCase()
        .includes(props.recipeNameSearchTerm.toLowerCase())
    );
    setFilteredRecipeList(filteredRecipes);
  }, [props.recipeNameSearchTerm, recipeList]);


  //Render the component
  return (
    <Grid className="recide-card-grid">
      <GridRow columns={3}>
        {filteredRecipeList.length > 0 ? (
          filteredRecipeList.map((item) => (
            <GridColumn key={item.id}>
              <RecipeCard recipe={item} />
              {/* <Card
                className="recipe-card-wrap"
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              >
                <span class="recipe-card-overlay"></span>
                <CardContent className="recipe-card-content">
                  <CardHeader
                    style={{ cursor: "pointer" }}
                  >
                    {item.recipe_name}
                  </CardHeader>
                  <button className="recipe-card-btn" >
                    View Recipe
                  </button>
                </CardContent>
              </Card> */}
            </GridColumn>
          ))
        ) : (
          <p>No recipes found.</p>
        )}
      </GridRow>
    </Grid>
  );
}

export default RecipeCardList;
