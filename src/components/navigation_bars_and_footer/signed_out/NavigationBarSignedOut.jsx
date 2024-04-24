import './../NavigationBar.css'

import { Link, Outlet } from "react-router-dom";

import React from "react";

//Navigation bar for when the user is not logged in
function NavigationBarSignedOut() {
    return (

        <div className="main-page-body">
            <div className="navigation-bar-container">

                {/*NOTE: CSS for links is in "index.css"*/}
                <Link className="link" to='/'>NutriHelp</Link>

                <div className="navigation-links-container">
                    <Link className="link" to='/login'>Sign In</Link>
                    <Link className="link" to='/signUp'>Create Account</Link>
                </div>
            </div>

            {/* Outlet contains all the routes, specified in App.js */}
            <Outlet />

        </div >


    );
}

export default NavigationBarSignedOut