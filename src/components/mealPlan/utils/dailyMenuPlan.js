// src/components/mealPlan/utils/dailyMenuPlan.js

export const DAILY_MENU_PLAN = {
  breakfast: [
    {
      title: "Oats with berries 🍓",
      meta: { prep: 5, cook: 5, servings: 1 },
      ingredients: [
        { name: "Rolled oats", qty: 60, unit: "g" },
        { name: "Mixed berries", qty: 100, unit: "g" },
        { name: "Milk (or alt.)", qty: 200, unit: "ml" }
      ],
      steps: [
        "Add oats and milk to a small pot; bring to a gentle simmer.",
        "Cook 4–5 minutes, stirring until creamy.",
        "Serve warm and top with fresh berries."
      ],
      nutrition: { calories: 320, protein: 12, carbs: 55, fat: 6, fiber: 8, sodium: 120 }
    },
    {
      title: "Green tea 🍵",
      meta: { prep: 1, cook: 3, servings: 1 },
      ingredients: [{ name: "Green tea bags", qty: 1, unit: "bag" }],
      steps: [
        "Heat water to just off the boil (80–85°C).",
        "Steep tea bag for 2–3 minutes; remove bag and serve."
      ],
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 }
    }
  ],

  lunch: [
    {
      title: "Grilled chicken with quinoa and veggies",
      meta: { prep: 10, cook: 20, servings: 1 },
      ingredients: [
        { name: "Chicken breast", qty: 150, unit: "g" },
        { name: "Quinoa", qty: 75, unit: "g" },
        { name: "Broccoli", qty: 120, unit: "g" },
        { name: "Carrot", qty: 1, unit: "pc" },
        { name: "Olive oil", qty: 1, unit: "tbsp" }
      ],
      steps: [
        "Season chicken; grill or pan-sear 6–7 min per side until cooked through.",
        "Rinse quinoa; simmer in 2× water for ~12–15 min, then fluff.",
        "Steam broccoli and sliced carrot until tender-crisp.",
        "Serve chicken over quinoa with veggies; drizzle olive oil."
      ],
      nutrition: { calories: 550, protein: 38, carbs: 46, fat: 18, fiber: 8, sodium: 280 }
    },
    {
      title: "Apple",
      meta: { prep: 1, cook: 0, servings: 1 },
      ingredients: [{ name: "Apple", qty: 1, unit: "pc" }],
      steps: ["Wash and enjoy as a snack."],
      nutrition: { calories: 95, protein: 0, carbs: 25, fat: 0, fiber: 4, sodium: 2 }
    }
  ],

  dinner: [
    {
      title: "Lentil soup with multigrain bread",
      meta: { prep: 10, cook: 25, servings: 1 },
      ingredients: [
        { name: "Red lentils", qty: 80, unit: "g" },
        { name: "Onion", qty: 0.5, unit: "pc" },
        { name: "Garlic", qty: 2, unit: "cloves" },
        { name: "Vegetable stock", qty: 500, unit: "ml" },
        { name: "Multigrain bread", qty: 2, unit: "slices" }
      ],
      steps: [
        "Sauté chopped onion and garlic in a little oil until soft.",
        "Add rinsed lentils and stock; simmer 18–20 min.",
        "Season to taste; serve with toasted multigrain bread."
      ],
      nutrition: { calories: 410, protein: 22, carbs: 64, fat: 8, fiber: 14, sodium: 420 }
    }
  ]
};
