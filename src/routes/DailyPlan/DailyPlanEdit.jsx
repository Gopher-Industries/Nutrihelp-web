import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * DailyPlanEdit (single-file page)
 * - No changes to other files
 * - Persists to localStorage under key "mealPlan"
 * - CRUD items across Breakfast/Lunch/Dinner/Snacks
 * - Live totals (calories, protein, fat, vitamins, sodium)
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
  details: { calories: 0, proteins: 0, fats: 0, vitamins: 0, sodium: 0 },
});

const MEAL_KEYS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "snacks", label: "Snacks" },
];

/* Scoped CSS override to defeat global button styles that hide text */
const CSS_OVERRIDE = `
  #daily-plan-edit button {
    color: #222 !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    text-indent: 0 !important;
    line-height: 1.2 !important;
  }
  #daily-plan-edit button::before,
  #daily-plan-edit button::after {
    content: none !important;
  }
  #daily-plan-edit button > * {
    color: #222 !important;
    font-size: 14px !important;
  }
`;

/* Local button base style (also clears aggressive globals) */
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
    const sum = { calories: 0, proteins: 0, fats: 0, vitamins: 0, sodium: 0 };
    Object.values(plan.meals).forEach((arr) => {
      arr.forEach((it) => {
        const d = it?.details || {};
        sum.calories += +d.calories || 0;
        sum.proteins += +d.proteins || 0;
        sum.fats += +d.fats || 0;
        sum.vitamins += +d.vitamins || 0;
        sum.sodium += +d.sodium || 0;
      });
    });
    return sum;
  }, [plan]);

  const setDate = (date) => setPlan((p) => ({ ...p, date }));

  const addItem = (mealKey) =>
    setPlan((p) => ({
      ...p,
      meals: { ...p.meals, [mealKey]: [...p.meals[mealKey], blankItem()] },
    }));

  const updateItemField = (mealKey, idx, field, value) =>
    setPlan((p) => {
      const arr = p.meals[mealKey].slice();
      const it = { ...arr[idx] };
      if (field === "name") {
        it.name = value;
      } else {
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
      <style>{CSS_OVERRIDE}</style>

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
          <div style={{ opacity: 0.8, marginTop: 6 }}>
            Date{" "}
            <input
              aria-label="Select date"
              type="date"
              value={plan.date}
              onChange={(e) => setDate(e.target.value)}
              style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            name="savePlan"
            aria-label="Save plan"
            title="Save plan"
            onClick={saveNow}
            style={BTN}
          >
            <span style={{ pointerEvents: "none" }}>Save</span>
          </button>

          <button
            type="button"
            name="clearAll"
            aria-label="Clear all"
            title="Clear all"
            onClick={clearAll}
            style={BTN}
          >
            <span style={{ pointerEvents: "none" }}>Clear All</span>
          </button>

          <button
            type="button"
            name="exportJSON"
            aria-label="Export JSON"
            title="Export JSON"
            onClick={exportJSON}
            style={BTN}
          >
            <span style={{ pointerEvents: "none" }}>Export</span>
          </button>

          {/* Import as button + hidden input */}
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])}
          />
          <button
            type="button"
            name="importJSON"
            aria-label="Import JSON"
            title="Import JSON"
            onClick={() => importRef.current?.click()}
            style={BTN}
          >
            <span style={{ pointerEvents: "none" }}>Import</span>
          </button>
        </div>
      </header>

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
          Calories: {totals.calories} · Protein: {totals.proteins} · Fat: {totals.fats} ·
          Vitamins: {totals.vitamins} · Sodium: {totals.sodium}
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

/* ---------------------- Helpers ---------------------- */

function MealSection({ title, mealKey, items, onAdd, onRemove, onMove, onChange }) {
  return (
    <section style={{ marginTop: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
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

      {(!items || items.length === 0) && (
        <p style={{ opacity: 0.7, marginTop: 8 }}>No items yet.</p>
      )}

      {items?.map((it, idx) => {
        const d = it?.details || {};
        return (
          <div
            key={idx}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(160px,1fr) repeat(5, 120px) auto",
              gap: 8,
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            {/* Name */}
            <input
              type="text"
              placeholder="Item name"
              value={it?.name ?? ""}
              onChange={(e) => onChange(idx, "name", e.target.value)}
              style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #ddd" }}
              aria-label="Item name"
              name="itemName"
            />

            {/* Macros */}
            <NumberField
              label="Calories"
              value={d.calories}
              onChange={(v) => onChange(idx, "calories", v)}
            />
            <NumberField
              label="Protein"
              value={d.proteins}
              onChange={(v) => onChange(idx, "proteins", v)}
            />
            <NumberField
              label="Fat"
              value={d.fats}
              onChange={(v) => onChange(idx, "fats", v)}
            />
            <NumberField
              label="Vitamins"
              value={d.vitamins}
              onChange={(v) => onChange(idx, "vitamins", v)}
            />
            <NumberField
              label="Sodium"
              value={d.sodium}
              onChange={(v) => onChange(idx, "sodium", v)}
            />

            {/* Actions */}
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <select
                aria-label="Move to meal"
                name="moveToMeal"
                value={mealKey}
                onChange={(e) => onMove(idx, e.target.value)}
                style={{
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                }}
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
        type="number"
        value={value ?? 0}
        min="0"
        step="1"
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "6px 8px",
          borderRadius: 8,
          border: "1px solid #ddd",
          width: "100%",
        }}
        aria-label={label}
        name={label.toLowerCase()}
      />
    </div>
  );
}
