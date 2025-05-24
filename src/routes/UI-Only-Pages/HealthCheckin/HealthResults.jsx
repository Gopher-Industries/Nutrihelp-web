import React, { useEffect, useState, useRef } from "react";
import { Chart } from "chart.js/auto";
import "./health.css";

const HealthResults = () => {
  const [records, setRecords] = useState([]);
  const chartRef = useRef(null);        
  const chartInstance = useRef(null);   

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("healthRecords") || "[]");
    setRecords(data);

    if (chartInstance.current) {
      chartInstance.current.destroy();  
    }

    if (chartRef.current) {
      chartInstance.current = new Chart(chartRef.current, {
        type: "line",
        data: {
          labels: data.map((r) => r.date),
          datasets: [{
            label: "Weight (kg)",
            data: data.map((r) => parseFloat(r.weight)),
            borderColor: "blue",
            tension: 0.2,
          }],
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: false } },
        },
      });
    }


    const fbUrl = encodeURIComponent("https://nutrihelp.com");
    const fbText = encodeURIComponent("I just completed a NutriHelp health check-in! #StayHealthy");
    document.getElementById("fb-share").href = `https://www.facebook.com/sharer/sharer.php?u=${fbUrl}&quote=${fbText}`;
  }, []);

  return (
    <div className="container">
      <h1>Check-in History</h1>
      <table id="record-table">
        <thead>
          <tr>
            <th>Date</th><th>Weight</th><th>Diet</th><th>Exercise</th><th>Mood</th>
            <th>Sleep</th><th>Water</th><th>Veggie</th><th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i}>
              <td>{r.date}</td><td>{r.weight}</td><td>{r.diet}</td><td>{r.exercise}</td><td>{r.mood}</td>
              <td>{r.sleep}</td><td>{r.water}</td><td>{r.veggie}</td><td>{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Weight Trend</h2>
      <canvas ref={chartRef}></canvas>

      <div className="share-buttons">
        <p>Share your health journey:</p>
        <a id="fb-share" className="share-icon" target="_blank" rel="noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" />
        </a>
        <a className="share-icon" title="Take a screenshot to share on Instagram!" href="#" target="_blank" rel="noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" />
        </a>
      </div>
    </div>
  );
};

export default HealthResults;
