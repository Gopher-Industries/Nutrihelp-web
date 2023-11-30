import React from "react";
import NavigationBarSignedOut from "./NavigationBarSignedOut";
import Footer from "../footer/Footer";
import '../NavigationBarAndFooter.css'

// Navigation footer for when the user is not logged in
function NavigationBarAndFooterSignedOut() {
    return (
        <div className="page-container">
            <div className="content-wrap">
                <NavigationBarSignedOut />
            </div>
            <Footer />
        </div>
    )
}

export default NavigationBarAndFooterSignedOut