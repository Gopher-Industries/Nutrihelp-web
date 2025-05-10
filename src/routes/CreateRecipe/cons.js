// File: CreateRecipe.js

// Simulated in-memory cuisine list
export const cuisineListDB = [
    { key: 'italian', text: 'Italian', value: 'Italian', label: 'Italian', id: 1 },
    { key: 'indian', text: 'Indian', value: 'Indian', label: 'Indian', id: 2 },
    { key: 'thai', text: 'Thai', value: 'Thai', label: 'Thai', id: 3 },
  ];
  
  // Simulated in-memory ingredient list
  export const ingredientListDB = {
    ingredient: [
      { key: 'onion', text: 'Onion', value: 'Onion', label: 'Onion', id: 101 },
      { key: 'tomato', text: 'Tomato', value: 'Tomato', label: 'Tomato', id: 102 },
      { key: 'garlic', text: 'Garlic', value: 'Garlic', label: 'Garlic', id: 103 },
      { key: 'chicken', text: 'Chicken', value: 'Chicken', label: 'Chicken', id: 104 },
    ]
  };
  
  // Simulate async API fetch for cuisine list
  export const getCuisineList = () => {
    // You can replace this with a real API call later
    console.log("Fetched cuisine list");
  };
  
  // Simulate async API fetch for ingredients
  export const getIngredientsList = () => {
    // You can replace this with a real API call later
    console.log("Fetched ingredient list");
  };
  