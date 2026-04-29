// src/routes/Meal/PersonalizedWeeklyPlan.jsx
import { useEffect, useState } from 'react';
import './PersonalizedPlan.css';

const AI_ENDPOINT       = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}/api/meal-plan/ai-generate`;
const FEEDBACK_ENDPOINT = (planId) => `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}/api/meal-plan/feedback/${planId}`;

// Accent colours cycling across day cards
const DAY_ACCENTS = [
  '#005BBB', '#2E7D32', '#c05c00', '#7B1FA2',
  '#00838F', '#B71C1C', '#1565C0',
];

// ── Nutrition badge ──────────────────────────────────────────────────────────
function NutritionBadge({ label, value, bg, color }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 999,
      background: bg,
      color,
      fontSize: '0.8125rem',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {label}: {value ?? '—'}
    </span>
  );
}

function sodiumColor(sodiumStr) {
  const val = parseInt(sodiumStr, 10) || 0;
  return val > 600
    ? { bg: '#FEE2E2', color: '#991b1b' }
    : { bg: '#F3F4F6', color: '#374151' };
}

// ── Expandable ingredients ───────────────────────────────────────────────────
function IngredientToggle({ ingredients }) {
  const [open, setOpen] = useState(false);

  if (!ingredients || ingredients.length === 0) return null;

  return (
    <div style={{ marginTop: 10 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--primary-color)',
          cursor: 'pointer',
          fontSize: '0.9375rem',
          padding: '4px 0',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <span style={{
          display: 'inline-block',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          fontSize: '0.75rem',
        }}>
          ▶
        </span>
        {open ? 'Hide ingredients' : 'Show ingredients'}
      </button>

      <div style={{
        maxHeight: open ? 1200 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}>
        <ul style={{
          listStyle: 'none',
          padding: '8px 0 0',
          margin: 0,
          fontSize: '0.9375rem',
          color: 'var(--text-secondary)',
        }}>
          {ingredients.map((ing, i) => (
            <li key={i} style={{
              padding: '4px 0',
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <span>{ing.item}</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: 12 }}>{ing.amount}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Single meal card ─────────────────────────────────────────────────────────
function MealCard({ mealType, meal }) {
  const sc = sodiumColor(meal?.sodium);
  return (
    <div style={{
      border: '1px solid var(--border-color)',
      borderRadius: 12,
      padding: 16,
      background: 'var(--card-background-secondary)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <h4 style={{
        margin: '0 0 6px',
        color: 'var(--primary-color)',
        fontSize: '1rem',
        fontWeight: 700,
        textTransform: 'capitalize',
      }}>
        {mealType}
      </h4>

      <p style={{
        margin: '0 0 6px',
        fontWeight: 700,
        fontSize: '1.0625rem',
        color: 'var(--text-primary)',
        lineHeight: 1.4,
      }}>
        {meal?.name || 'N/A'}
      </p>

      <p style={{
        margin: '0 0 12px',
        fontSize: '0.9375rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
      }}>
        {meal?.description || ''}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <NutritionBadge label="Cal"     value={meal?.calories} bg="#FFF3CD" color="#c05c00" />
        <NutritionBadge label="Protein" value={meal?.proteins} bg="#DBEAFE" color="#1e40af" />
        <NutritionBadge label="Fat"     value={meal?.fats}     bg="#FEF9C3" color="#92400e" />
        <NutritionBadge label="Fiber"   value={meal?.fiber}    bg="#DCFCE7" color="#166534" />
        <NutritionBadge
          label="Sodium"
          value={meal?.sodium || '—'}
          bg={sc.bg}
          color={sc.color}
        />
      </div>

      <IngredientToggle ingredients={meal?.ingredients} />
    </div>
  );
}

// ── Day card ─────────────────────────────────────────────────────────────────
function DayCard({ dayPlan, index }) {
  const accent = DAY_ACCENTS[index % DAY_ACCENTS.length];
  const bg = index % 2 === 0
    ? 'var(--card-background)'
    : 'var(--background-secondary)';

  return (
    <div style={{
      marginBottom: 24,
      borderRadius: 14,
      border: '1px solid var(--border-color)',
      borderLeft: `5px solid ${accent}`,
      background: bg,
      overflow: 'hidden',
    }}>
      <h3 style={{
        margin: 0,
        padding: '14px 18px',
        fontSize: '1.25rem',
        fontWeight: 800,
        color: 'var(--text-primary)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        {dayPlan.day}
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 14,
        padding: 16,
      }}>
        {['breakfast', 'lunch', 'dinner'].map(mealType => (
          <MealCard key={mealType} mealType={mealType} meal={dayPlan[mealType]} />
        ))}
      </div>
    </div>
  );
}

// ── Cycling-message loading screen ──────────────────────────────────────────
const LOADING_STEPS = [
  { icon: '🔍', text: 'Searching for the best recipes for you...' },
  { icon: '🥗', text: 'Analysing your dietary preferences...' },
  { icon: '💊', text: 'Checking your health conditions...' },
  { icon: '⚖️',  text: 'Balancing your nutrition targets...' },
  { icon: '🍽️', text: 'Crafting your 7-day meal plan...' },
  { icon: '🧂', text: 'Reviewing sodium and allergen levels...' },
  { icon: '📋', text: 'Selecting ingredients just for you...' },
  { icon: '✨', text: 'Putting the finishing touches on your plan...' },
];

function PlanLoadingScreen() {
  const [stepIdx, setStepIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setStepIdx(i => (i + 1) % LOADING_STEPS.length);
        setVisible(true);
      }, 350);
    }, 2200);
    return () => clearInterval(cycle);
  }, []);

  const step = LOADING_STEPS[stepIdx];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      background: 'var(--card-background)',
      borderRadius: 16,
      border: '1px solid var(--border-color)',
      minHeight: 280,
      textAlign: 'center',
    }}>
      <style>{`
        @keyframes planSpinRing {
          to { transform: rotate(360deg); }
        }
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>

      <div style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        border: '4px solid var(--border-color)',
        borderTopColor: 'var(--primary-color)',
        animation: 'planSpinRing 0.9s linear infinite',
        marginBottom: 28,
        flexShrink: 0,
      }} />

      <div style={{
        transition: 'opacity 0.35s ease',
        opacity: visible ? 1 : 0,
        minHeight: 64,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{ fontSize: '2rem', lineHeight: 1 }}>{step.icon}</span>
        <p style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: 0,
          maxWidth: 340,
          lineHeight: 1.4,
        }}>
          {step.text}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 7, marginTop: 28 }}>
        {LOADING_STEPS.map((_, i) => (
          <span key={i} style={{
            width: i === stepIdx ? 20 : 8,
            height: 8,
            borderRadius: 999,
            background: i === stepIdx ? 'var(--primary-color)' : 'var(--border-color)',
            transition: 'width 0.3s ease, background 0.3s ease',
            display: 'inline-block',
          }} />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 480, marginTop: 32 }}>
        {[1, 0.75, 0.55].map((w, i) => (
          <div key={i} style={{
            height: 14,
            borderRadius: 999,
            background: 'var(--background-secondary)',
            width: `${w * 100}%`,
            marginBottom: 10,
            animation: `skeletonPulse 1.6s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Feedback card ─────────────────────────────────────────────────────────────
// Meal chip cycles: neutral → liked (green) → disliked (red) → neutral
const NEXT_MEAL_STATE = { undefined: 'liked', liked: 'disliked', disliked: undefined };

const MEAL_CHIP_STYLE = {
  neutral:  { bg: 'var(--primary-light)',  border: 'var(--primary-color)', color: 'var(--text-primary)' },
  liked:    { bg: '#DCFCE7',               border: '#16a34a',               color: '#14532d'              },
  disliked: { bg: '#FEE2E2',               border: '#dc2626',               color: '#7f1d1d'              },
};

function FeedbackCard({ planId, mealPlan }) {
  // A — star rating
  const [rating, setRating]       = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // B — followed plan
  const [followedPlan, setFollowedPlan] = useState(null); // null | true | false

  // C — per-meal toggle: { "Monday Breakfast": "liked" | "disliked" | undefined }
  const [mealStates, setMealStates] = useState({});

  // D — notes
  const [notes, setNotes] = useState('');

  // E — submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Build the 21 meal labels from actual plan data
  const mealLabels = mealPlan.flatMap(day =>
    ['Breakfast', 'Lunch', 'Dinner'].map(m => `${day.day} ${m}`)
  );

  const toggleMeal = (label) => {
    setMealStates(prev => {
      const next = { ...prev };
      const current = prev[label]; // undefined | 'liked' | 'disliked'
      const nextVal = NEXT_MEAL_STATE[current];
      if (nextVal === undefined) {
        delete next[label];
      } else {
        next[label] = nextVal;
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!rating || submitting) return;
    if (!planId) {
      setSubmitError('Feedback is not available for this plan — plan ID was not returned by the server.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const likedMeals    = mealLabels.filter(l => mealStates[l] === 'liked');
      const dislikedMeals = mealLabels.filter(l => mealStates[l] === 'disliked');
      const body = {
        rating,
        ...(likedMeals.length    && { likedMeals }),
        ...(dislikedMeals.length && { dislikedMeals }),
        ...(followedPlan !== null && { followedPlan }),
        ...(notes.trim()          && { notes: notes.trim() }),
      };
      const res = await fetch(FEEDBACK_ENDPOINT(planId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error('API returned an error');
      setSubmitted(true);
    } catch (err) {
      console.error('Feedback submit error:', err);
      setSubmitError('Failed to submit feedback, please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  // Section label style shared across all headings inside the card
  const sectionLabel = {
    display: 'block',
    fontWeight: 700,
    fontSize: '1.0625rem',
    color: 'var(--text-primary)',
    marginBottom: 10,
  };

  // ── Thank-you state ──
  if (submitted) {
    return (
      <div style={{
        marginTop: 32,
        padding: '28px 24px',
        borderRadius: 16,
        border: '2px solid #16a34a',
        background: '#F0FDF4',
        textAlign: 'center',
      }}>
        <span style={{ fontSize: '2rem' }}>🎉</span>
        <p style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: '#14532d',
          margin: '10px 0 0',
          lineHeight: 1.5,
        }}>
          Thank you for your feedback! This helps us improve future plans.
        </p>
      </div>
    );
  }

  // ── Feedback form ──
  return (
    <div style={{
      marginTop: 36,
      padding: '28px 24px',
      borderRadius: 16,
      border: '1px solid var(--border-color)',
      background: 'var(--background-secondary)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      <h3 style={{
        margin: '0 0 6px',
        fontSize: '1.3125rem',
        fontWeight: 800,
        color: 'var(--text-primary)',
      }}>
        Rate Your Meal Plan
      </h3>
      <p style={{
        margin: '0 0 24px',
        fontSize: '1rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
      }}>
        Your rating helps us personalise better plans for you in the future.
      </p>

      {/* ── A: Star rating ── */}
      <div style={{ marginBottom: 28 }}>
        <span style={sectionLabel}>How would you rate this meal plan?</span>
        <div
          style={{ display: 'flex', gap: 6 }}
          onMouseLeave={() => setHoverRating(0)}
          role="group"
          aria-label="Star rating"
        >
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px 4px',
                cursor: 'pointer',
                fontSize: '2.5rem',   // 40px — comfortably above 36px minimum
                lineHeight: 1,
                color: star <= displayRating ? '#f59e0b' : 'var(--border-color)',
                transition: 'color 0.12s ease, transform 0.12s ease',
                transform: star <= displayRating ? 'scale(1.15)' : 'scale(1)',
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {star <= displayRating ? '★' : '☆'}
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p style={{ margin: '6px 0 0', fontSize: '0.9375rem', color: '#f59e0b', fontWeight: 600 }}>
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][rating]}
          </p>
        )}
      </div>

      {/* ── B: Followed plan? ── */}
      <div style={{ marginBottom: 28 }}>
        <span style={sectionLabel}>Did you follow this plan?</span>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Yes, I followed it', value: true  },
            { label: "No, I didn't",        value: false },
          ].map(opt => {
            const active = followedPlan === opt.value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setFollowedPlan(prev => prev === opt.value ? null : opt.value)}
                style={{
                  padding: '10px 20px',
                  minHeight: 44,
                  borderRadius: 999,
                  border: active
                    ? '2px solid var(--primary-color)'
                    : '1px solid var(--border-color)',
                  background: active ? 'var(--primary-color)' : 'var(--card-background)',
                  color: active ? 'var(--text-inverse)' : 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── C: Per-meal feedback chips ── */}
      <div style={{ marginBottom: 28 }}>
        <span style={sectionLabel}>Tell us about individual meals <span style={{ fontWeight: 400, fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>(optional)</span></span>
        <p style={{
          margin: '0 0 10px',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
            1 click = liked
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
            2 clicks = disliked
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--border-color)', display: 'inline-block' }} />
            3 clicks = clear
          </span>
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {mealLabels.map(label => {
            const state = mealStates[label]; // undefined | 'liked' | 'disliked'
            const style = MEAL_CHIP_STYLE[state ?? 'neutral'];
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleMeal(label)}
                style={{
                  padding: '8px 14px',
                  minHeight: 44,
                  borderRadius: 999,
                  border: `1px solid ${style.border}`,
                  background: style.bg,
                  color: style.color,
                  fontSize: '0.9375rem',
                  fontWeight: state ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {state === 'liked' ? '👍 ' : state === 'disliked' ? '👎 ' : ''}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── D: Notes ── */}
      <div style={{ marginBottom: 28 }}>
        <span style={sectionLabel}>
          Any other feedback?{' '}
          <span style={{ fontWeight: 400, fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>(optional)</span>
        </span>
        <textarea
          className="personalize-input"
          value={notes}
          maxLength={500}
          rows={3}
          placeholder="Any other feedback? (e.g. too spicy, portions too large)"
          onChange={e => setNotes(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            resize: 'vertical',
            minHeight: 80,
            fontFamily: 'inherit',
            fontSize: '1rem',
          }}
        />
        <span style={{
          display: 'block',
          textAlign: 'right',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          marginTop: 4,
        }}>
          {notes.length}/500
        </span>
      </div>

      {/* ── E: Submit ── */}
      {submitError && (
        <p style={{
          fontSize: '1rem',
          color: '#dc2626',
          marginBottom: 12,
          fontWeight: 600,
        }}>
          {submitError}
        </p>
      )}

      <button
        type="button"
        className="btn-primary-solid"
        disabled={!rating || submitting}
        onClick={handleSubmit}
        style={{
          minHeight: 48,
          fontSize: '1.0625rem',
          opacity: (!rating || submitting) ? 0.6 : 1,
          cursor: (!rating || submitting) ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? (
          <>
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                width: 16,
                height: 16,
                border: '2px solid #ffffff',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'planSpinRing 0.8s linear infinite',
                marginRight: 8,
                verticalAlign: 'middle',
              }}
            />
            Submitting...
          </>
        ) : 'Submit Feedback'}
      </button>

      {!rating && (
        <p style={{
          marginTop: 8,
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          fontStyle: 'italic',
        }}>
          Please select a star rating to enable submit.
        </p>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function PersonalizedWeeklyPlan({ filters, onExport, showExport = true }) {
  const [mealPlan, setMealPlan]           = useState([]);
  const [planId, setPlanId]               = useState(null);
  const [loading, setLoading]             = useState(!!filters);
  const [error, setError]                 = useState('');
  const [regenerateKey, setRegenerateKey] = useState(0);

  useEffect(() => {
    if (!filters) return;

    let mounted = true;
    setLoading(true);
    setError('');
    setPlanId(null);

    fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (!json.success) throw new Error(json.message || 'API returned an error');
        if (mounted) {
          setMealPlan(json.data?.plan || []);
          // Accept planId under any of the common key names the backend might use
          setPlanId(json.planId || json.plan_id || json.id || null);
        }
      })
      .catch(err => {
        console.error('AI meal plan error:', err);
        if (mounted) setError(
          "We couldn't generate your plan right now. Please try again in a moment."
        );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [filters, regenerateKey]);

  // ── Loading ──
  if (loading) return <PlanLoadingScreen />;

  // ── Error ──
  if (error) return (
    <div style={{
      textAlign: 'center',
      padding: 32,
      background: 'var(--card-background)',
      borderRadius: 14,
      border: '1px solid var(--border-color)',
    }}>
      <p style={{
        fontSize: '1.125rem',
        color: 'var(--error-color, #dc2626)',
        margin: '0 0 20px',
        lineHeight: 1.5,
      }}>
        {error}
      </p>
      <button
        className="btn-primary-solid"
        onClick={() => setRegenerateKey(k => k + 1)}
        style={{ minHeight: 44 }}
      >
        Try Again
      </button>
    </div>
  );

  // ── Plan ──
  return (
    <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>

      {/* Top action bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16,
      }}>
        {mealPlan.length > 0 && (
          <button
            className="btn-primary-solid"
            onClick={() => setRegenerateKey(k => k + 1)}
            style={{ minHeight: 44 }}
          >
            Regenerate Plan
          </button>
        )}

        {showExport && onExport && (
          <button
            className="export-btn"
            onClick={onExport}
            style={{ minHeight: 44 }}
          >
            Export as PDF
          </button>
        )}
      </div>

      {/* 7-day plan */}
      <div id="personalized-meal-plan">
        {mealPlan.map((dayPlan, idx) => (
          <DayCard key={idx} dayPlan={dayPlan} index={idx} />
        ))}
      </div>

      {/* Feedback card — shown whenever a plan loaded, planId may be null */}
      {mealPlan.length > 0 && (
        <FeedbackCard planId={planId} mealPlan={mealPlan} />
      )}
    </div>
  );
}
