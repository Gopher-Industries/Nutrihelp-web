// src/components/mealPlan/WaterCounter.jsx
import React, { useEffect, useState } from "react";

const LS_KEY = "nutrihelp:water:v1";
const DEFAULT_GOAL = 8; // glasses/day

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

export default function WaterCounter({ goal = DEFAULT_GOAL }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.date === todayKey()) setCount(parsed.count || 0);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ date: todayKey(), count }));
  }, [count]);

  const pct = Math.min(100, Math.round((count / goal) * 100));

  return (
    <section className="section">
      <div className="meal-card water-card">
        <div className="meal-title">💧 Hydration Tracker</div>

        <div className="water-progress">
          <div className="water-fill" style={{ width: `${pct}%` }} />
        </div>

        <div className="water-controls">
          <div className="water-status">
            {count}/{goal} glasses
          </div>
          <div className="water-buttons">
            <button onClick={() => setCount((c) => Math.max(0, c - 1))}>− 1</button>
            <button onClick={() => setCount((c) => Math.min(goal, c + 1))}>+ 1</button>
            <button onClick={() => setCount(0)}>Reset</button>
          </div>
        </div>
      </div>
    </section>
  );
}
