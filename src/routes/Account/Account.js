import { useState } from 'react';
import './Account.css';
import ShowStar from './ShowStar';

function Account() {
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    const mealDataList = [
        {
            title: "Simple No-Cook Meal Plan",
            date: "2024-11-19 6:30",
            star: 2,
            meals: [
                {
                    name: "Breakfast: Yogurt and Fruit Bowl",
                    ingredients: [
                        "Greek yogurt (unsweetened) 1 cup",
                        "Fresh fruits (e.g., berries, banana, kiwi) 1/2 cup",
                        "Granola or nuts 2 tablespoons",
                        "Honey or maple syrup (optional)"
                    ]
                },
                {
                    name: "Lunch: Tuna Salad Wrap",
                    ingredients: [
                        "Canned tuna (in water) 1 small can",
                        "Lettuce leaves or spinach",
                        "Whole-wheat tortilla or wrap",
                        "Cherry tomatoes (sliced) 1/4 cup",
                        "Mayonnaise or Greek yogurt 1 tablespoon",
                        "Lemon juice a few drops"
                    ]
                },
                {
                    name: "Dinner: Hummus and Veggie Platter",
                    ingredients: [
                        "Hummus 1/2 cup",
                        "Fresh veggies (e.g., carrots, cucumbers, bell peppers, cherry tomatoes)",
                        "Whole-grain crackers or pita bread",
                        "Olives (optional)"
                    ]
                }
            ]
        },
        {
            title: "Simple No-Cook Meal Plan (Day 2)",
            date: "2024-11-20 6:30",
            star: 3,
            meals: [
                {
                    name: "Breakfast: Overnight Oats",
                    ingredients: [
                        "Rolled oats 1/2 cup",
                        "Milk or plant-based milk 1/2 cup",
                        "Chia seeds 1 tablespoon",
                        "Fresh fruit for topping"
                    ]
                },
                {
                    name: "Lunch: Chicken Salad",
                    ingredients: [
                        "Cooked chicken breast (shredded) 1 cup",
                        "Lettuce or mixed greens",
                        "Avocado slices",
                        "Cherry tomatoes 1/4 cup",
                        "Salad dressing (optional)"
                    ]
                },
                {
                    name: "Dinner: Cheese and Crackers Platter",
                    ingredients: [
                        "Assorted cheeses",
                        "Whole-grain crackers",
                        "Fresh fruits (e.g., grapes, apple slices)",
                        "Nuts (optional)"
                    ]
                }
            ]
        }
    ];

    const [isTime, setTime] = useState(null);

    const handleMealClick = (title, star) => {
        setSelectedMeal({ title, star });
        setIsVisible(true);

        if (isTime) {
            clearTimeout(isTime);
        }

        const newTimeoutId = setTimeout(() => {
            setIsVisible(false);
            setSelectedMeal(null);
        }, 5000);

        setTime(newTimeoutId);

    };

    return (
        <div id="account">
            <div className="container">
                {mealDataList.map((mealData, index) => (
                    <MealPlan
                        key={index}
                        title={mealData.title}
                        date={mealData.date}
                        meals={mealData.meals}
                        star={mealData.star}
                        onMealClick={handleMealClick}
                    />
                ))}
            </div>
            {selectedMeal && (
                <ShowStar
                    title={selectedMeal.title}
                    star={selectedMeal.star}
                    isVisible={isVisible}
                />
            )}
        </div>
    );
}

function MealPlan({ title, date, meals, star, onMealClick }) {
    return (
        <div className="row">
            <div className="col-lg-12 account">
                <div className='col-lg-12 title'
                    onClick={() => onMealClick(title, star)}>
                    <h3>{title}</h3>
                    <p>{date}</p>
                </div>
                <hr />
                {meals.map((meal, index) => (
                    <div key={index} className='col-lg-12 message'>
                        <div className='left'>
                            <h5>{meal.name}</h5>
                        </div>
                        <div className='right'>
                            <p>Ingredients</p>
                            <ul>
                                {meal.ingredients.map((ingredient, idx) => (
                                    <li key={idx}>{ingredient}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Account;
