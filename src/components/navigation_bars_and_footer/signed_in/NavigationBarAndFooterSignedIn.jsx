import React from "react";
import NavigationBarSignedIn from "./NavigationBarSignedIn";
import Footer from "../footer/Footer";
import '../NavigationBarAndFooter.css'

// Navigation footer for when the user is not logged in
function NavigationBarAndFooterSignedIn() {
    return (
        <div className="page-container">
            <div className="content-wrap">
                <NavigationBarSignedIn />
            </div>
            <Footer />
        </div>
    )
}

export default NavigationBarAndFooterSignedIn