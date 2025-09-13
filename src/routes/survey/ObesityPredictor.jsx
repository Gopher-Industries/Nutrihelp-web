// import React, { useState, useRef } from 'react';
// import './ObesityPredict.css';
// import { useNavigate } from 'react-router-dom';

// export default function ObesityPredict() {
//   const [formData, setFormData] = useState({});
//   const [progress, setProgress] = useState(0);
//   const [showScrollHint, setShowScrollHint] = useState(false);
//   const formRef = useRef(null);
//   const navigate = useNavigate();

//   const questions = [
//     { label: 'Gender', name: 'gender', type: 'select', options: [['1','Male'], ['2','Female']] },
//     { label: 'Age (years)', name: 'age', type: 'number' },
//     { label: 'Height (cm)', name: 'height', type: 'number' },
//     { label: 'Weight (kg)', name: 'weight', type: 'number' },
//     { label: 'Family history of overweight', name: 'family_history', type: 'select', options: [['yes','Yes'], ['no','No']] },
//     { label: 'Calorie intake (per day)', name: 'calories', type: 'number' },
//     { label: 'Vegetable consumption (0-3)', name: 'vegetables', type: 'number' },
//     { label: 'Main meals per day', name: 'meals', type: 'number' },
//     { label: 'Snacks between meals (0–3)', name: 'snacks', type: 'number' },
//     { label: 'Do you smoke?', name: 'smoke', type: 'select', options: [['0','No'], ['1','Yes']] },
//     { label: 'Water intake (liters)', name: 'water', type: 'number' },
//     { label: 'Monitor calorie intake?', name: 'monitor', type: 'select', options: [['yes','Yes'], ['no','No']] },
//     { label: 'Physical activity (hours/day)', name: 'activity', type: 'number' },
//     { label: 'Screen time (hours/day)', name: 'screen_time', type: 'number' },
//     { label: 'Alcohol consumption', name: 'alcohol', type: 'select', options: [['0','Never'], ['1','Sometimes'], ['2','Frequently']] },
//     { label: 'Mode of transportation', name: 'transport', type: 'select', options: [['Automobile','Automobile'], ['Bike','Bike'], ['Motorbike','Motorbike'], ['Public_Transportation','Public Transportation'], ['Walking','Walking']] }
//   ];

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     const numericFields = [
//       'gender', 'age', 'height', 'weight', 'calories',
//       'vegetables', 'meals', 'snacks', 'smoke',
//       'water', 'activity', 'screen_time', 'alcohol'
//     ];

//     const parsedValue = numericFields.includes(name) ? Number(value) : value;

//     setFormData(prev => {
//       const updated = { ...prev, [name]: parsedValue };
//       const filled = Object.keys(updated).filter(key => updated[key] !== '').length;
//       setProgress(Math.round((filled / questions.length) * 100));
//       return updated;
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // ✅ Save data to localStorage for now
//     localStorage.setItem('obesityFormData', JSON.stringify(formData));

//     // 🔹 Later: Enable this API call
//     /*
//     const payload = {
//       Gender: formData.gender,
//       Age: formData.age,
//       Height: formData.height / 100,
//       Weight: formData.weight,
//       family_history_with_overweight: formData.family_history,
//       FAVC: formData.calories,
//       FCVC: formData.vegetables,
//       NCP: formData.meals,
//       CAEC: formData.snacks,
//       SMOKE: formData.smoke,
//       CH2O: formData.water,
//       SCC: formData.monitor,
//       FAF: formData.activity,
//       TUE: formData.screen_time,
//       CALC: formData.alcohol,
//       MTRANS: formData.transport
//     };

//     fetch('http://localhost:80/api/medical-report/retrieve', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload)
//     })
//     .then(res => res.json())
//     .then(result => {
//       localStorage.setItem('obesityResult', JSON.stringify(result));
//       navigate('/predict/result');
//     })
//     .catch(err => {
//       console.error(err);
//       alert('Prediction failed. Please try again later.');
//     });
//     */

//     // For now, just navigate to the results page
//     navigate('/predict/result');
//   };

//   const scrollToTop = () => {
//     formRef.current.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const handleScroll = () => {
//     const { scrollTop, scrollHeight, clientHeight } = formRef.current;
//     setShowScrollHint(scrollTop + clientHeight >= scrollHeight - 10);
//   };

//   return (
//     <div className="obesity-card">
//       <h2>Personal Medical Survey</h2>

//       <div className="progress-bar-container">
//         <div className="progress-bar" style={{ width: `${progress}%` }}></div>
//         <span className="progress-label">{progress}% completed</span>
//       </div>

//       <form
//         ref={formRef}
//         className="obesity-form"
//         onSubmit={handleSubmit}
//         onScroll={handleScroll}
//       >
//         {questions.map((q, i) => (
//           <div key={i} className="field-block">
//             <label>{i + 1}. {q.label}</label>
//             {q.type === 'select' ? (
//               <select name={q.name} onChange={handleChange} required>
//                 <option value="">-- Select --</option>
//                 {q.options.map(([val, text], idx) => (
//                   <option key={idx} value={val}>{text}</option>
//                 ))}
//               </select>
//             ) : (
//               <input
//                 type={q.type}
//                 name={q.name}
//                 onChange={handleChange}
//                 required
//               />
//             )}
//           </div>
//         ))}

//         {showScrollHint && (
//           <div className="scroll-hint">✅ You’ve reached the bottom</div>
//         )}

//         <button type="button" className="scroll-top-btn-inline" onClick={scrollToTop}>
//           ↑ Back to Top
//         </button>

//         <button type="submit" className="submit-btn">Predict</button>
//       </form>
//     </div>
//   );
// }

import React, { useState, useRef } from 'react';
import './ObesityPredict.css';
import { useNavigate } from 'react-router-dom';

export default function ObesityPredict() {
  const [formData, setFormData] = useState({});
  const [progress, setProgress] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();

  // Grouped Questions
  const questionGroups = {
    personal: [
      { label: 'Gender', name: 'gender', type: 'select', options: [['1','Male'], ['2','Female']] },
      { label: 'Age (years)', name: 'age', type: 'number' },
      { label: 'Height(m)', name: 'height', type: 'number' },
      { label: 'Weight (kg)', name: 'weight', type: 'number' }
      
    ],
    food: [
      { label: 'Calorie intake (per day)', name: 'calories', type: 'number' },
      { label: 'Vegetable consumption (0-3)', name: 'vegetables', type: 'number' },
      { label: 'Main meals per day', name: 'meals', type: 'number' },
      { label: 'Snacks between meals (0–3)', name: 'snacks', type: 'number' },
      { label: 'Water intake (liters)', name: 'water', type: 'number' },
      { label: 'Monitor calorie intake?', name: 'monitor', type: 'select', options: [['yes','Yes'], ['no','No']] }
    ],
    lifestyle: [
      { label: 'Do you smoke?', name: 'smoke', type: 'select', options: [['0','No'], ['1','Yes']] },
      { label: 'Alcohol consumption', name: 'alcohol', type: 'select', options: [['0','Never'], ['1','Sometimes'], ['2','Frequently']] },
      { label: 'Physical activity (hours/day)', name: 'activity', type: 'number' },
      { label: 'Screen time (hours/day)', name: 'screen_time', type: 'number' },
      { label: 'Family history of overweight', name: 'family_history', type: 'select', options: [['yes','Yes'], ['no','No']] },
      { label: 'Mode of transportation', name: 'transport', type: 'select', options: [
        ['Automobile','Automobile'], 
        ['Bike','Bike'], 
        ['Motorbike','Motorbike'], 
        ['Public_Transportation','Public Transportation'], 
        ['Walking','Walking']
      ] }
    ]
  };

  const allQuestions = Object.values(questionGroups).flat();
  const totalQuestions = allQuestions.length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = [
      'gender', 'age', 'height', 'weight', 'calories',
      'vegetables', 'meals', 'snacks', 'smoke',
      'water', 'activity', 'screen_time', 'alcohol'
    ];
    const parsedValue = numericFields.includes(name) ? Number(value) : value;

    setFormData(prev => {
      const updated = { ...prev, [name]: parsedValue };
      const filled = Object.keys(updated).filter(key => updated[key] !== '').length;
      setProgress(Math.round((filled / totalQuestions) * 100));
      return updated;
    });
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();

  //   // ✅ Build payload in backend format
  //   const payload = {
  //     Gender: formData.gender,
  //     Age: formData.age,
  //     Height: formData.height, // convert cm → meters
  //     Weight: formData.weight,
  //     family_history_with_overweight: formData.family_history,
  //     FAVC: formData.calories,
  //     FCVC: formData.vegetables,
  //     NCP: formData.meals,
  //     CAEC: formData.snacks,
  //     SMOKE: formData.smoke,
  //     CH2O: formData.water,
  //     SCC: formData.monitor,
  //     FAF: formData.activity,
  //     TUE: formData.screen_time,
  //     CALC: formData.alcohol,
  //     MTRANS: formData.transport
  //   };

  //   // Save to localStorage in case user refreshes
  //   localStorage.setItem('obesityFormData', JSON.stringify(formData));

  //   // 🔹 Call backend
  //   fetch('http://localhost:8000/ai-model/medical-report/retrieve', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(payload)
  //   })
  //     .then(res => res.json())
  //     .then(result => {
  //       localStorage.setItem('obesityResult', JSON.stringify(result));
  //       navigate('/predict/result');
  //     })
  //     .catch(err => {
  //       console.error(err);
  //       alert('Prediction failed. Please try again later.');
  //     });
  // };
  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // map formData to backend format
    const payload = {
      Gender: formData.gender,
      Age: formData.age,
      Height: formData.height, // convert cm to meters
      Weight: formData.weight,
      family_history_with_overweight: formData.family_history,
      FAVC: formData.calories,
      FCVC: formData.vegetables,
      NCP: formData.meals,
      CAEC: formData.snacks,
      SMOKE: formData.smoke,
      CH2O: formData.water,
      SCC: formData.monitor,
      FAF: formData.activity,
      TUE: formData.screen_time,
      CALC: formData.alcohol,
      MTRANS: formData.transport
    };

    const response = await fetch('http://localhost:8000/ai-model/medical-report/retrieve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('API request failed');

    const result = await response.json();
    localStorage.setItem('ObesityResult', JSON.stringify(result));
    navigate('/survey/result');
  } catch (err) {
    console.error(err);
    alert('Prediction failed. Please try again later.');
  }
};


  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = formRef.current;
    setShowScrollHint(scrollTop + clientHeight >= scrollHeight - 10);
  };

  return (
    <div className="obesity-card">
      <div className="heading_survey">
        <h2>Personal Medical Survey</h2>
      </div>

      <div className="prog">
        <span className="progress-label">{progress}% completed</span>
      </div>

      <div className="main_foorm">
        <form ref={formRef} className="obesity-form" onScroll={handleScroll} onSubmit={handleSubmit}>
          
          {Object.entries(questionGroups).map(([groupName, questions]) => (
            <div key={groupName} className="question-group">
              <h3 className="group-heading">
                {groupName === 'personal' && '👤 Personal Information'}
                {groupName === 'food' && '🍎 Food & Diet'}
                {groupName === 'lifestyle' && '🏃 Lifestyle & Habits'}
              </h3>

              <div className="questions-grid">
                {questions.map((q) => (
                  <div key={q.name} className="question-card">
                    <label>{q.label}</label>
                    {q.type === 'select' ? (
                      <select
                      name={q.name}
                      onChange={handleChange}
                      required
                      value={formData[q.name] ?? ''}
                    >
                      <option value="">-- Select --</option>
                      {q.options.map(([val, text]) => (
                        <option 
                          key={val} 
                          value={q.type === "number" ? Number(val) : val}
                        >
                          {text}
                        </option>
                      ))}
                    </select>
                    ) : (
                      <input
                        type={q.type}
                        name={q.name}
                        onChange={handleChange}
                        required
                        value={formData[q.name] || ''}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {showScrollHint && <div className="scroll-hint">✅ You’ve reached the bottom</div>}

          <div className='predict'>
            <button type="submit" className="predict-btn">Predict</button>
          </div>
        </form>
      </div>
    </div>
  );
}
