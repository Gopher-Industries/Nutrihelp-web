// src/components/mealPlan/RecipeDetailsModal.jsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";

const Z = 11000;

const styles = {
  backdrop: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: Z
  },
  modal: {
    width: "720px", maxWidth: "94vw", background: "#fff",
    borderRadius: "14px", boxShadow: "0 12px 30px rgba(0,0,0,.2)", overflow: "hidden"
  },
  header: {
    padding: "14px 18px", background: "#f7f9fc", borderBottom: "1px solid #e6e9ef",
    display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700
  },
  body: { padding: "18px" },
  footer: {
    padding: "14px 18px", background: "#f7f9fc", borderTop: "1px solid #e6e9ef",
    display: "flex", justifyContent: "flex-end", gap: "10px"
  },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 8, margin: "8px 0 14px" },
  chip: {
    background: "#eef1fb", color: "#334155", padding: "6px 10px", borderRadius: 999, fontSize: ".85rem"
  },
  twoCol: { display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 18 },
  sectionTitle: { fontWeight: 700, margin: "10px 0 6px" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: ".95rem" },
  thtd: { borderBottom: "1px solid #e6e9ef", padding: "8px 6px", textAlign: "left" },

  /* --- Button styles (fixed) --- */
  btn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "10px 14px", minWidth: 108, borderRadius: 10,
    border: "1px solid #cfd7e3", background: "#ffffff", color: "#111827",
    fontWeight: 600, cursor: "pointer"
  },
  primary: { background: "#b527e0", color: "#fff", border: "none" },
  iconBtn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 36, height: 36, borderRadius: 9,
    border: "1px solid #cfd7e3", background: "#fff", color: "#111827", cursor: "pointer"
  }
};

export default function RecipeDetailsModal({ open, recipe, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !recipe) return null;

  const { title, meta = {}, ingredients = [], steps = [], nutrition = {} } = recipe;

  const printIt = () => window.print();

  return createPortal(
    <div style={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="recipe-title">
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header with clear, visible X */}
        <div style={styles.header}>
          <div id="recipe-title">{title}</div>
          <button
            style={styles.iconBtn}
            type="button"
            onClick={onClose}
            aria-label="Close recipe details"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.chipRow}>
            <span style={styles.chip}>⏱ Prep: {meta.prep || 0} min</span>
            <span style={styles.chip}>🍳 Cook: {meta.cook || 0} min</span>
            <span style={styles.chip}>👥 Serves: {meta.servings || 1}</span>
          </div>

          <div style={styles.twoCol}>
            <div>
              <div style={styles.sectionTitle}>Ingredients</div>
              <ul>
                {ingredients.map((i, idx) => (
                  <li key={idx}>{i.name} — {i.qty} {i.unit}</li>
                ))}
              </ul>

              <div style={styles.sectionTitle}>Steps</div>
              <ol>
                {steps.map((s, idx) => <li key={idx} style={{ marginBottom: 6 }}>{s}</li>)}
              </ol>
            </div>

            <div>
              <div style={styles.sectionTitle}>Nutrition (per serving)</div>
              <table style={styles.table}>
                <tbody>
                  {[
                    ["Calories", nutrition.calories, "kcal"],
                    ["Protein", nutrition.protein, "g"],
                    ["Carbs", nutrition.carbs, "g"],
                    ["Fat", nutrition.fat, "g"],
                    ["Fiber", nutrition.fiber, "g"],
                    ["Sodium", nutrition.sodium, "mg"]
                  ].map(([k, v, u]) => (
                    <tr key={k}>
                      <th style={styles.thtd}>{k}</th>
                      <td style={styles.thtd}>{v ?? 0} {u}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer with clear Print + Close buttons */}
        <div style={styles.footer}>
          <button
            type="button"
            style={styles.btn}
            onClick={printIt}
            aria-label="Print recipe"
            title="Print"
          >
            🖨 Print
          </button>
          <button
            type="button"
            style={{ ...styles.btn, ...styles.primary }}
            onClick={onClose}
            aria-label="Close"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
