import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export default function FitnessRoadmapScreen() {
  const location = useLocation();
  const form = location.state?.form || {};
  const result = location.state?.result || {};

  const [roadmap, setRoadmap] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateRoadmap();
  }, []);

  const generateRoadmap = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/ai-model/medical-report/plan/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form, result }),
      });

      const data = await res.json();
      setRoadmap(data);
    } catch {
      setRoadmap({
        weeklyExercisePlan: [
          "Walk 20–30 minutes, 4 days per week.",
          "Do light stretching daily.",
          "Add beginner strength exercises twice per week.",
        ],
        dietaryRecommendations: [
          "Eat more vegetables, fruits, and whole grains.",
          "Reduce sugary drinks and processed food.",
          "Drink enough water daily.",
        ],
        milestones: [
          "4 weeks: Build a regular walking habit.",
          "8 weeks: Improve stamina and reduce waist measurement.",
          "12 weeks: Maintain consistent exercise and healthy eating.",
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestone = (item) => {
    setCompleted((prev) =>
      prev.includes(item) ? prev.filter((m) => m !== item) : [...prev, item]
    );
  };

  const shareRoadmap = () => {
    const text = `
NutriHelp Fitness Roadmap

Weekly Exercise Plan:
${roadmap.weeklyExercisePlan.join("\n")}

Dietary Recommendations:
${roadmap.dietaryRecommendations.join("\n")}

Milestones:
${roadmap.milestones.join("\n")}
`;

    navigator.clipboard.writeText(text);
    alert("Roadmap copied to clipboard.");
  };

  if (loading) return <div style={styles.center}>Generating fitness roadmap...</div>;

  if (!roadmap) return null;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>Fitness Roadmap</h2>

        <h3>Weekly Exercise Plan</h3>
        <ul>
          {roadmap.weeklyExercisePlan.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <h3>Dietary Recommendations</h3>
        <ul>
          {roadmap.dietaryRecommendations.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <h3>Milestone Targets</h3>
        {roadmap.milestones.map((item, index) => (
          <label key={index} style={styles.option}>
            <input
              type="checkbox"
              checked={completed.includes(item)}
              onChange={() => toggleMilestone(item)}
            />
            {item}
          </label>
        ))}

        <button style={styles.primary} onClick={shareRoadmap}>
          Share Roadmap
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 30, background: "#f6faf6", minHeight: "100vh" },
  card: { maxWidth: 700, margin: "auto", background: "#fff", padding: 25, borderRadius: 16 },
  option: { display: "block", margin: "12px 0" },
  primary: { width: "100%", padding: 14, background: "#1b7f3a", color: "#fff", border: "none", borderRadius: 10, marginTop: 20 },
  center: { padding: 50, textAlign: "center" },
};