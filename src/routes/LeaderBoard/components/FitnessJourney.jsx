// src/routes/LeaderBoard/components/FitnessJourney.jsx
import React, { useState } from "react";
import "./FitnessJourney.css";  // For styles (You can customize this)



const FitnessJourney = ({ currentWeight, targetWeight, goalType }) => {
  // Calculate the number of weeks it will take based on goal
  const [progress, setProgress] = useState({
    currentWeight,
    weeksCompleted: 0,
    milestones: 0,
  });

  const [visibleWeeks, setVisibleWeeks] = useState(6); // Show first 4 weeks

  // Generate a basic weekly plan
  const generateWeeklyPlan = () => {
    const plan = [];
    const weightChangePerWeek = 0.5;  // Example: 0.5 kg change per week

    for (let i = 1; i <= 12; i++) {
      plan.push({
        week: i,
        goal: `Week ${i}`,
        targetWeight: currentWeight + i * weightChangePerWeek,
      });
    }
    return plan;
  };

  const weeklyPlan = generateWeeklyPlan();



  return (
    <div className="fitness-journey">
      <div className="weekly-plan">
        {weeklyPlan.slice(0, visibleWeeks).map((week, index) => (
        <div key={index} className="week-plan">
        <h3>{week.goal}</h3>
        <p>Target Weight: {week.targetWeight.toFixed(2)} kg</p>
        </div>
        ))}
      </div>


      <div className="progress">
      </div>
      
    </div>
  );
};

export default FitnessJourney;
