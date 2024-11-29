import './Meal.css'; // Import your CSS file here

import { Link, Outlet, useNavigate } from "react-router-dom";
import React, { createContext, useState } from 'react';

const Meal = () => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [totalNutrition, setTotalNutrition] = useState({
        calories: 0,
        proteins: 0,
        fats: 0,
        vitamins:0,
        sodium:0,
    });
    const [showBreakfast, setShowBreakfast] = useState(true);
    const [showLunch, setShowLunch] = useState(false);
    const [showDinner, setShowDinner] = useState(false);

    const toggleItemSelection = (item, mealType) => {
        setSelectedItems(prevSelectedItems => {
            const itemExists = prevSelectedItems.find(selectedItem => selectedItem.name === item.name);
            if (itemExists) {
                return prevSelectedItems.filter(selectedItem => selectedItem.name !== item.name);
            } else {
                return [...prevSelectedItems, { ...item, mealType }];
            }
        });
    };
    // List of food items
    const breakfast = [
        {
            name: 'Oatmeal',
            imageUrl: 'https://images.immediate.co.uk/production/volatile/sites/30/2023/08/Porridge-oats-d09fae8.jpg?quality=90&resize=440,400',
            details: {
                calories: 150,
                fats: 300,
                proteins: 500,
                vitamins: 80,
                sodium: 300
            }
            
        },
        {
            name: 'Omelete',
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQo6q5-FWYZNd5DgwNQd5_1JwN30iq7KXkEVQ&usqp=CAU',
            details: {
                calories: 150,
                fats: 300,
                proteins: 500,
                vitamins: 180,
                sodium: 100
            }
        },
        {
            name: 'Berry Smoothie',
            imageUrl: 'https://www.jessicagavin.com/wp-content/uploads/2020/07/berry-smoothie-8-1200.jpg',
            details: {
                calories: 200,
                fats: 100,
                proteins: 600,
                vitamins: 880,
                sodium: 30
            }
        },
        {
            name: 'Vegetable Stir-Fry',
            imageUrl: 'https://www.dinneratthezoo.com/wp-content/uploads/2019/02/vegetable-stir-fry-3.jpg',
            details: {
                calories: 500,
                fats: 700,
                proteins: 600,
                vitamins: 50,
                sodium: 60
            }
        },
    ];

    const lunch = [
        {
            name: 'Chocolate Cake',
            imageUrl: 'https://sugargeekshow.com/wp-content/uploads/2023/10/easy_chocolate_cake_slice.jpg',
            details: {
                calories: 350,
                fats: 500,
                proteins: 100,
                vitamins: 90,
                sodium: 5
            }
            
        },
        {
            name: 'Quinoa Salad',
            imageUrl: 'https://cooktoria.com/wp-content/uploads/2018/08/Mediterranean-Quinoa-Salad-SQ-1.jpg',
             details: {
                calories: 150,
                fats: 300,
                proteins: 500,
                vitamins: 30,
                sodium: 30
            }
        },
        {
            name: 'Chicken Wings',
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfd6SFL5sSIHlwcDV7db1dfWSpBCtyO6gujA&usqp=CAU',
            details: {
                calories: 20,
                fats: 600,
                proteins: 700,
                vitamins: 180,
                sodium: 30
            }
        },
        {
            name: 'Hotdog',
            imageUrl: 'https://hips.hearstapps.com/hmg-prod/images/delish-202104-airfryerhotdogs-044-1619472270.jpg?crop=0.448xw:1.00xh;0.0657xw,0&resize=980:*',
            details: {
                calories: 500,
                fats: 700,
                proteins: 600,
                vitamins: 220,
                sodium: 20
            }
        },
    ];

    const dinner = [
        {
            name: 'Broccoli',
            imageUrl: 'https://cdn.apartmenttherapy.info/image/upload/f_jpg,q_auto:eco,c_fill,g_auto,w_1500,ar_1:1/k%2Farchive%2Fd852987f86aeae8b65926f9e7a260c28285ea744',
            details: {
                calories: 250,
                fats: 500,
                proteins: 100,
                vitamins: 30,
                sodium: 90
            }
            
        },
        {
            name: 'Avocado',
            imageUrl: 'https://domf5oio6qrcr.cloudfront.net/medialibrary/5138/h0618g16207257173805.jpg',
             details: {
                calories: 150,
                fats: 100,
                proteins: 500,
                vitamins: 80,
                sodium: 300
            }
        },
        {
            name: 'Salmon',
            imageUrl: 'https://images.theconversation.com/files/249331/original/file-20181206-128208-1lepxpi.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1356&h=668&fit=crop',
            details: {
                calories: 800,
                fats: 700,
                proteins: 900,
                vitamins: 880,
                sodium: 0
            }
        },
        {
            name: 'Oatmeal2',
            imageUrl: 'https://images.immediate.co.uk/production/volatile/sites/30/2023/08/Porridge-oats-d09fae8.jpg?quality=90&resize=440,400',
            details: {
                calories: 150,
                fats: 300,
                proteins: 500,
                vitamins: 680,
                sodium: 30
            }
            
        },
    ];
       // Function to find the details for a specific meal type
       const findItemDetails = itemName => {
        // Search in breakfast array
        let item = breakfast.find(item => item.name === itemName);
        if (item) return item.details;

        // Search in lunch array
        item = lunch.find(item => item.name === itemName);
        if (item) return item.details;

        // Search in dinner array
        item = dinner.find(item => item.name === itemName);
        if (item) return item.details;

        // Item not found, return empty details
        return { calories: 0, proteins: 0, fats: 0, vitamins:0, sodium:0};
    };
      // Update total nutrition whenever selected items change
      React.useEffect(() => {
        let totalCalories = 0;
        let totalProteins = 0;
        let totalFats = 0;
        let totalVitamins = 0;
        let totalSodium = 0;

        selectedItems.forEach(item => {
            const details = findItemDetails(item.name);
            totalCalories += details.calories;
            totalProteins += details.proteins;
            totalFats += details.fats;
            totalVitamins += details.vitamins;
            totalSodium += details.sodium;
        });

        setTotalNutrition({ calories: totalCalories, proteins: totalProteins, fats: totalFats, vitamins: totalVitamins, sodium: totalSodium });
    }, [selectedItems]);

    return (
        <div>
            <header>
                <h1>What is Your Meal Plan Today?</h1>
            </header>

            <div className="mealcontainer">
                <div style={{ width: "100%" }}>
                    <h3 className='heading' style={{ marginTop: "20px" }} onClick={() => setShowBreakfast(!showBreakfast)}>Breakfast</h3>
                    <div className="menuContainer" style={{ maxHeight: showBreakfast ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.5s ease' }}>
                    {showBreakfast && breakfast.map(item => (
                            <div
                                className={`food-item ${selectedItems.some(selected => selected.name === item.name) ? 'selected' : ''}`}
                                key={item.name}
                                onClick={() => toggleItemSelection(item, 'breakfast')}
                            >
                                <img src={item.imageUrl} alt={item.name} />
                                <div className='names'>
                                    <b>{item.name}</b>
                                </div>
                            </div>
                        ))}
                    </div>
                    <h3 className='heading' onClick={() => setShowLunch(!showLunch)}>Lunch</h3>
                    <div className="menuContainer" style={{ maxHeight: showLunch ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.5s ease' }}>
                    {showLunch && lunch.map(item => (
                            <div
                                className={`food-item ${selectedItems.some(selected => selected.name === item.name) ? 'selected' : ''}`}
                                key={item.name}
                                onClick={() => toggleItemSelection(item, 'lunch')}
                            >
                                <img src={item.imageUrl} alt={item.name} />
                                <div className='names'>
                                    <b>{item.name}</b>
                                </div>
                            </div>
                        ))}
                    </div>
                    <h3 className='heading' onClick={() => setShowDinner(!showDinner)}>Dinner</h3>
                    <div className="menuContainer" style={{ maxHeight: showDinner ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.5s ease' }}>
                    {showDinner && dinner.map(item => (
                            <div
                                className={`food-item ${selectedItems.some(selected => selected.name === item.name) ? 'selected' : ''}`}
                                key={item.name}
                                onClick={() => toggleItemSelection(item, 'dinner')}
                            >
                                <img src={item.imageUrl} alt={item.name} />
                                <div className='names'>
                                    <b>{item.name}</b>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="details-container">
                    <div className="details-box">
                        <h3 style={{ fontSize: "2rem" }}>Nutritional Value</h3>

                        <div>
                            <ul style={{ fontSize: "1.5rem", marginTop: "0.5rem" }}>
                            <li>Calories: {totalNutrition.calories}</li>
                        <li>Proteins: {totalNutrition.proteins}g</li>
                        <li>Fats: {totalNutrition.fats}g</li>
                        <li>Vitamins: {totalNutrition.vitamins}mg</li>
                        <li>Sodium: {totalNutrition.sodium}mg</li>
                            </ul>
                        </div>
                    </div>
                    <Link className="link" to="/dashboard" state={{ selectedItems, totalNutrition }}>
                        <button className="viewplan">View Meal Plan</button>
                    </Link>


                </div>
            </div>
        </div>
    );
};

export default Meal;
