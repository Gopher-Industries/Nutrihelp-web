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