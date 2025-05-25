import React, { useState, useRef, useEffect } from 'react';
import './ObesityPredict.css';
import { useNavigate } from 'react-router-dom';

export default function ObesityPredict() {
  const [formData, setFormData] = useState({});
  const [showScrollHint, setShowScrollHint] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mockResult = {
      obesity: 'Overweight_II',
      diabetes: 'True (65% probability)'
    };
    localStorage.setItem('obesityResult', JSON.stringify(mockResult));
    navigate('/predict/result');
  };

  const scrollToTop = () => {
    formRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = formRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setShowScrollHint(true);
    } else {
      setShowScrollHint(false);
    }
  };

  const questions = [
    { label: 'Gender', name: 'gender', type: 'select', options: [['1','Male'], ['2','Female']] },
    { label: 'Age (years)', name: 'age', type: 'number' },
    { label: 'Height (m)', name: 'height', type: 'number' },
    { label: 'Weight (kg)', name: 'weight', type: 'number' },
    { label: 'Family history of overweight', name: 'family_history', type: 'select', options: [['yes','Yes'], ['no','No']] },
    { label: 'Calorie intake (per day)', name: 'calories', type: 'number' },
    { label: 'Vegetable consumption (0-3)', name: 'vegetables', type: 'number' },
    { label: 'Main meals per day', name: 'meals', type: 'number' },
    { label: 'Snacks between meals (0–3)', name: 'snacks', type: 'number' },
    { label: 'Do you smoke?', name: 'smoke', type: 'select', options: [['0','No'], ['1','Yes']] },
    { label: 'Water intake (liters)', name: 'water', type: 'number' },
    { label: 'Monitor calorie intake?', name: 'monitor', type: 'select', options: [['yes','Yes'], ['no','No']] },
    { label: 'Physical activity (hours/day)', name: 'activity', type: 'number' },
    { label: 'Screen time (hours/day)', name: 'screen_time', type: 'number' },
    { label: 'Alcohol consumption', name: 'alcohol', type: 'select', options: [['0','Never'], ['1','Sometimes'], ['2','Frequently']] },
    { label: 'Mode of transportation', name: 'transport', type: 'select', options: [['Automobile','Automobile'], ['Bike','Bike'], ['Motorbike','Motorbike'], ['Public_Transportation','Public Transportation'], ['Walking','Walking']] }
  ];

  return (
    <div className="obesity-card">


      <h2>Obesity Risk Prediction</h2>

      <form ref={formRef} className="obesity-form" onSubmit={handleSubmit} onScroll={handleScroll}>
        {questions.map((q, i) => (
          <div key={i} className="field-block">
            <label>{i + 1}. {q.label}</label>
            {q.type === 'select' ? (
              <select name={q.name} onChange={handleChange} required>
                <option value="">-- Select --</option>
                {q.options.map(([val, text], idx) => (
                  <option key={idx} value={val}>{text}</option>
                ))}
              </select>
            ) : (
              <input
                type={q.type}
                name={q.name}
                onChange={handleChange}
                required
              />
            )}
          </div>
        ))}

        {showScrollHint && (
          <div className="scroll-hint">✅ You’ve reached the bottom</div>
        )}

<div className="button-wrapper">
  <button type="button" className="submit-btn" onClick={scrollToTop}>
    ↑ Back to Top
  </button>
  <button type="submit" className="submit-btn">
    Predict
  </button>
</div>


      </form>
    </div>
  );
}


