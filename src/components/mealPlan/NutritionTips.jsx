// components/NutritionTips.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";


// 1) Keep your weekday tips for "Tip of the Day"
const weekdayTips = [
  "💧 Sunday: Drink 8 glasses of water today.",
  "🍳 Monday: Add an egg or beans for extra protein.",
  "🥦 Tuesday: Eat 5+ servings of vegetables/fruits.",
  "🥣 Wednesday: Choose whole grains over refined grains.",
  "🧂 Thursday: Reduce salt—use herbs, lemon, and spices.",
  "🍫 Friday: Skip sugary snacks—try a few pieces of dark chocolate.",
  "🍵 Saturday: Sip unsweetened green tea for digestion."
];

// 2) Extra tips used for carousel + expanded list
const extraTips = [
  "🥗 Fill half your plate with colourful veggies.",
  "🥜 Include nuts/seeds for healthy fats & minerals.",
  "🫘 Pair carbs with protein/fat to slow glucose spikes.",
  "🚶‍♀️ Take a 10‑minute walk after meals.",
  "🥛 Choose calcium sources daily (or fortified alternatives).",
  "🍋 Acid (lemon/vinegar) boosts flavour without salt.",
  "🧊 Prep snacks on Sunday—clear boxes encourage use.",
  "🧄 Garlic, onion, paprika, cumin = flavour without sodium.",
  "🥫 Rinse canned beans/veg to reduce sodium.",
  "🍊 Vitamin C helps absorb iron—pair citrus with legumes/greens."
];

const ROTATE_MS = 5000;

export default function NutritionTips() {
  // Tip of the day (based on system weekday)
  const todayIndex = new Date().getDay();
  const todayTip = weekdayTips[todayIndex];

  // Carousel state
  const tips = useMemo(() => extraTips, []);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || tips.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % tips.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, tips.length]);

  // Expandable list
  const [expanded, setExpanded] = useState(false);
  const gridRef = useRef(null);

  return (
    <div className="section">
      {/* Tip of the Day */}
      <div className="tip-card large-tip animated-tip" role="status" aria-live="polite">
        {todayTip}
      </div>

      {/* Auto-rotating mini carousel */}
      {tips.length > 0 && (
        <div
          className="tip-carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          aria-roledescription="carousel"
          aria-label="Nutrition tips carousel"
        >
          <div className="carousel-track">
            <div key={index} className="carousel-slide in">
              {tips[index]}
            </div>
          </div>
          <div className="carousel-controls">
            <button
              className="btn btn-ghost small"
              onClick={() => setIndex((i) => (i - 1 + tips.length) % tips.length)}
              aria-label="Previous tip"
            >
              ‹
            </button>
            <button
              className="btn btn-ghost small"
              onClick={() => setIndex((i) => (i + 1) % tips.length)}
              aria-label="Next tip"
            >
              ›
            </button>
            <button
              className="btn btn-ghost small"
              aria-pressed={paused}
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Resume auto-rotate" : "Pause auto-rotate"}
            >
              {paused ? "▶" : "⏸"}
            </button>
          </div>
        </div>
      )}

      {/* Show more tips (staggered grid) */}
      <div className="more-tips-header">
        <button className="btn btn-primary" onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Hide more tips" : "Show more tips"}
        </button>
      </div>

      <div
        ref={gridRef}
        className={`tips-grid ${expanded ? "open" : ""}`}
        aria-hidden={!expanded}
      >
        {tips.map((t, i) => (
          <div
            key={`${t}-${i}`}
            className="tip-card animated-tip stagger"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}
