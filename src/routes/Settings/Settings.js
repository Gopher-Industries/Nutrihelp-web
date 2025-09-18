import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../routes/DarkModeToggle/DarkModeContext';
import { getFontSizeOptions, applyFontSize, getCurrentFontSize } from '../../utils/fontSizeManager';
import { testVoiceSettings, saveVoiceSettings } from '../../utils/voiceSettingsManager';
import { MoonIcon, SunIcon, Bell, Globe, Save, Volume2 } from "lucide-react";
import notificationPreferencesApi from '../../services/notificationPreferencesApi';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useDarkMode();
  const [fontSize, setFontSize] = useState('medium');
  const [fontSizes, setFontSizes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [showFocusIndicators, setShowFocusIndicators] = useState(false);
  const [screenReaderSupport, setScreenReaderSupport] = useState(false);
  const [rememberPreferences, setRememberPreferences] = useState(true);
  const [showHelpfulTips, setShowHelpfulTips] = useState(true);
  
  // Settings states
  const [autoSave, setAutoSave] = useState(true);
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState({
    mealReminders: true,
    waterReminders: true,
    healthTips: true,
    weeklyReports: false,
    systemUpdates: true
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // API integration states
  const [isLoadingFromAPI, setIsLoadingFromAPI] = useState(false);
  const [isSavingToAPI, setIsSavingToAPI] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(null);
  
  // Voice/Audio settings states
  const [voiceSettings, setVoiceSettings] = useState({
    enabled: true,
    volume: 0.8,
    rate: 1.0,
    pitch: 1.0,
    autoPlay: false,
    voice: 'default'
  });

  // Language options
  const languageOptions = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];

  // Initialize settings
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        setIsLoadingFromAPI(true);
        setApiError(null);
        
        // Initialize font size options
        const options = getFontSizeOptions();
        setFontSizes(options);
        
        const currentSize = getCurrentFontSize();
        if (options[currentSize]) {
          setFontSize(currentSize);
          applyFontSize(options[currentSize].size);
        }
        
        // Try to load settings from API first
        try {
          const apiPreferences = await notificationPreferencesApi.getAllUserPreferences();
          
          if (apiPreferences) {
            // Set notification preferences from API
            if (apiPreferences.notification_preferences) {
              setNotifications(apiPreferences.notification_preferences);
            }
            
            // Set language from API
            if (apiPreferences.language) {
              setLanguage(apiPreferences.language);
            }
            
            // Set theme from API
            if (apiPreferences.theme) {
              const isDarkMode = apiPreferences.theme === 'dark';
              setDarkMode(isDarkMode);
              if (isDarkMode) {
                document.body.classList.add('dark-mode');
              } else {
                document.body.classList.remove('dark-mode');
              }
            }
            
            // Set font size from API
            if (apiPreferences.font_size) {
              // Find matching font size option
              const matchingSize = Object.keys(options).find(key => 
                options[key].size === apiPreferences.font_size
              );
              if (matchingSize) {
                setFontSize(matchingSize);
                applyFontSize(apiPreferences.font_size);
              }
            }
            
            setApiSuccess('Settings loaded from cloud successfully');
          }
        } catch (apiError) {
          console.error('Error loading settings from API:', apiError);
          setApiError('Failed to load settings from cloud, using local settings');
          
          // Fallback to local storage
          loadSettingsFromLocalStorage();
        }
        
        // Load other settings from local storage (not handled by API yet)
        const savedHighContrast = localStorage.getItem('highContrast') === 'true';
        const savedShowFocusIndicators = localStorage.getItem('showFocusIndicators') === 'true';
        const savedScreenReaderSupport = localStorage.getItem('screenReaderSupport') === 'true';
        const savedRememberPreferences = localStorage.getItem('rememberPreferences') !== 'false';
        const savedShowHelpfulTips = localStorage.getItem('showHelpfulTips') !== 'false';
        const savedAutoSave = localStorage.getItem('autoSave') !== 'false';
        const savedVoiceSettings = JSON.parse(localStorage.getItem('voiceSettings') || '{}');
        
        setHighContrast(savedHighContrast);
        setShowFocusIndicators(savedShowFocusIndicators);
        setScreenReaderSupport(savedScreenReaderSupport);
        setRememberPreferences(savedRememberPreferences);
        setShowHelpfulTips(savedShowHelpfulTips);
        setAutoSave(savedAutoSave);
        setVoiceSettings({ ...voiceSettings, ...savedVoiceSettings });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing settings:', error);
        setApiError('Error initializing settings');
        setIsLoading(false);
      } finally {
        setIsLoadingFromAPI(false);
      }
    };
    
    initializeSettings();
  }, []);

  // Load settings from local storage (fallback function)
  const loadSettingsFromLocalStorage = () => {
    try {
      const savedGlobalDarkMode = localStorage.getItem('globalDarkMode') === 'true';
      const savedLanguage = localStorage.getItem('language') || 'en';
      const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '{}');
      
      setDarkMode(savedGlobalDarkMode);
      setLanguage(savedLanguage);
      setNotifications({ ...notifications, ...savedNotifications });
      
      if (savedGlobalDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    } catch (error) {
      console.error('Error loading settings from local storage:', error);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasUnsavedChanges) {
      const timer = setTimeout(() => {
        saveSettings();
        setHasUnsavedChanges(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [autoSave, hasUnsavedChanges, fontSize, darkMode, highContrast, showFocusIndicators, screenReaderSupport, rememberPreferences, showHelpfulTips, language, notifications, voiceSettings]);

  // Apply font size
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
      localStorage.setItem('fontSize', fontSizes[newSize].size);
      setHasUnsavedChanges(true);
    }
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    localStorage.setItem('globalDarkMode', newDarkMode.toString());
    setHasUnsavedChanges(true);
  };

  // Handle notification toggle
  const handleNotificationToggle = async (key) => {
    console.log('🔧 Debug: handleNotificationToggle called with key:', key);
    console.log('🔧 Debug: Current notifications:', notifications);
    console.log('🔧 Debug: Current autoSave:', autoSave);
    
    const newNotifications = {
      ...notifications,
      [key]: !notifications[key]
    };
    
    console.log('🔧 Debug: New notifications:', newNotifications);
    
    setNotifications(newNotifications);
    setHasUnsavedChanges(true);
    
    // Show immediate feedback
    showSuccessMessage(`${key} notification ${newNotifications[key] ? 'enabled' : 'disabled'}`);
    
    // If auto-save is enabled, save to API immediately
    if (autoSave) {
      try {
        setIsSavingToAPI(true);
        setApiError(null);
        
        console.log('🔧 Debug: Attempting to save to API...');
        const response = await notificationPreferencesApi.updateNotificationPreferences(newNotifications);
        
        if (response.success) {
          setApiSuccess('Notification preferences saved to cloud');
          setHasUnsavedChanges(false);
          console.log('✅ Debug: API save successful');
        } else {
          setApiError(response.message || 'Failed to save notification preferences');
          console.log('❌ Debug: API save failed:', response.message);
        }
      } catch (error) {
        console.error('❌ Debug: Error saving notification preferences:', error);
        setApiError('Failed to save to cloud, saved locally');
      } finally {
        setIsSavingToAPI(false);
      }
    } else {
      console.log('🔧 Debug: Auto-save disabled, only saved locally');
    }
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setHasUnsavedChanges(true);
  };

  // Handle voice settings change
  const handleVoiceSettingChange = (setting, value) => {
    setVoiceSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    setHasUnsavedChanges(true);
  };

  // Test voice settings
  const handleTestVoice = () => {
    testVoiceSettings(voiceSettings);
  };

  // Save all settings
  const saveSettings = async () => {
    try {
      setIsSavingToAPI(true);
      setApiError(null);
      
      // Save settings that are handled by API
      const apiPreferences = {
        notification_preferences: notifications,
        language: language,
        theme: darkMode ? 'dark' : 'light',
        font_size: fontSizes[fontSize]?.size || '16px'
      };
      
      // Try to save to API first
      try {
        const response = await notificationPreferencesApi.updateAllUserPreferences(apiPreferences);
        
        if (response.success) {
          setApiSuccess('Settings saved to cloud successfully!');
        } else {
          setApiError(response.message || 'Failed to save some settings to cloud');
        }
      } catch (apiError) {
        console.error('Error saving to API:', apiError);
        setApiError('Failed to save to cloud, saved locally');
      }
      
      // Always save to local storage as backup and for settings not handled by API
      saveSettingsToLocalStorage();
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setApiError('Error saving settings');
      saveSettingsToLocalStorage();
    } finally {
      setIsSavingToAPI(false);
    }
  };

  // Save settings to local storage
  const saveSettingsToLocalStorage = () => {
    if (fontSize && fontSizes[fontSize]) {
      localStorage.setItem('fontSize', fontSizes[fontSize].size);
    }
    
    localStorage.setItem('highContrast', highContrast);
    localStorage.setItem('showFocusIndicators', showFocusIndicators);
    localStorage.setItem('screenReaderSupport', screenReaderSupport);
    localStorage.setItem('rememberPreferences', rememberPreferences);
    localStorage.setItem('showHelpfulTips', showHelpfulTips);
    localStorage.setItem('autoSave', autoSave);
    localStorage.setItem('language', language);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    localStorage.setItem('globalDarkMode', darkMode.toString());
    saveVoiceSettings(voiceSettings);
    
    // Apply accessibility settings
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    if (showFocusIndicators) {
      document.body.classList.add('show-focus-indicators');
    } else {
      document.body.classList.remove('show-focus-indicators');
    }
    
    if (screenReaderSupport) {
      document.body.classList.add('screen-reader-support');
    } else {
      document.body.classList.remove('screen-reader-support');
    }
    
    showSuccessMessage('Settings saved successfully!');
  };

  // Show success message
  const showSuccessMessage = (message) => {
    const successMessage = document.createElement('div');
    successMessage.className = 'settings-success-message';
    successMessage.textContent = message;
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
      if (document.body.contains(successMessage)) {
        document.body.removeChild(successMessage);
      }
    }, 3000);
  };

  // Handle back navigation
  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  // Handle save settings
  const handleSaveSettings = () => {
    saveSettings();
    setHasUnsavedChanges(false);
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

  const currentFontSize = fontSizes[fontSize] || fontSizes.medium || { size: '16px', label: 'Medium' };

  // Define all settings sections
  const allSections = [
    {
      id: 'display',
      title: 'Display Settings',
      description: 'Customize your display preferences',
      content: (
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
      )
    },
    {
      id: 'font',
      title: 'Font Size',
      description: 'Adjust the text size to make it easier to read for elderly users',
      content: (
        <>
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
        </>
      )
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      description: 'Additional settings for better accessibility',
      content: (
        <div className="accessibility-options">
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              className="checkbox-input"
              checked={highContrast}
              onChange={(e) => {
                setHighContrast(e.target.checked);
                setHasUnsavedChanges(true);
              }}
            />
            <div>
              <div className="checkbox-label">High contrast mode</div>
              <div className="checkbox-description">Enhance text and background contrast</div>
            </div>
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              className="checkbox-input"
              checked={showFocusIndicators}
              onChange={(e) => {
                setShowFocusIndicators(e.target.checked);
                setHasUnsavedChanges(true);
              }}
            />
            <div>
              <div className="checkbox-label">Show focus indicators</div>
              <div className="checkbox-description">Highlight focused elements for better navigation</div>
            </div>
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              className="checkbox-input"
              checked={screenReaderSupport}
              onChange={(e) => {
                setScreenReaderSupport(e.target.checked);
                setHasUnsavedChanges(true);
              }}
            />
            <div>
              <div className="checkbox-label">Enable screen reader support</div>
              <div className="checkbox-description">Improve compatibility with assistive technologies</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage your notification preferences',
      content: (
        <div className="notification-options">
          <div className="notification-header">
            <div className="notification-status">
              <span className="status-indicator">
                {Object.values(notifications).filter(Boolean).length} of {Object.keys(notifications).length} enabled
              </span>
            </div>
            <div className="notification-actions">
              <button 
                className="action-btn enable-all"
                onClick={() => {
                  const allEnabled = Object.keys(notifications).reduce((acc, key) => {
                    acc[key] = true;
                    return acc;
                  }, {});
                  setNotifications(allEnabled);
                  setHasUnsavedChanges(true);
                  showSuccessMessage('All notifications enabled');
                }}
              >
                Enable All
              </button>
              <button 
                className="action-btn disable-all"
                onClick={() => {
                  const allDisabled = Object.keys(notifications).reduce((acc, key) => {
                    acc[key] = false;
                    return acc;
                  }, {});
                  setNotifications(allDisabled);
                  setHasUnsavedChanges(true);
                  showSuccessMessage('All notifications disabled');
                }}
              >
                Disable All
              </button>
            </div>
          </div>
          
          <div className="notification-list">
            <div className="checkbox-group" onClick={() => handleNotificationToggle('mealReminders')}>
              <input 
                type="checkbox" 
                className="checkbox-input"
                checked={notifications.mealReminders}
                onChange={() => {}} // Handled by parent div click
                readOnly
              />
              <div className="notification-content">
                <div className="checkbox-label">
                  <span className="notification-icon">🍽️</span>
                  Meal reminders
                </div>
                <div className="checkbox-description">Get reminded about your scheduled meals</div>
                <div className="notification-status-text">
                  {notifications.mealReminders ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
            
            <div className="checkbox-group" onClick={() => handleNotificationToggle('waterReminders')}>
              <input 
                type="checkbox" 
                className="checkbox-input"
                checked={notifications.waterReminders}
                onChange={() => {}} // Handled by parent div click
                readOnly
              />
              <div className="notification-content">
                <div className="checkbox-label">
                  <span className="notification-icon">💧</span>
                  Water intake reminders
                </div>
                <div className="checkbox-description">Stay hydrated with regular water reminders</div>
                <div className="notification-status-text">
                  {notifications.waterReminders ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
            
            <div className="checkbox-group" onClick={() => handleNotificationToggle('healthTips')}>
              <input 
                type="checkbox" 
                className="checkbox-input"
                checked={notifications.healthTips}
                onChange={() => {}} // Handled by parent div click
                readOnly
              />
              <div className="notification-content">
                <div className="checkbox-label">
                  <span className="notification-icon">💡</span>
                  Health tips
                </div>
                <div className="checkbox-description">Receive daily health and nutrition tips</div>
                <div className="notification-status-text">
                  {notifications.healthTips ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
            
            <div className="checkbox-group" onClick={() => handleNotificationToggle('weeklyReports')}>
              <input 
                type="checkbox" 
                className="checkbox-input"
                checked={notifications.weeklyReports}
                onChange={() => {}} // Handled by parent div click
                readOnly
              />
              <div className="notification-content">
                <div className="checkbox-label">
                  <span className="notification-icon">📊</span>
                  Weekly progress reports
                </div>
                <div className="checkbox-description">Get weekly summaries of your health progress</div>
                <div className="notification-status-text">
                  {notifications.weeklyReports ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
            
            <div className="checkbox-group" onClick={() => handleNotificationToggle('systemUpdates')}>
              <input 
                type="checkbox" 
                className="checkbox-input"
                checked={notifications.systemUpdates}
                onChange={() => {}} // Handled by parent div click
                readOnly
              />
              <div className="notification-content">
                <div className="checkbox-label">
                  <span className="notification-icon">🔔</span>
                  System updates
                </div>
                <div className="checkbox-description">Receive notifications about app updates</div>
                <div className="notification-status-text">
                  {notifications.systemUpdates ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'language',
      title: 'Language',
      description: 'Choose your preferred language',
      content: (
        <div className="language-options">
          {languageOptions.map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${language === lang.code ? 'selected' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="language-flag">{lang.flag}</span>
              <span className="language-name">{lang.name}</span>
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'voice',
      title: 'Voice & Audio',
      description: 'Configure text-to-speech and audio settings',
      content: (
        <div className="voice-options">
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              className="checkbox-input"
              checked={voiceSettings.enabled}
              onChange={(e) => handleVoiceSettingChange('enabled', e.target.checked)}
            />
            <div>
              <div className="checkbox-label">Enable text-to-speech</div>
              <div className="checkbox-description">Turn on/off the voice reading feature</div>
            </div>
          </div>
          
          <div className="slider-group">
            <div className="slider-label">
              <span>Voice Volume: {Math.round(voiceSettings.volume * 100)}%</span>
            </div>
            <div className="voice-slider-container">
              <div 
                className="voice-slider-progress" 
                style={{ width: `${voiceSettings.volume * 100}%` }}
              ></div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={voiceSettings.volume}
                onChange={(e) => handleVoiceSettingChange('volume', parseFloat(e.target.value))}
                className="voice-slider"
              />
            </div>
          </div>
          
          <div className="slider-group">
            <div className="slider-label">
              <span>Speech Rate: {voiceSettings.rate}x</span>
            </div>
            <div className="voice-slider-container">
              <div 
                className="voice-slider-progress" 
                style={{ width: `${((voiceSettings.rate - 0.5) / 1.5) * 100}%` }}
              ></div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.rate}
                onChange={(e) => handleVoiceSettingChange('rate', parseFloat(e.target.value))}
                className="voice-slider"
              />
            </div>
          </div>
          
          <div className="slider-group">
            <div className="slider-label">
              <span>Voice Pitch: {voiceSettings.pitch}x</span>
            </div>
            <div className="voice-slider-container">
              <div 
                className="voice-slider-progress" 
                style={{ width: `${((voiceSettings.pitch - 0.5) / 1.5) * 100}%` }}
              ></div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.pitch}
                onChange={(e) => handleVoiceSettingChange('pitch', parseFloat(e.target.value))}
                className="voice-slider"
              />
            </div>
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              className="checkbox-input"
              checked={voiceSettings.autoPlay}
              onChange={(e) => handleVoiceSettingChange('autoPlay', e.target.checked)}
            />
            <div>
              <div className="checkbox-label">Auto-play on page load</div>
              <div className="checkbox-description">Automatically start reading when a new page loads</div>
            </div>
          </div>
          
          <div className="voice-test-section">
            <button 
              className="test-voice-btn"
              onClick={handleTestVoice}
              disabled={!voiceSettings.enabled}
            >
              <Volume2 size={16} />
              Test Voice Settings
            </button>
            <p className="test-description">
              Click to hear a sample with your current voice settings
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'preferences',
      title: 'User Preferences',
      description: 'Customize your experience',
      content: (
        <div className="preference-options">
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              className="checkbox-input"
              checked={rememberPreferences}
              onChange={(e) => {
                setRememberPreferences(e.target.checked);
                setHasUnsavedChanges(true);
              }}
            />
            <div>
              <div className="checkbox-label">Remember my preferences</div>
              <div className="checkbox-description">Save your settings across sessions</div>
            </div>
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              className="checkbox-input"
              checked={showHelpfulTips}
              onChange={(e) => {
                setShowHelpfulTips(e.target.checked);
                setHasUnsavedChanges(true);
              }}
            />
            <div>
              <div className="checkbox-label">Show helpful tips</div>
              <div className="checkbox-description">Display contextual help and tips</div>
            </div>
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              className="checkbox-input"
              checked={autoSave}
              onChange={(e) => {
                setAutoSave(e.target.checked);
                setHasUnsavedChanges(true);
              }}
            />
            <div>
              <div className="checkbox-label">Auto-save settings</div>
              <div className="checkbox-description">Automatically save changes after 2 seconds</div>
            </div>
          </div>
        </div>
      )
    }
  ];

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
          <p className="settings-subtitle">Customize your NutriHelp experience</p>
        </div>

        <div className="settings-content">
          {/* API Status Messages */}
          {apiError && (
            <div className="api-status-message api-error">
              <span>⚠️ {apiError}</span>
            </div>
          )}
          {apiSuccess && (
            <div className="api-status-message api-success">
              <span>✅ {apiSuccess}</span>
            </div>
          )}
          {(isLoadingFromAPI || isSavingToAPI) && (
            <div className="api-status-message api-loading">
              <span>🔄 {isLoadingFromAPI ? 'Loading settings from cloud...' : 'Saving settings to cloud...'}</span>
            </div>
          )}

          {/* Settings Sections */}
          {allSections.map((section) => (
            <div key={section.id} className="settings-section">
              <h2 className="section-title">
                                 {section.title === 'Display Settings' && <SunIcon size={24} />}
                 {section.title === 'Font Size' && <span style={{ fontSize: '24px' }}>Aa</span>}
                 {section.title === 'Accessibility' && <span style={{ fontSize: '24px' }}>♿</span>}
                 {section.title === 'Notifications' && <Bell size={24} />}
                 {section.title === 'Language' && <Globe size={24} />}
                 {section.title === 'Voice & Audio' && <Volume2 size={24} />}
                 {section.title === 'User Preferences' && <span style={{ fontSize: '24px' }}>⚙️</span>}
                {section.title}
              </h2>
              <p className="section-description">
                {section.description}
              </p>
              {section.content}
            </div>
          ))}
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
            disabled={!hasUnsavedChanges}
          >
            {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
