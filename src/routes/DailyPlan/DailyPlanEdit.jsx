// src/routes/DailyPlan/DailyPlanEdit.jsx
import React, { useMemo, useState } from "react";
import "./DailyPlanEdit.css";

// ----- Types -----
const MEALS = ["Breakfast", "Lunch", "Dinner", "Snacks"];
const NEW_ITEM = () => ({
  name: "",
  calories: 0,
  protein: 0,
  fat: 0,
  vitamins: 0,
  sodium: 0,
});

// ----- Helpers -----
function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}
function toDateString(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function fromDateString(s) {
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

export default function DailyPlanEdit() {
  // Plan state: date + meal items
  const [dateText, setDateText] = useState(toDateString(new Date()));
  const [plan, setPlan] = useState(() => {
    const base = {};
    MEALS.forEach((m) => (base[m] = []));
    return base;
  });

  // ---- Derived totals ----
  const totals = useMemo(() => {
    const sum = { calories: 0, protein: 0, fat: 0, vitamins: 0, sodium: 0 };
    MEALS.forEach((m) => {
      plan[m].forEach((it) => {
        sum.calories += Number(it.calories) || 0;
        sum.protein += Number(it.protein) || 0;
        sum.fat += Number(it.fat) || 0;
        sum.vitamins += Number(it.vitamins) || 0;
        sum.sodium += Number(it.sodium) || 0;
      });
    });
    return sum;
  }, [plan]);

  // ---- Date controls ----
  const goPrevDay = () => {
    const d = fromDateString(dateText);
    d.setDate(d.getDate() - 1);
    setDateText(toDateString(d));
  };
  const goNextDay = () => {
    const d = fromDateString(dateText);
    d.setDate(d.getDate() + 1);
    setDateText(toDateString(d));
  };

  // ---- Item mutations ----
  const addItem = (meal) => {
    setPlan((p) => ({
      ...p,
      [meal]: [...p[meal], NEW_ITEM()],
    }));
  };

  const removeItem = (meal, index) => {
    setPlan((p) => {
      const copy = [...p[meal]];
      copy.splice(index, 1);
      return { ...p, [meal]: copy };
    });
  };

  const updateItem = (meal, index, key, value) => {
    setPlan((p) => {
      const copy = [...p[meal]];
      const next = { ...copy[index] };
      next[key] = key === "name" ? value : value === "" ? "" : Number(value);
      copy[index] = next;
      return { ...p, [meal]: copy };
    });
  };

  // ---- Actions (stubs) ----
  const savePlan = () => {
    // Hook to your API if desired
    console.log("savePlan", { date: dateText, plan });
    alert("Saved (demo): check console for payload.");
  };

  const clearAll = () => {
    if (!window.confirm("Clear all items for all meals?")) return;
    const base = {};
    MEALS.forEach((m) => (base[m] = []));
    setPlan(base);
  };

  const exportPlan = () => {
    const payload = { date: dateText, plan };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `daily-plan-${dateText}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importPlan = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data || typeof data !== "object") throw new Error("Bad file");
        const nextDate = data.date || dateText;
        const nextPlan = data.plan || {};
        // sanitize
        const safe = {};
        MEALS.forEach((m) => {
          safe[m] = Array.isArray(nextPlan[m])
            ? nextPlan[m].map((x) => ({
                name: x?.name ?? "",
                calories: Number(x?.calories) || 0,
                protein: Number(x?.protein) || 0,
                fat: Number(x?.fat) || 0,
                vitamins: Number(x?.vitamins) || 0,
                sodium: Number(x?.sodium) || 0,
              }))
            : [];
        });
        setDateText(nextDate);
        setPlan(safe);
      } catch (e) {
        console.error(e);
        alert("Invalid plan file.");
      }
    };
    input.click();
  };

  // ---- Render ----
  return (
    <div className="dpe">
      <div className="dpe__wrap">
        {/* Header */}
        <div className="dpe-header">
          <div>
            <h3>Edit Daily Meal Plan</h3>
            <div className="dpe-date">
              <button className="dpe-chipbtn" onClick={goPrevDay}>
                ← Prev
              </button>

              {/* Use type="date" if you prefer native picker */}
              <input
                type="text"
                value={dateText}
                onChange={(e) => setDateText(e.target.value)}
                aria-label="Date"
              />

              <button className="dpe-chipbtn" onClick={goNextDay}>
                Next →
              </button>
            </div>
          </div>

          <div className="dpe-actions">
            <button className="dpe-btn" onClick={savePlan}>
              Save
            </button>
            <button className="dpe-btn" onClick={clearAll}>
              Clear All
            </button>
            <button className="dpe-btn" onClick={exportPlan}>
              Export
            </button>
            <button className="dpe-btn" onClick={importPlan}>
              Import
            </button>
          </div>
        </div>

        {/* Totals */}
        <div className="dpe-totals">
          Calories: {totals.calories} • Protein: {totals.protein} • Fat:{" "}
          {totals.fat} • Vitamins: {totals.vitamins} • Sodium: {totals.sodium}
        </div>

        {/* Sections */}
        {MEALS.map((meal) => (
          <section key={meal}>
            <div className="dpe-section">{meal}</div>

            {/* Existing rows */}
            {(plan[meal] || []).map((item, idx) => (
              <div className="dpe-row" key={`${meal}-${idx}`}>
                <div className="dpe-grid">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) =>
                      updateItem(meal, idx, "name", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    placeholder="0"
                    value={item.calories}
                    onChange={(e) =>
                      updateItem(meal, idx, "calories", e.target.value)
                    }
                    aria-label="Calories"
                  />

                  <input
                    type="number"
                    placeholder="0"
                    value={item.protein}
                    onChange={(e) =>
                      updateItem(meal, idx, "protein", e.target.value)
                    }
                    aria-label="Protein"
                  />

                  <input
                    type="number"
                    placeholder="0"
                    value={item.fat}
                    onChange={(e) =>
                      updateItem(meal, idx, "fat", e.target.value)
                    }
                    aria-label="Fat"
                  />

                  <input
                    type="number"
                    placeholder="0"
                    value={item.vitamins}
                    onChange={(e) =>
                      updateItem(meal, idx, "vitamins", e.target.value)
                    }
                    aria-label="Vitamins"
                  />

                  <input
                    type="number"
                    placeholder="0"
                    value={item.sodium}
                    onChange={(e) =>
                      updateItem(meal, idx, "sodium", e.target.value)
                    }
                    aria-label="Sodium"
                  />

                  <div className="dpe-meal">{meal}</div>

                  <button
                    className="dpe-remove"
                    onClick={() => removeItem(meal, idx)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Empty state */}
            {plan[meal].length === 0 && (
              <div className="dpe-empty">No items yet.</div>
            )}

            {/* Add line */}
            <div className="dpe-addline">
              <button className="dpe-btn" onClick={() => addItem(meal)}>
                Add Item
              </button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
