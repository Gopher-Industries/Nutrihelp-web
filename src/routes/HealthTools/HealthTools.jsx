import React, { useState } from 'react';
import './HealthTools.css';


function WaterTracker({ recommendedWater }) {
  const [cupsDrank, setCupsDrank] = useState(0);
  const cupSize = 250;

  const handleAddCup = () => {
    setCupsDrank(cupsDrank + 1);
  };

  const totalDrank = cupsDrank * cupSize;
  const goalAchieved = totalDrank >= recommendedWater;

  return (
    <div className="card">
      <h3>Water Estimator</h3>
      <p className="progress-text">{totalDrank} / {recommendedWater} ml</p>
      <button className="primary-button" onClick={handleAddCup}>
        Add Cup
      </button>
      {goalAchieved && <p className="success-text">Goal Reached!</p>}
    </div>
  );
}

function HealthTools() {
  const [bodyWeight, setBodyWeight] = useState('');
  const [recommendedProtein, setRecommendedProtein] = useState(null);
  const [recommendedWater, setRecommendedWater] = useState(null);
  const [recommendedCalories, setRecommendedCalories] = useState(null);
  const [foodWeightPounds, setFoodWeightPounds] = useState('');
  const [foodWeightGrams, setFoodWeightGrams] = useState(null);

  function calculateProteinIntake(bodyWeight) {
    const proteinPerKg = 0.9;
    return bodyWeight * proteinPerKg;
  }

  function calculateWaterIntake(bodyWeight) {
    const waterPerKg = 35;
    return bodyWeight * waterPerKg;
  }

  function calculateCalorieIntake(bodyWeight) {
    const caloriesPerKg = 30;
    return bodyWeight * caloriesPerKg;
  }

  const handleCalculate = () => {
    if (bodyWeight && !isNaN(bodyWeight)) {
      const weight = parseFloat(bodyWeight);
      setRecommendedProtein(calculateProteinIntake(weight).toFixed(2));
      setRecommendedWater(calculateWaterIntake(weight).toFixed(2));
      setRecommendedCalories(calculateCalorieIntake(weight).toFixed(2));
    }
  };

  const handleConvertFoodWeight = () => {
    if (foodWeightPounds && !isNaN(foodWeightPounds)) {
      const kilograms = parseFloat(foodWeightPounds) * 0.453592;
      setFoodWeightGrams(kilograms.toFixed(2));
    }
  };

  return (
    <div className="container">
      <h1>Health Calculator Tools</h1>
      <div className="card">
        <input
          type="number"
          value={bodyWeight}
          onChange={(e) => setBodyWeight(e.target.value)}
          className="input-field"
          placeholder="Enter body weight in Kilograms"
        />
        <button className="primary-button" onClick={handleCalculate}>
          Calculate
        </button>
      </div>
      {recommendedProtein && (
        <div className="card">
          <h3>Recommended Protein Intake</h3>
          <p className="result-text">{recommendedProtein} grams</p>
        </div>
      )}
      {recommendedWater && (
        <div className="card">
          <h3>Recommended Water Intake</h3>
          <p className="result-text">{recommendedWater} ml</p>
        </div>
      )}
      {recommendedCalories && (
        <div className="card">
          <h3>Recommended Caloric Intake</h3>
          <p className="result-text">{recommendedCalories} calories</p>
        </div>
      )}
      {recommendedWater && (
        <WaterTracker recommendedWater={parseFloat(recommendedWater)} />
      )}
      <div className="card">
        <h3>Convert Pounds to Kilograms</h3>
        <input
          type="number"
          value={foodWeightPounds}
          onChange={(e) => setFoodWeightPounds(e.target.value)}
          className="input-field"
          placeholder="Enter pounds"
        />
        <button className="primary-button" onClick={handleConvertFoodWeight}>
          Convert
        </button>
        {foodWeightGrams && (
          <p className="result-text">
            {foodWeightPounds} lbs = {foodWeightGrams} kg
          </p>
        )}
      </div>
    </div>
  );
}

export default HealthTools;