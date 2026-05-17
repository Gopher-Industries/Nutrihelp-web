import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ObesitySurveyResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.result || {};
  const form = location.state?.form || {};

  const riskLevel = result.riskLevel || result.risk_level || "Moderate";

  const bmi =
    form.weight && form.height
      ? (Number(form.weight) / Math.pow(Number(form.height) / 100, 2)).toFixed(1)
      : "N/A";

  const riskColor =
    riskLevel.toLowerCase() === "low"
      ? "#2e7d32"
      : riskLevel.toLowerCase() === "high"
      ? "#c62828"
      : "#ef6c00";

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>Your Health Results</h2>

        <h3>Risk Level</h3>
        <span style={{ ...styles.badge, background: riskColor }}>{riskLevel}</span>

        <h3>BMI Overview</h3>
        <h1>{bmi}</h1>

        <div style={styles.chartBg}>
          <div style={{ ...styles.chartFill, width: bmi === "N/A" ? "20%" : `${Math.min(Number(bmi) * 3, 100)}%` }} />
        </div>

        <h3>Recommendations</h3>
        <p>
          {result.recommendation ||
            result.recommendations ||
            "Focus on balanced meals, regular exercise, hydration, and consistent sleep."}
        </p>

        <button
          style={styles.primary}
          onClick={() => navigate("/fitness-roadmap-new", { state: { result, form } })}
        >
          View Fitness Roadmap
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 30, background: "#f6faf6", minHeight: "100vh" },
  card: { maxWidth: 650, margin: "auto", background: "#fff", padding: 25, borderRadius: 16 },
  badge: { color: "#fff", padding: "10px 18px", borderRadius: 20, fontWeight: "bold" },
  chartBg: { height: 18, background: "#ddd", borderRadius: 20, overflow: "hidden", margin: "15px 0" },
  chartFill: { height: "100%", background: "#1b7f3a" },
  primary: { width: "100%", padding: 14, background: "#1b7f3a", color: "#fff", border: "none", borderRadius: 10, marginTop: 20 },
};