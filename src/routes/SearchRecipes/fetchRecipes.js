export async function fetchRecipes() {
  return {
    recipes: [
      {
        id: 1,
        recipe_name: "Butter Chicken",
        cuisine_name: "Indian",
        instructions: "Creamy, spiced chicken in a rich tomato sauce.",
        imageUrl: "https://images.immediate.co.uk/production/volatile/sites/30/2021/02/butter-chicken-ac2ff98.jpg?quality=90&webp=true&resize=375,341"
      },
      {
        id: 2,
        recipe_name: "Margherita Pizza",
        cuisine_name: "Italian",
        instructions: "Classic pizza with tomatoes, mozzarella, and basil.",
        imageUrl: "https://images.prismic.io/eataly-us/ed3fcec7-7994-426d-a5e4-a24be5a95afd_pizza-recipe-main.jpg?auto=compress,format"
      },
      {
        id: 3,
        recipe_name: "Sushi",
        cuisine_name: "Japanese",
        instructions: "Rice rolls with fresh fish and vegetables.",
        imageUrl: "https://cdn.britannica.com/52/128652-050-14AD19CA/Maki-zushi.jpg?w=400&h=300&c=crop"
      },
      {
        id: 4,
        recipe_name: "Kung Pao Chicken",
        cuisine_name: "Chinese",
        instructions: "Spicy chicken stir-fry with peanuts and bell peppers.",
        imageUrl: "https://smellylunchbox.com/wp-content/uploads/2022/04/kungpaochicken2-360x450.webp"
      }
    ]
  };
}