// import React, { useState } from "react";
// import { useDarkMode } from "../routes/DarkModeToggle/DarkModeContext";
// import DarkModeToggle from "../routes/DarkModeToggle/DarkModeToggle";
// import "../styles/mainNavbar.css";
// import SideMenu from "./SideMenu";
// import { Link } from "react-router-dom";
// import UserIcon from "./user-stroke-rounded.tsx";

// const MainNavbar = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const { darkMode } = useDarkMode();

//   const toggleMenu = () => setIsOpen(!isOpen);
 
//   return (
//     <>
//       <header className={`main-header ${darkMode ? "bg-[#333]" : ""}`}>
//         <nav className="main-nav">
//              <button className="hamburger" onClick={toggleMenu}>
//               ☰
//             </button>
        
         

//           <div className="logo-container">
//             <img src="/images/logo.png" alt="Website Logo" />
//           </div>
//           <div className="darkmode">
//             <Link to="/userProfile" onClick={toggleMenu}><UserIcon width={40} height={30} color="#fff" /></Link>
//           </div>
          
//         </nav>
//       </header>

//       <SideMenu isOpen={isOpen} toggleMenu={toggleMenu} />
//     </>
//   );
// };

// export default MainNavbar;

import React, { useState, useEffect } from "react";
import { useDarkMode } from "../routes/DarkModeToggle/DarkModeContext";
import DarkModeToggle from "../routes/DarkModeToggle/DarkModeToggle";
import "../styles/mainNavbar.css";
import SideMenu from "./SideMenu";
import { Link } from "react-router-dom";
import UserIcon from "./user-stroke-rounded.tsx";
import { px } from "framer-motion";

const MainNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { darkMode } = useDarkMode();

  // New state to track scroll position
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 200) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`main-header ${
          darkMode ? "bg-[#333]" : ""
        } ${scrolled ? "scrolled" : ""}`}
      >
        <nav className="main-nav">
          <button className="hamburger" onClick={toggleMenu}>
            ☰
          </button>

          <div className="logo-container">
            <img src="/images/logo.png" alt="Website Logo" />
          </div>


          <div className="nav-links">
            {currentUser ? (
              <>
                <Link className="link nav-link" to="/dashboard">
                  Menu
                </Link>
                <Link className="link nav-link" to="/Meal">
                  Meal Planning
                </Link>
                <Link className="link nav-link" to="/healthnews">
                  Health News
                </Link>

                <div className="dropdown">
                  <Link className="link nav-link">Recipes</Link>
                  <div className="dropdown-content">
                    <Link className="link dropdown-link" to="/CreateRecipe">
                      Create Recipe
                    </Link>
                    <Link className="link dropdown-link" to="/SearchRecipes">
                      Search Recipes
                    </Link>
                    <Link className="link dropdown-link" to="/RecipeRating">
                      Recipe rating
                    </Link>
                    <Link className="link dropdown-link" to="/UITimer">
                      UITimer
                    </Link>
                  </div>
                </div>

                <div className="dropdown">
                  <Link className="link nav-link">User</Link>
                  <div className="dropdown-content">
                    <Link
                      className="link dropdown-link"
                      to="/DietaryRequirements"
                    >
                      Dietary Preference
                    </Link>
                    <Link className="link dropdown-link" to="/userProfile">
                      Profile
                    </Link>
                  </div>
                </div>

                <Link className="link nav-link" to="/ScanProducts">
                  Scan Products
                </Link>

                <Link className="link nav-link" to="/preferences">
                  Allergies & Intolerances
                </Link>

                <Link className="link nav-link" to="/symptomassessment">
                  Symptom Assessment
                </Link>

                <Link className="link nav-link" to="/healthtools">
                  Health Tools
                </Link>

                <button
                  className="link nav-link logout-button"
                  onClick={logOut}
                >
                  Log Out
                </button>
                <TextToSpeech />
                <VoiceNavigation />
                <Link>
                  <DarkModeToggle />
                </Link>
              </>
            ) : (
              <>
                <Link
                  className={`link dropdown-link font-bold text-xl rounded-md  ${darkMode
                    ? "text-white hover:text-blue-300 hover:bg-blue-700"
                    : "text-[#333] hover:bg-blue-200 hover:text-blue-600"
                    }`}
                  to="/home"
                >
                  Home
                </Link>
                <Link
                  className={`link dropdown-link font-bold text-xl rounded-md  ${darkMode
                    ? "text-white hover:text-blue-300 hover:bg-blue-700"
                    : "text-[#333] hover:bg-blue-200 hover:text-blue-600"
                    }`}
                  to="/login"
                >
                  Sign In
                </Link>
                <Link
                  className={`link dropdown-link font-bold text-xl rounded-md  ${darkMode
                    ? "text-white hover:text-blue-300 hover:bg-blue-700"
                    : "text-[#333] hover:bg-blue-200 hover:text-blue-600"
                    }`}
                  to="/signUp"
                >
                  Create Account
                </Link>
                <Link>
                  <DarkModeToggle />
                </Link>
                <TextToSpeech />
                <VoiceNavigation />
                {/* Included from master branch */}

              </>
            )}

          <div className="darkmode">
            <Link to="/userProfile" onClick={toggleMenu}>
              <UserIcon width={40} height={30} color="#fff" />
            </Link>

          </div>
        </nav>
      </header>

      <SideMenu isOpen={isOpen} toggleMenu={toggleMenu} />
    </>
  );
};

export default MainNavbar;
