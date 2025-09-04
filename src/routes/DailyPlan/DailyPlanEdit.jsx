import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * DailyPlanEdit (standalone page)
 * - LocalStorage persistence (key: "mealPlan")
 * - CRUD items across Breakfast/Lunch/Dinner/Snacks
 * - Live totals (calories, protein, vitamins, sodium)
 * - Editable date + Prev/Next day controls
 */

const STORAGE_KEY = "mealPlan";

const emptyPlan = () => ({
  date: new Date().toISOString().slice(0, 10),
  meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
});

const ensureShape = (raw) => {
  const plan = raw && typeof raw === "object" ? raw : {};
  const date =
    typeof plan.date === "string" ? plan.date : new Date().toISOString().slice(0, 10);
  const meals = plan.meals && typeof plan.meals === "object" ? plan.meals : {};
  return {
    date,
    meals: {
      breakfast: Array.isArray(meals.breakfast) ? meals.breakfast : [],
      lunch: Array.isArray(meals.lunch) ? meals.lunch : [],
      dinner: Array.isArray(meals.dinner) ? meals.dinner : [],
      snacks: Array.isArray(meals.snacks) ? meals.snacks : [],
    },
  };
};

const blankItem = () => ({
  name: "",
  details: { calories: 0, proteins: 0, vitamins: 0, sodium: 0 },
});

const MEAL_KEYS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "snacks", label: "Snacks" },
];

/* Keep buttons readable if a global theme overrides them */
const CSS_OVERRIDE = `
  #daily-plan-edit * { box-sizing: border-box; }
  #daily-plan-edit button {
    color: #222 !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    text-indent: 0 !important;
    line-height: 1.2 !important;
  }
  #daily-plan-edit button::before,
  #daily-plan-edit button::after { content: none !important; }
  #daily-plan-edit button > * { color: #222 !important; font-size: 14px !important; }
`;

/* --- UPDATED layout --- */
const RESPONSIVE_CSS = `
  /* One row: Name | Calories | Protein | Vitamins | Sodium | Actions */
  #daily-plan-edit .meal-row{
    display:grid;
    grid-template-columns: minmax(200px,1fr) repeat(4,96px) 300px;
    gap:12px;                             /* a bit more space between columns */
    align-items:center;
    padding:10px 0;
    border-bottom:1px solid #eee;
  }

  #daily-plan-edit .number-input{
    width:100%;
    min-width:0;
    padding:6px 10px;                     /* smaller inputs */
    border:1px solid #ddd;
    border-radius:18px;
    font-size:13px;
  }

  /* Actions cell now has a little left padding and bigger internal gap */
  #daily-plan-edit .meal-actions{
    display:flex;
    gap:12px;
    justify-content:flex-end;
    align-items:center;
    padding-left:6px;                     /* creates extra breathing room from Sodium */
    flex-wrap:nowrap;
  }
  #daily-plan-edit .meal-actions select{
    min-width:150px;                      /* keep the select readable */
    height:40px;
    padding:8px 12px;
    border:1px solid #ddd;
    border-radius:10px;
    background:#fff;
    cursor:pointer;
    font-size:14px;
  }
  #daily-plan-edit .meal-actions button{
    min-width:104px;                      /* ensure "Remove" never clips */
    padding:8px 12px;
  }

  /* Mobile: stack cleanly */
  @media (max-width:720px){
    #daily-plan-edit .meal-row{
      grid-template-columns:1fr;
      row-gap:8px;
    }
    #daily-plan-edit .meal-actions{
      justify-content:flex-start;
      flex-wrap:wrap;
      padding-left:0;
    }
  }
`;

/* Base button styling */
const BTN = {
  all: "unset",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  gap: 6,
  minWidth: 96,
  lineHeight: 1.2,
  textIndent: 0,
  overflow: "visible",
  border: "1px solid #ddd",
  borderRadius: 10,
  background: "#fff",
  color: "#222",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  userSelect: "none",
};

export default function DailyPlanEdit() {
  const [plan, setPlan] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? ensureShape(JSON.parse(raw)) : emptyPlan();
    } catch {
      return emptyPlan();
    }
  });

  const importRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch {}
  }, [plan]);

  const totals = useMemo(() => {
    const sum = { calories: 0, proteins: 0, vitamins: 0, sodium: 0 };
    Object.values(plan.meals).forEach((arr) => {
      arr.forEach((it) => {
        const d = it?.details || {};
        sum.calories += +d.calories || 0;
        sum.proteins += +d.proteins || 0;
        sum.vitamins += +d.vitamins || 0;
        sum.sodium += +d.sodium || 0;
      });
    });
    return sum;
  }, [plan]);

  const setDate = (date) => setPlan((p) => ({ ...p, date }));
  const shiftDate = (days) => {
    const d = new Date(plan.date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().slice(0, 10));
  };

  const addItem = (mealKey) =>
    setPlan((p) => ({
      ...p,
      meals: { ...p.meals, [mealKey]: [...p.meals[mealKey], blankItem()] },
    }));

  const updateItemField = (mealKey, idx, field, value) =>
    setPlan((p) => {
      const arr = p.meals[mealKey].slice();
      const it = { ...arr[idx] };
      if (field === "name") it.name = value;
      else {
        it.details = { ...(it.details || {}) };
        it.details[field] = value === "" ? 0 : Number(value);
      }
      arr[idx] = it;
      return { ...p, meals: { ...p.meals, [mealKey]: arr } };
    });

  const removeItem = (mealKey, idx) =>
    setPlan((p) => {
      const arr = p.meals[mealKey].slice();
      arr.splice(idx, 1);
      return { ...p, meals: { ...p.meals, [mealKey]: arr } };
    });

  const moveItem = (fromKey, toKey, idx) =>
    setPlan((p) => {
      if (fromKey === toKey) return p;
      const fromArr = p.meals[fromKey].slice();
      const [it] = fromArr.splice(idx, 1);
      const toArr = p.meals[toKey].slice();
      toArr.push(it);
      return { ...p, meals: { ...p.meals, [fromKey]: fromArr, [toKey]: toArr } };
    });

  const clearAll = () => setPlan(emptyPlan());

  const saveNow = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
      alert("Daily meal plan saved.");
    } catch {
      alert("Could not save plan (storage error).");
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mealPlan-${plan.date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const next = ensureShape(JSON.parse(reader.result));
        setPlan(next);
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="daily-plan-edit" style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
      <style>{CSS_OVERRIDE + RESPONSIVE_CSS}</style>

      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Edit Daily Meal Plan</h2>
        </div>

        <a
          href="/daily-plan-edit"
          style={{ color: "#4b2c7a", fontWeight: 700, textDecoration: "none" }}
          onClick={(e) => e.preventDefault()}
          title="You are on this page"
        >
          Edit Plan
        </a>
      </header>

      <section
        style={{
          background: "#caa7e6",
          color: "#fff",
          padding: 16,
          borderRadius: 12,
          marginTop: 12,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Date</div>
        <input
          aria-label="Select date"
          type="date"
          value={plan.date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 22,
            border: "1px solid #ddd",
            color: "#222",
            background: "#fff",
          }}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button type="button" name="prevDay" style={{ ...BTN, minWidth: 90 }} onClick={() => shiftDate(-1)}>
            ← Prev
          </button>
          <button type="button" name="nextDay" style={{ ...BTN, minWidth: 90 }} onClick={() => shiftDate(1)}>
            Next →
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button type="button" name="savePlan" onClick={saveNow} style={BTN}>
            <span style={{ pointerEvents: "none" }}>Save</span>
          </button>
          <button type="button" name="clearAll" onClick={clearAll} style={BTN}>
            <span style={{ pointerEvents: "none" }}>Clear All</span>
          </button>
          <button type="button" name="exportJSON" onClick={exportJSON} style={BTN}>
            <span style={{ pointerEvents: "none" }}>Export</span>
          </button>

          <input
            ref={importRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])}
          />
          <button type="button" name="importJSON" onClick={() => importRef.current?.click()} style={BTN}>
            <span style={{ pointerEvents: "none" }}>Import</span>
          </button>
        </div>
      </section>

      <section
        style={{
          background: "#fafafa",
          padding: 12,
          borderRadius: 12,
          border: "1px solid #eee",
          marginTop: 16,
          fontSize: 14,
        }}
      >
        <strong>Totals</strong>
        <div style={{ marginTop: 6 }}>
          Calories: {totals.calories} · Protein: {totals.proteins} · Vitamins: {totals.vitamins} · Sodium: {totals.sodium}
        </div>
      </section>

      {MEAL_KEYS.map(({ key, label }) => (
        <MealSection
          key={key}
          mealKey={key}
          title={label}
          items={plan.meals[key]}
          onAdd={() => addItem(key)}
          onRemove={(idx) => removeItem(key, idx)}
          onMove={(idx, toKey) => moveItem(key, toKey, idx)}
          onChange={(idx, field, value) => updateItemField(key, idx, field, value)}
        />
      ))}
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function MealSection({ title, mealKey, items, onAdd, onRemove, onMove, onChange }) {
  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button
          type="button"
          name={`add-${mealKey}`}
          aria-label={`Add item to ${title}`}
          title={`Add item to ${title}`}
          onClick={onAdd}
          style={BTN}
        >
          <span style={{ pointerEvents: "none" }}>+ Add Item</span>
        </button>
      </div>

      {(!items || items.length === 0) && <p style={{ opacity: 0.7, marginTop: 8 }}>No items yet.</p>}

      {items?.map((it, idx) => {
        const d = it?.details || {};
        return (
          <div key={idx} className="meal-row">
            {/* Name */}
            <input
              type="text"
              placeholder="Item name"
              value={it?.name ?? ""}
              onChange={(e) => onChange(idx, "name", e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 18, border: "1px solid #ddd" }}
              aria-label="Item name"
              name="itemName"
            />

            {/* Macros (no Fat column) */}
            <NumberField label="Calories" value={d.calories} onChange={(v) => onChange(idx, "calories", v)} />
            <NumberField label="Protein"  value={d.proteins} onChange={(v) => onChange(idx, "proteins", v)} />
            <NumberField label="Vitamins" value={d.vitamins} onChange={(v) => onChange(idx, "vitamins", v)} />
            <NumberField label="Sodium"   value={d.sodium}   onChange={(v) => onChange(idx, "sodium", v)} />

            {/* Actions (fixed column) */}
            <div className="meal-actions">
              <select
                aria-label="Move to meal"
                name="moveToMeal"
                value={mealKey}
                onChange={(e) => onMove(idx, e.target.value)}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
              </select>

              <button
                type="button"
                name="removeItem"
                aria-label="Remove item"
                title="Remove item"
                onClick={() => onRemove(idx)}
                style={BTN}
              >
                <span style={{ pointerEvents: "none" }}>Remove</span>
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <label style={{ fontSize: 12, opacity: 0.7 }}>{label}</label>
      <input
        className="number-input"
        type="number"
        value={value ?? 0}
        min="0"
        step="1"
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        name={label.toLowerCase()}
      />
    </div>
  );
}
