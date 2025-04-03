import React, { useState } from 'react';
import './DarkModeToggle.css';

const DarkModeToggle = () => {
    const [darkMode, setDarkMode] = useState(false);

    const handleClick = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark-mode', !darkMode);
    };

    return (
            <button onClick={handleClick} className='button'>
                {darkMode ? 'Dark Mode' : 'Light Mode'}
                
            </button>
            
    );
    
};

export default DarkModeToggle;