import React from "react";
import { Form, Input, Dropdown } from "semantic-ui-react";

const mealOptions = [
  { key: 'breakfast', value: 'Breakfast', text: 'Breakfast' },
  { key: 'lunch', value: 'Lunch', text: 'Lunch' },
  { key: 'dinner', value: 'Dinner', text: 'Dinner' },
  { key: 'snack', value: 'Snack', text: 'Snack' },
];

function SectionRecipeDescription({
  dayOfWeek,
  onDayOfWeekChange,
  mealType,
  onMealTypeChange,
  recipeName,
  onRecipeNameChange,
  calories,
  onCaloriesChange,
}) {
  return (
    <Form>
      <Form.Field>
        <label>Day of the Week</label>
        <Input
          placeholder="e.g., Monday"
          value={dayOfWeek}
          onChange={(e) => onDayOfWeekChange(e.target.value)}
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
          onChange={(e, { value }) => onMealTypeChange(value)}
        />
      </Form.Field>

      <Form.Field>
        <label>Recipe Name</label>
        <Input
          placeholder="Enter recipe name"
          value={recipeName}
          onChange={(e) => onRecipeNameChange(e.target.value)}
        />
      </Form.Field>

      <Form.Field>
        <label>Calorie Intake (kcal)</label>
        <Input
          type="number"
          placeholder="e.g., 350"
          value={calories}
          onChange={(e) => onCaloriesChange(e.target.value)}
        />
      </Form.Field>
    </Form>
  );
}

export default SectionRecipeDescription;
