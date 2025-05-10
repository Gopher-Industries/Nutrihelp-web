// File: SectionIngredients.jsx
import React, { useState } from "react";
import { Form, Input, Dropdown, Button, Table, TextArea } from "semantic-ui-react";

function IngredientsSection({
  ingredient,
  onIngredientChange,
  ingredientCategory,
  onIngredientCategoryChange,
  ingredientQuantity,
  onIngredientQuantityChange,
  tableData,
  isEditing,
  ingredientListDB,
  onIsEditingChange,
  instructions,
  onInstructionsChange,
  onImageAdded
}) {
  const [table, setTable] = useState(tableData);

  const handleAddIngredient = () => {
    if (ingredient && ingredientQuantity) {
      const newRow = { ingredient, ingredientQuantity };
      const updatedTable = [...table, newRow];
      setTable(updatedTable);
      onIsEditingChange(updatedTable);
    }
  };

  return (
    <div className="ingredients-section">
      <Form>
        <Form.Group widths="equal">
          <Form.Field>
            <label>Ingredient</label>
            <Dropdown
              placeholder="Select Ingredient"
              fluid
              search
              selection
              options={ingredientListDB.ingredient}
              value={ingredient}
              onChange={(e, { value }) => onIngredientChange(value)}
            />
          </Form.Field>

          <Form.Field>
            <label>Quantity</label>
            <Input
              placeholder="e.g., 100"
              value={ingredientQuantity}
              onChange={(e) => onIngredientQuantityChange(e.target.value)}
            />
          </Form.Field>
        </Form.Group>

        <Button type="button" onClick={handleAddIngredient} primary>
          Add Ingredient
        </Button>

        <Table celled compact>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Ingredient</Table.HeaderCell>
              <Table.HeaderCell>Quantity</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {table.map((row, index) => (
              <Table.Row key={index}>
                <Table.Cell>{row.ingredient}</Table.Cell>
                <Table.Cell>{row.ingredientQuantity}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        <Form.Field>
          <label>Instructions</label>
          <TextArea
            placeholder="Describe the steps to prepare the recipe..."
            value={instructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
          />
        </Form.Field>

        <Form.Field>
          <label>Recipe Image</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => onImageAdded(e.target.files[0])}
          />
        </Form.Field>
      </Form>
    </div>
  );
}

export default IngredientsSection;