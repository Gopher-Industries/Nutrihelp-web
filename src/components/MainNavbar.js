import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import '../styles/mainNavbar.css'; 

const MainNavbar = () => {
  const { currentUser, logOut } = useContext(UserContext);

  return (
    <header className="header main-header">
      <nav className="nav main-nav">
        <div className="nav-container">
        <div className="logo-container">
          
        <img src="/images/logo.png" alt="Website Logo" className="logo" />

        </div>

        <div className="nav-links">
          {currentUser ? (
            <>
              <Link className="link nav-link" to='/dashboard'>Menu</Link>
              <Link className="link nav-link" to='/Meal'>Meal Planning</Link>

              <div className="dropdown">
                <Link className="link nav-link">Recipes</Link>
                <div className="dropdown-content">
                  <Link className="link dropdown-link" to='/CreateRecipe'>Create Recipe</Link>
                  <Link className="link dropdown-link" to='/SearchRecipes'>Search Recipes</Link>
                </div>
              </div>

              <div className="dropdown">
                <Link className="link nav-link">User</Link>
                <div className="dropdown-content">
                  <Link className="link dropdown-link" to='/DietaryRequirements'>Dietary Preference</Link>
                  <Link className="link dropdown-link" to='/userProfile'>Profile</Link>
                </div>
              </div>

              <Link className="link nav-link" to='/ScanProducts'>Scan Products</Link>

              <button className="link nav-link logout-button" onClick={logOut}>Log Out</button>
            </>
          ) : (
            <>
              <Link className="link dropdown-link" to='/home'>Home</Link>
              <Link className="link dropdown-link" to='/login'>Sign In</Link>
              <Link className="link dropdown-link" to='/signUp'>Create Account</Link>
            </>
          )}
        </div>
        </div>
      </nav>
    </header>
  );
};

export default MainNavbar;
