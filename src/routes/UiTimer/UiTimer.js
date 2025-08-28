import { useState, useEffect, useRef } from "react";
import "./UiTimer.css";

// Predefined recipes with suggested cooking times (in seconds)
const RECIPES = [
  { id: 1, name: "Boiled Egg", time: 300 }, // 5 minutes
  { id: 2, name: "Pasta", time: 600 },      // 10 minutes
  { id: 3, name: "Rice", time: 1200 },      // 20 minutes
  { id: 4, name: "Steak", time: 300 },      // 5 minutes
  { id: 5, name: "Baked Potato", time: 1800 }, // 30 minutes
  { id: 6, name: "Soup", time: 900 }        // 15 minutes
];

// Helper function to format numbers to two digits
const formatTime = (num) => {
  return num.toString().padStart(2, "0");
};

// Convert total seconds to hours, minutes, seconds
const convertSecondsToTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  
  return { hours, minutes, seconds };
};

function RecipeTimer() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [animate, setAnimate] = useState({ hours: false, minutes: false, seconds: false });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  // Refs to track current values for interval calculations
  const minutesRef = useRef(minutes);
  const hoursRef = useRef(hours);

  // Update refs when values change
  useEffect(() => {
    minutesRef.current = minutes;
    hoursRef.current = hours;
  }, [minutes, hours]);

  // Handle input changes for time values
  const handleTimeInput = (event, setter) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setter(value);
    } else {
      alert("Please enter a valid number");
    }
  };

  // Handle blur events to normalize time values
  const handleInputBlur = (event, unit) => {
    const value = parseInt(event.target.value, 10);
    
    if (isNaN(value)) return;
    
    if (unit === 'minutes') {
      if (value >= 60) {
        const newMinutes = value % 60;
        const addedHours = Math.floor(value / 60);
        setMinutes(newMinutes);
        setHours(prev => prev + addedHours);
      }
    } else if (unit === 'seconds') {
      if (value >= 60) {
        const newSeconds = value % 60;
        const addedMinutes = Math.floor(value / 60);
        setSeconds(newSeconds);
        setMinutes(prev => prev + addedMinutes);
        
        // Check if minutes need to be converted to hours
        if (minutes + addedMinutes >= 60) {
          const newTotalMinutes = minutes + addedMinutes;
          const newMinutes = newTotalMinutes % 60;
          const addedHours = Math.floor(newTotalMinutes / 60);
          setMinutes(newMinutes);
          setHours(prev => prev + addedHours);
        }
      }
    }
  };

  // Countdown logic
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      setSeconds(prevSeconds => {
        if (prevSeconds === 0) {
          // Seconds reached 0, check minutes
          if (minutesRef.current === 0) {
            // Minutes reached 0, check hours
            if (hoursRef.current === 0) {
              // All time units reached 0
              alert("Time's up!");
              setIsRunning(false);
              return 0;
            } else {
              // Decrement hours, reset minutes and seconds
              setAnimate(prev => ({ ...prev, hours: true, minutes: true, seconds: true }));
              setHours(prev => prev - 1);
              setMinutes(59);
              return 59;
            }
          } else {
            // Decrement minutes, reset seconds
            setAnimate(prev => ({ ...prev, minutes: true, seconds: true }));
            setMinutes(prev => prev - 1);
            return 59;
          }
        }
        
        // Just decrement seconds
        setAnimate(prev => ({ ...prev, seconds: true }));
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  // Reset animation state after animation completes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setAnimate({ hours: false, minutes: false, seconds: false });
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [animate]);

  // Handle recipe selection
  const handleRecipeSelect = (recipe) => {
    // Stop timer if running when selecting a new recipe
    if (isRunning) {
      setIsRunning(false);
    }
    
    const { hours, minutes, seconds } = convertSecondsToTime(recipe.time);
    setHours(hours);
    setMinutes(minutes);
    setSeconds(seconds);
    setSelectedRecipe(recipe.id);
  };

  // Clear recipe selection and reset timer
  const clearRecipeSelection = () => {
    setSelectedRecipe(null);
    setHours(0);
    setMinutes(0);
    setSeconds(0);
    setIsRunning(false);
  };

  // Reset timer to initial values
  const resetTimer = () => {
    setIsRunning(false);
    if (selectedRecipe) {
      const recipe = RECIPES.find(r => r.id === selectedRecipe);
      const { hours, minutes, seconds } = convertSecondsToTime(recipe.time);
      setHours(hours);
      setMinutes(minutes);
      setSeconds(seconds);
    } else {
      setHours(0);
      setMinutes(0);
      setSeconds(0);
    }
  };

  return (
    <div className="recipe-timer-container">
      <h2>Cooking Timer</h2>
      
      <div className="recipe-selection">
        <h3>Select a Recipe</h3>
        <div className="recipe-grid">
          {RECIPES.map(recipe => (
            <div 
              key={recipe.id}
              className={`recipe-card ${selectedRecipe === recipe.id ? 'selected' : ''}`}
              onClick={() => handleRecipeSelect(recipe)}
            >
              <strong>{recipe.name}</strong>
              <span className="recipe-time">
                {convertSecondsToTime(recipe.time).hours > 0 
                  ? `${convertSecondsToTime(recipe.time).hours}h ` 
                  : ''}
                {convertSecondsToTime(recipe.time).minutes}m
              </span>
            </div>
          ))}
        </div>
        
        {selectedRecipe && (
          <button className="clear-selection" onClick={clearRecipeSelection}>
            Clear Selection
          </button>
        )}
      </div>
      
      <div className="timer-display">
        {!isRunning ? (
          <div className="time-inputs">
            <div className="time-input-group">
              <input
                type="number"
                value={hours}
                min="0"
                onChange={(e) => handleTimeInput(e, setHours)}
                placeholder="00"
              />
              <label>Hours</label>
            </div>
            
            <span className="separator">:</span>
            
            <div className="time-input-group">
              <input
                type="number"
                value={minutes}
                min="0"
                onChange={(e) => handleTimeInput(e, setMinutes)}
                onBlur={(e) => handleInputBlur(e, 'minutes')}
                placeholder="00"
              />
              <label>Minutes</label>
            </div>
            
            <span className="separator">:</span>
            
            <div className="time-input-group">
              <input
                type="number"
                value={seconds}
                min="0"
                onChange={(e) => handleTimeInput(e, setSeconds)}
                onBlur={(e) => handleInputBlur(e, 'seconds')}
                placeholder="00"
              />
              <label>Seconds</label>
            </div>
          </div>
        ) : (
          <div className="time-display">
            <div className={`time-unit ${animate.hours ? 'animate' : ''}`}>
              {formatTime(hours)}
              <span className="unit-label">Hours</span>
            </div>
            
            <span className="separator">:</span>
            
            <div className={`time-unit ${animate.minutes ? 'animate' : ''}`}>
              {formatTime(minutes)}
              <span className="unit-label">Minutes</span>
            </div>
            
            <span className="separator">:</span>
            
            <div className={`time-unit ${animate.seconds ? 'animate' : ''}`}>
              {formatTime(seconds)}
              <span className="unit-label">Seconds</span>
            </div>
          </div>
        )}
        
        <div className="timer-controls">
          <button 
            className="control-button"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          
          <button 
            className="control-button reset"
            onClick={resetTimer}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeTimer;
