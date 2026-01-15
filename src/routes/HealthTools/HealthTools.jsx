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

  function calculateProteinIntake(weight) {
    return weight * 0.9;
  }

  function calculateWaterIntake(weight) {
    return weight * 35;
  }

  function calculateCalorieIntake(weight) {
    return weight * 30;
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
      <h1>Health Tool Calculator</h1>

      {/* Row: Body Weight + Pounds Converter */}
      <div className="flex-row">
        <div className="card">
          <h3>Macro Calculator</h3>
          <input
            type="number"
            value={bodyWeight}
            onChange={(e) => setBodyWeight(e.target.value)}
            className="input-field"
            placeholder="Enter body weight in Kilograms ..."
          />
          <button className="primary-button" onClick={handleCalculate}>
            Calculate
          </button>
          {recommendedProtein && (
            <p className="result-text">Protein: {recommendedProtein} g</p>
          )}
          {recommendedWater && (
            <p className="result-text">Water: {recommendedWater} ml</p>
          )}
          {recommendedCalories && (
            <p className="result-text">Calories: {recommendedCalories} cal</p>
          )}
          {recommendedWater && (
            <WaterTracker recommendedWater={parseFloat(recommendedWater)} />
          )}
        </div>

        <div className="card">
          <h3>Pounds to Kilogram Converter</h3>
          <input
            type="number"
            value={foodWeightPounds}
            onChange={(e) => setFoodWeightPounds(e.target.value)}
            className="input-field"
            placeholder="Enter pounds to be converted ..."
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

      {/* Row: Medical Breach Checker */}
      <div className="flex-row" style={{ marginTop: '20px' }}>
        <div className="card" style={{ width: '100%', borderColor: '#6366f1', borderWidth: '2px' }}>
          <h3 style={{ color: '#4f46e5' }}>Medical Record Breach Checker</h3>
          <p>
            Check if your email address has been exposed in any known healthcare-related data breaches.
            We prioritize your privacy and security.
          </p>
          <button
            className="primary-button"
            style={{ backgroundColor: '#4f46e5', marginTop: '10px' }}
            onClick={() => window.location.href = '/security/breach-detection'}
          >
            Check Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default HealthTools;
