import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/user.context";
import "../styles/mainNavbar.css";
import DarkModeToggle from "../routes/DarkModeToggle/DarkModeToggle";
import profileImage from '../images/profile.png';

const MainNavbar = () => {
  const { currentUser, logOut } = useContext(UserContext);
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
    <header className={`header main-header ${isScrolled ? "scrolled" : ""}`}>
      <nav className="nav main-nav">
        <div className="nav-container">
          {/* Logo */}
          <div className="logo-container">
            <img src="/images/logo.png" alt="Website Logo" className="logo" />
          </div>

          <div className="user-profile">
            {currentUser ? (
              <>
                <Link to="/userProfile" className="link profile-link" onClick={() => setIsMenuOpen(false)}>
                <img src={profileImage} alt="profile" className="profile-image" />
                <span className="profile-text">Profile</span>
                </Link>
                
              </>
            ) : (
              <span className="nav-placeholder"></span> // Keeps a permanent element
            )}
          </div>

          {/* Hamburger Button */}
          <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            ☰
          </button>

          {/* Fullscreen Menu */}
          <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>
            {currentUser ? (
              <>

                <DarkModeToggle />
                <Link className="link nav-link" to='/home' onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link className="link nav-link" to="/dashboard" onClick={() => setIsMenuOpen(false)}>Menu</Link>
                <Link className="link nav-link" to="/Meal" onClick={() => setIsMenuOpen(false)}>Meal Planning</Link>
                <Link className="link nav-link" to="/leaderboard" onClick={() => setIsMenuOpen(false)}>LeaderBoard</Link>

                <div className="dropdown">
                  <Link className="link nav-link">Recipes</Link>
                  <div className="dropdown-content">
                    <ul>
                      <li><Link className="link dropdown-link" to="/CreateRecipe" onClick={() => setIsMenuOpen(false)}>Create Recipe</Link></li>
                      <li><Link className="link dropdown-link" to="/SearchRecipes" onClick={() => setIsMenuOpen(false)}>Search Recipes</Link></li>
                    </ul>
                  </div>
                </div>

                <div className="dropdown">
                  <Link className="link nav-link">User</Link>
                  <div className="dropdown-content">
                    <ul>
                      <li><Link className="link dropdown-link" to="/DietaryRequirements" onClick={() => setIsMenuOpen(false)}>Dietary Preference</Link></li>
                    </ul>
                  </div>
                </div>

                <Link className="link nav-link" to="/ScanProducts" onClick={() => setIsMenuOpen(false)}>Scan Products</Link>

                

                <button className="link nav-link logout-button" onClick={() => { logOut(); setIsMenuOpen(false); }}>Log Out</button>
              </>
            ) : (
              <>
                <DarkModeToggle />
                <Link className="link nav-link" to='/home' onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link className="link nav-link" to='/login' onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                <Link className="link nav-link" to='/signUp' onClick={() => setIsMenuOpen(false)}>Create Account</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default MainNavbar;
