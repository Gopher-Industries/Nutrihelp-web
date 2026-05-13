import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";
import "./predictionresult.css";
import { API_BASE_URL, getApiErrorMessage } from "./surveyApi";

const getMedicalReport = (result) => result?.medical_report || result || {};

const renderConfidence = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "";
  return `${(Number(value) * 100).toFixed(0)}% confidence`;
};

const getWeightSummary = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("insufficient")) {
    return {
      title: "Your weight may be below the usual healthy range",
      detail: "This can happen for many reasons. It may be worth checking whether you are eating enough regular meals.",
      nextStep: "Try steady meals and speak with a healthcare professional if this weight change was not planned.",
      tone: "watch",
    };
  }
  if (normalized.includes("normal")) {
    return {
      title: "Your weight appears to be in a usual healthy range",
      detail: "Keep focusing on balanced meals, regular movement, hydration, and sleep.",
      nextStep: "Keep your current routine and review it again if your health or activity changes.",
      tone: "good",
    };
  }
  if (normalized.includes("overweight")) {
    return {
      title: "Your weight may be above the usual healthy range",
      detail: "Small, steady changes to meals and activity may help over time.",
      nextStep: "Start with one realistic change, such as a short daily walk or reducing sugary snacks.",
      tone: "watch",
    };
  }
  if (normalized.includes("obesity")) {
    return {
      title: "Your answers suggest extra weight-related health attention may help",
      detail: "This is not a diagnosis. It means a routine health check and personalised advice may be useful.",
      nextStep: "Consider speaking with a GP or healthcare professional before making major diet or exercise changes.",
      tone: "care",
    };
  }
  return {
    title: "We prepared a weight-related estimate",
    detail: "Use this as a general guide, not as a diagnosis.",
    nextStep: "Review your answers or retake the check-in if anything looks unclear.",
    tone: "neutral",
  };
};

const getDiabetesSummary = (value) => {
  if (value === undefined || value === null) {
    return {
      title: "Blood sugar risk could not be estimated",
      detail: "Some information may be missing.",
      nextStep: "Retake the check-in with complete answers if you want a clearer estimate.",
      tone: "neutral",
    };
  }

  return value
    ? {
        title: "Some answers suggest a routine blood sugar check may be helpful",
        detail: "This does not mean you have diabetes. It only flags that some answers are worth checking safely.",
        nextStep: "Speak with a GP or healthcare professional, especially if you often feel thirsty, tired, or urinate more than usual.",
        tone: "care",
      }
    : {
        title: "No strong blood sugar warning sign was found from your answers",
        detail: "Continue with balanced meals, regular movement, and routine health checks.",
        nextStep: "Keep routine check-ups, especially if family history or symptoms change.",
        tone: "good",
      };
};

export default function ObesityResult() {
  const [result, setResult] = useState(null);
  const [fitnessChoice, setFitnessChoice] = useState(null);
  const [targetWeight, setTargetWeight] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState("");
  const [workoutPlace, setWorkoutPlace] = useState("Home");
  const [surveyData, setSurveyData] = useState(null);
  const [roadmapErrors, setRoadmapErrors] = useState({});
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const resultRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("ObesityResult");
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch (error) {
        console.error("Error parsing stored result:", error);
      }
    }

    const storedSurveyData = localStorage.getItem("ObesitySurveyData");
    if (storedSurveyData) {
      try {
        setSurveyData(JSON.parse(storedSurveyData));
      } catch (error) {
        console.error("Error parsing stored survey data:", error);
      }
    }
  }, []);

  if (!result) {
    return (
      <div className="full">
        <div className="no-result">
          <h2>No survey results found</h2>
          <p>Complete the health check-in first so NutriHelp can prepare your summary.</p>
          <button className="back-btn" onClick={() => navigate("/survey")}>
            Start Check-In
          </button>
        </div>
      </div>
    );
  }

  const medicalReport = getMedicalReport(result);
  const obesityData = medicalReport.obesity_prediction || {};
  const diabetesData = medicalReport.diabetes_prediction || {};
  const weightSummary = getWeightSummary(obesityData.obesity_level);
  const diabetesSummary = getDiabetesSummary(diabetesData.diabetes);

  const handleDownloadPDF = () => {
    if (!resultRef.current) return;
    html2pdf().from(resultRef.current).save("NutriHelp-Health-Summary.pdf");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success("Share link copied.");
    });
  };

  const validateRoadmapInputs = () => {
    const nextErrors = {};
    const targetWeightValue = Number(targetWeight);
    const currentWeight = Number(surveyData?.Weight);
    const daysValue = Number(daysPerWeek);

    if (targetWeight === "") {
      nextErrors.targetWeight = "Enter a target weight in kilograms.";
    } else if (!Number.isFinite(targetWeightValue)) {
      nextErrors.targetWeight = "Target weight must be a number.";
    } else if (targetWeightValue < 30 || targetWeightValue > 250) {
      nextErrors.targetWeight = "Choose a realistic target between 30 and 250 kg.";
    } else if (
      Number.isFinite(currentWeight) &&
      currentWeight > 0 &&
      (targetWeightValue < currentWeight * 0.5 || targetWeightValue > currentWeight * 1.5)
    ) {
      nextErrors.targetWeight = "Choose a target closer to your current weight. You can update it later.";
    }

    if (daysPerWeek === "") {
      nextErrors.daysPerWeek = "Choose how many days per week you can exercise.";
    } else if (!Number.isInteger(daysValue) || daysValue < 0 || daysValue > 7) {
      nextErrors.daysPerWeek = "Exercise days must be a whole number from 0 to 7.";
    }

    if (!workoutPlace) {
      nextErrors.workoutPlace = "Choose where you prefer to exercise.";
    }

    setRoadmapErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateRoadmapField = (field, value) => {
    setRoadmapErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "targetWeight") setTargetWeight(value);
    if (field === "daysPerWeek") setDaysPerWeek(value);
    if (field === "workoutPlace") setWorkoutPlace(value);
  };

  const handleStartJourney = async () => {
    if (isSubmittingPlan || !validateRoadmapInputs()) return;

    const storedSurveyData = localStorage.getItem("ObesitySurveyData");
    if (!storedSurveyData) {
      toast.error("Survey data is missing. Please complete the check-in again.");
      return;
    }

    try {
      const parsedSurveyData = JSON.parse(storedSurveyData);
      const payload = {
        medical_report: result,
        survey_data: {
          ...parsedSurveyData,
          days_per_week: Number(daysPerWeek),
          target_weight: Number(targetWeight),
          workout_place: workoutPlace.toLowerCase(),
        },
      };

      setIsSubmittingPlan(true);
      const response = await fetch(`${API_BASE_URL}/medical-report/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Failed to generate your roadmap. Please try again later.")
        );
      }

      const planResult = await response.json();
      localStorage.setItem("FitnessPlan", JSON.stringify(planResult));
      localStorage.removeItem("FitnessPlanCompleted");
      localStorage.removeItem("FitnessPlanUnlockedWeek");
      localStorage.removeItem("FitnessPlanCompletedDays");
      navigate("/roadmap");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to generate your roadmap.");
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  return (
    <div className="full" ref={resultRef}>
      <section className="summary-hero">
        <span className="summary-eyebrow">NutriHelp check-in</span>
        <h1>Your Health Summary</h1>
        <p>
          A simple wellness snapshot based on your answers. Use it as a guide for meal and activity
          planning, not as a medical diagnosis.
        </p>
      </section>

      <div className="result-info-container">
        <div className="result-card-simple">
          <div className="result-card-header">
            <div>
              <span className="result-card-kicker">Current estimate</span>
              <h2>Wellness indicators</h2>
            </div>
            <span className="summary-status">Review ready</span>
          </div>

          <div className={`result-row result-row--${weightSummary.tone}`}>
            <span className="result-label">
              <span className="result-icon">1</span>
              Weight-related guidance
            </span>
            <span className="result-value">
              <span className="result-main-value">{weightSummary.title}</span>
              <span className="result-description">{weightSummary.detail}</span>
              <span className="next-step-label">Suggested next step</span>
              <span className="result-description">{weightSummary.nextStep}</span>
              <span className="result-confidence">{renderConfidence(obesityData.confidence)}</span>
            </span>
          </div>

          <div className={`result-row result-row--${diabetesSummary.tone}`}>
            <span className="result-label">
              <span className="result-icon">2</span>
              Blood sugar guidance
            </span>
            <span className="result-value">
              <span className="result-main-value">{diabetesSummary.title}</span>
              <span className="result-description">{diabetesSummary.detail}</span>
              <span className="next-step-label">Suggested next step</span>
              <span className="result-description">{diabetesSummary.nextStep}</span>
              <span className="result-confidence">{renderConfidence(diabetesData.confidence)}</span>
            </span>
          </div>

          <details className="technical-details">
            <summary>Show AI technical details</summary>
            <div>
              <span>Weight model label: {obesityData.obesity_level || "Not available"}</span>
              <span>Diabetes model output: {String(diabetesData.diabetes ?? "Not available")}</span>
            </div>
          </details>
        </div>

        <div className="result-note">
          This is an AI-supported wellness estimate. Please speak with a healthcare professional
          before making medical decisions or major changes to your diet, medication, or exercise routine.
        </div>

        <div className="encouragement-card">
          <span>✓</span>
          <div>
            <strong>Small steps are enough.</strong>
            <p>The next plan can turn this summary into gentle weekly actions you can adjust anytime.</p>
          </div>
        </div>

        <div className="result-buttons">
          <button className="save-btton" onClick={handleDownloadPDF}>Save as PDF</button>
          <button className="copy-btn" onClick={handleCopyLink}>Copy Share Link</button>
          <button className="back-btn" onClick={() => navigate("/survey")}>Back to Check-In</button>
        </div>
      </div>

      <div className="fitness-question">
        {fitnessChoice === null && (
          <>
            <h2>Would you like a personalised activity roadmap?</h2>
            <p>NutriHelp can turn this summary into a gentle weekly plan for movement, meals, and reminders.</p>
            <div className="choice-buttons">
              <button onClick={() => setFitnessChoice("yes")}>Create Roadmap</button>
              <button onClick={() => setFitnessChoice("no")}>Not Now</button>
            </div>
          </>
        )}

        {fitnessChoice === "yes" && (
          <div className="followup-questions">
            <p>Tell us how you would like to start.</p>
            <label>
              Target weight
              <input
                type="number"
                placeholder="kg"
                value={targetWeight}
                aria-invalid={Boolean(roadmapErrors.targetWeight)}
                onChange={(event) => updateRoadmapField("targetWeight", event.target.value)}
              />
              <span className="input-help">Use a realistic short-term target.</span>
              {roadmapErrors.targetWeight ? <span className="field-error">{roadmapErrors.targetWeight}</span> : null}
            </label>
            <label>
              Exercise days per week
              <input
                type="number"
                min="0"
                max="7"
                placeholder="e.g., 4"
                value={daysPerWeek}
                aria-invalid={Boolean(roadmapErrors.daysPerWeek)}
                onChange={(event) => updateRoadmapField("daysPerWeek", event.target.value)}
              />
              <span className="input-help">Choose a whole number from 0 to 7.</span>
              {roadmapErrors.daysPerWeek ? <span className="field-error">{roadmapErrors.daysPerWeek}</span> : null}
            </label>
            <label>
              Preferred workout place
              <select
                value={workoutPlace}
                aria-invalid={Boolean(roadmapErrors.workoutPlace)}
                disabled={isSubmittingPlan}
                onChange={(event) => updateRoadmapField("workoutPlace", event.target.value)}
              >
                <option value="Home">Home</option>
                <option value="Gym">Gym</option>
              </select>
              <span className="input-help">Pick the place that feels easiest to maintain.</span>
              {roadmapErrors.workoutPlace ? <span className="field-error">{roadmapErrors.workoutPlace}</span> : null}
            </label>
            <button className="start-btn" onClick={handleStartJourney} disabled={isSubmittingPlan}>
              {isSubmittingPlan ? "Creating roadmap..." : "Create My Roadmap"}
            </button>
          </div>
        )}

        {fitnessChoice === "no" && (
          <div className="no-journey">
            <p>No problem. You can return to the check-in later when you are ready.</p>
            <button onClick={() => navigate("/")}>Back to Home</button>
          </div>
        )}
      </div>
    </div>
  );
}
