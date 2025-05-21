import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import goalImage from '../../images/HealthGoal.png';
import logo from '../../images/logo.png'; 

const HealthGoal = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // Store the target in localStorage for later use
  const handleNext = async () => {
    if (selectedGoal) {
      setIsSubmitting(true);
      try {
        // Currently only stored in localStorage (will be sent to the API with the habit in the next step)
        localStorage.setItem('healthGoal', selectedGoal);
        
        // If you need to use the fetch API to send data in the future, you can replace the localStorage logic above with the following code:
        /*
        const response = await fetch('/api/health-goal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ goal: selectedGoal })
        });
        
        if (!response.ok) {
          throw new Error('Server responded with an error: ' + response.status);
        }
        
        const data = await response.json();
        console.log('Goal saved successfully:', data);
        */
        
        navigate('/habits-activity');
      } catch (error) {
        console.error('Error saving goal:', error);
        alert('Failed to save your goal. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      navigate('/habits-activity'); // Continue even if no target is selected
    }
  };

  const handleSkip = () => {
    localStorage.removeItem('healthGoal'); // Clear any stored targets
    navigate('/habits-activity');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md p-8 flex flex-col md:flex-row justify-between">
        
        {/* Left content */}
        <div className="flex flex-col space-y-4 w-full md:w-1/2 text-left">
          <img
            src={logo}
            alt="NutriHelp Logo"
            className="h-28 w-auto mb-4 object-contain"
          />
          <h2 className="text-2xl font-bold">Let's start with your goals.</h2>
          <p className="text-gray-500">Select up to one that are most important to you</p>

          {['Lose Weight', 'Gain Muscle', 'Modify My Diet', 'Plan Meals'].map((goal, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedGoal(goal)}
              className={`py-2 px-4 rounded-xl shadow-sm font-semibold
                ${selectedGoal === goal
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-black'}
              `}
            >
              {goal}
            </button>
          ))}

          <div className="mt-8 flex flex-col items-center">
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-10 rounded-full shadow-md"
            >
              {isSubmitting ? 'Saving...' : 'Next'}
            </button>

            {/* Skip */}
            <p
              onClick={handleSkip}
              className="text-gray-500 underline hover:text-purple-600 cursor-pointer mt-2"
            >
              Skip
            </p>
          </div>
        </div>

        {/* Illustration on the right */}
        <div className="hidden md:block w-1/2">
          <img
            src={goalImage}
            alt="Health Goal Visual"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default HealthGoal;