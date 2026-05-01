import React, { useState } from "react";
import "./ObesityPredict.css";
import { useNavigate } from "react-router-dom";
import {
  ERROR_MESSAGES,
  validatePositiveNumber,
  validatePositiveFloat,
} from "../../utils/validationRules";
import FieldError from "../../components/FieldError";
import { toast } from "react-toastify";
import {
  API_BASE_URL,
  buildSurveyPayload,
  getApiErrorMessage,
} from "./surveyApi";

export default function ObesityPredict() {
  const [formData, setFormData] = useState({});
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Grouped Questions
  const questionGroups = {
    personal: [
      {
        label: "Gender",
        name: "gender",
        type: "select",
        options: [
          ["1", "Male"],
          ["2", "Female"],
        ],
      },
      { label: "Age (years)", name: "age", type: "number" },
      {
        label: "Height (metres)",
        name: "height",
        type: "number",
        placeholder: "e.g. 1.67",
        helperText: "Enter height in metres. Example: 167 cm = 1.67 m.",
        min: 0.5,
        max: 2.5,
        step: 0.01,
      },
      {
        label: "Weight (kg)",
        name: "weight",
        type: "number",
        placeholder: "e.g. 70",
        min: 10,
        max: 300,
        step: 0.1,
      },
    ],
    food: [
      {
        label: "Do you frequently eat high-calorie foods?",
        name: "favc",
        type: "select",
        options: [
          ["1", "Yes"],
          ["0", "No"],
        ],
      },
      {
        label: "Vegetable consumption (0-3)",
        name: "vegetables",
        type: "number",
        placeholder: "e.g. 2",
        min: 0,
        max: 5,
        step: 0.1,
      },
      {
        label: "Main meals per day",
        name: "meals",
        type: "number",
        placeholder: "e.g. 3",
        min: 0,
        max: 10,
        step: 1,
      },
      {
        label: "Snacks between meals",
        name: "caec",
        type: "select",
        options: [
          ["0", "Never"],
          ["1", "Sometimes"],
          ["2", "Frequently"],
          ["3", "Always"],
        ],
      },
      {
        label: "Water intake (litres)",
        name: "water",
        type: "number",
        placeholder: "e.g. 2",
        min: 0,
        max: 10,
        step: 0.1,
      },
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
          ["0", "No"],
          ["1", "Yes"],
        ],
      },
      {
        label: "Alcohol consumption",
        name: "alcohol",
        type: "select",
        options: [
          ["0", "Never"],
          ["1", "Sometimes"],
          ["2", "Frequently"],
        ],
      },
      {
        label: "Physical activity (hours/day)",
        name: "activity",
        type: "number",
        placeholder: "e.g. 1",
        min: 0,
        max: 10,
        step: 0.1,
      },
      {
        label: "Screen time (hours/day)",
        name: "screen_time",
        type: "number",
        placeholder: "e.g. 3",
        min: 0,
        max: 24,
        step: 0.1,
      },
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
  const numberRanges = {
    age: { min: 1, max: 119, message: "Please enter an age between 1 and 119." },
    height: { min: 0.5, max: 2.5, message: "Height must be entered in metres, between 0.5 and 2.5." },
    weight: { min: 10, max: 300, message: "Please enter a weight between 10 and 300 kg." },
    vegetables: { min: 0, max: 5, message: "Vegetable consumption must be between 0 and 5." },
    meals: { min: 0, max: 10, message: "Main meals per day must be between 0 and 10." },
    water: { min: 0, max: 10, message: "Water intake must be between 0 and 10 litres." },
    activity: { min: 0, max: 10, message: "Physical activity must be between 0 and 10 hours per day." },
    screen_time: { min: 0, max: 24, message: "Screen time must be between 0 and 24 hours per day." },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const floatFields = ['height', 'weight', 'water', 'activity', 'screen_time', 'vegetables'];
    const integerFields = ['age', 'meals'];
    const selectNumericFields = ['gender', 'smoke', 'alcohol', 'favc', 'caec'];

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
        (key) => updated[key] !== "",
      ).length;
      setProgress(Math.round((filled / totalQuestions) * 100));
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateField = (name, value) => {
    if (value === undefined || value === "") return ERROR_MESSAGES.REQUIRED;

    switch (name) {
      case "age":
      case "meals":
        if (validatePositiveNumber(value)) return validatePositiveNumber(value);
        break;
      case "height":
      case "weight":
      case "water":
      case "activity":
      case "screen_time":
        if (validatePositiveFloat(value)) return validatePositiveFloat(value);
        break;
      case "vegetables": {
        const floatError = validatePositiveFloat(value);
        if (floatError) return floatError;
        break;
      }
      default:
        break;
    }

    const range = numberRanges[name];
    if (range) {
      const numericValue = Number(value);
      if (Number.isNaN(numericValue) || numericValue < range.min || numericValue > range.max) {
        return range.message;
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errs = {};
    allQuestions.forEach((q) => {
      const val = formData[q.name];
      const fieldError = validateField(q.name, val);
      if (fieldError) errs[q.name] = fieldError;
    });

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTouched(
        allQuestions.reduce((acc, q) => ({ ...acc, [q.name]: true }), {}),
      );
      toast.error("Please fill in all fields correctly.");
      return;
    }

    try {
      const payload = buildSurveyPayload(formData);
      setIsSubmitting(true);

      const response = await fetch(
        `${API_BASE_URL}/api/medical-report/retrieve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
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
            <button type="submit" className="predict-btn" disabled={isSubmitting}>
              {isSubmitting ? "Predicting..." : "Predict"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
