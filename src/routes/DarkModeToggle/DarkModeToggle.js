import { MoonIcon, SunIcon } from "lucide-react";
import React, { useEffect } from "react";
import { useDarkMode } from "./DarkModeContext";
import "./DarkModeToggle.css";

const DarkModeToggle = () => {
  const { darkMode, setDarkMode } = useDarkMode();
  console.log("🚀 ~ DarkModeToggle ~ darkMode:", darkMode);

  const handleToggle = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark-mode', !darkMode);
  };

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark-mode");

    if (isDarkMode !== darkMode) {
      setDarkMode(isDarkMode);
    }
  }, [darkMode, setDarkMode]);

  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={darkMode}
        onChange={handleToggle}
        aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
      />
      <span className="slider">
        {darkMode ? <SunIcon size={24} /> : <MoonIcon size={24} />}
      </span>
    </label>
  );
};

export default DarkModeToggle;
