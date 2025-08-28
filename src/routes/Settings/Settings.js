import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../routes/DarkModeToggle/DarkModeContext';
import { getFontSizeOptions, applyFontSize, getCurrentFontSize } from '../../utils/fontSizeManager';
import { MoonIcon, SunIcon } from "lucide-react";
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useDarkMode();
  const [fontSize, setFontSize] = useState('medium'); // Default to medium
  const [fontSizes, setFontSizes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [showFocusIndicators, setShowFocusIndicators] = useState(false);
  const [screenReaderSupport, setScreenReaderSupport] = useState(false);
  const [rememberPreferences, setRememberPreferences] = useState(true);
  const [showHelpfulTips, setShowHelpfulTips] = useState(true);

  // Initialize font sizes safely
  useEffect(() => {
    try {
      const options = getFontSizeOptions();
      setFontSizes(options);
      
      // Get current font size safely
      const currentSize = getCurrentFontSize();
      if (options[currentSize]) {
        setFontSize(currentSize);
        // Apply the saved font size immediately
        applyFontSize(options[currentSize].size);
      }
      
      // Load global dark mode preference
      const savedGlobalDarkMode = localStorage.getItem('globalDarkMode') === 'true';
      setDarkMode(savedGlobalDarkMode);
      
      // Apply global dark mode on initialization
      if (savedGlobalDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      
      // Load other saved settings
      const savedHighContrast = localStorage.getItem('highContrast') === 'true';
      const savedShowFocusIndicators = localStorage.getItem('showFocusIndicators') === 'true';
      const savedScreenReaderSupport = localStorage.getItem('screenReaderSupport') === 'true';
      const savedRememberPreferences = localStorage.getItem('rememberPreferences') !== 'false';
      const savedShowHelpfulTips = localStorage.getItem('showHelpfulTips') !== 'false';
      
      setHighContrast(savedHighContrast);
      setShowFocusIndicators(savedShowFocusIndicators);
      setScreenReaderSupport(savedScreenReaderSupport);
      setRememberPreferences(savedRememberPreferences);
      setShowHelpfulTips(savedShowHelpfulTips);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing font sizes:', error);
      setIsLoading(false);
    }
  }, []);

  // Ensure saved font size is applied on component mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      // Apply the saved font size to ensure consistency
      applyFontSize(savedFontSize);
    }
  }, []);

  // Apply font size to the document
  useEffect(() => {
    if (fontSize && fontSizes[fontSize]) {
      try {
        applyFontSize(fontSizes[fontSize].size);
      } catch (error) {
        console.error('Error applying font size:', error);
      }
    }
  }, [fontSize, fontSizes]);

  // Handle font size change
  const handleFontSizeChange = (newSize) => {
    if (fontSizes[newSize]) {
      setFontSize(newSize);
      // Save font size immediately to localStorage
      localStorage.setItem('fontSize', fontSizes[newSize].size);
    }
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Apply dark mode globally to the entire application
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Save dark mode preference globally
    localStorage.setItem('globalDarkMode', newDarkMode.toString());
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Handle save settings
  const handleSaveSettings = () => {
    // Save font size to localStorage
    if (fontSize && fontSizes[fontSize]) {
      localStorage.setItem('fontSize', fontSizes[fontSize].size);
    }
    
    // Save all other settings to localStorage
    localStorage.setItem('highContrast', highContrast);
    localStorage.setItem('showFocusIndicators', showFocusIndicators);
    localStorage.setItem('screenReaderSupport', screenReaderSupport);
    localStorage.setItem('rememberPreferences', rememberPreferences);
    localStorage.setItem('showHelpfulTips', showHelpfulTips);
    
    // Apply high contrast mode
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // Apply focus indicators
    if (showFocusIndicators) {
      document.body.classList.add('show-focus-indicators');
    } else {
      document.body.classList.remove('show-focus-indicators');
    }
    
    // Apply screen reader support
    if (screenReaderSupport) {
      document.body.classList.add('screen-reader-support');
    } else {
      document.body.classList.remove('screen-reader-support');
    }
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'settings-success-message';
    successMessage.textContent = 'Settings saved successfully!';
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
      if (document.body.contains(successMessage)) {
        document.body.removeChild(successMessage);
      }
    }, 3000);
    
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className={`settings-page ${darkMode ? 'dark-mode' : ''}`}>
        <div className="settings-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Safety check for fontSizes
  if (!fontSizes || Object.keys(fontSizes).length === 0) {
    return (
      <div className={`settings-page ${darkMode ? 'dark-mode' : ''}`}>
        <div className="settings-container">
          <div className="error-content">
            <h2>Settings Not Available</h2>
            <p>Please refresh the page to try again.</p>
            <button onClick={() => window.location.reload()} className="refresh-btn">
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get current font size safely
  const currentFontSize = fontSizes[fontSize] || fontSizes.medium || { size: '16px', label: 'Medium' };

  return (
    <div className={`settings-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className="settings-container">
        <div className="settings-header">
          <button 
            className="back-button"
            onClick={handleBack}
            aria-label="Go back"
          >
            ← Back
          </button>
          <h1 className="settings-title">Settings</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h2 className="section-title">Display Settings</h2>
            <p className="section-description">
              Customize your display preferences
            </p>
            
            <div className="dark-mode-toggle">
              <div className="toggle-label">
                <span>Dark Mode</span>
                <span>Switch between light and dark themes for better visibility</span>
              </div>
              <div 
                className={`toggle-switch ${darkMode ? 'active' : ''}`}
                onClick={handleDarkModeToggle}
                role="button"
                tabIndex={0}
                aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDarkModeToggle();
                  }
                }}
              >
                <div className="toggle-slider"></div>
                <div className="toggle-icon">
                  {darkMode ? <SunIcon size={20} /> : <MoonIcon size={20} />}
                </div>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2 className="section-title">Font Size</h2>
            <p className="section-description">
              Adjust the text size to make it easier to read for elderly users
            </p>
            
            <div className="font-size-options">
              {Object.entries(fontSizes).map(([key, value]) => (
                <button
                  key={key}
                  className={`font-size-option ${fontSize === key ? 'selected' : ''}`}
                  onClick={() => handleFontSizeChange(key)}
                >
                  <span className="font-size-label">{value.label}</span>
                  <span className={`font-size-preview font-size-${key}`}>Aa</span>
                </button>
              ))}
            </div>

            <div className="font-size-preview-container">
              <h3 className="preview-title">Preview:</h3>
              <p className="preview-text" style={{ fontSize: currentFontSize.size }}>
                This is how the text will appear with your selected font size. 
                The text should be comfortable to read for elderly users.
              </p>
            </div>
          </div>

          <div className="settings-section">
            <h2 className="section-title">Accessibility</h2>
            <p className="section-description">
              Additional settings for better accessibility
            </p>
            
            <div className="accessibility-options">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                />
                <span>High contrast mode</span>
              </label>
              
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={showFocusIndicators}
                  onChange={(e) => setShowFocusIndicators(e.target.checked)}
                />
                <span>Show focus indicators</span>
              </label>
              
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={screenReaderSupport}
                  onChange={(e) => setScreenReaderSupport(e.target.checked)}
                />
                <span>Enable screen reader support</span>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h2 className="section-title">User Preferences</h2>
            <p className="section-description">
              Customize your experience
            </p>
            
            <div className="preference-options">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={rememberPreferences}
                  onChange={(e) => setRememberPreferences(e.target.checked)}
                />
                <span>Remember my preferences</span>
              </label>
              
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={showHelpfulTips}
                  onChange={(e) => setShowHelpfulTips(e.target.checked)}
                />
                <span>Show helpful tips</span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button 
            className="cancel-btn"
            onClick={handleBack}
          >
            Cancel
          </button>
          <button 
            className="save-settings-btn"
            onClick={handleSaveSettings}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
