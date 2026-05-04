import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import "./predictionresult.css";
import { API_BASE_URL, getApiErrorMessage } from "./surveyApi";

const getObesityRiskLevel = (level) => {
  if (!level) return { label: "N/A", class: "risk-unknown" };
  const l = String(level).toLowerCase();
  if (l.includes("insufficient") || l.includes("normal")) return { label: level, class: "risk-low" };
  if (l.includes("overweight")) return { label: level, class: "risk-medium" };
  if (l.includes("obesity")) return { label: level, class: "risk-high" };
  return { label: level, class: "risk-medium" };
};

const getRecommendations = (level) => {
  const l = String(level || "").toLowerCase();
  if (l.includes("obesity")) {
    return [
      "Consult a healthcare professional for a personalised weight management plan.",
      "Incorporate 150-300 minutes of moderate-intensity aerobic activity weekly.",
      "Focus on a high-protein, high-fiber, and portion-controlled diet.",
      "Monitor daily calorie and water intake strictly."
    ];
  }
  if (l.includes("overweight")) {
    return [
      "Aim for at least 150 minutes of physical activity per week.",
      "Reduce intake of processed sugars and high-calorie snacks.",
      "Increase vegetable and whole grain consumption.",
      "Ensure adequate hydration (2-3 litres per day)."
    ];
  }
  return [
    "Maintain your current balanced diet and regular physical activity.",
    "Monitor weight monthly to stay within the healthy range.",
    "Ensure 7-9 hours of quality sleep daily.",
    "Continue with your active lifestyle and mindfulness practices."
  ];
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
    const stored = localStorage.getItem("ObesityResult");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // The BFF returns { survey_id, medical_report: { obesity_prediction, diabetes_prediction } }
        setResult(parsed);
      } catch (e) {
        console.error("Error parsing stored result:", e);
      }
    }
  }, []);

  if (!result) {
    return (
      <div className="no-result">
        <h2>⚠️ No survey results found</h2>
        <p>It looks like you haven't completed the health survey yet.</p>
        <button className="back-btn" onClick={() => navigate("/survey")}>
          ← Start Survey
        </button>
      </div>
    );
  }

  const medicalReport = result.medical_report || {};
  const obesityData = medicalReport.obesity_prediction || {};
  const diabetesData = medicalReport.diabetes_prediction || {};
  const riskInfo = getObesityRiskLevel(obesityData.obesity_level);
  const recommendations = getRecommendations(obesityData.obesity_level);

  const handleDownloadPDF = () => {
    if (!resultRef.current) return;
    html2pdf().from(resultRef.current).save("Health_Summary_Report.pdf");
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("🔗 Link copied to clipboard!");
    });
  };

  const handleStartJourney = async () => {
    if (isSubmittingPlan) return;

    if (!targetWeight || !daysPerWeek) {
      alert("Please complete all follow-up fields.");
      return;
    }

    const daysValue = Number(daysPerWeek);
    if (Number.isNaN(daysValue) || daysValue < 0 || daysValue > 7) {
      alert("Days per week must be a number between 0 and 7.");
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
          ...parsedSurveyData,
          days_per_week: daysValue,
          target_weight: Number(targetWeight),
          workout_place: workoutPlace.toLowerCase(),
        },
      };

      setIsSubmittingPlan(true);

      const response = await fetch(
        `${API_BASE_URL}/medical-report/plan`,
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
      alert(error.message || "Failed to generate fitness plan.");
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  return (
    <div className="full" ref={resultRef}>
      <div className="prediction-heading">🎯 Your Personal Health Summary</div>
      
      <div className="result-info-container">
        <div className="result-card-simple">
          <div className="result-row">
            <span className="result-label">⚖️ Weight-Related Status:</span>
            <span className="result-value">
              <span className={`result-main-value ${riskInfo.class}`}>
                {humanizePredictionLabel(riskInfo.label)}
              </span>
              {obesityData.confidence !== undefined && (
                <span className="result-confidence">
                  {renderConfidence(obesityData.confidence)}
                </span>
              )}
            </span>
          </div>

          <div className="result-row">
            <span className="result-label">🩺 Diabetes Screening:</span>
            <span className="result-value">
              <span className="result-main-value">
                {renderDiabetesResult(diabetesData.diabetes)}
              </span>
              {diabetesData.confidence !== undefined && (
                <span className="result-confidence">
                  {renderConfidence(diabetesData.confidence)}
                </span>
              )}
            </span>
          </div>

          <div className="recommendations-section">
            <div className="recommendations-heading">📝 Recommended Next Steps:</div>
            <ul className="recommendations-list">
              {recommendations.map((rec, index) => (
                <li key={index} className="recommendation-item">
                  ✅ {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="result-note">
          ⚠️ <strong>Medical Disclaimer:</strong> This summary is an AI-powered wellness estimate based on your self-reported data. 
          It is not a medical diagnosis. Please consult a qualified healthcare professional for medical advice or treatment.
        </div>

        <div className="result-buttons">
          <button className="save-btton" onClick={handleDownloadPDF}>
            📄 Save as PDF
          </button>
          <button className="copy-btn" onClick={handleCopyLink}>
            🔗 Copy Share Link
          </button>
          <button className="back-btn" onClick={() => navigate("/survey")}>
            ← Retake Survey
          </button>
        </div>
      </div>

      <div className="fitness-question">
        {fitnessChoice === null && (
          <div className="choice-offer">
            <h3>💪 Ready to transform?</h3>
            <p>Get a personalised fitness roadmap based on your results.</p>
            <div className="choice-buttons">
              <button className="choice-yes" onClick={() => setFitnessChoice("yes")}>Yes, Start My Plan</button>
              <button className="choice-no" onClick={() => setFitnessChoice("no")}>Not Now</button>
            </div>
          </div>
        )}

        {fitnessChoice === "yes" && (
          <div className="followup-questions">
            <h3>Customise Your Journey 🚀</h3>
            <div className="followup-grid">
              <label>
              1️⃣ Target Weight (kg)
              <input
                type="number"
                placeholder="e.g. 75"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
              />
              </label>
              <label>
                2️⃣ Exercise Frequency (days/week)
                <input
                  type="number"
                  min="1"
                  max="7"
                  placeholder="1-7"
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(e.target.value)}
                />
              </label>
              <label>
                3️⃣ Preferred Workout Location
                <select
                  value={workoutPlace}
                  disabled={isSubmittingPlan}
                  onChange={(e) => setWorkoutPlace(e.target.value)}
                >
                  <option value="Home">Home (No equipment)</option>
                  <option value="Gym">Gym (Full access)</option>
                </select>
              </label>
            </div>
            <button
              className="start-btn"
              onClick={handleStartJourney}
              disabled={isSubmittingPlan}
            >
              {isSubmittingPlan ? "🚀 Generating Your Plan..." : "Generate My Fitness Roadmap"}
            </button>
          </div>
        )}

        {fitnessChoice === "no" && (
          <div className="no-journey">
            <p>No problem! You can always generate a plan later from your results page.</p>
            <button className="home-btn" onClick={() => navigate("/")}>🏠 Back to Home</button>
          </div>
        )}
      </div>
    </div>
  );
}