import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/user.context";
import "../styles/mainNavbar.css";
import TextToSpeech from "./TextToSpeech/TextToSpeech";
import VoiceNavigation from "./VoiceControl/VoiceNavigation";

const SideMenu = ({ isOpen, toggleMenu }) => {
  const { currentUser, logOut } = useContext(UserContext);

  // Track which dropdown is open
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setOpenDropdown(null);
    }
  }, [isOpen]);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <div className={`side-menu ${isOpen ? "open" : ""}`}>
      {/* Close Button */}
      <button 
        className="close-button" 
        onClick={toggleMenu} 
        aria-label="Close menu"
      >
        &times; {/* This renders a nice cross */}
      </button>
      <div className="nav-links column">
        {currentUser ? (
          <>
            <Link to="/home" onClick={toggleMenu}>Home</Link>
            <Link to="/dashboard" onClick={toggleMenu}>Menu</Link>
            <Link to="/Meal" onClick={toggleMenu}>Meal Planning</Link>
            <Link to="/daily-plan-edit" onClick={toggleMenu}>Edit Daily Plan</Link>
            <Link to="/healthnews" onClick={toggleMenu}>Health News</Link>
            <Link to="/community" onClick={toggleMenu}>Community</Link>
            <Link to="/leaderboard" onClick={toggleMenu}>LeaderBoard</Link>
            <Link to="/HealthFAQ" onClick={toggleMenu}>HealthFAQ</Link>

            {/* Recipes Dropdown */}
            <div className="dropdown">
              <span
                className="dropdown-toggle"
                onClick={() => toggleDropdown("recipes")}
              >
                Recipes
              </span>
              {openDropdown === "recipes" && (
                <div className="dropdown-content">
                  <Link to="/CreateRecipe" onClick={toggleMenu}>Create Recipe</Link>
                  <Link to="/SearchRecipes" onClick={toggleMenu}>Search Recipes</Link>
                  <Link to="/RecipeRating" onClick={toggleMenu}>Recipe Rating</Link>
                  <Link to="/UiTimer" onClick={toggleMenu}>UiTimer</Link>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="dropdown">
              <span
                className="dropdown-toggle"
                onClick={() => toggleDropdown("user")}
              >
                User
              </span>
              {openDropdown === "user" && (
                <div className="dropdown-content">
                  <Link to="/DietaryRequirements" onClick={toggleMenu}>Dietary Preference</Link>
                  <Link to="/userProfile" onClick={toggleMenu}>Profile</Link>
                </div>
              )}
            </div>

            <Link to="/ScanProducts" onClick={toggleMenu}>Scan Products</Link>
            <Link to="/ScanBarcode" onClick={toggleMenu}>Scan Barcode</Link>
            <Link to="/preferences" onClick={toggleMenu}>Allergies & Intolerances</Link>
            <Link to="/symptomassessment" onClick={toggleMenu}>Symptom Assessment</Link>
            <Link to="/healthtools" onClick={toggleMenu}>Health Tools</Link>
            <Link to="/settings" onClick={toggleMenu}>Settings</Link>
            <button onClick={() => { logOut(); toggleMenu(); }}>Log Out</button>
            <TextToSpeech />
            <VoiceNavigation />
          </>
        ) : (
          <>
            {/* <DarkModeToggle />
            <Link to="/home" onClick={toggleMenu}>Home</Link>
            <Link to="/login" onClick={toggleMenu}>Sign In</Link>
            <Link to="/signUp" onClick={toggleMenu}>Create Account</Link>
            <TextToSpeech />
            <VoiceNavigation /> */}
            <Link to="/home" onClick={toggleMenu}>Home</Link>
            <Link to="/dashboard" onClick={toggleMenu}>Menu</Link>
            <Link to="/Meal" onClick={toggleMenu}>Meal Planning</Link>
            <Link to="/daily-plan-edit" onClick={toggleMenu}>Edit Daily Plan</Link>
            <Link to="/healthnews" onClick={toggleMenu}>Health News</Link>
            <Link to="/community" onClick={toggleMenu}>Community</Link>
            <Link to="/leaderboard" onClick={toggleMenu}>LeaderBoard</Link>

            {/* Recipes Dropdown */}
            <div className="dropdown">
              <span
                className="dropdown-toggle"
                onClick={() => toggleDropdown("recipes")}
              >
                Recipes
              </span>
              {openDropdown === "recipes" && (
                <div className="dropdown-content">
                  <Link to="/CreateRecipe" onClick={toggleMenu}>Create Recipe</Link>
                  <Link to="/SearchRecipes" onClick={toggleMenu}>Search Recipes</Link>
                  <Link to="/RecipeRating" onClick={toggleMenu}>Recipe Rating</Link>
                  <Link to="/UiTimer" onClick={toggleMenu}>UiTimer</Link>
                  <Link to="/HealthFAQ" onClick={toggleMenu}>HealthFAQ</Link>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="dropdown">
              <span
                className="dropdown-toggle"
                onClick={() => toggleDropdown("user")}
              >
                User
              </span>
              {openDropdown === "user" && (
                <div className="dropdown-content">
                  <Link to="/DietaryRequirements" onClick={toggleMenu}>Dietary Preference</Link>
                  <Link to="/userProfile" onClick={toggleMenu}>Profile</Link>
                </div>
              )}
            </div>

            <Link to="/ScanProducts" onClick={toggleMenu}>Scan Products</Link>
            <Link to="/ScanBarcode" onClick={toggleMenu}>Scan Barcode</Link>
            <Link to="/preferences" onClick={toggleMenu}>Allergies & Intolerances</Link>
            <Link to="/symptomassessment" onClick={toggleMenu}>Symptom Assessment</Link>
            <Link to="/healthtools" onClick={toggleMenu}>Health Tools</Link>
            <Link to="/settings" onClick={toggleMenu}>Settings</Link>
            <button onClick={() => { logOut(); toggleMenu(); }}>Log Out</button>
            <TextToSpeech />
            <VoiceNavigation />
          </>
        )}
      </div>
    </div>
  );
};

export default SideMenu;
