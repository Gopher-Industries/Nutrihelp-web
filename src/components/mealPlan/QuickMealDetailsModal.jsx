// src/components/mealPlan/QuickMealDetailsModal.jsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";

const Z = 10990;

const S = {
  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: Z },
  modal: { width: 560, maxWidth: "92vw", background: "#fff", borderRadius: 14,
    boxShadow: "0 12px 30px rgba(0,0,0,.2)", overflow: "hidden" },
  header: { padding: "12px 16px", background: "#f7f9fc", borderBottom: "1px solid #e6e9ef",
    display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700 },
  body: { padding: 16 },
  footer: { padding: "12px 16px", background: "#f7f9fc", borderTop: "1px solid #e6e9ef",
    display: "flex", justifyContent: "flex-end", gap: 10 },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 8, margin: "6px 0 10px" },
  chip: { background: "#eef1fb", color: "#334155", padding: "6px 10px", borderRadius: 999, fontSize: ".85rem" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: ".95rem", marginTop: 6 },
  thtd: { borderBottom: "1px solid #e6e9ef", padding: "8px 6px", textAlign: "left" },
  btn: { padding: "9px 14px", borderRadius: 10, border: "1px solid #cfd7e3", background: "#fff",
    color: "#111827", fontWeight: 600, cursor: "pointer" },
  primary: { background: "#7a5af8", color: "#fff", border: "none" },
  iconBtn: { width: 34, height: 34, borderRadius: 8, border: "1px solid #cfd7e3",
    background: "#fff", cursor: "pointer" }
};

export default function QuickMealDetailsModal({ open, meal, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !meal) return null;

  const { title, meta = {}, nutrition = {} } = meal;

  return createPortal(
    <div style={S.backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="qd-title">
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.header}>
          <div id="qd-title">{title}</div>
          <button style={S.iconBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div style={S.body}>
          <div style={S.chipRow}>
            <span style={S.chip}>⏱ Prep: {meta.prep ?? 0} min</span>
            <span style={S.chip}>🍳 Cook: {meta.cook ?? 0} min</span>
            <span style={S.chip}>👥 Serves: {meta.servings ?? 1}</span>
          </div>

          <div style={{ fontWeight: 700, marginTop: 6 }}>Nutrition (per serving)</div>
          <table style={S.table}>
            <tbody>
              {[
                ["Calories", nutrition.calories, "kcal"],
                ["Protein", nutrition.protein, "g"],
                ["Carbs", nutrition.carbs, "g"],
                ["Fat", nutrition.fat, "g"],
                ["Fiber", nutrition.fiber, "g"],
                ["Sodium", nutrition.sodium, "mg"],
              ].map(([k,v,u]) => (
                <tr key={k}>
                  <th style={S.thtd}>{k}</th>
                  <td style={S.thtd}>{v ?? 0} {u}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ color:"#64748b", fontSize: ".9rem", marginTop: 8 }}>
            Note: For full recipe steps and ingredients, choose <strong>Recipe</strong>.
          </div>
        </div>

        <div style={S.footer}>
          <button style={{ ...S.btn, ...S.primary }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
