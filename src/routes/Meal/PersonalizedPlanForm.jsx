// src/routes/Meal/PersonalizedPlanForm.jsx
import { useState } from 'react';
import './PersonalizedPlan.css';

const DIET_TYPES = [
  { value: 'balanced', label: 'Balanced' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'low-carb', label: 'Low-Carb' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'diabetic-friendly', label: 'Diabetic-Friendly' },
  { value: 'high-protein', label: 'High-Protein' },
];

const GOALS = [
  { value: 'maintain weight', label: 'Maintain Weight' },
  { value: 'lose weight', label: 'Lose Weight' },
  { value: 'gain weight', label: 'Gain Weight' },
  { value: 'manage blood sugar', label: 'Manage Blood Sugar' },
  { value: 'improve heart health', label: 'Improve Heart Health' },
  { value: 'build strength', label: 'Build Strength' },
];

const CUISINES = [
  { value: 'any', label: 'Any' },
  { value: 'Mediterranean', label: 'Mediterranean' },
  { value: 'Asian', label: 'Asian' },
  { value: 'Western', label: 'Western' },
  { value: 'Indian', label: 'Indian' },
  { value: 'Middle Eastern', label: 'Middle Eastern' },
];

const ALLERGENS = ['Nuts', 'Dairy', 'Gluten', 'Soy', 'Shellfish', 'Eggs'];

const HEALTH_CONDITIONS = [
  'Diabetes', 'Hypertension', 'Osteoporosis', 'Heart Disease',
  'Kidney Disease', 'Constipation', 'Dysphagia',
];

const TEXTURE_OPTIONS = [
  { value: 'regular', label: 'Regular', helper: 'Normal foods' },
  { value: 'soft', label: 'Soft', helper: 'Tender & moist' },
  { value: 'pureed', label: 'Pureed', helper: 'Fully blended' },
];

const MOBILITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'lightly active', label: 'Lightly Active' },
  { value: 'moderately active', label: 'Moderately Active' },
];

const COMPLEXITY_OPTIONS = [
  { value: 'simple', label: 'Simple (≤30 min)' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'complex', label: 'Complex' },
];

const PORTION_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

// ── Collapsible section wrapper ─────────────────────────────────────────────
function CollapsibleSection({ title, open, onToggle, children }) {
  return (
    <div style={{
      marginBottom: 16,
      border: '1px solid var(--border-color)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: 'var(--background-secondary)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          textAlign: 'left',
          minHeight: 52,
        }}
      >
        <span>{title}</span>
        <span style={{
          display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.25s ease',
          lineHeight: 1,
          fontSize: '1rem',
        }}>
          ▾
        </span>
      </button>
      <div style={{
        maxHeight: open ? 2000 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.35s ease',
      }}>
        <div style={{ padding: '16px 18px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Button-style radio group ─────────────────────────────────────────────────
function OptionGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 16px',
              minHeight: 52,
              borderRadius: 12,
              border: active
                ? '2px solid var(--primary-color)'
                : '1px solid var(--border-color)',
              background: active ? 'var(--primary-color)' : 'var(--input-background)',
              color: active ? 'var(--text-inverse)' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: active ? 700 : 500,
              transition: 'all 0.15s ease',
              flex: '1 1 auto',
            }}
          >
            <span>{opt.label}</span>
            {opt.helper && (
              <span style={{
                fontSize: '0.8125rem',
                fontWeight: 400,
                marginTop: 2,
                opacity: 0.85,
                color: active ? 'var(--text-inverse)' : 'var(--text-secondary)',
              }}>
                {opt.helper}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Main form component ──────────────────────────────────────────────────────
// loading prop is optional (default false). Parent can pass it to show
// the spinner on the submit button while the plan is being generated.
export default function PersonalizedPlanForm({ onGenerate, onExport, loading = false }) {
  const [sec1Open, setSec1Open] = useState(true);
  const [sec2Open, setSec2Open] = useState(true);
  const [sec3Open, setSec3Open] = useState(false);

  const [dietType, setDietType] = useState('balanced');
  const [goal, setGoal] = useState('maintain weight');
  const [calorieTarget, setCalorieTarget] = useState(1800);
  const [cuisine, setCuisine] = useState('any');
  const [allergies, setAllergies] = useState([]);
  const [healthConditions, setHealthConditions] = useState([]);
  const [mealTexture, setMealTexture] = useState('regular');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [mobilityLevel, setMobilityLevel] = useState('sedentary');
  const [cookingComplexity, setCookingComplexity] = useState('simple');
  const [portionSize, setPortionSize] = useState('medium');

  const toggleChip = (setList, value) => {
    setList(prev =>
      prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filters = {
      dietType,
      goal,
      calorieTarget,
      allergies,
      healthConditions,
      mealTexture,
      mobilityLevel,
      cookingComplexity,
      portionSize,
      ...(cuisine !== 'any' && { cuisine }),
      ...(additionalNotes.trim() && { additionalNotes: additionalNotes.trim() }),
    };
    onGenerate(filters);
  };

  return (
    <form className="personalize-card" onSubmit={handleSubmit}>
      <h2 className="personalize-title">Personalize Your 7-Day Meal Plan</h2>

      {/* ── Section 1: Basic Preferences (open by default) ── */}
      <CollapsibleSection
        title="Basic Preferences"
        open={sec1Open}
        onToggle={() => setSec1Open(o => !o)}
      >
        <div className="personalize-grid">
          <label className="personalize-field" style={{ marginBottom: 4 }}>
            <span className="personalize-label">Diet Type</span>
            <select
              className="personalize-input"
              value={dietType}
              onChange={e => setDietType(e.target.value)}
            >
              {DIET_TYPES.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </label>

          <label className="personalize-field" style={{ marginBottom: 4 }}>
            <span className="personalize-label">Goal</span>
            <select
              className="personalize-input"
              value={goal}
              onChange={e => setGoal(e.target.value)}
            >
              {GOALS.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </label>

          <label className="personalize-field" style={{ marginBottom: 4 }}>
            <span className="personalize-label">Daily Calories (kcal)</span>
            <input
              type="number"
              className="personalize-input"
              value={calorieTarget}
              min={500}
              max={5000}
              onChange={e => setCalorieTarget(Number(e.target.value))}
            />
          </label>

          <label className="personalize-field" style={{ marginBottom: 4 }}>
            <span className="personalize-label">Cuisine Preference</span>
            <select
              className="personalize-input"
              value={cuisine}
              onChange={e => setCuisine(e.target.value)}
            >
              {CUISINES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>
        </div>
      </CollapsibleSection>

      {/* ── Section 2: Health & Medical (open by default) ── */}
      <CollapsibleSection
        title="Health & Medical"
        open={sec2Open}
        onToggle={() => setSec2Open(o => !o)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="personalize-field">
            <span className="personalize-label">Health Conditions</span>
            <div className="chip-row" style={{ marginTop: 8 }}>
              {HEALTH_CONDITIONS.map(hc => (
                <button
                  key={hc}
                  type="button"
                  className={`chip ${healthConditions.includes(hc) ? 'chip--active' : ''}`}
                  onClick={() => toggleChip(setHealthConditions, hc)}
                >
                  {hc}
                </button>
              ))}
            </div>
          </div>

          <div className="personalize-field">
            <span className="personalize-label">Allergies (exclude)</span>
            <div className="chip-row" style={{ marginTop: 8 }}>
              {ALLERGENS.map(a => (
                <button
                  key={a}
                  type="button"
                  className={`chip ${allergies.includes(a) ? 'chip--active' : ''}`}
                  onClick={() => toggleChip(setAllergies, a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="personalize-field">
            <span className="personalize-label">Meal Texture</span>
            <OptionGroup
              value={mealTexture}
              onChange={setMealTexture}
              options={TEXTURE_OPTIONS}
            />
          </div>

          <div className="personalize-field">
            <span className="personalize-label">Additional Notes</span>
            <textarea
              className="personalize-input"
              value={additionalNotes}
              maxLength={300}
              rows={3}
              placeholder="e.g. On warfarin, avoid high Vitamin K foods"
              onChange={e => setAdditionalNotes(e.target.value)}
              style={{
                resize: 'vertical',
                minHeight: 80,
                fontFamily: 'inherit',
                fontSize: '1rem',
              }}
            />
            <span style={{
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              textAlign: 'right',
              display: 'block',
              marginTop: 2,
            }}>
              {additionalNotes.length}/300
            </span>
          </div>
        </div>
      </CollapsibleSection>

      {/* ── Section 3: Lifestyle (collapsed by default) ── */}
      <CollapsibleSection
        title="Lifestyle"
        open={sec3Open}
        onToggle={() => setSec3Open(o => !o)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="personalize-field">
            <span className="personalize-label">Mobility Level</span>
            <OptionGroup
              value={mobilityLevel}
              onChange={setMobilityLevel}
              options={MOBILITY_OPTIONS}
            />
          </div>

          <div className="personalize-field">
            <span className="personalize-label">Cooking Complexity</span>
            <OptionGroup
              value={cookingComplexity}
              onChange={setCookingComplexity}
              options={COMPLEXITY_OPTIONS}
            />
          </div>

          <div className="personalize-field">
            <span className="personalize-label">Portion Size</span>
            <OptionGroup
              value={portionSize}
              onChange={setPortionSize}
              options={PORTION_OPTIONS}
            />
          </div>
        </div>
      </CollapsibleSection>

      <div className="personalize-generate-bar">
        <div className="personalize-generate-hint">
          Reviewed your preferences? Generate your personalised 7-day AI meal plan.
        </div>
        <div className="personalize-actions">
          <button
            type="submit"
            className="btn-primary-solid personalize-generate-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="pp-spinner" aria-hidden="true" />
                Generating plan…
              </>
            ) : (
              <>
                ✨ Generate My 7-Day Plan
              </>
            )}
          </button>

          {onExport && (
            <button
              type="button"
              className="export-btn"
              onClick={onExport}
            >
              Export as PDF
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
