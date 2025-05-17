import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HabitsActivity = () => {
  const navigate = useNavigate();

  const healthHabits = [
    "Plan more meals", "Eat more protein", "Eat more fiber",
    "Eat a balanced diet", "Meal prep and cook", "Move more",
    "Workout more", "Track macros", "Track calories", "Track nutrients"
  ];

  const activityLevels = [
    {
      label: "Not Very Active",
      description: "Spend most of the day sitting (e.g. bank teller, desk job)",
    },
    {
      label: "Lightly Active",
      description: "Spend a good part of the day on your feet (e.g. teacher, salesperson)",
    },
    {
      label: "Active",
      description: "Spend a good part of the day doing some physical activity (e.g. food server, postal carrier)",
    },
    {
      label: "Very Active",
      description: "Spend most of the day doing heavy physical activity (e.g. bike messenger, carpenter)",
    },
  ];

  const [selectedHabits, setSelectedHabits] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleHabit = (habit) => {
    setSelectedHabits((prev) =>
      prev.includes(habit)
        ? prev.filter((h) => h !== habit)
        : [...prev, habit]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true); // Start loading state
    
    try {
      // Get the target from localStorage
      const healthGoal = localStorage.getItem('healthGoal');
      
      // Prepare the data
      const userPreferences = {
        goal: healthGoal || null,
        habits: selectedHabits,
        activityLevel: selectedActivity
      };
      
      // Use the fetch API to save user preferences
      const response = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userPreferences)
      });
      
      // Checking the response status
      if (!response.ok) {
        throw new Error('Server responded with an error: ' + response.status);
      }
      
      // Parsing the response data
      const data = await response.json();
      
      // Clear localStorage on success
      localStorage.removeItem('healthGoal');
      
      console.log("Selected Habits:", selectedHabits);
      console.log("Selected Activity:", selectedActivity);
      
      navigate('/login');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save your preferences. Please try again.');
    } finally {
      setIsSubmitting(false); // End loading state
    }
  };

  const handleSkip = () => {
    // Remove stored targets when skipping
    localStorage.removeItem('healthGoal');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-8">
          Personalised Health Habits & Activity Level Assessment
        </h1>

        {/* Healthy Habit Choices */}
        <div className="bg-gray-100 p-6 rounded-xl mb-8">
          <h2 className="font-bold text-lg mb-1">Which health habits are most important to you?</h2>
          <p className="text-sm text-gray-500 mb-4 text-center">Recommended for you</p>
          <div className="flex flex-wrap gap-3 ">
            {healthHabits.map((habit, idx) => (
              <button
                key={idx}
                onClick={() => toggleHabit(habit)}
                className={`px-4 py-2 rounded-full shadow-sm font-medium ${
                  selectedHabits.includes(habit)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-black'
                }`}
              >
                {habit}
              </button>
            ))}
          </div>
        </div>

        {/* Activity level selection */}
        <div className="bg-gray-100 p-6 rounded-xl mb-6">
          <h2 className="font-bold text-lg mb-1">What is your baseline activity level?</h2>
          <p className="text-sm text-gray-500 mb-4 text-center">Not including workouts – we count that separately.</p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gridTemplateRows: 'repeat(2, auto)',
            gap: '1rem'
          }}>
            {activityLevels.map((level, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedActivity(level.label)}
                className={`text-left border rounded-xl p-4 flex justify-between items-center ${
                  selectedActivity === level.label
                    ? 'border-purple-600 bg-purple-100'
                    : 'border-gray-300 bg-white'
                }`}
                style={{ 
                  minHeight: '100px',
                  height: '100%'
                }}
              >
                <div>
                  <p className="font-bold">{level.label}</p>
                  <p className="text-sm text-gray-500">{level.description}</p>
                </div>
                <div className="text-2xl">
                  {selectedActivity === level.label ? '🔘' : '⚪'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom button */}
        <p className="text-xs text-gray-400 mb-2 italic text-center">
          P.S. You've already done the hardest part: getting started.
        </p>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting} // Adding a disabled state
          className="w-1/3 mx-auto block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-full text-xl"
        >
          {/* Update button text based on loading status */}
          {isSubmitting ? 'Saving...' : 'Submit'}  
        </button>
        
        {/* skip */}
        <p
          onClick={handleSkip}
          className="text-gray-500 underline hover:text-purple-600 cursor-pointer mt-2 text-center w-full"
        >
          Skip
        </p>

        <p
          onClick={() => navigate('/health-goal')}
          className="text-sm text-gray-500 mt-4 cursor-pointer hover:underline"
        >
          ← Previous step
        </p>
      </div>
    </div>
  );
};

export default HabitsActivity;