import React, { useState, useEffect } from "react";
import goalIcon from "../../images/goal.png";
import foodIcon from "../../images/food.png";
import exerciseIcon from "../../images/exercise.png";

const UserDashboard = () => {
  // State Management
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNutrientModal, setShowNutrientModal] = useState(false);
  const [baseGoal, setBaseGoal] = useState(0);
  const [food, setFood] = useState(0);
  const [exercise, setExercise] = useState(0);
  const [exerciseHours, setExerciseHours] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Temporary input state (for popup editing)
  const [tempBaseGoal, setTempBaseGoal] = useState(baseGoal);
  const [tempFood, setTempFood] = useState(food);
  const [tempExercise, setTempExercise] = useState(exercise);
  const [tempExerciseHours, setTempExerciseHours] = useState(exerciseHours);

  // Nutrient data status
  const [nutrients, setNutrients] = useState([]);

  // Provisional nutrient data
  const [tempNutrients, setTempNutrients] = useState([]);

  // API base URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://api.nutrihelp.com";

  // Fetch user energy data
  useEffect(() => {
    const fetchEnergyData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");
        
        const response = await fetch(`${API_BASE_URL}/api/energy-tracking`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setBaseGoal(data.baseGoal);
        setFood(data.food);
        setExercise(data.exercise);
        setExerciseHours(data.exerciseHours);
        setTempBaseGoal(data.baseGoal);
        setTempFood(data.food);
        setTempExercise(data.exercise);
        setTempExerciseHours(data.exerciseHours);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load energy data");
        setIsLoading(false);
        console.error("Error fetching energy data:", err);
      }
    };

    fetchEnergyData();
  }, []);

  // Fetch nutrients data
  useEffect(() => {
    const fetchNutrientsData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        
        const response = await fetch(`${API_BASE_URL}/api/nutrients-tracking`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setNutrients(data);
        setTempNutrients(JSON.parse(JSON.stringify(data)));
      } catch (err) {
        console.error("Error fetching nutrients data:", err);
      }
    };

    fetchNutrientsData();
  }, []);

  // Calculate the remaining energy value (according to the formula Remaining = Goal - Food + Exercise)
  const remaining = baseGoal - food + exercise;

  // Calculates progress percentage (based on ratio of food consumed to goal)
  const progressPercentage = Math.min(((food - exercise) / baseGoal) * 100, 100);
  
  // Determine whether it is a negative number
  const isNegative = remaining < 0;

  // Processing Save Edit for energy data
  const handleSaveEdit = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      
      const energyData = {
        baseGoal: tempBaseGoal,
        food: tempFood,
        exercise: tempExercise,
        exerciseHours: tempExerciseHours
      };
      
      const response = await fetch(`${API_BASE_URL}/api/energy-tracking`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(energyData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Update local state
      setBaseGoal(tempBaseGoal);
      setFood(tempFood);
      setExercise(tempExercise);
      setExerciseHours(tempExerciseHours);
      
      setShowEditModal(false);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to update energy data");
      setIsLoading(false);
      console.error("Error updating energy data:", err);
    }
  };

  // Handle closing pop-up window
  const handleCloseModal = () => {
    // Reset temporary value to current value
    setTempBaseGoal(baseGoal);
    setTempFood(food);
    setTempExercise(exercise);
    setTempExerciseHours(exerciseHours);
    setShowEditModal(false);
  };

  // Processing nutrients data update
  const handleSaveNutrients = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      
      const response = await fetch(`${API_BASE_URL}/api/nutrients-tracking`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tempNutrients)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Update local state
      setNutrients(tempNutrients);
      
      setShowNutrientModal(false);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to update nutrients data");
      setIsLoading(false);
      console.error("Error updating nutrients data:", err);
    }
  };

  // Handle closing of nutrients pop-up window
  const handleCloseNutrientModal = () => {
    setTempNutrients(JSON.parse(JSON.stringify(nutrients)));
    setShowNutrientModal(false);
  };

  // Calculate the path of a ring
  const radius = 120;
  const strokeWidth = 16;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const absoluteProgressPercentage = Math.abs(progressPercentage);
  const strokeDashoffset = circumference - (Math.min(absoluteProgressPercentage, 100) / 100) * circumference;

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Energy Edit Popup */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Daily Values</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Goal (kJ)
                </label>
                <input
                  type="number"
                  value={tempBaseGoal}
                  onChange={(e) => setTempBaseGoal(Number(e.target.value))}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food (kJ)
                </label>
                <input
                  type="number"
                  value={tempFood}
                  onChange={(e) => setTempFood(Number(e.target.value))}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise (kJ)
                </label>
                <input
                  type="number"
                  value={tempExercise}
                  onChange={(e) => setTempExercise(Number(e.target.value))}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise Duration (hours)
                </label>
                <input
                  type="number"
                  value={tempExerciseHours}
                  onChange={(e) => setTempExerciseHours(Number(e.target.value))}
                  className="w-full border px-3 py-2 rounded"
                  step="0.1"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 bg-white border rounded hover:bg-purple-100"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nutrient edit popup */}
      {showNutrientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Nutrients</h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {tempNutrients.map((nutrient, index) => (
                <div key={nutrient.label} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {nutrient.label}
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={nutrient.current}
                        onChange={(e) => {
                          const newNutrients = [...tempNutrients];
                          newNutrients[index].current = Number(e.target.value);
                          setTempNutrients(newNutrients);
                        }}
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Current"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={nutrient.total}
                        onChange={(e) => {
                          const newNutrients = [...tempNutrients];
                          newNutrients[index].total = Number(e.target.value);
                          setTempNutrients(newNutrients);
                        }}
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Target"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseNutrientModal}
                className="px-4 py-2 text-gray-700 bg-white border rounded hover:bg-purple-100"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNutrients}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content area - horizontal layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Calorie tracker card */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
          {/* Title and Edit Button - Relative Positioning */}
          <div className="relative mb-6">
            {/* Left title */}
            <h2 className="text-2xl font-bold mb-1">Kilojoules</h2>
            {/* Centering formula */}
            <div className="text-center">
              <p className="text-gray-500 text-sm">Remaining = Goal - Food + Exercise</p>
            </div>
            {/* The edit button in the upper right corner */}
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute top-0 right-0 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          </div>
          
          {/* Circular progress circle and data display - centered layout */}
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Circular progress circle area */}
            <div className="flex items-center justify-center space-x-12">
              {/* Circular progress circle */}
              <div className="relative flex items-center justify-center">
                <svg
                  height={radius * 2}
                  width={radius * 2}
                  className="transform -rotate-90"
                >
                  {/* Background ring */}
                  <circle
                    stroke="#E5E7EB"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                  {/* Progress Ring */}
                  <circle
                    stroke={isNegative ? "#EF4444" : "#3B82F6"}
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                </svg>
                
                {/* Center shows the remaining value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className={`text-3xl font-bold ${isNegative ? 'text-red-500' : ''}`}>
                    {remaining.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Remaining</p>
                </div>
              </div>
              
              {/* The data on the right shows */}
              <div className="space-y-4">
                {/* Base Goal */}
                <div className="flex items-center">
                  <img src={goalIcon} alt="Goal" className="h-12 w-12 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Base Goal</p>
                    <p className="font-bold">{baseGoal.toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Food */}
                <div className="flex items-center">
                  <img src={foodIcon} alt="Food" className="h-12 w-12 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Food</p>
                    <p className="font-bold">{food.toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Exercise */}
                <div className="flex items-center">
                  <img src={exerciseIcon} alt="Exercise" className="h-12 w-12 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Exercise</p>
                    <p className="font-bold">{exercise.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom description text */}
            <div className="text-center text-sm text-gray-600 max-w-md">
              <p>
                {isNegative ? (
                  <span className="text-red-500">
                    You have exceeded your daily energy goal. This means that you have consumed more energy from food than you have targeted (even after deducting the amount of energy you have consumed from exercise). You may need to eat less food or exercise more.
                  </span>
                ) : (
                  <span className="text-green-600">
                    You can still take in kilojoules of energy. This means you have an energy budget available. It is recommended to plan the rest of your meal wisely.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        {/* Right: Nutrient progress bar card */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">Nutrients</h3>
            <button
              onClick={() => setShowNutrientModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          </div>
          
          <div className="space-y-4">
            {nutrients.map(({ label, color, current, total, unit = "g" }) => (
              <div key={label}>
                <div className="flex justify-between text-sm">
                  <p className="font-semibold" style={{ color }}>{label}</p>
                  <p className="text-gray-500">
                    {current || 0}{unit}/{total || 0}{unit}
                  </p>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded">
                  <div
                    className="h-2 rounded"
                    style={{ width: `${Math.min((current / total) * 100, 100)}%`, backgroundColor: color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;