import React, { useState } from "react";
import "./ObesityPredict.css";
import { useNavigate } from "react-router-dom";
import { ERROR_MESSAGES } from "../../utils/validationRules";
import FieldError from "../../components/FieldError";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../services/baseApi";

const FIELD_RANGES = {
  age: { min: 1, max: 120, label: "Age must be between 1 and 120" },
  height: { min: 0.5, max: 2.5, label: "Height must be between 0.5 m and 2.5 m" },
  weight: { min: 10, max: 300, label: "Weight must be between 10 kg and 300 kg" },
  vegetables: { min: 0, max: 5, label: "Vegetable consumption frequency must be between 0 and 5" },
  meals: { min: 1, max: 10, label: "Meals per day must be between 1 and 10" },
  water: { min: 0, max: 10, label: "Water intake must be between 0 and 10 liters" },
  activity: { min: 0, max: 10, label: "Physical activity must be between 0 and 10" },
  screen_time: { min: 0, max: 24, label: "Screen time must be between 0 and 24 hours" },
};

const ERROR_FIELD_MAP = {
  Gender: 'gender',
  Age: 'age',
  Height: 'height',
  Weight: 'weight',
  family_history_with_overweight: 'family_history',
  FAVC: 'FAVC',
  FCVC: 'vegetables',
  NCP: 'meals',
  CAEC: 'CAEC',
  SMOKE: 'smoke',
  CH2O: 'water',
  SCC: 'monitor',
  FAF: 'activity',
  TUE: 'screen_time',
  CALC: 'alcohol',
  MTRANS: 'transport'
};

function validateNumericField(name, value) {
  if (value === undefined || value === null || value === "") {
    return ERROR_MESSAGES.REQUIRED;
  }
  const num = Number(value);
  if (isNaN(num)) return "Please enter a valid number";
  const range = FIELD_RANGES[name];
  if (range && (num < range.min || num > range.max)) {
    return range.label;
  }
  if (num < 0) return "Value must not be negative";
  return null;
}

function mapToBackendPayload(formData) {
  return {
    "Gender": formData.gender === 1 ? "Male" : "Female",
    "Age": formData.age,
    "Height": formData.height,
    "Weight": formData.weight,
    "Any family history of overweight (yes/no)": formData.family_history,
    "Frequent High Calorie Food Consumption (yes/no)": formData.FAVC,
    "Consumption of vegetables in meals": formData.vegetables,
    "Consumption of Food Between Meals": formData.CAEC,
    "Number of Main Meals": formData.meals,
    "Daily Water Intake": formData.water,
    "Do you Smoke?": formData.smoke === 1 ? "yes" : "no",
    "Do you monitor your daily calories?": formData.monitor,
    "Physical Activity Frequency": formData.activity,
    "Time Using Technology Devices Daily": formData.screen_time,
    "Alcohol Consumption Rate": formData.alcohol,
    "Mode of Transportation you use": formData.transport,
  };
}

export default function ObesityPredict() {
  const [formData, setFormData] = useState({});
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const API_URL = `${API_BASE_URL}/medical-report/retrieve`;

  const questionGroups = {
    personal: [
      {
        label: "Gender",
        name: "gender",
        type: "select",
        options: [
          [1, "Male"],
          [2, "Female"],
        ],
      },
      { label: "Age (years)", name: "age", type: "number" },
      { label: "Height (m)", name: "height", type: "number" },
      { label: "Weight (kg)", name: "weight", type: "number" },
    ],
    food: [
      {
        label: "Frequent consumption of high caloric food?",
        name: "FAVC",
        type: "select",
        options: [
          ["yes", "Yes"],
          ["no", "No"],
        ],
      },
      {
        label: "Vegetable consumption frequency (0-5)",
        name: "vegetables",
        type: "number",
      },
      { label: "Main meals per day (1-10)", name: "meals", type: "number" },
      {
        label: "Consumption of food between meals",
        name: "CAEC",
        type: "select",
        options: [
          ["no", "No"],
          ["Sometimes", "Sometimes"],
          ["Frequently", "Frequently"],
          ["Always", "Always"],
        ],
      },
      { label: "Water intake (liters)", name: "water", type: "number" },
      {
        label: "Monitor calorie intake?",
        name: "monitor",
        type: "select",
        options: [
          ["yes", "Yes"],
          ["no", "No"],
        ],
      },
    ],
    lifestyle: [
      {
        label: "Do you smoke?",
        name: "smoke",
        type: "select",
        options: [
          [0, "No"],
          [1, "Yes"],
        ],
      },
      {
        label: "Alcohol consumption",
        name: "alcohol",
        type: "select",
        options: [
          ["no", "Never"],
          ["Sometimes", "Sometimes"],
          ["Frequently", "Frequently"],
          ["Always", "Always"],
        ],
      },
      {
        label: "Physical activity weekly frequency",
        name: "activity",
        type: "number",
      },
      { label: "Screen time (hours/day)", name: "screen_time", type: "number" },
      {
        label: "Family history of overweight",
        name: "family_history",
        type: "select",
        options: [
          ["yes", "Yes"],
          ["no", "No"],
        ],
      },
      {
        label: "Mode of transportation",
        name: "transport",
        type: "select",
        options: [
          ["Automobile", "Automobile"],
          ["Bike", "Bike"],
          ["Motorbike", "Motorbike"],
          ["Public_Transportation", "Public Transportation"],
          ["Walking", "Walking"],
        ],
      },
    ],
  };

  const allQuestions = Object.values(questionGroups).flat();
  const totalQuestions = allQuestions.length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['height', 'weight', 'water', 'activity', 'screen_time', 'vegetables', 'meals', 'age'];
    
    // Convert to number if numeric field, otherwise keep as string (for "yes"/"no", "Sometimes")
    let parsedValue = value;
    if (numericFields.includes(name)) {
      parsedValue = value === '' ? '' : Number(value);
    } else if (['gender', 'smoke'].includes(name)) { // These specific ones are integers in backend
      parsedValue = value === '' ? '' : Number(value);
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: parsedValue };
      const filled = Object.keys(updated).filter(
        (key) => updated[key] !== "",
      ).length;
      setProgress(Math.round((filled / totalQuestions) * 100));
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const errs = {};
    allQuestions.forEach((q) => {
      const val = formData[q.name];
      if (val === undefined || val === "") {
        errs[q.name] = ERROR_MESSAGES.REQUIRED;
      } else if (q.type === "number") {
        const numErr = validateNumericField(q.name, val);
        if (numErr) errs[q.name] = numErr;
      }
    });

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTouched(
        allQuestions.reduce((acc, q) => ({ ...acc, [q.name]: true }), {}),
      );
      toast.error("Please fill in all fields correctly.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = mapToBackendPayload(formData);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 422 && result.detail) {
          const fieldErrors = {};
          result.detail.forEach((err) => {
            if (err.loc && err.loc.length > 1) {
              const backendField = err.loc[err.loc.length - 1];
              const feField = ERROR_FIELD_MAP[backendField] || backendField;
              fieldErrors[feField] = err.msg;
            }
          });
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            setTouched(
              allQuestions.reduce((acc, q) => ({ ...acc, [q.name]: true }), {}),
            );
          }
          toast.error("Validation failed. Please check the highlighted fields.");
          return;
        }

        if (response.status === 429) {
          toast.error("Too many requests. Please wait a few minutes before trying again.");
          return;
        }

        throw new Error(result.error || result.message || "Server error. Please try again later.");
      }

      localStorage.setItem("ObesityResult", JSON.stringify(result));
      toast.success("Survey submitted successfully!");
      navigate("/survey/result");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Prediction failed. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="obesity-card">
      <div className="heading_survey">Personal Medical Survey</div>

      <div className="prog">
        <span className="progress-label">{progress}% completed</span>
      </div>

      <div className="main_foorm">
        <form className="obesity-form" onSubmit={handleSubmit}>
          {Object.entries(questionGroups).map(([groupName, questions]) => (
            <div key={groupName} className="question-group">
              <h3 className="group-heading">
                {groupName === "personal" && "👤 Personal Information"}
                {groupName === "food" && "🍎 Food & Diet"}
                {groupName === "lifestyle" && "🏃 Lifestyle & Habits"}
              </h3>

              <div className="questions-grid">
                {questions.map((q) => (
                  <div key={q.name} className="question-card">
                    <label>{q.label}</label>
                    {q.type === "select" ? (
                      <select
                        name={q.name}
                        onChange={handleChange}
                        onBlur={() =>
                          setTouched((prev) => ({ ...prev, [q.name]: true }))
                        }
                        className={
                          errors[q.name] && touched[q.name]
                            ? "error-border"
                            : ""
                        }
                        value={formData[q.name] ?? ""}
                      >
                        <option value="">-- Select --</option>
                        {q.options.map(([val, text]) => (
                          <option key={val} value={val}>
                            {text}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={q.type}
                        name={q.name}
                        onChange={handleChange}
                        onBlur={() =>
                          setTouched((prev) => ({ ...prev, [q.name]: true }))
                        }
                        className={
                          errors[q.name] && touched[q.name]
                            ? "error-border"
                            : ""
                        }
                        value={formData[q.name] || ""}
                      />
                    )}
                    <FieldError
                      error={errors[q.name]}
                      touched={touched[q.name]}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="predict">
            <button
              type="submit"
              className={`predict-btn ${isSubmitting ? "predict-btn--loading" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" aria-hidden="true"></span>
                  Analyzing…
                </>
              ) : (
                "Predict"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}