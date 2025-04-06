import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import goalImage from '../../images/HealthGoal.png';
import logo from '../../images/logo.png'; 

const HealthGoal = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState(null);

  const handleNext = () => {
    navigate('/habits-activity');
  };

  const handleSkip = () => {
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
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-10 rounded-full shadow-md"
            >
              Next
            </button>

            {/* skip */}
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
