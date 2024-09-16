import { Link, Outlet, useNavigate } from "react-router-dom";
import React, { createContext, useState } from 'react';
import { MdDynamicFeed } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { AiFillBug } from "react-icons/ai";
import { FaUserPen } from "react-icons/fa6";
import oatsimg from '../../images/oats.jpg';
import juiceimg from '../../images/juice.jpeg';
import coffeeimg from '../../images/coffee.jpeg';
import breadimg from '../../images/bread.jpg';
import userimg from '../../images/user.png';
import riceimg from '../../images/rice.jpeg';
import chickenimg from '../../images/chicken.jpeg';
import eggsimg from '../../images/eggs.jpeg';
import vegimg from '../../images/vegs.jpeg';
import editimage from '../../images/edit.jpeg';
import helpimage from '../../images/help.png';
import logoutimage from '../../images/logout.png';
import chapatiimg from '../../images/chapati.jpeg';
import fishimg from '../../images/fish.jpeg';
import milkimg from '../../images/milk.jpeg';
import meatimg from '../../images/meat.jpg';

import leftarrow from '../../images/left.png';
import rightarrow from '../../images/right.png';
import './Dashboard.css'; // Import your CSS file here
const Dashboard = () => {
  
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
          name: 'Oats',
          imageUrl: oatsimg,
          details: {
              calories: 150,
              fats: 300,
              proteins: 500,
              vitamins: 80,
              sodium: 300
          }
          
      },
      {
          name: 'Juice',
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
          name: 'Coffee',
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
          name: 'Bread',
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
          name: 'Rice',
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
          name: 'Chicken',
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
          name: 'Eggs',
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
          name: 'Vegetables',
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
          name: 'Chapati',
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
          name: 'Fish',
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
          name: 'Milk',
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
          name: 'Meat',
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
    <div className="container-fluid bg-white">
<h2 className="text-dark text-view">View Meal Plans</h2>
<div className="custom-row w-100">
    <div className="container70 w-70">
        <h2 className="text-dark text-view">Choose Your Meal of the Day</h2>
        <input type="radio" class="myradio" name="meal-time" id="breakfast" />
        <label htmlFor="breakfast">Breakfast</label>
        <div className="row">
               
                
                <div className="food-selection">
                    <h3>Select Your Food, To Eat</h3>
                    <div className="food-items">
<img src={leftarrow} alt="left arrow" className="imgsign" />

<div className="food-item">
  <img src={oatsimg} alt="Oats" className="foodimg" />
  <span>Oats</span>
</div>

<div className="food-item">
  <img src={juiceimg} alt="Juice" className="foodimg" />
  <span>Juice</span>
</div>

<div className="food-item">
  <img src={coffeeimg} alt="Coffee" className="foodimg" />
  <span>Coffee</span>
</div>

<div className="food-item">
  <img src={breadimg} alt="Bread" className="foodimg" />
  <span>Bread</span>
</div>

<img src={rightarrow} alt="right arrow" className="imgsign" />
</div>
                </div>
            </div>
            <input type="radio" class="myradio" name="meal-time" id="lunch" />
        <label htmlFor="lunch">Lunch</label>
            <div className="row">
               
                
               <div className="food-selection">
                   <h3>Select Your Food, To Eat</h3>
                   <div className="food-items">
<img src={leftarrow} alt="left arrow" className="imgsign" />

<div className="food-item">
 <img src={riceimg} alt="Oats" className="foodimg" />
 <span>Rice</span>
</div>

<div className="food-item">
 <img src={chickenimg} alt="Juice" className="foodimg" />
 <span>Chicken</span>
</div>

<div className="food-item">
 <img src={eggsimg} alt="Coffee" className="foodimg" />
 <span>Eggs</span>
</div>

<div className="food-item">
 <img src={vegimg} alt="Bread" className="foodimg" />
 <span>Vegetables</span>
</div>

<img src={rightarrow} alt="right arrow" className="imgsign" />
</div>
               </div>
           </div>
           <input type="radio" class="myradio" name="meal-time" id="dinner" />
        <label htmlFor="dinner">Dinner</label>
           <div className="row">
               
                
               <div className="food-selection">
                   <h3>Select Your Food, To Eat</h3>
                   <div className="food-items">
<img src={leftarrow} alt="left arrow" className="imgsign" />

<div className="food-item">
 <img src={chapatiimg} alt="Oats" className="foodimg" />
 <span>Chapati</span>
</div>

<div className="food-item">
 <img src={fishimg} alt="Juice" className="foodimg" />
 <span>Fish</span>
</div>

<div className="food-item">
 <img src={milkimg} alt="Coffee" className="foodimg" />
 <span>Milk</span>
</div>

<div className="food-item">
 <img src={meatimg} alt="Bread" className="foodimg" />
 <span>Meat</span>
</div>

<img src={rightarrow} alt="right arrow" className="imgsign" />
</div>
               </div>
           </div>
    </div>
    
    <div className="container30 w-30">
        <h3>User Dashboard</h3>
        <div className="user-profile">
  <div className="profile-pic">
  <img src={userimg} alt="User Image" />
  </div>
  <div className="user-buttons">
    <button className="image-text-button">
    <img src={editimage} className="buttonimages" alt="Edit Profile" />
        <span className="button-text">Edit Profile</span></button>
    <button className="sign-out">
    <img src={logoutimage} className="buttonimages" alt="Log Out" />
    <span className="button-text"> Sign Out </span></button>
    <button className="help">
    <img src={helpimage} className="buttonimages" alt="Help" />
    <span className="button-text">Need Help?</span></button>
  </div>
</div>
<h3>Calories Associated with Food</h3>
  <div className="food-details">
  <h2>Juice</h2>
  <div className="food-content">
    <div className="food-image">
      <img src={juiceimg} alt="Juice" />
    </div>
    <div className="food-info">
      <p>Calories .......................... 100</p>
      <p>Protein ........................... 20g</p>
      <p>Carbs ............................. 10g</p>
      <p>Minerals .......................... 10</p>
      <p>Vitamins .................. A,B,C,D</p>
      <p>Fats .............................. 10mg</p>
      <p>Sugar ............................. 150</p>
    </div>
  </div>
  <button className="confirm-meal">Confirm Meal</button>
</div>
</div>
    </div>
</div>
);
};
export default Dashboard;
