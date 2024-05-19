import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Dashboard.css";

const DashboardD = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const navigate = useNavigate();

  const foodItems = [
    { category: 'breakfast', name: 'Banana Spice Smoothie' },
    { category: 'breakfast', name: 'Pumpkin Oatmeal' },
    { category: 'breakfast', name: 'Carrot Ginger Juice' },
    { category: 'lunch', name: 'Stuffed Green Peppers' },
    { category: 'lunch', name: 'Easy Chicken Enchilada Casserole' },
    { category: 'lunch', name: 'Mushroom & Leek Risotto' },
    { category: 'dinner', name: 'Mushroom & Leek Risotto' },
    { category: 'dinner', name: 'Cottage Cheese with Pineapple Chunks' },
    { category: 'dinner', name: 'Whole Grain Crackers' },
    { category: 'extras', name: 'Soup' },
    { category: 'extras', name: 'Salad' },
    { category: 'extras', name: 'Fruit' },
  ];

  useEffect(() => {
    if (searchTerm) {
      const filtered = foodItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAppointmentClick = () => {
    navigate('/appointment');
  };

  return (
    <main>
      <div className="mainBox">
        <div className="Title">
        <button onClick={handleAppointmentClick}>Book an Appointment</button>
          <h2>MENU
          
          </h2>
          
          
        </div>

        <div className="daySelectionText">
          <h3>Today</h3>
        </div>

        <div className="breakfastBox">
          <div className="breakfastBoxSub1">
            <div className="breakfastBoxSub1text1">
              <p>Banana Spice Smoothie</p>
            </div>
            <div className="breakfastBoxTitle">
              <p>Breakfast</p>
            </div>
          </div>
          <div className="breakfastBoxSub2">
            <div className="breakfastBoxSub1text2">
              <p>Pumpkin Oatmeal</p>
            </div>
          </div>
          <div className="breakfastBoxSub3">
            <div className="breakfastBoxSub1text3">
              <p>Carrot Ginger Juice</p>
            </div>
          </div>
        </div>

        <div className="breakfastBox2">
          <div className="breakfastBoxSub21">
            <div className="breakfastBoxSub2text1">
              <p>Creamy Vegetable Soup</p>
            </div>
          </div>
          <div className="breakfastBoxSub22">
            <div className="breakfastBoxSub2text2">
              <p>Harb Cauliflower Bean Dip</p>
            </div>
          </div>
          <div className="breakfastBoxSub23">
            <div className="breakfastBoxSub2text3">
              <p>Spanish & Mushroom Omelette</p>
            </div>
          </div>
        </div>

        <div className="breakfastBoxTitle2">
          <p>Lunch</p>
        </div>

        <div className="breakfastBox3">
          <div className="breakfastBoxSub31">
            <div className="breakfastBoxSub3text1">
              <p>Stuffed Green Peppers</p>
            </div>
          </div>
          <div className="breakfastBoxSub32">
            <div className="breakfastBoxSub3text2">
              <p>Easy Chicken Enchilada Casserole</p>
            </div>
          </div>
          <div className="breakfastBoxSub33">
            <div className="breakfastBoxSub3text3">
              <p>Mushroom & Leek Risotto</p>
            </div>
          </div>
        </div>

        <div className="breakfastBoxTitle3">
          <p>Dinner</p>
        </div>

        <div className="breakfastBox4">
          <div className="breakfastBoxSub41">
            <div className="breakfastBoxSub4text1">
              <p>Mushroom & Leek Risotto</p>
            </div>
          </div>
          <div className="breakfastBoxSub42">
            <div className="breakfastBoxSub4text2">
              <p>Cottage Cheese with Pineapple Chunks</p>
            </div>
          </div>
          <div className="breakfastBoxSub43">
            <div className="breakfastBoxSub4text3">
              <p>Whole Grain Crackers</p>
            </div>
          </div>
        </div>

        <div className="breakfastBoxTitle4">
          <p>Extras</p>
        </div>

        {filteredItems.map((item, index) => (
          <div className="menuItem" key={index}>
            <p>{item.name}</p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default DashboardD;
