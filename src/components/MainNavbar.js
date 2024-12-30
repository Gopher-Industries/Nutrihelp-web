import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/user.context";
import "../styles/mainNavbar.css";

const MainNavbar = () => {
  const { currentUser, logOut } = useContext(UserContext);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`header main-header ${isScrolled ? "scrolled" : ""}`}>
      <nav className="nav main-nav">
        <div className="nav-container">
          <div className="logo-container">
            <img src="/images/logo.png" alt="Website Logo" className="logo" />
          </div>

          <div className="nav-links">
            {currentUser ? (
              <>
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

                <button className="link nav-link logout-button" onClick={logOut}>Log Out</button>
              </>
            ) : (
              <>
                <div className="dropdown">
                  <Link className="link nav-link" to="/home">Home</Link>
                  <div className="dropdown-content">
                    <a className="link dropdown-link" href="#services">Services</a>
                    <a className="link dropdown-link" href="#contact">Contact</a>
                  </div>
                </div>
                <Link className="link nav-link" to="/faq">FAQ</Link>
                <Link className="link dropdown-link" to="/login">Sign In</Link>
                <Link className="link dropdown-link" to="/signUp">Create Account</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default MainNavbar;
