const ingredientListDB = {
    'ingredient': [{ value: '', label: '', id: 0 }],
    'category': [{ value: '', label: '', id: 0 }]
}

const cuisineListDB = [{ value: '', label: '', id: 0 }];

const getIngredientsList = async () => {
    fetch('http://localhost:80/api/fooddata/ingredients', {
        method: 'GET',
        headers: {
            'Origin': 'http://localhost:3000/',
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            data.forEach(element => {
                ingredientListDB.ingredient.push({ 'value': element.name, 'label': element.name, 'id': element.id })
                ingredientListDB.category.push({ 'value': element.category, 'label': element.category, 'id': element.id })
            })
            console.log('Ingredients were fetched from DB')
        })
        .catch((error) => {
            // Handle errors
            console.error('Error sending message:', error);
        });
}

const getCuisineList = async () => {
    fetch('http://localhost:80/api/fooddata/cuisines', {
        method: 'GET',
        headers: {
            'Origin': 'http://localhost:3000/',
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            data.forEach(element => {
                cuisineListDB.push({ 'value': element.name, 'label': element.name, 'id': element.id })

            })
            console.log('Cuisines were fetched from DB')
        })
        .catch((error) => {
            // Handle errors
            console.error('Error sending message:', error);
        });
}


// legacy manual data input
const cuisineList = [
    { value: '', label: '', id: 0 },
    { value: 'Universal', label: 'Universal' },
    { value: 'French', label: 'French' },
    { value: 'Chinese', label: 'Chinese' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Italian', label: 'Italian' },
    { value: 'Greek', label: 'Greek' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'Lebanese', label: 'Lebanese' },
    { value: 'Turkey', label: 'Turkey' },
    { value: 'Thai', label: 'Thai' },
    { value: 'Indian', label: 'Indian' },
    { value: 'Mexican', label: 'Mexican' },
    { value: 'Vietnamese', label: 'Vietnamese' },
    { value: 'Australian', label: 'Australian' },
    { value: 'Other', label: 'Other' }
]

const ingredientList = {
    'ingredient': [{ value: '', label: '', id: 0 },
    { value: 'Fettuccine', label: 'Fettuccine', id: 2 },
    { value: 'Olive Oil', label: 'Olive Oil', id: 3 },
    { value: 'Chicken Thigh Fillets', label: 'Chicken Thigh Fillets', id: 4 },
    { value: 'Cherry tomatoes', label: 'Cherry tomatoes', id: 5 },
    { value: 'Pesto Sauce', label: 'Pesto Sauce', id: 6 },
    { value: 'Baby Rocket', label: 'Baby Rocket', id: 7 },
    { value: 'Salt', label: 'Salt', id: 8 }
    ],

    'category': [{ value: '', label: '', id: 0 },
    { value: 'Pantry', label: 'Pantry', id: 2 },
    { value: 'Pantry', label: 'Pantry', id: 3 },
    { value: 'Meat & seafood', label: 'Meat & seafood', id: 4 },
    { value: 'Fruit & vegetables', label: 'Fruit & vegetables', id: 5 },
    { value: 'Pantry', label: 'Pantry', id: 6 },
    { value: 'Fruit & vegetables', label: 'Fruit & vegetables', id: 7 },
    { value: 'Pantry', label: 'Pantry', id: 8 }
    ]
}
export { getCuisineList, getIngredientsList, cuisineList, ingredientList, cuisineListDB, ingredientListDB }