import React, { useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export default function SymptomAssessmentScreen() {
  const [step, setStep] = useState(1);
  const [symptoms, setSymptoms] = useState([]);
  const [frequency, setFrequency] = useState("");
  const [severity, setSeverity] = useState("");
  const [dietContext, setDietContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const symptomOptions = ["Fatigue", "Headache", "Nausea", "Dizziness", "Bloating"];
  const frequencyOptions = ["Rarely", "Sometimes", "Often", "Daily"];
  const severityOptions = ["Mild", "Moderate", "Severe"];
  const dietOptions = ["Healthy diet", "High sugar diet", "High fat diet", "Irregular meals"];

  const toggleSymptom = (item) => {
    setSymptoms((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const nextStep = () => {
    if (step === 1 && symptoms.length === 0) return alert("Please select symptoms.");
    if (step === 2 && (!frequency || !severity)) return alert("Please select frequency and severity.");
    setStep(step + 1);
  };

  const submitAssessment = async () => {
    if (!dietContext) return alert("Please select dietary context.");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/symptom-assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, frequency, severity, dietContext }),
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        recommendation:
          "Monitor your symptoms, stay hydrated, maintain a balanced diet, and seek medical advice if symptoms continue.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.center}>Processing assessment...</div>;

  if (result) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>Assessment Results</h2>
          <p>{result.recommendation || result.message || "Assessment completed successfully."}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>Symptom Assessment</h2>
        <p>Step {step} of 3</p>

        {step === 1 && (
          <>
            <h3>Select Symptoms</h3>
            {symptomOptions.map((item) => (
              <label key={item} style={styles.option}>
                <input
                  type="checkbox"
                  checked={symptoms.includes(item)}
                  onChange={() => toggleSymptom(item)}
                />
                {item}
              </label>
            ))}
          </>
        )}

        {step === 2 && (
          <>
            <h3>Frequency</h3>
            {frequencyOptions.map((item) => (
              <button key={item} style={frequency === item ? styles.selected : styles.button} onClick={() => setFrequency(item)}>
                {item}
              </button>
            ))}

            <h3>Severity</h3>
            {severityOptions.map((item) => (
              <button key={item} style={severity === item ? styles.selected : styles.button} onClick={() => setSeverity(item)}>
                {item}
              </button>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <h3>Dietary Context</h3>
            {dietOptions.map((item) => (
              <button key={item} style={dietContext === item ? styles.selected : styles.button} onClick={() => setDietContext(item)}>
                {item}
              </button>
            ))}
          </>
        )}

        <div style={styles.row}>
          {step > 1 && <button style={styles.secondary} onClick={() => setStep(step - 1)}>Back</button>}
          {step < 3 ? (
            <button style={styles.primary} onClick={nextStep}>Next</button>
          ) : (
            <button style={styles.primary} onClick={submitAssessment}>Submit</button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 30, background: "#f6faf6", minHeight: "100vh" },
  card: { maxWidth: 600, margin: "auto", background: "#fff", padding: 25, borderRadius: 16 },
  option: { display: "block", margin: "12px 0", fontSize: 16 },
  button: { display: "block", width: "100%", padding: 12, margin: "8px 0", borderRadius: 10, border: "1px solid #ccc", background: "#fff" },
  selected: { display: "block", width: "100%", padding: 12, margin: "8px 0", borderRadius: 10, border: "1px solid #1b7f3a", background: "#e8f5e9" },
  row: { display: "flex", gap: 10, marginTop: 20 },
  primary: { flex: 1, padding: 12, background: "#1b7f3a", color: "#fff", border: "none", borderRadius: 10 },
  secondary: { flex: 1, padding: 12, background: "#fff", color: "#1b7f3a", border: "1px solid #1b7f3a", borderRadius: 10 },
  center: { padding: 50, textAlign: "center" },
};