
import React, { useState } from "react";
import { Form, Button, Input, Dropdown, TextArea, Header, Segment } from "semantic-ui-react";
import "./CreateRecipe.css";

const mealOptions = [
  { key: 'breakfast', value: 'Breakfast', text: 'Breakfast' },
  { key: 'lunch', value: 'Lunch', text: 'Lunch' },
  { key: 'dinner', value: 'Dinner', text: 'Dinner' },
  { key: 'snack', value: 'Snack', text: 'Snack' },
];

function CreateRecipe() {
  const [mealType, setMealType] = useState("");
  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [calories, setCalories] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");

  const handleSubmit = () => {
    const recipe = {
      mealType,
      recipeName,
      ingredients,
      instructions,
      calories,
      dayOfWeek
    };

    console.log("Recipe submitted:", recipe);
    alert("Recipe added successfully!");
  };

  return (
    <div className="create-recipe-container">
      <Segment padded="very">
        <Header as="h2">Create a Healthy Meal Plan Recipe</Header>
        <Form>
          <Form.Field>
            <label>Day of the Week</label>
            <Input
              placeholder="e.g., Monday"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
            />
          </Form.Field>

          <Form.Field>
            <label>Meal Type</label>
            <Dropdown
              placeholder="Select Meal Type"
              fluid
              selection
              options={mealOptions}
              value={mealType}
              onChange={(e, { value }) => setMealType(value)}
            />
          </Form.Field>

          <Form.Field>
            <label>Recipe Name</label>
            <Input
              placeholder="Enter recipe name"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
            />
          </Form.Field>

          <Form.Field>
            <label>Ingredients</label>
            <TextArea
              placeholder="List ingredients separated by commas"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
          </Form.Field>

          <Form.Field>
            <label>Instructions</label>
            <TextArea
              placeholder="Step-by-step cooking instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </Form.Field>

          <Form.Field>
            <label>Calorie Intake (kcal)</label>
            <Input
              type="number"
              placeholder="e.g., 350"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
          </Form.Field>

          <Button color="green" onClick={handleSubmit}>
            Add Recipe
          </Button>
        </Form>
      </Segment>
    </div>
  );
}

export default CreateRecipe;
