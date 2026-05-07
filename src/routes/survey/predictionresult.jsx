import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import "./predictionresult.css";
import { API_BASE_URL, getApiErrorMessage } from "./surveyApi";

const humanizePredictionLabel = (value) => {
  if (!value) return "N/A";
  const cleaned = String(value).replace(/_/g, " ");
  return cleaned.replace(/\bLevel I\b/, "Level I").replace(/\bLevel II\b/, "Level II");
};

const renderConfidence = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return "";
  }
  return `${(Number(value) * 100).toFixed(1)}% model confidence`;
};

const renderDiabetesResult = (value) => {
  if (value === undefined) return "Not available";
  return value
    ? "Potential diabetes risk signal detected"
    : "No diabetes risk signal detected";
};

export default function ObesityResult() {
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  const [fitnessChoice, setFitnessChoice] = useState(null);
  const [targetWeight, setTargetWeight] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState("");
  const [workoutPlace, setWorkoutPlace] = useState("Home");
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Read result from localStorage
    const stored = localStorage.getItem("ObesityResult");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setResult(parsed.medical_report || parsed);
      } catch (e) {
        console.error("Error parsing stored result:", e);
      }
    }
  }, []);

  const handleDownloadPDF = () => {
    if (!resultRef.current) return;
    html2pdf().from(resultRef.current).save("Obesity_Report.pdf");
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert("🔗 Link copied to clipboard!");
    });
  };

  const handleStartJourney = async () => {
    if (isSubmittingPlan) return;

    if (targetWeight === "" || daysPerWeek === "" || workoutPlace === "") {
      alert("Please complete all follow-up fields.");
      return;
    }

    const daysValue = Number(daysPerWeek);
    if (Number.isNaN(daysValue) || daysValue < 0 || daysValue > 7) {
      alert("days_per_week is required and must be between 0 and 7.");
      return;
    }
    if (!(Number(targetWeight) > 0)) {
      alert("target_weight must be greater than 0.");
      return;
    }

    const storedSurveyData = localStorage.getItem("ObesitySurveyData");
    if (!storedSurveyData) {
      alert("Survey data is missing. Please complete the survey again.");
      return;
    }

    try {
      const parsedSurveyData = JSON.parse(storedSurveyData);

      const payload = {
        medical_report: result,
        survey_data: {
          Gender: parsedSurveyData.Gender,
          Age: parsedSurveyData.Age,
          Height: parsedSurveyData.Height,
          Weight: parsedSurveyData.Weight,
          days_per_week: daysValue,
          target_weight: Number(targetWeight),
          workout_place: workoutPlace.toLowerCase(),
        },
      };

      setIsSubmittingPlan(true);

      const response = await fetch(
        `${API_BASE_URL}/api/medical-report/plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            "Failed to generate fitness plan. Please try again later."
          )
        );
      }

      const planResult = await response.json();
      localStorage.setItem("FitnessPlan", JSON.stringify(planResult));
      navigate("/roadmap");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to generate fitness plan. Please try again later.");
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  return (
    <div className="full" ref={resultRef}>
      <div className="prediction-heading">🎯 Your Health Summary</div>
      {result ? (
        <div className="result-info-container">
          <div className="result-card-simple">
            <div className="result-row">
              <span className="result-label">⚖️ Weight-related health category:</span>
              <span className="result-value">
                <span className="result-main-value">
                  {humanizePredictionLabel(result.obesity_prediction?.obesity_level)}
                </span>
                {result.obesity_prediction?.confidence !== undefined ? (
                  <span className="result-confidence">
                    {renderConfidence(result.obesity_prediction?.confidence)}
                  </span>
                ) : null}
              </span>
            </div>

            <div className="result-row">
              <span className="result-label">🩺 Diabetes screening result:</span>
              <span className="result-value">
                <span className="result-main-value">
                  {renderDiabetesResult(result.diabetes_prediction?.diabetes)}
                </span>
                {result.diabetes_prediction?.confidence !== undefined ? (
                  <span className="result-confidence">
                    {renderConfidence(result.diabetes_prediction?.confidence)}
                  </span>
                ) : null}
              </span>
            </div>
          </div>
          <div className="result-note">
            This summary is an AI-supported wellness estimate and should not be treated as a medical diagnosis.
            Use it as general guidance and speak with a healthcare professional if you need medical advice.
          </div>
          <div className="result-buttons">
            <button className="save-btton" onClick={handleDownloadPDF}>
              📄 Save as PDF
            </button>
            <button className="copy-btn" onClick={handleCopyLink}>
              🔗 Copy Share Link
            </button>
            <Link to="/survey">
              <button className="back-btn">← Back to Questionnaire</button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="no-result">
          <p>No result data available.</p>
          <Link to="/survey">
            <button className="back-btn">Take the Survey</button>
          </Link>
        </div>
      )}

      <div className="fitness-question">
        {fitnessChoice === null && (
          <>
            💪 Would you like a personalised fitness roadmap based on this result?
            <div className="choice-buttons">
              <button onClick={() => setFitnessChoice("yes")}>✅ Yes</button>
              <button onClick={() => setFitnessChoice("no")}>❌ No</button>
            </div>
          </>
        )}

        {fitnessChoice === "yes" && (
          <div className="followup-questions">
            <p>Great! Let’s get started 🚀</p>
            <label>
              1️⃣ What is your target weight?
              <input
                type="number"
                placeholder="(kg)"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
              />
            </label>
            <label>
              2️⃣ How many days a week can you exercise?
              <input
                type="number"
                min="0"
                max="7"
                placeholder="e.g., 4"
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(e.target.value)}
              />
            </label>
            <label>
              3️⃣ Do you prefer home workouts or gym?
              <select
                value={workoutPlace}
                disabled={isSubmittingPlan}
                onChange={(e) => setWorkoutPlace(e.target.value)}
              >
                <option value="Home">Home</option>
                <option value="Gym">Gym</option>
              </select>
            </label>
            <button
              className="start-btn"
              onClick={handleStartJourney}
              disabled={isSubmittingPlan}
            >
              {isSubmittingPlan ? "Generating Plan..." : "🚀 Start Journey"}
            </button>
          </div>
        )}

        {fitnessChoice === "no" && (
          <div className="no-journey">
            <p>That’s okay 👍 You can always start later.</p>
            <button onClick={() => navigate("/home")}>🏠 Go to Home</button>
          </div>
        )}
      </div>
    </div>
  );
}
