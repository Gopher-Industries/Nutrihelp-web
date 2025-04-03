import React, { useState } from 'react';
import './MealPlanA.css';  

import Avocado from './images/Avocado.png';
import Driedfruits from './images/Driedfruits.jpg';
import Darkchoc from './images/Darkchoc.jpg';
import NutButter from './images/NutButter.jpg';
import Rawbeef from './images/Rawbeef.jpg';
import Cheese from './images/cheese.jpg';
import Rice from './images/rice.jpg';
import Oil from './images/oil.jpg';
import Greek from './images/greek.jpg';
import Potatoes from './images/potatoes.jpg';
import Egg from './images/egg.jpg';
import Salmon from './images/salmon.jpg';
import Nuts from './images/nuts.jpg';
import Icecream from './images/icecream.jpg';
import Fish from './images/fish.jpg';
import Pasta from './images/pasta.jpg';



const foods = [
    { name: "Avocado", description: "Rich in monounsaturated fats and vitamin E." ,img: Avocado},
    { name: "Egg", description: "High in protein and essential nutrients." ,img: Egg},
    { name: "Dark Chocolate", description: "Contains antioxidants and can improve heart health." ,img: Darkchoc },
    { name: "Red Meat", description: "Rich in protein and iron." ,img: Rawbeef },
    { name: "Oily Fish", description: "High in omega-3 fatty acids." ,img:Fish},
    { name: "Nut Butter", description: "A good source of healthy fats and proteins.",img: NutButter },
    { name: "Cheese", description: "Rich in calcium and protein." ,img: Cheese },
    { name: "Dried Fruit", description: "High in sugar and calories, good for quick energy." ,img: Driedfruits},
    { name: "Rice", description: "Rice is a calorie-dense carb source that will significantly aid someone on a weight gaining journey. ",img:Rice },
    { name: "Nuts", description: "High in sugar and calories, good for quick energy." ,img:Nuts},
    { name: "Greek Yogurt", description: "Greek yogurt. Whole milk Greek yogurt is highTrusted Source in protein and provides a moderate amount of calories. " ,img:Greek},
    { name: "Ice Cream", description: "High in sugar and calories, good for quick energy." ,img:Icecream},
    { name: "Potatoes", description: "High in sugar and calories, good for quick energy.",img: Potatoes },
    { name: "Pasta", description: "High in sugar and calories, good for quick energy." ,img:Pasta},
    { name: "Oil", description: "High in sugar and calories, good for quick energy." ,img:Oil},
    { name: "Salmon", description: "Salmon and oily fish are rich in protein and healthy fats, especially omega-3 fatty acids." ,img:Salmon},
    
];

const MealPlanA = () => {
    const [showDescription, setShowDescription] = useState(Array(foods.length).fill(false));

    const toggleDescription = (index) => {
        const updatedShowDescription = [...showDescription];
        updatedShowDescription[index] = !updatedShowDescription[index];
        setShowDescription(updatedShowDescription);
    };

    return (
        <div className="meal-plan">
            <h1>Meal Plan A: High-Calorie Foods</h1>
            <div className="foods-container">
                {foods.map((food, index) => (
                    <div key={index} className="food-item">
                        <img src={food.img ? food.img : `path_to_images/${food.imgPath}`} alt={food.name} />
                        <button onClick={() => toggleDescription(index)}>{food.name}</button>
                        {showDescription[index] && <p>{food.description}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MealPlanA;
