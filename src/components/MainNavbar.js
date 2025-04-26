import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/user.context";
import { useDarkMode } from "../routes/DarkModeToggle/DarkModeContext";  // Import useDarkMode from context
import DarkModeToggle from "../routes/DarkModeToggle/DarkModeToggle";  // Toggle button for dark mode
import "../styles/mainNavbar.css";
import TextToSpeech from "./TextToSpeech/TextToSpeech";  // Include TextToSpeech component
import profileImage from '../images/profile.png'; // Profile image for logged-in users

const MainNavbar = () => {
  const { currentUser, logOut } = useContext(UserContext);
  const { darkMode } = useDarkMode();  // Dark mode from context
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`header main-header ${isScrolled ? "scrolled" : ""} ${darkMode ? "bg-[#555555]" : "bg-white"}`}>
      <nav>
        <div className="flex justify-between items-center pr-8">
          <div className="">
            <img src="/images/logo.png" alt="Website Logo" className="logo" />
          </div>

          <div className="user-profile">
            {currentUser ? (
              <>
                <Link to="/userProfile" className="link profile-link" onClick={() => setIsMenuOpen(false)}>
                  <img src={profileImage} alt="profile" className="profile-image" />
                  <span className="profile-text">Profile</span>
                </Link>

                <Link className="link nav-link" to="/dashboard">Menu</Link>
                <Link className="link nav-link" to="/Meal">Meal Planning</Link>

                <div className="dropdown">
                  <Link className="link nav-link">Recipes</Link>
                  <div className="dropdown-content">
                    <Link className="link dropdown-link" to="/CreateRecipe">Create Recipe</Link>
                    <Link className="link dropdown-link" to="/SearchRecipes">Search Recipes</Link>
                  </div>
                </div>

                <div className="dropdown">
                  <Link className="link nav-link">User</Link>
                  <div className="dropdown-content">
                    <Link className="link dropdown-link" to="/DietaryRequirements">Dietary Preference</Link>
                    <Link className="link dropdown-link" to="/userProfile">Profile</Link>
                  </div>
                </div>

                <Link className="link nav-link" to="/ScanProducts">Scan Products</Link>
                <button className="link nav-link logout-button" onClick={() => { logOut(); setIsMenuOpen(false); }}>Log Out</button>
              </>
            ) : (
              <>
                <Link className="link nav-link" to="/home">Home</Link>
                <Link className="link nav-link" to="/login">Sign In</Link>
                <Link className="link nav-link" to="/signUp">Create Account</Link>
                <DarkModeToggle />
                <TextToSpeech />
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default MainNavbar;
