import { Grid, GridColumn, GridRow, Image } from 'semantic-ui-react'
import React, { useContext, useState } from 'react';

const Dashboard = () => {



  //html code including food items
  return (

    <main>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />



      <div class="mainBox">

        <div class="Title">
          <h2>MENU</h2>
        </div>

        <div class="daySelctionText">
          <h3>Today</h3>
        </div>

        <div className='dashboard-grid'>
          <div class="widgetBox dashboard-grid-1">

            <i class="fa-solid fa-palette"></i>

            <i class="fa-solid fa-paintbrush"></i>

            <i class="fa-solid fa-caret-down"></i>

            <i class="fa-solid fa-sun"></i>

            <i class="fa-solid fa-moon"></i>

            <i class="fa-solid fa-sliders"></i>
          </div>
          <div className='dashboard-grid-2'>
          <Grid columns={3} divided >
            <GridRow className='menu-grid-wrap'>
              <GridColumn>
                <div className='menu-grid-box'>
                  <h3>Breakfast</h3>
                  <div className='selected-recipe-box'>
                    <p>Recipe 1</p>
                  </div>
                </div>
              </GridColumn>
              <GridColumn>
                <div className='menu-grid-box'>
                  <h3>Lunch</h3>
                  <div className='selected-recipe-box'>
                    <p>Recipe 1</p>
                  </div>
                </div>
              </GridColumn>
              <GridColumn>
                <div className='menu-grid-box'>
                  <h3>Dinner</h3>
                  <div className='selected-recipe-box'>
                    <p>Recipe 1</p>
                  </div>
                </div>
              </GridColumn>
            </GridRow>
          </Grid>
          </div>
        

          <div class="widgetBox2 dashboard-grid-3">

            <i class="fa-solid fa-circle-plus"></i>

            <i class="fa-solid fa-caret-down"></i>

            <i class="fa-solid fa-utensils"></i>

            <i class="fa-solid fa-heart-pulse"></i>

            <i class="fa-solid fa-carrot"></i>

            <i class="fa-solid fa-calendar-check"></i>

            <i class="fa-solid fa-bars"></i>

          </div>
        </div>






        {/* <div class="userfeedbackButton">

          <i class="fa-solid fa-user"></i>

          <i class="fa-solid fa-comment"></i>

        </div> */}


      </div>
    </main>
  );


}

export default Dashboard
