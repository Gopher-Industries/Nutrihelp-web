import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./health.css";

const HealthCheckin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    weight: "",
    diet: "",
    exercise: "",
    mood: "3",
    sleep: "",
    water: "",
    veggie: "",
    notes: "",
  });

  const [records, setRecords] = useState(() =>
    JSON.parse(localStorage.getItem("healthRecords") || "[]")
  );
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (records.length === 0) return;
    let s = 1;
    for (let i = records.length - 1; i > 0; i--) {
      const current = new Date(records[i].date);
      const previous = new Date(records[i - 1].date);
      const diff = (current - previous) / (1000 * 3600 * 24);
      if (diff === 1) s++;
      else break;
    }
    setStreak(s);
  }, [records]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const date = new Date().toLocaleDateString();
    const newRecord = { date, ...formData };
    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    localStorage.setItem("healthRecords", JSON.stringify(updatedRecords));
    setFormData({
      weight: "", diet: "", exercise: "", mood: "3", sleep: "",
      water: "", veggie: "", notes: "",
    });
    setStep(1);
    navigate("/results");
  };

  return (
    <div className="container">
      <h1>Daily Health Check-in</h1>
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="form-step">
            <label>
              Weight (kg):
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Healthy Diet?
              <select name="diet" value={formData.diet} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>
            <button type="button" onClick={() => setStep(2)}>Next</button>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <label>
              Did You Exercise?
              <select name="exercise" value={formData.exercise} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>

            <label>
              Mood:
              <select name="mood" value={formData.mood} onChange={handleChange}>
                <option value="1">😟 1</option>
                <option value="2">😐 2</option>
                <option value="3">🙂 3</option>
                <option value="4">😊 4</option>
                <option value="5">😄 5</option>
              </select>
            </label>

            <label>
              Sleep Duration (hours):
              <input
                type="number"
                name="sleep"
                value={formData.sleep}
                onChange={handleChange}
              />
            </label>

            <label>
              Water Intake (ml):
              <input
                type="number"
                name="water"
                value={formData.water}
                onChange={handleChange}
              />
            </label>

            <label>
              Ate Fruits/Vegetables Today?
              <select name="veggie" value={formData.veggie} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>

            <label>
              Notes:
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </label>

            <button type="submit">Submit Check-in</button>
          </div>
        )}
      </form>

      {streak >= 3 && (
        <div className="achievement-card">
          {streak >= 7
            ? `🎉 Amazing! ${streak} days in a row!`
            : `👏 Great! ${streak}-day streak!`}
        </div>
      )}
    </div>
  );
};

export default HealthCheckin;

