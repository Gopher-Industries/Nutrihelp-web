import React, { useState } from 'react';
import './DarkModeToggle.css';

const DarkModeToggle = () => {
    const [darkMode, setDarkMode] = useState(false);

    const handleToggle = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark-mode', !darkMode);
    };

    return (
        <label className="toggle-switch">
            <input type="checkbox" checked={darkMode} onChange={handleToggle} />
            <span className="slider"></span>
        </label>
    );
};

export default DarkModeToggle;


