import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { useDarkMode } from "../routes/DarkModeToggle/DarkModeContext";
import "../styles/mainNavbar.css";
import UserIcon from "./user-stroke-rounded.tsx";
import SideMenu from "./SideMenu";

const ChevronDownIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M6 9l6 6 6-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BarcodeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4 7v10M7 7v10M10 7v10M12 7v10M14 7v10M17 7v10M20 7v10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const MainNavbar = () => {
  const { darkMode } = useDarkMode();
  const [openMenu, setOpenMenu] = useState(null); // "more" | "settings" | "account" | null
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  // close on outside click
  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  // close on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hover/focus open. Blur closes only when focus leaves wrapper.
  const menuHandlers = (name) => ({
    onMouseEnter: () => setOpenMenu(name),
    onMouseLeave: () => setOpenMenu((prev) => (prev === name ? null : prev)),
    onFocus: () => setOpenMenu(name),
    onBlur: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setOpenMenu((prev) => (prev === name ? null : prev));
      }
    },
  });

  return (
    <header
      className={`main-header ${darkMode ? "dark-mode" : ""} ${scrolled ? "scrolled" : ""
        }`}
    >
      <nav className="main-nav" ref={navRef} aria-label="Main">
        {/* Mobile Toggle */}
        <button
          className="nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo -> Home */}
        <Link to="/home" className="nav-logo" aria-label="NutriHelp Home">
          <img src="/images/logo.png" alt="NutriHelp logo" />
        </Link>

        {/* Left (Desktop) */}
        <div className="nav-left desktop-only">
          <Link to="/home" className="nav-link">
            Home
          </Link>

          <Link to="/security/breach-detection" className="nav-link" style={{
            color: '#2563eb',
            fontWeight: 'bold',
            border: '2px solid #2563eb',
            padding: '8px 20px',
            borderRadius: '9999px',
            marginLeft: '10px'
          }}>
            Breach Check
          </Link>

          <Link to="/ScanProducts" className="nav-link nav-link-icon">
            <span className="nav-icon" aria-hidden="true">
              <BarcodeIcon />
            </span>
            Scan
          </Link>

          {/* MORE */}
          <div className="nav-dropdown" {...menuHandlers("more")}>
            <button
              type="button"
              className="nav-button"
              aria-haspopup="true"
              aria-expanded={openMenu === "more"}
              aria-controls="menu-more"
            >
              More <span className="nav-icon"><ChevronDownIcon /></span>
            </button>

            {openMenu === "more" && (
              <div id="menu-more" className="dropdown-panel mega-menu" role="menu">
                <SideMenu onNavigate={() => setOpenMenu(null)} />
              </div>
            )}
          </div>
        </div>

        {/* Center search */}
        <div className="nav-search-container" role="search">
          <input
            id="nutrihelp-search"
            className="search-input-field"
            type="search"
            placeholder="Search"
            aria-label="Search NutriHelp"
          />
          <button className="search-button-icon" aria-label="Submit search">
            <Search size={20} />
          </button>
        </div>

        {/* Right (Desktop) */}
        <div className="nav-right desktop-only">
          {/* SETTINGS */}
          <div className="nav-dropdown" {...menuHandlers("settings")}>
            <button
              type="button"
              className="nav-button"
              aria-haspopup="true"
              aria-expanded={openMenu === "settings"}
              aria-controls="menu-settings"
            >
              Settings <span className="nav-icon"><ChevronDownIcon /></span>
            </button>

            {openMenu === "settings" && (
              <div id="menu-settings" className="dropdown-panel single-menu" role="menu">
                <Link className="dropdown-item" role="menuitem" to="/settings#display" onClick={() => setOpenMenu(null)}>
                  Display
                </Link>
                <Link className="dropdown-item" role="menuitem" to="/settings#font-size" onClick={() => setOpenMenu(null)}>
                  Font Size
                </Link>
                <Link className="dropdown-item" role="menuitem" to="/settings#accessibility" onClick={() => setOpenMenu(null)}>
                  Accessibility
                </Link>
                <Link className="dropdown-item" role="menuitem" to="/settings#notifications" onClick={() => setOpenMenu(null)}>
                  Notifications
                </Link>
                <Link className="dropdown-item" role="menuitem" to="/settings#language" onClick={() => setOpenMenu(null)}>
                  Language
                </Link>
                <Link className="dropdown-item" role="menuitem" to="/settings#voice-audio" onClick={() => setOpenMenu(null)}>
                  Voice &amp; Audio
                </Link>
              </div>
            )}
          </div>

          {/* ACCOUNT */}
          <div className="nav-dropdown" {...menuHandlers("account")}>
            <button
              type="button"
              className="nav-button nav-account"
              aria-haspopup="true"
              aria-expanded={openMenu === "account"}
              aria-controls="menu-account"
            >
              <span className="account-icon" aria-hidden="true">
                <UserIcon width={22} height={22} color="currentColor" />
              </span>
              Account <span className="nav-icon"><ChevronDownIcon /></span>
            </button>

            {openMenu === "account" && (
              <div id="menu-account" className="dropdown-panel single-menu" role="menu">
                <Link className="dropdown-item" role="menuitem" to="/userProfile" onClick={() => setOpenMenu(null)}>
                  Profile
                </Link>
                <Link className="dropdown-item" role="menuitem" to="/dietaryRequirements" onClick={() => setOpenMenu(null)}>
                  Dietary Preference
                </Link>
                <Link className="dropdown-item" role="menuitem" to="/preferences" onClick={() => setOpenMenu(null)}>
                  Allergies &amp; Intolerances
                </Link>
                <Link className="dropdown-item" role="menuitem" to="/login" onClick={() => setOpenMenu(null)}>
                  Log Out
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <Link to="/home" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/security/breach-detection" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Breach Check</Link>
            <Link to="/ScanProducts" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Scan</Link>

            <div className="mobile-divider"></div>
            <div className="mobile-section-title">More</div>
            <Link to="/createRecipe" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Create Recipe</Link>
            <Link to="/dashboard" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Meal Details</Link>
            <Link to="/HealthTools" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Health Tools</Link>

            <div className="mobile-divider"></div>
            <Link to="/settings" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
            <Link to="/userProfile" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Account</Link>
            <Link to="/login" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Log Out</Link>
          </div>
        )}
      </nav>
    </header >
  );
};

export default MainNavbar;
