import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AI_MODEL_URL = process.env.REACT_APP_AI_MODEL_URL || "http://localhost:8000/ai-model";

export default function ObesitySurveyScreen() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    age: "",
    weight: "",
    height: "",
    waist: "",
    activityLevel: "",
    dietQuality: "",
    familyHistory: "",
    existingConditions: "",
  });

  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const submitSurvey = async () => {
    if (!form.age || !form.weight || !form.height || !form.waist) {
      return alert("Please complete all metric fields.");
    }

    setLoading(true);

    try {
      const res = await fetch(`${AI_MODEL_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      navigate("/obesity-survey-result-new", { state: { result: data, form } });
    } catch {
      navigate("/obesity-survey-result-new", {
        state: {
          form,
          result: {
            riskLevel: "Moderate",
            recommendation:
              "Maintain a balanced diet, exercise regularly, and monitor your health progress.",
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.center}>Analysing your health data...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>Obesity Risk Survey</h2>

        {["age", "weight", "height", "waist"].map((field) => (
          <input
            key={field}
            style={styles.input}
            placeholder={field}
            type="number"
            value={form[field]}
            onChange={(e) => updateField(field, e.target.value)}
          />
        ))}

        <h3>Activity Level</h3>
        {["Low", "Moderate", "High"].map((item) => (
          <button key={item} style={form.activityLevel === item ? styles.selected : styles.button} onClick={() => updateField("activityLevel", item)}>
            {item}
          </button>
        ))}

        <h3>Diet Quality</h3>
        {["Poor", "Average", "Good"].map((item) => (
          <button key={item} style={form.dietQuality === item ? styles.selected : styles.button} onClick={() => updateField("dietQuality", item)}>
            {item}
          </button>
        ))}

        <h3>Family History</h3>
        {["Yes", "No"].map((item) => (
          <button key={item} style={form.familyHistory === item ? styles.selected : styles.button} onClick={() => updateField("familyHistory", item)}>
            {item}
          </button>
        ))}

        <input
          style={styles.input}
          placeholder="Existing conditions"
          value={form.existingConditions}
          onChange={(e) => updateField("existingConditions", e.target.value)}
        />

        <button style={styles.primary} onClick={submitSurvey}>
          Submit Survey
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 30, background: "#f6faf6", minHeight: "100vh" },
  card: { maxWidth: 600, margin: "auto", background: "#fff", padding: 25, borderRadius: 16 },
  input: { width: "100%", padding: 12, margin: "8px 0", borderRadius: 10, border: "1px solid #ccc" },
  button: { display: "block", width: "100%", padding: 12, margin: "8px 0", borderRadius: 10, border: "1px solid #ccc", background: "#fff" },
  selected: { display: "block", width: "100%", padding: 12, margin: "8px 0", borderRadius: 10, border: "1px solid #1b7f3a", background: "#e8f5e9" },
  primary: { width: "100%", padding: 14, background: "#1b7f3a", color: "#fff", border: "none", borderRadius: 10, marginTop: 20 },
  center: { padding: 50, textAlign: "center" },
};