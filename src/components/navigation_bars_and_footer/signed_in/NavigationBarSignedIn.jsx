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
                <Link to='/'>
                <img className="logo" src="/images/logos_black.png" alt="NutriHelp Logo" style={{ width: '150px', height: '75px' }} />

                </Link>


                <div className="navigation-links-container">

                    {/* If the user is logged in, display their email.
                    Else, display "Not Logged in" */}
                    {/* {currentUser ? (
                        <h3 className="link">
                            {"Hello "}
                            <br />
                            {currentUser.email}
                        </h3>
                    ) : (
                        "Not logged in"
                    )} */}


                    <Link className="link" to='/dashboard'>Menu</Link>
                    <Link className="link" to='/Meal'>Meal Planning</Link>
                    

                    <div className="dropdown">
                    <Link className="link" >Recipies</Link>
                        <div className="dropdown-content">
                        <Link className="link" to='/CreateRecipe'>Create Recipe</Link>
                    <Link className="link" to='/SearchRecipes'>Search Recipes</Link>
                        </div>
                    </div>
                   
                    <div className="dropdown">
                    <Link className="link" >User</Link>
                        <div className="dropdown-content">
                        <Link className="link" to='/DietaryRequirements'>Dietary Preference</Link>
                    <Link className="link" to='/userProfile'>Profile</Link>
                        </div>
                    </div>
                    <Link className="link" to='/ScanProducts'>Scan Products</Link>
                   

                    {/* <button className="link-style-button" onClick={logout}>Logout</button> */}
                </div>
            </div>

            {/* Outlet contains all the routes, specified in App.js */}
            <Outlet />

        </div>
    );
}

export default NavigationBarSignedIn