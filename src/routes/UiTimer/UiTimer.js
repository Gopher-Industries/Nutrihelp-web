import { useState, useEffect } from "react";
import "./UiTimer.css";

// Basic recipe list
const RECIPES = [
  { id: 1, name: "Boiled Egg", time: 300 },   // 5min
  { id: 2, name: "Pasta", time: 600 },        // 10min
  { id: 3, name: "Rice", time: 1200 },        // 20min
  { id: 4, name: "Steak", time: 300 },        // 5min
  { id: 5, name: "Baked Potato", time: 1800 } // 30min
];

// Helper functions
const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
};

const pad = (num) => num.toString().padStart(2, "0");

function UiTimer() {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [animate, setAnimate] = useState({ hours: false, minutes: false, seconds: false });

  // Convert time to total seconds
  // const getTotalSeconds = () => {
  //   return time.hours * 3600 + time.minutes * 60 + time.seconds;
  // };

  // Countdown logic
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTime(prev => {
        const total = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;

        // Timer completion
        if (total <= 0) {
          clearInterval(interval);
          setIsRunning(false);
          alert("Time's up!");
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        // Calculate new time values
        const newTime = formatTime(total);

        // Set animation flags for changed values
        setAnimate({
          hours: newTime.hours !== prev.hours,
          minutes: newTime.minutes !== prev.minutes,
          seconds: newTime.seconds !== prev.seconds
        });

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Clear animation after it completes
  useEffect(() => {
    if (Object.values(animate).some(flag => flag)) {
      const timer = setTimeout(() => setAnimate({ hours: false, minutes: false, seconds: false }), 500);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  // Handle recipe selection
  const selectRecipe = (recipe) => {
    setIsRunning(false);
    setSelectedRecipe(recipe.id);
    setTime(formatTime(recipe.time));
  };

  // Clear recipe selection
  const clearRecipe = () => {
    setSelectedRecipe(null);
    setTime({ hours: 0, minutes: 0, seconds: 0 });
    setIsRunning(false);
  };

  // Handle manual time input
  const handleTimeChange = (e, unit) => {
    const value = parseInt(e.target.value, 10) || 0;
    setTime(prev => ({ ...prev, [unit]: value }));
  };

  // Reset timer
  const resetTimer = () => {
    if (selectedRecipe) {
      const recipe = RECIPES.find(r => r.id === selectedRecipe);
      setTime(formatTime(recipe.time));
    } else {
      setTime({ hours: 0, minutes: 0, seconds: 0 });
    }
    setIsRunning(false);
  };

  return (
    <div className="timer-container">
      <h2>Cooking Timer</h2>

      {/* Recipe Selection */}
      <div className="recipe-section">
        <h3>Select Recipe</h3>
        <div className="recipe-list">
          {RECIPES.map(recipe => (
            <div
              key={recipe.id}
              className={`recipe-item ${selectedRecipe === recipe.id ? 'selected' : ''}`}
              onClick={() => selectRecipe(recipe)}
            >
              {recipe.name} ({formatTime(recipe.time).minutes}m)
            </div>
          ))}
        </div>
        {selectedRecipe && (
          <button className="clear-btn" onClick={clearRecipe}>
            Clear Selection
          </button>
        )}
      </div>

      {/* Timer Display */}
      <div className="timer-display">
        {!isRunning ? (
          <div className="time-inputs">
            <div className="time-group">
              <input
                type="number"
                value={time.hours}
                min="0"
                onChange={(e) => handleTimeChange(e, 'hours')}
                placeholder="00"
              />
              <div>Hours</div>
            </div>
            <span className="separator">:</span>
            <div className="time-group">
              <input
                type="number"
                value={time.minutes}
                min="0"
                max="59"
                onChange={(e) => handleTimeChange(e, 'minutes')}
                placeholder="00"
              />
              <div>Minutes</div>
            </div>
            <span className="separator">:</span>
            <div className="time-group">
              <input
                type="number"
                value={time.seconds}
                min="0"
                max="59"
                onChange={(e) => handleTimeChange(e, 'seconds')}
                placeholder="00"
              />
              <div>Seconds</div>
            </div>
          </div>
        ) : (
          <div className="time-values">
            <div className={`time-value ${animate.hours ? 'animate' : ''}`}>
              {pad(time.hours)}
              <div className="unit">Hours</div>
            </div>
            <span className="separator">:</span>
            <div className={`time-value ${animate.minutes ? 'animate' : ''}`}>
              {pad(time.minutes)}
              <div className="unit">Minutes</div>
            </div>
            <span className="separator">:</span>
            <div className={`time-value ${animate.seconds ? 'animate' : ''}`}>
              {pad(time.seconds)}
              <div className="unit">Seconds</div>
            </div>
          </div>
        )}

        <div className="controls">
          <button
            className="control-btn"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            className="control-btn"
            onClick={resetTimer}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default UiTimer;
