import React, { useState } from "react";
import "./ObesityPredict.css";
import { useNavigate } from "react-router-dom";
import { ERROR_MESSAGES } from "../../utils/validationRules";
import FieldError from "../../components/FieldError";
import { toast } from "react-toastify";
import {
  API_BASE_URL,
  buildSurveyPayload,
  getApiErrorMessage,
} from "./surveyApi";

const FIELD_RANGES = {
  Age: { min: 1, max: 119, label: "Age must be between 1 and 119" },
  Height: { min: 0.5, max: 2.5, label: "Height must be between 0.5 m and 2.5 m" },
  Weight: { min: 10, max: 300, label: "Weight must be between 10 kg and 300 kg" },
  FCVC: { min: 0, max: 5, label: "Vegetable consumption frequency must be between 0 and 5" },
  NCP: { min: 1, max: 10, label: "Meals per day must be between 1 and 10" },
  CH2O: { min: 0, max: 10, label: "Water intake must be between 0 and 10 liters" },
  FAF: { min: 0, max: 10, label: "Physical activity must be between 0 and 10" },
  TUE: { min: 0, max: 24, label: "Screen time must be between 0 and 24 hours" },
};

const ERROR_FIELD_MAP = {
  Gender: 'Gender',
  Age: 'Age',
  Height: 'Height',
  Weight: 'Weight',
  family_history_with_overweight: 'family_history_with_overweight',
  FAVC: 'FAVC',
  FCVC: 'FCVC',
  NCP: 'NCP',
  CAEC: 'CAEC',
  SMOKE: 'SMOKE',
  CH2O: 'CH2O',
  SCC: 'SCC',
  FAF: 'FAF',
  TUE: 'TUE',
  CALC: 'CALC',
  MTRANS: 'MTRANS'
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

export default function ObesityPredict() {
  const [formData, setFormData] = useState({});
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const questionGroups = {
    personal: [
      {
        label: "Gender",
        name: "Gender",
        type: "select",
        options: [
          [1, "Male"],
          [2, "Female"],
        ],
      },
      {
        label: "Age",
        name: "Age",
        type: "number",
        placeholder: "e.g. 68",
        helperText: "Enter your age in years.",
      },
      {
        label: "Height",
        name: "Height",
        type: "number",
        placeholder: "e.g. 1.67",
        helperText: "Use metres. For example, 167 cm is 1.67 m.",
        min: 0.5,
        max: 2.5,
        step: 0.01,
      },
      {
        label: "Weight",
        name: "Weight",
        type: "number",
        placeholder: "e.g. 70",
        min: 10,
        max: 300,
        step: 0.1,
      },
    ],
    food: [
      {
        label: "How often do you eat high-calorie foods?",
        name: "FAVC",
        type: "select",
        options: [
          [1, "Yes"],
          [0, "No"],
        ],
        helperText: "Examples include fried foods, sweets, fast food, and sugary drinks.",
      },
      {
        label: "Vegetable intake",
        name: "FCVC",
        type: "select",
        options: [
          [0, "Rarely"],
          [1, "Sometimes"],
          [2, "Most days"],
          [3, "With most meals"],
        ],
        helperText: "Choose the closest usual pattern.",
      },
      {
        label: "Main meals per day",
        name: "NCP",
        type: "select",
        options: [
          [1, "1 meal"],
          [2, "2 meals"],
          [3, "3 meals"],
          [4, "4 or more meals"],
        ],
        helperText: "Count breakfast, lunch, dinner, or similar main meals.",
      },
      {
        label: "Snacks between meals",
        name: "CAEC",
        type: "select",
        options: [
          [0, "Never"],
          [1, "Sometimes"],
          [2, "Frequently"],
          [3, "Always"],
        ],
        helperText: "Choose the option closest to your usual routine.",
      },
      {
        label: "Water intake",
        name: "CH2O",
        type: "select",
        options: [
          [0.5, "Less than 1 litre"],
          [1, "About 1 litre"],
          [2, "About 2 litres"],
          [3, "3 litres or more"],
        ],
        helperText: "An estimate is enough.",
      },
      {
        label: "Do you track calorie intake?",
        name: "SCC",
        type: "select",
        options: [
          ["yes", "Yes"],
          ["no", "No"],
        ],
        helperText: "This can include using an app, diary, or checking food labels.",
      },
    ],
    lifestyle: [
      {
        label: "Do you smoke?",
        name: "SMOKE",
        type: "select",
        options: [
          [0, "No"],
          [1, "Yes"],
        ],
        helperText: "Used only to support the wellness summary.",
      },
      {
        label: "Alcohol consumption",
        name: "CALC",
        type: "select",
        options: [
          [0, "Never"],
          [1, "Sometimes"],
          [2, "Frequently"],
        ],
        helperText: "Choose the closest usual pattern.",
      },
      {
        label: "Daily physical activity",
        name: "FAF",
        type: "select",
        options: [
          [0.2, "Very little"],
          [1, "Light activity"],
          [3, "Active most days"],
          [5, "Very active"],
        ],
        helperText: "Include walking, housework, or light exercise.",
      },
      {
        label: "Daily screen time",
        name: "TUE",
        type: "select",
        options: [
          [1, "1-2 hours"],
          [3, "3-5 hours"],
          [6, "6-8 hours"],
          [9, "More than 8 hours"],
        ],
        helperText: "Choose the closest usual amount.",
      },
      {
        label: "Family history of overweight",
        name: "family_history_with_overweight",
        type: "select",
        options: [
          ["yes", "Yes"],
          ["no", "No"],
        ],
        helperText: "Select yes if close family members have had overweight or obesity concerns.",
      },
      {
        label: "Mode of transportation",
        name: "MTRANS",
        type: "select",
        options: [
          ["Automobile", "Automobile"],
          ["Bike", "Bike"],
          ["Motorbike", "Motorbike"],
          ["Public_Transportation", "Public Transportation"],
          ["Walking", "Walking"],
        ],
        helperText: "Choose how you usually get around.",
      },
    ],
  };

  const allQuestions = Object.values(questionGroups).flat();
  const totalQuestions = allQuestions.length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const floatFields = ['Height', 'Weight', 'CH2O', 'FAF', 'TUE', 'FCVC'];
    const integerFields = ['Age', 'NCP'];
      const selectNumericFields = ['Gender', 'SMOKE', 'CALC', 'FAVC', 'CAEC', 'FCVC', 'NCP', 'CH2O', 'FAF', 'TUE'];

    let parsedValue = value;
    if (floatFields.includes(name)) {
      parsedValue = value === '' ? '' : Number(value);
    } else if (integerFields.includes(name)) {
      parsedValue = value === '' ? '' : Number(value);
    } else if (selectNumericFields.includes(name)) {
      parsedValue = value === '' ? '' : Number(value);
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: parsedValue };
      const filled = Object.keys(updated).filter(
        (key) => updated[key] !== "" && updated[key] !== undefined
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
      const payload = buildSurveyPayload(formData);
      const response = await fetch(
        `${API_BASE_URL}/medical-report/retrieve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        if (response.status === 422 && Array.isArray(result.detail)) {
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

        throw new Error(
          await getApiErrorMessage(
            response,
            "Prediction failed. Please try again later."
          )
        );
      }

      const result = await response.json();
      localStorage.setItem("ObesityResult", JSON.stringify(result));
      localStorage.setItem("ObesitySurveyData", JSON.stringify(payload));
      toast.success("Survey submitted successfully!");
      navigate("/survey/result");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Prediction failed. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="obesity-card">
      <div className="heading_survey">Health & Lifestyle Check-In</div>

      <section className="survey-intro">
        <div>
          <h2>Build your health summary</h2>
          <p>
            Answer a few questions about your routine so NutriHelp can estimate your wellness category
            and prepare a starting point for healthier meal and activity guidance.
          </p>
        </div>
        <span>Not a diagnosis</span>
      </section>

      <div className="prog">
        <span className="progress-label">{progress}% completed</span>
      </div>

      <div className="main_foorm">
        <form className="obesity-form" onSubmit={handleSubmit}>
          {Object.entries(questionGroups).map(([groupName, questions]) => (
            <div key={groupName} className="question-group">
              <h3 className="group-heading">
                {groupName === "personal" && "👤 About You"}
                {groupName === "food" && "🍎 Eating Routine"}
                {groupName === "lifestyle" && "🏃 Daily Habits"}
              </h3>

              <div className="questions-grid">
                {questions.map((q) => (
                  <div key={q.name} className="question-card">
                    <label>{q.label}</label>
                    {q.type === "select" ? (
                      <select
                        name={q.name}
                        onChange={handleChange}
                        disabled={isSubmitting}
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
                        placeholder={q.placeholder}
                        min={q.min}
                        max={q.max}
                        step={q.step}
                        onChange={handleChange}
                        disabled={isSubmitting}
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
                    {q.helperText ? (
                      <div className="field-helper">{q.helperText}</div>
                    ) : null}
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
                "View My Health Summary"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
