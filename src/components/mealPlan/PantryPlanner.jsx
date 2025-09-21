// src/components/mealPlan/PantryPlanner.jsx
import React, { useEffect, useMemo, useState } from "react";
import { DAILY_MENU_PLAN } from "./utils/dailyMenuPlan";

// Merge duplicate ingredients (same name + unit), scale by servings
function mergeGroceries(plan, servings) {
  const map = new Map();
  const push = ({ name, qty, unit }) => {
    const key = `${name.toLowerCase()}__${unit}`;
    const prev = map.get(key) || { name, qty: 0, unit };
    map.set(key, { ...prev, qty: prev.qty + qty * servings });
  };

 
  Object.values(plan).forEach(mealArray => {
    mealArray.forEach(meal => (meal.ingredients || []).forEach(push));
  });

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function toTxt(items) {
  return items.map(i => `- ${i.name}: ${i.qty} ${i.unit}`).join("\n");
}
function toCsv(items) {
  const header = "name,qty,unit";
  const rows = items.map(i => `${i.name.replace(/,/g," ")},${i.qty},${i.unit}`);
  return [header, ...rows].join("\n");
}

const LS_KEY_PANTRY_OPEN = "nutrihelp:pantry:open";

export default function PantryPlanner() {
  const [servings, setServings] = useState(1);
  const [checked, setChecked] = useState({}); // { key: boolean }
  const [open, setOpen] = useState(true);

  // restore collapsed/expanded state
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY_PANTRY_OPEN);
    if (raw !== null) setOpen(raw === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY_PANTRY_OPEN, open ? "1" : "0");
  }, [open]);

  const groceries = useMemo(
    () => mergeGroceries(DAILY_MENU_PLAN, servings),
    [servings]
  );

  const keyOf = (i) => `${i.name.toLowerCase()}__${i.unit}`;
  const toggle = (k) => setChecked(prev => ({ ...prev, [k]: !prev[k] }));

  const copyTxt = async () => {
    try { await navigator.clipboard.writeText(toTxt(groceries)); alert("Copied grocery list!"); }
    catch { alert("Copy failed; try Download TXT/CSV instead."); }
  };
  const download = (filename, content, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };
  const email = () => {
    const body = encodeURIComponent(toTxt(groceries));
    window.location.href = `mailto:?subject=Grocery%20List&body=${body}`;
  };

  return (
    <section className="section pantry-wrap">
      <div className="meal-card pantry-card">

        {/* Header with slide toggle */}
        <div className="pantry-head">
          <div className="meal-title">🛒 Grocery List Generator</div>
          <button
            className={`pantry-toggle ${open ? "is-open" : ""}`}
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            aria-controls="pantry-slide-panel"
            type="button"
          >
            <span className="pantry-toggle-icon">▾</span>
            {open ? "Hide" : "Show"}
          </button>
        </div>

        {/* Sliding panel */}
        <div
          id="pantry-slide-panel"
          className={`pantry-slide ${open ? "open" : ""}`}
        >
          <div className="pantry-inner">
            <div className="pantry-controls">
              <label className="pantry-label">
                Servings
                <input
                  type="number"
                  className="pantry-input"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(Math.max(1, Number(e.target.value)))}
                />
              </label>

              <div className="pantry-actions">
                <button onClick={copyTxt}>Copy TXT</button>
                <button onClick={() => download("grocery-list.txt", toTxt(groceries), "text/plain")}>
                  Download TXT
                </button>
                <button onClick={() => download("grocery-list.csv", toCsv(groceries), "text/csv")}>
                  Download CSV
                </button>
                <button onClick={email}>Send to caregiver</button>
              </div>
            </div>

            <ul className="pantry-list">
              {groceries.map(item => {
                const k = keyOf(item);
                return (
                  <li key={k} className={`pantry-row ${checked[k] ? "is-done" : ""}`}>
                    <label className="pantry-row-inner">
                      <input
                        type="checkbox"
                        checked={!!checked[k]}
                        onChange={() => toggle(k)}
                      />
                      <span className="pantry-name">{item.name}</span>
                      <span className="pantry-qty">{item.qty} {item.unit}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}
