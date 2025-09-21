// src/components/mealPlan/EditPreferencesModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    width: "560px",
    maxWidth: "92vw",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  header: {
    padding: "14px 18px",
    background: "#f7f9fc",
    borderBottom: "1px solid #e6e9ef",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  body: { padding: "18px" },
  row: { marginBottom: "12px" },
  label: {
    display: "block",
    fontSize: ".92rem",
    marginBottom: "6px",
    color: "#333",
  },
  input: {
    width: "100%",
    fontSize: ".95rem",
    padding: "10px 12px",
    border: "1px solid #cfd7e3",
    borderRadius: "8px",
    outline: "none",
  },

  dietGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px 14px",
  },
  chip: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    border: "1px solid #b527e0",
    borderRadius: "12px",
    background: "#fff",
    cursor: "pointer",
    userSelect: "none",
    fontWeight: 600,
    color: "#1f2937",
    transition: "border-color .2s ease, background .2s ease, box-shadow .2s ease",
  },
  chipChecked: {
    background: "#f1ecff",
    borderColor: "#a08df7",
    boxShadow: "0 0 0 3px rgba(122,90,248,.15)",
  },
  checkmark: {
    width: 18,
    height: 18,
    borderRadius: 4,
    border: "2px solid #cfd7e3",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    lineHeight: 1,
    color: "transparent",
    background: "#fff",
    transition: "all .2s ease",
  },
  checkmarkOn: { background: "#b527e0", borderColor: "#7a5af8", color: "#fff" },

  dietTools: { display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  smallBtn: {
    padding: "6px 6px",
    borderRadius: 8,
    border: "1px solid #333",
    background: "#b527e0",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: ".70rem",
    transition: "all .2s ease",
  },

  footer: {
    padding: "14px 18px",
    background: "#f7f9fc",
    borderTop: "1px solid #e6e9ef",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  btn: {
    padding: "9px 14px",
    borderRadius: "9px",
    border: "1px solid transparent",
    cursor: "pointer",
    fontWeight: 700,
  },
  primary: { background: "#b527e0", color: "#fff" },
  ghost: {
    background: "#b527e0",
    color: "#fff",
    borderColor: "#cbd5e1",

  },

  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#b527e0",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background .2s ease, color .2s ease",
  },
};

const DIET_TYPES = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Diabetic",
  "Keto",
  "Low-Sodium",
];

export default function EditPreferencesModal({ open, initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const [hoverClose, setHoverClose] = useState(false);
  const [hoverSel, setHoverSel] = useState(false);
  const [hoverClr, setHoverClr] = useState(false);
  const firstInputRef = useRef(null);

  useEffect(() => setForm(initial), [initial, open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  // Autofocus first input
  useEffect(() => {
    if (open && firstInputRef.current) firstInputRef.current.focus();
  }, [open]);

  if (!open) return null;

  const toggleDiet = (diet) => {
    setForm((prev) => {
      const list = prev.dietTypes || [];
      return list.includes(diet)
        ? { ...prev, dietTypes: list.filter((d) => d !== diet) }
        : { ...prev, dietTypes: [...list, diet] };
    });
  };

  const selectAll = () => setForm((prev) => ({ ...prev, dietTypes: [...DIET_TYPES] }));
  const clearAll  = () => setForm((prev) => ({ ...prev, dietTypes: [] }));

  const updateField = (k) => (e) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const normalizeList = (v) =>
    (typeof v === "string" ? v : "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSave = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      allergies: Array.isArray(form.allergies) ? form.allergies : normalizeList(form.allergies),
      dislikes:  Array.isArray(form.dislikes)  ? form.dislikes  : normalizeList(form.dislikes),
      dietTypes: form.dietTypes || [],
    });
  };

  return createPortal(
    <div
      style={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-prefs-title"
      onClick={onCancel} // backdrop click closes
    >
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()} // keep clicks inside from closing
      >
        <div style={styles.header} id="edit-prefs-title">
          <span>Edit Preferences</span>
          <button
            type="button"
            style={{
              ...styles.iconBtn,
              ...(hoverClose ? { background: "#b527e0", color: "#fff" } : {}),
            }}
            onMouseEnter={() => setHoverClose(true)}
            onMouseLeave={() => setHoverClose(false)}
            onClick={onCancel}
            aria-label="Close"
            title="Close"
          >
            ✕
          </button>
        </div>

        <form style={styles.body} onSubmit={handleSave}>
          {/* Name */}
          <div style={styles.row}>
            <label htmlFor="name" style={styles.label}>Name</label>
            <input
              id="name"
              style={styles.input}
              ref={firstInputRef}
              value={form.name || ""}
              onChange={updateField("name")}
            />
          </div>

          {/* Diet Types */}
          <div style={styles.row}>
            <label style={styles.label}>Diet Types</label>

            <div style={styles.dietTools}>
              <button
                type="button"
                style={{
                  ...styles.smallBtn,
                  ...(hoverSel ? { background: "#7a5af8", color: "#fff" } : {}),
                }}
                onMouseEnter={() => setHoverSel(true)}
                onMouseLeave={() => setHoverSel(false)}
                onClick={selectAll}
                aria-label="Select all diet types"
              >
                Select All
              </button>
              <button
                type="button"
                style={{
                  ...styles.smallBtn,
                  ...(hoverClr ? { background: "#7a5af8", color: "#fff" } : {}),
                }}
                onMouseEnter={() => setHoverClr(true)}
                onMouseLeave={() => setHoverClr(false)}
                onClick={clearAll}
                aria-label="Clear all diet types"
              >
                Clear All
              </button>
            </div>

            <div style={styles.dietGrid}>
              {DIET_TYPES.map((d) => {
                const checked = !!form.dietTypes?.includes(d);
                return (
                  <label
                    key={d}
                    style={{ ...styles.chip, ...(checked ? styles.chipChecked : {}) }}
                  >
                    {/* keep native input for a11y; hide visually */}
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDiet(d)}
                      style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
                      aria-checked={checked}
                    />
                    <span
                      style={{ ...styles.checkmark, ...(checked ? styles.checkmarkOn : {}) }}
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <span>{d}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Allergies */}
          <div style={styles.row}>
            <label htmlFor="allergies" style={styles.label}>Allergies (comma separated)</label>
            <input
              id="allergies"
              style={styles.input}
              placeholder="e.g., Nuts, Shellfish"
              value={
                typeof form.allergies === "string"
                  ? form.allergies
                  : (form.allergies || []).join(", ")
              }
              onChange={updateField("allergies")}
            />
          </div>

          {/* Dislikes */}
          <div style={styles.row}>
            <label htmlFor="dislikes" style={styles.label}>Dislikes (comma separated)</label>
            <input
              id="dislikes"
              style={styles.input}
              placeholder="e.g., Mushrooms, Spicy food"
              value={
                typeof form.dislikes === "string"
                  ? form.dislikes
                  : (form.dislikes || []).join(", ")
              }
              onChange={updateField("dislikes")}
            />
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <button
              type="button"
              style={{ ...styles.btn, ...styles.ghost }}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button type="submit" style={{ ...styles.btn, ...styles.primary }}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
