import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/user.context';

const MainNavbar = () => {
  const { currentUser, logOut } = useContext(UserContext);

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-links">
          {currentUser ? (
            <>
              <Link className="link" to='/dashboard'>Menu</Link>
              <Link className="link" to='/Meal'>Meal Planning</Link>

              <div className="dropdown">
                <Link className="link">Recipes</Link>
                <div className="dropdown-content">
                  <Link className="link" to='/CreateRecipe'>Create Recipe</Link>
                  <Link className="link" to='/SearchRecipes'>Search Recipes</Link>
                </div>
              </div>

              <div className="dropdown">
                <Link className="link">User</Link>
                <div className="dropdown-content">
                  <Link className="link" to='/DietaryRequirements'>Dietary Preference</Link>
                  <Link className="link" to='/userProfile'>Profile</Link>
                </div>
              </div>

              <Link className="link" to='/ScanProducts'>Scan Products</Link>

              <button className="link" onClick={logOut}>Log Out</button>
            </>
          ) : (
            <>
              <Link className="link" to='/home'>Home</Link>
              <Link className="link" to='/login'>Sign In</Link>
              <Link className="link" to='/signUp'>Create Account</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default MainNavbar;
