// import React, { useState } from "react";
// import "./FitnessInput.css"; // Assuming you've kept the existing styles in this file

// const FitnessInput = ({ onProfileSaved }) => {
//   const [currentFitness, setCurrentFitness] = useState({
//     weight: "",
//     height: "",
//     bodyType: "",
//   });
//   const [targetFitness, setTargetFitness] = useState({
//     targetWeight: "",
//     endGoal: "",
//   });
//   const [currentStep, setCurrentStep] = useState(1); // Step control (1 = current, 2 = target)

//   // Handle current fitness input change
//   const handleCurrentInputChange = (e) => {
//     const { name, value } = e.target;
//     setCurrentFitness({
//       ...currentFitness,
//       [name]: value,
//     });
//   };

//   // Handle target fitness input change
//   const handleTargetInputChange = (e) => {
//     const { name, value } = e.target;
//     setTargetFitness({
//       ...targetFitness,
//       [name]: value,
//     });
//   };

//   // Handle form submission
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (currentStep === 1) {
//       setCurrentStep(2); // Move to target goal input
//     } else {
//       alert("Form submitted!");
//       // Process the data here (send to backend or store in state)
//       onProfileSaved();
//     }
//   };

//   return (
//     <div className="fitness-form-container">

//       <form onSubmit={handleSubmit}>

//         {/* Step 1: Current Fitness */}
//         {currentStep === 1 && (

//           <div className="current-fitness-form">
//             <h2>Personalize Your Health Tracker</h2>
//             <div className="form-group">
//               <label>Current Weight (kg):</label>
//               <input
//                 type="number"
//                 name="weight"
//                 value={currentFitness.weight}
//                 onChange={handleCurrentInputChange}
//                 className="form-input"
//               />
//             </div>
//             <div className="form-group">
//               <label>Current Height (cm):</label>
//               <input
//                 type="number"
//                 name="height"
//                 value={currentFitness.height}
//                 onChange={handleCurrentInputChange}
//                 className="form-input"
//               />
//             </div>
//             <div className="form-group">
//               <label>Body Type:</label>
//               <select
//                 name="bodyType"
//                 value={currentFitness.bodyType}
//                 onChange={handleCurrentInputChange}
//                 className="form-input"
//               >
//                 <option value="">Select Body Type</option>
//                 <option value="Ectomorph">Ectomorph (Lean)</option>
//                 <option value="Mesomorph">Mesomorph (Muscular)</option>
//                 <option value="Endomorph">Endomorph (Rounder)</option>
//               </select>
//             </div>
//             <button type="submit" className="next-button">Next: Set Target Goal</button>
//           </div>
//         )}

//         {/* Step 2: Target Goal */}
//         {currentStep === 2 && (
//           <div className="target-goal-form">
//             <h3>What is your target goal?</h3>

//             {/* Question 1: Target Weight */}
//             <div className="form-group">
//               <label>Target Weight (kg):</label>
//               <input
//                 type="number"
//                 name="targetWeight"
//                 value={targetFitness.targetWeight}
//                 onChange={handleTargetInputChange}
//                 className="form-input"
//               />
//             </div>

//             {/* Question 2: End Goal */}
//             <div className="form-group">
//               <label>End Goal:</label>
//               <select
//                 name="endGoal"
//                 value={targetFitness.endGoal}
//                 onChange={handleTargetInputChange}
//                 className="form-input"
//               >
//                 <option value="">Select End Goal</option>
//                 <option value="Gain Muscle">Gain Muscle</option>
//                 <option value="Gain Weight">Gain Weight</option>
//                 <option value="Lose Weight">Lose Weight</option>
//                 <option value="Maintain">Maintain Weight</option>
//                 <option value="Healthy Schedule">Just a Healthy Schedule</option>
//               </select>
//             </div>

//             <button type="submit" className="submit-button">Submit</button>
//           </div>
//         )}
//       </form>
//     </div>
//   );
// };

// export default FitnessInput;

import React, { useState } from "react";
import "./FitnessInput.css";
import {
  ERROR_MESSAGES,
  validatePositiveNumber,
} from "../../../utils/validationRules";
import FieldError from "../../../components/FieldError";
import { toast } from "react-toastify";

const FitnessInput = ({ onProfileSaved }) => {
  const [currentFitness, setCurrentFitness] = useState({
    weight: "",
    height: "",
    bodyType: "",
  });
  const [targetFitness, setTargetFitness] = useState({
    targetWeight: "",
    endGoal: "",
  });
  const [currentStep, setCurrentStep] = useState(1);

  // Missing states added here as per Team Leader comments on my PR request
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Handles the current fitness input change here...
  const handleCurrentInputChange = (e) => {
    const { name, value } = e.target;
    // Functional gets updated to avoid the stale state (@Team Leader's comment on my PR request)
    setCurrentFitness((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handles the target fitness input change here...
  const handleTargetInputChange = (e) => {
    const { name, value } = e.target;
    // Functional gets updated to avoid the stale state (@Team Leader's comment on my PR request)
    setTargetFitness((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handles the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep === 1) {
      const err = {};
      const weightErr = validatePositiveNumber(currentFitness.weight);
      if (weightErr) err.weight = weightErr;
      const heightErr = validatePositiveNumber(currentFitness.height);
      if (heightErr) err.height = heightErr;
      if (!currentFitness.bodyType) err.bodyType = ERROR_MESSAGES.REQUIRED;

      if (Object.keys(err).length > 0) {
        setErrors(err);
        setTouched({ weight: true, height: true, bodyType: true });
        return;
      }
      setErrors({});
      setTouched({});
      setCurrentStep(2); // Moves to th target goal input...
    } else {
      const err = {};
      const tWeightErr = validatePositiveNumber(targetFitness.targetWeight);
      if (tWeightErr) err.targetWeight = tWeightErr;
      if (!targetFitness.endGoal) err.endGoal = ERROR_MESSAGES.REQUIRED;

      if (Object.keys(err).length > 0) {
        setErrors(err);
        setTouched({ targetWeight: true, endGoal: true });
        return;
      }
      // Prepares the data to be sent to the backend <\>
      const data = {
        weight: currentFitness.weight,
        height: currentFitness.height,
        bodyType: currentFitness.bodyType,
        targetWeight: targetFitness.targetWeight,
        endGoal: targetFitness.endGoal,
      };

      // Sends the data to the backend API using fetch
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}/api/fitness-journey`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          },
        );

        const result = await response.json();

        if (response.ok) {
          toast.success("Fitness journey saved successfully!");
          onProfileSaved(); // If you want to redirect or show something do it here after saving the data successfully...
        } else {
          toast.error(`Error: ${result?.error || "Something went wrong"}`);
        }
      } catch (error) {
        toast.error(`Network error: ${error.message}`);
      }
    }
  };

  return (
    <div className="fitness-form-container">
      <form onSubmit={handleSubmit}>
        {/* Step 1: Current Fitness */}
        {currentStep === 1 && (
          <div className="current-fitness-form">
            <h2>Personalize Your Health Tracker</h2>
            <div className="form-group">
              <label>Current Weight (kg):</label>
              <input
                type="number"
                name="weight"
                value={currentFitness.weight}
                onChange={handleCurrentInputChange}
                onBlur={() => setTouched((prev) => ({ ...prev, weight: true }))}
                className={`form-input ${errors.weight && touched.weight ? "border-red-500" : ""}`}
              />
              <FieldError error={errors.weight} touched={touched.weight} />
            </div>
            <div className="form-group">
              <label>Current Height (cm):</label>
              <input
                type="number"
                name="height"
                value={currentFitness.height}
                onChange={handleCurrentInputChange}
                onBlur={() => setTouched((prev) => ({ ...prev, height: true }))}
                className={`form-input ${errors.height && touched.height ? "border-red-500" : ""}`}
              />
              <FieldError error={errors.height} touched={touched.height} />
            </div>
            <div className="form-group">
              <label>Body Type:</label>
              <select
                name="bodyType"
                value={currentFitness.bodyType}
                onChange={handleCurrentInputChange}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, bodyType: true }))
                }
                className={`form-input ${errors.bodyType && touched.bodyType ? "border-red-500" : ""}`}
              >
                <option value="">Select Body Type</option>
                <option value="Ectomorph">Ectomorph (Lean)</option>
                <option value="Mesomorph">Mesomorph (Muscular)</option>
                <option value="Endomorph">Endomorph (Rounder)</option>
              </select>
              <FieldError error={errors.bodyType} touched={touched.bodyType} />
            </div>
            <button type="submit" className="next-button">
              Next: Set Target Goal
            </button>
          </div>
        )}

        {/* Step 2: Target Goal */}
        {currentStep === 2 && (
          <div className="target-goal-form">
            <h3>What is your target goal?</h3>

            {/* Question 1: Target Weight */}
            <div className="form-group">
              <label>Target Weight (kg):</label>
              <input
                type="number"
                name="targetWeight"
                value={targetFitness.targetWeight}
                onChange={handleTargetInputChange}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, targetWeight: true }))
                }
                className={`form-input ${errors.targetWeight && touched.targetWeight ? "border-red-500" : ""}`}
              />
              <FieldError
                error={errors.targetWeight}
                touched={touched.targetWeight}
              />
            </div>

            {/* Question 2: End Goal */}
            <div className="form-group">
              <label>End Goal:</label>
              <select
                name="endGoal"
                value={targetFitness.endGoal}
                onChange={handleTargetInputChange}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, endGoal: true }))
                }
                className={`form-input ${errors.endGoal && touched.endGoal ? "border-red-500" : ""}`}
              >
                <option value="">Select End Goal</option>
                <option value="Gain Muscle">Gain Muscle</option>
                <option value="Gain Weight">Gain Weight</option>
                <option value="Lose Weight">Lose Weight</option>
                <option value="Maintain">Maintain Weight</option>
                <option value="Healthy Schedule">
                  Just a Healthy Schedule
                </option>
              </select>
              <FieldError error={errors.endGoal} touched={touched.endGoal} />
            </div>

            <button type="submit" className="submit-button">
              Submit
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default FitnessInput;
