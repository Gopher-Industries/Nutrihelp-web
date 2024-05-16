import React, { useContext, useState } from 'react';

 

const Dashboard = () => {

      

    //html code including food items
    return (

      <main>

       
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />

        
          <div class="mainBox">
          
          <div class = "Title">
          <h2>MENU</h2>
          </div>
  
          <div class="daySelctionText">
            <h3>Today</h3>
          </div>
  
          <div class="breakfastBox">
            <div class = "breakfastBoxSub1">
            <div class="breakfastBoxSub1text1">
            <p>Banana Spice Smoothie</p>
          </div>
  
          <div class="breakfastBoxTitle">
            <p>Breakfast</p>
          </div>
            </div>
            <div class = "breakfastBoxSub2">
            <div class="breakfastBoxSub1text2">
            <p>Pumpkin Oatmeal</p>
          </div>
           </div>
            <div class = "breakfastBoxSub3">
            <div class="breakfastBoxSub1text3">
            <p>Carrot Ginger Juice</p>
          </div>
          </div>
          </div>
  
        
          <div class="breakfastBox2">
            <div class = "breakfastBoxSub21">
            <div class="breakfastBoxSub2text1">
            <p>Creamy Vegetable Soup</p>
            </div>
          </div>
            <div class = "breakfastBoxSub22">
            <div class="breakfastBoxSub2text2">
            <p>Harb Cauliflower Bean Dip</p>
            </div>
            </div>
            <div class = "breakfastBoxSub23">
            <div class="breakfastBoxSub2text3">
            <p>Spanish & Mushroom Omelette</p>
            </div>
            </div>
          </div>
  
          <div class="breakfastBoxTitle2">
            <p>Lunch</p>
          </div>
  
          <div class="breakfastBox3">
            <div class = "breakfastBoxSub31">
            <div class="breakfastBoxSub3text1">
              <p>Stuffed green Peppers</p>
            </div>
            </div>
            <div class = "breakfastBoxSub32">
            <div class="breakfastBoxSub3text2">
              <p>Easy Chicken Enchiladu Casserole</p>
            </div>
            </div>
            <div class = "breakfastBoxSub33"></div>
            <div class="breakfastBoxSub3text3">
              <p>Mushroom & Leek Risotto</p>
            </div>
          </div>
  
          <div class="breakfastBoxTitle3">
            <p>Dinner</p>
          </div>
  
  
          
          <div class = "widgetBox">

            <i class="fa-solid fa-palette"></i>

            <i class="fa-solid fa-paintbrush"></i>

            <i class="fa-solid fa-caret-down"></i>

            <i class="fa-solid fa-sun"></i>

            <i class="fa-solid fa-moon"></i>

            <i class="fa-solid fa-sliders"></i>



          </div>


          <div class = "widgetBox2">

          <i class="fa-solid fa-circle-plus"></i>

          <i class="fa-solid fa-caret-down"></i>

          <i class="fa-solid fa-utensils"></i>

          <i class="fa-solid fa-heart-pulse"></i>

          <i class="fa-solid fa-carrot"></i>

          <i class="fa-solid fa-calendar-check"></i>

          <i class="fa-solid fa-bars"></i>

        </div>

        <div class = "userfeedbackButton">

          <i class="fa-solid fa-user"></i>

          <i class="fa-solid fa-comment"></i>

        </div>
  
    
        </div>
      </main>
    );

  
}

export default Dashboard
