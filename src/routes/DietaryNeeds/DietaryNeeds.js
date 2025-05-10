import React from 'react';
import './DietaryNeeds.css';

import Hero from './images/healthy-lifestyle.jpg';
import KidsImg from './images/children-healthy.jpg';
import TeensImg from './images/teens-fitness.jpg';
import AdultsImg from './images/adults-fitness.jpg';
import SeniorsImg from './images/seniors-fitness.jpg';

const dietaryInfo = [
  {
    ageGroup: "Children (5–12 years)",
    image: KidsImg,
    diet: [
      "🍎 Prioritize fruits, vegetables, whole grains, and dairy.",
      "🍫 Limit sweets, junk food, and sugary drinks.",
      "💪 Ensure enough calcium and iron for growth and development."
    ],
    exercise: [
      "🚴‍♂️ At least 1 hour of active play daily.",
      "🤸 Encourage biking, dancing, sports, and swimming."
    ]
  },
  {
    ageGroup: "Teenagers (13–19 years)",
    image: TeensImg,
    diet: [
      "🥗 High-protein meals with lots of fruits and greens.",
      "🥤 Avoid skipping meals and reduce fast food.",
      "🧠 Include iron-rich and brain-boosting foods like nuts and leafy greens."
    ],
    exercise: [
      "🏃 Engage in at least 60 minutes of activity daily.",
      "🏋️‍♀️ Combine cardio, strength, and flexibility training."
    ]
  },
  {
    ageGroup: "Adults (20–59 years)",
    image: AdultsImg,
    diet: [
      "🍽️ Balanced meals with proper portions of carbs, fats, and protein.",
      "🧂 Minimize salt, sugar, and processed food.",
      "🌾 Incorporate fiber-rich foods like legumes, oats, and leafy greens."
    ],
    exercise: [
      "🕺 At least 150 mins of moderate aerobic exercise weekly.",
      "🏋️‍♂️ Include 2–3 strength sessions + stretching."
    ]
  },
  {
    ageGroup: "Older Adults (60+ years)",
    image: SeniorsImg,
    diet: [
      "🍲 Soft, nutrient-rich meals are best.",
      "💧 Stay hydrated and limit fried and salty food.",
      "🦴 Focus on calcium, vitamin D, and B12."
    ],
    exercise: [
      "🚶‍♀️ Go for daily walks or light aerobic activity.",
      "🧘 Do light yoga or balance training to prevent falls."
    ]
  }
];

const DietaryNeeds = () => {
  return (
    <div className="dietary-page">
      <div className="hero">
        <img src={Hero} alt="Healthy lifestyle" />
        <div className="overlay-text">
          <h1>Live Healthy, Live Happy 🌿</h1>
          <p className="quote-highlight"> Diet is just one part of the puzzle — <strong>movement completes it.</strong></p>

        </div>
      </div>

      {dietaryInfo.map((group, index) => (
        <div key={index} className="section-block">
          <h2>{group.ageGroup}</h2>
          <div className="section-content">
            <img src={group.image} alt={group.ageGroup} className="age-img" />
            <div className="section-details">
              <div className="info-card">
                <h3>🥗 Dietary Recommendations</h3>
                <ul>
                  {group.diet.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>
              <div className="info-card">
                <h3>🏃 Exercise Guidelines</h3>
                <ul>
                  {group.exercise.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DietaryNeeds;
