import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../../../context/user.context";
import { getAuth } from "firebase/auth";
import './../NavigationBar.css'

// Navigation bar for when the user is not logged in
function NavigationBarSignedIn() {

    const navigate = useNavigate()

    const auth = getAuth() //Obtain the signed-in/authenticated user

    //Obtain the current user from the UserContext (from user.context.jsx)
    const { currentUser } = useContext(UserContext)
    console.log("current user email: " + currentUser.email) //Print information of the current user to the console

    const { setCurrentUser } = useContext(UserContext); // Extract context methods


    //Define the logout function
    const logout = () => {
        // currentUser = null;
        auth.signOut(); //Sign out of the signed-in/authenticated user
        navigate('/') //Navigate to the first page (i.e., "Login" page)
        setCurrentUser(null)
    }

    return (

        <div>
            <div className="navigation-bar-container">

                {/*NOTE: CSS for links is in "index.css"*/}
                <Link className="link" to='/'>NutriHelp</Link>

                <div className="navigation-links-container">

                    {/* If the user is logged in, display their email.
                    Else, display "Not Logged in" */}
                    {currentUser ? (
                        <h3 className="single-line">
                            {"Logged in as "}
                            <br />
                            {currentUser.email}
                        </h3>
                    ) : (
                        "Not logged in"
                    )}

                    <Link className="link" to='/'>Groceries</Link>
                    <Link className="link" to='/'>Nutrient Intake Report</Link>
                    <Link className="link" to='/'>Meal Planning</Link>
                    <Link className="link" to='/CreateRecipe'>Create Recipe</Link>
                    <Link className="link" to='/SearchRecipes'>Search Recipes</Link>

                    <button className="link-style-button" onClick={logout}>Logout</button>
                </div>
            </div>

            {/* Outlet contains all the routes, specified in App.js */}
            <Outlet />

        </div>
    );
}

export default NavigationBarSignedIn