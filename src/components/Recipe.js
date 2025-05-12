import React from 'react';
import '../styles/recipe.css';

function Recipe() {
  return (
    <div className="landing-container">
        <div className="logo-and-menu">
            <img src="./images/logo.png" alt="NutriHelp Logo" className="logo" />
            <div className="menu">
                <div className="menu-item">
                    <span>Your Menu</span>
                </div>
                <div className="menu-item">
                    <span>Recipes</span>
                </div>
                <div className="menu-item">
                    <span>Shopping list</span>
                </div>
                <div className="menu-item">
                    <span>Settings</span>
                </div>
                <div className="menu-item">
                    <span>Profile</span>
                </div>
            </div>
        </div>

        <div className="content-container">
            <div className="label">
                <div className="text-wrapper">Recipes</div>
            </div>
            <div className="search-box">
                < input type="text" placeholder="Search Recipes"/> 
            </div>
            <div className="label1">
                <div className="text-wrapper1">Chicken Burger</div>
            </div>
            <div className="label2">
                <div className="text-wrapper2">Ingredients</div>
                <div className="text-wrapper3">Instructions</div>
            </div>
            <div className="containers">
                <div className="container1">
                    <div className="box">
                        <div className="rectangle">
                            <p className="box-text">Buns</p>
                            <img src="./images/close.png" alt="Close" className="close-image" />
                        </div>
                        <div className="rectangle">
                            <p className="box-text">Chicken Patty</p>
                            <img src="./images/close.png" alt="Close" className="close-image" />
                        </div>
                        <div className="rectangle">
                            <p className="box-text">Lettuce</p>
                            <img src="./images/close.png" alt="Close" className="close-image" />
                        </div>
                        <div className="rectangle">
                            <p className="box-text">Tomato</p>
                            <img src="./images/close.png" alt="Close" className="close-image" />
                        </div>
                        <div className="rectangle">
                            <p className="box-text">Cheese</p>
                            <img src="./images/close.png" alt="Close" className="close-image" />
                        </div>
                        <div className="rectangle">
                            <p className="box-text">Mayonnaise</p>
                            <img src="./images/close.png" alt="Close" className="close-image" />
                        </div>
                        <div className="rectangle">
                            <p className="box-text">Cucumber</p>
                            <img src="./images/close.png" alt="Close" className="close-image" />
                        </div>
                    </div>
                </div>
                <div className="container2">
                    <div className="text-wrapper4">
                        <p> 1. Fry two pieces of buns in oil. </p>
                        <p> 2. Season the chicken fillet according to your taste.</p>
                        <p> 3. Start stacking the bun with sauce, lettuce, tomato, chicken patty, cheese respectively.</p>
                        <p> 4. Cover the top of the burger with the other piece of semi bun. </p>
                        <p> 5. Enjoy your food. </p>
                    </div>
                </div>
            </div>

            <button className="add-to-menu-button">Add to your menu</button>

        </div>

    </div>
  );
}

export default Recipe;