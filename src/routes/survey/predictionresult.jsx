import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import "./predictionresult.css";

export default function ObesityResult() {
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [fitnessChoice, setFitnessChoice] = useState(null); // "yes" | "no" | null
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Read result from localStorage
    const stored = localStorage.getItem("ObesityResult");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setResult(parsed);
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

  return (
    <div className="full" ref={resultRef}>
      <div className="prediction-heading">🎯 Your Health Report</div>
      {result ? (
        <div className="result-info-container">
          <div className="result-card-simple">
            <div className="result-row">
              <span className="result-label">⚖️ Obesity Level:</span>
              <span className="result-value">
                {result.medical_report?.obesity_level || "N/A"}
                {result.probability &&
                  ` (${(result.probability * 100).toFixed(1)}% confidence)`}
              </span>
            </div>

            {/* Recommendations Section */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="recommendations-section">
                <div className="recommendations-heading">📝 Recommended Actions:</div>
                <ul className="recommendations-list">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="recommendation-item">
                      ✅ {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
            💪 Do you want to start your fitness journey?
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
              <input type="text" placeholder="(kG)" />
            </label>
            <label>
              2️⃣ How many days a week can you exercise?
              <input type="number" placeholder="e.g., 3" />
            </label>
            <label>
              3️⃣ Do you prefer home workouts or gym?
              <select>
                <option>Home</option>
                <option>Gym</option>
                <option>Both</option>
              </select>
            </label>
            <button className="start-btn" onClick={() => navigate("/roadmap")}>
              🚀 Start Journey
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