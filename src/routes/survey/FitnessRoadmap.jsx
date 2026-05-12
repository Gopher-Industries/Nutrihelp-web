import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './fitnessroadmap1.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import html2pdf from 'html2pdf.js';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const createPlanProgressKey = (planText) => {
  let hash = 0;
  for (let i = 0; i < planText.length; i += 1) {
    hash = ((hash << 5) - hash + planText.charCodeAt(i)) | 0;
  }
  return String(hash);
};

const parseDailyWorkouts = (workouts = []) => {
  const dailyMap = {};
  const generalWorkouts = [];

  workouts.forEach((item) => {
    if (!item) return;
    const parts = String(item).split(':');
    if (parts.length < 2) {
      generalWorkouts.push(String(item).trim());
      return;
    }

    const day = parts[0].trim();
    dailyMap[day] = parts.slice(1).join(':').trim();
  });

  return { dailyMap, generalWorkouts };
};

export default function FitnessRoadmap() {
  const [data, setData] = useState(null);
  const [weekIndex, setWeekIndex] = useState(0);
  const [day, setDay] = useState('Monday');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlockedWeek, setUnlockedWeek] = useState(0);
  const [planCompleted, setPlanCompleted] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');
  const [completedDays, setCompletedDays] = useState({});
  const certificateRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cached = localStorage.getItem('FitnessPlan');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.weekly_plan) && parsed.weekly_plan.length > 0) {
          const currentPlanKey = createPlanProgressKey(cached);
          const savedPlanKey = localStorage.getItem('FitnessPlanProgressKey');
          const isSamePlan = savedPlanKey === currentPlanKey;

          if (!isSamePlan) {
            localStorage.setItem('FitnessPlanProgressKey', currentPlanKey);
            localStorage.removeItem('FitnessPlanCompleted');
            localStorage.setItem('FitnessPlanUnlockedWeek', '0');
            localStorage.removeItem('FitnessPlanCompletedDays');
          }

          const completed = isSamePlan && localStorage.getItem('FitnessPlanCompleted') === 'true';
          const savedUnlockedWeek = isSamePlan
            ? Number(localStorage.getItem('FitnessPlanUnlockedWeek') || 0)
            : 0;
          const savedCompletedDays = isSamePlan
            ? JSON.parse(localStorage.getItem('FitnessPlanCompletedDays') || '{}')
            : {};

          setData(parsed);
          setCompletedDays(savedCompletedDays);
          setPlanCompleted(completed);

          if (completed) {
            const finalWeek = Math.max(parsed.weekly_plan.length - 1, 0);
            setUnlockedWeek(finalWeek);
            setWeekIndex(finalWeek);
          } else {
            const safeUnlockedWeek = Math.min(
              Math.max(Number.isNaN(savedUnlockedWeek) ? 0 : savedUnlockedWeek, 0),
              parsed.weekly_plan.length - 1
            );
            setUnlockedWeek(safeUnlockedWeek);
            setWeekIndex(safeUnlockedWeek);
          }

          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error parsing FitnessPlan:', err);
      }
    }

    setError('No active roadmap found. Please complete the health check-in to generate your personalised plan.');
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="roadmap-loading">
        <div className="spinner" />
        <p>Loading your roadmap...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="roadmap-error">
        <h2>{error}</h2>
        <button className="back-btn" onClick={() => navigate('/survey')}>
          Go to Check-In
        </button>
      </div>
    );
  }

  if (!data || !Array.isArray(data.weekly_plan) || data.weekly_plan.length === 0) {
    return <p className="roadmap-state">No weekly plan data available.</p>;
  }

  const week = data.weekly_plan[weekIndex];
  const { dailyMap, generalWorkouts } = parseDailyWorkouts(week.workouts);
  const workoutToday = dailyMap[day] || generalWorkouts[0] || 'Gentle mobility or walking on rest days';
  const totalWeeks = data.weekly_plan.length;
  const currentWeekKey = String(week.week);
  const currentCompletedDays = completedDays[currentWeekKey] || {};
  const completedDaysThisWeek = daysOfWeek.filter((d) => currentCompletedDays[d]).length;
  const isCurrentDayComplete = Boolean(currentCompletedDays[day]);
  const isWeekReadyToComplete = completedDaysThisWeek === daysOfWeek.length;
  const isFinalWeek = weekIndex === totalWeeks - 1;
  const completedWeeks = planCompleted ? totalWeeks : unlockedWeek;
  const displayOverallPercent = planCompleted ? 100 : Math.round((completedWeeks / totalWeeks) * 100);

  const ringsData = data.weekly_plan.map((w, index) => {
    const weekCompletedDays = completedDays[String(w.week)] || {};
    const dayProgress = Math.round((daysOfWeek.filter((d) => weekCompletedDays[d]).length / daysOfWeek.length) * 100);
    return { week: w.week, value: planCompleted || index < unlockedWeek ? 100 : dayProgress };
  });

  const persistCompletedDays = (nextCompletedDays) => {
    localStorage.setItem('FitnessPlanProgressKey', createPlanProgressKey(JSON.stringify(data)));
    localStorage.setItem('FitnessPlanCompletedDays', JSON.stringify(nextCompletedDays));
  };

  const handleCompleteDay = () => {
    if (isCurrentDayComplete || planCompleted) return;

    const nextCompletedDays = {
      ...completedDays,
      [currentWeekKey]: {
        ...(completedDays[currentWeekKey] || {}),
        [day]: true,
      },
    };

    setCompletedDays(nextCompletedDays);
    persistCompletedDays(nextCompletedDays);
    setCompletionMessage(`${day} in Week ${week.week} marked as done.`);
  };

  const handleCompleteWeek = () => {
    if (!isWeekReadyToComplete) {
      setCompletionMessage(`Complete all 7 days in Week ${week.week} before finishing this week.`);
      return;
    }

    if (isFinalWeek) {
      setPlanCompleted(true);
      setUnlockedWeek(totalWeeks - 1);
      localStorage.setItem('FitnessPlanProgressKey', createPlanProgressKey(JSON.stringify(data)));
      localStorage.setItem('FitnessPlanCompleted', 'true');
      localStorage.setItem('FitnessPlanUnlockedWeek', String(totalWeeks - 1));
      setCompletionMessage('You completed the full roadmap. Your certificate is ready.');
      return;
    }

    const nextWeek = Math.min(unlockedWeek + 1, totalWeeks - 1);
    setUnlockedWeek(nextWeek);
    setWeekIndex(nextWeek);
    setDay('Monday');
    localStorage.setItem('FitnessPlanProgressKey', createPlanProgressKey(JSON.stringify(data)));
    localStorage.setItem('FitnessPlanUnlockedWeek', String(nextWeek));
    setCompletionMessage(`Week ${week.week} completed. Week ${week.week + 1} is now ready.`);
  };

  const handleDownloadCertificate = () => {
    if (!certificateRef.current) return;
    html2pdf()
      .set({
        margin: 0,
        filename: 'NutriHelp-Wellness-Achievement.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      })
      .from(certificateRef.current)
      .save();
  };

  return (
    <div className="roadmap-page">
      {planCompleted ? (
        <section className="achievement-card">
          <div ref={certificateRef} className="certificate-print">
            <div className="certificate-inner">
              <div className="certificate-brand">NutriHelp</div>
              <div className="certificate-rule" />
              <p className="certificate-kicker">Certificate of Achievement</p>
              <h2>Wellness Roadmap Completed</h2>
              <p className="certificate-presented">This certificate is presented for completing</p>
              <p className="certificate-name">NutriHelp Wellness Achievement</p>
              <p className="certificate-copy">
                Successfully completed a {totalWeeks} week activity and nutrition roadmap with
                daily check-ins, weekly progress, movement guidance, and meal reminders.
              </p>
              <div className="certificate-seal" aria-hidden="true"><span>NH</span></div>
              <div className="certificate-footer">
                <div className="certificate-signature">
                  <span />
                  <strong>NutriHelp AI Team</strong>
                  <small>Care Guidance System</small>
                </div>
                <div className="certificate-date">
                  <strong>{new Date().toLocaleDateString()}</strong>
                  <small>Date Completed</small>
                </div>
                <div className="certificate-signature">
                  <span />
                  <strong>Wellness Roadmap</strong>
                  <small>Program Completion</small>
                </div>
              </div>
            </div>
          </div>
          <p className="achievement-note">
            Your certificate is ready. Download it as a record of completing the full roadmap.
          </p>
          <button className="certificate-download" type="button" onClick={handleDownloadCertificate}>
            Download Certificate
          </button>
        </section>
      ) : null}

      <section className="roadmap-hero">
        <span>NutriHelp activity plan</span>
        <h1>Your Weekly Wellness Roadmap</h1>
        <p>
          A gentle plan for movement, meals, and reminders based on your health check-in.
          Complete each day first, then finish the week when you are ready.
        </p>
      </section>

      <section className="roadmap-support-card">
        <span className="support-icon">✓</span>
        <div>
          <strong>Small steps count.</strong>
          <p>Complete the daily check-ins at your own pace. This roadmap is a guide, not a strict rule.</p>
        </div>
      </section>

      {completionMessage ? <div className="completion-message">{completionMessage}</div> : null}

      <div className="selector-row">
        {data.weekly_plan.map((w, index) => {
          const isLocked = index > unlockedWeek;
          return (
            <button
              type="button"
              key={w.week || index}
              disabled={isLocked}
              onClick={() => {
                if (!isLocked) {
                  setWeekIndex(index);
                  setDay('Monday');
                }
              }}
              className={`${index === weekIndex ? 'week-card-active' : 'week-card-inactive'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Week {w.week} {isLocked ? 'Locked' : ''}
            </button>
          );
        })}
      </div>

      <div className="day-buttons">
        {daysOfWeek.map((weekday) => (
          <button
            key={weekday}
            type="button"
            className={`day-btn ${weekday === day ? 'active' : ''} ${completedDays[currentWeekKey]?.[weekday] ? 'completed' : ''}`}
            onClick={() => setDay(weekday)}
          >
            {weekday}
          </button>
        ))}
      </div>

      <div className="content-grid">
        <div className="card-1">
          <div className="card">
            <span className="card-kicker">Movement</span>
            <h2>{day}</h2>
            <p>{workoutToday}</p>
          </div>

          <div className="card">
            <span className="card-kicker">Weekly focus</span>
            <h2>{week.focus || 'Balanced fitness and nutrition maintenance'}</h2>
            <p>Use this focus to guide your meals, activity, and rest for the week.</p>
          </div>
        </div>

        <div className="card">
          <span className="card-kicker">Nutrition</span>
          <h2>Daily target: {week.target_calories_per_day || 'Not set'} kcal</h2>
          <p>{week.meal_notes || 'Prioritise lean protein, vegetables, whole grains, and consistent hydration.'}</p>
        </div>

        <div className="card">
          <span className="card-kicker">Reminders</span>
          <h2>Keep in mind</h2>
          <ul>
            {(week.reminders || []).map((reminder, index) => <li key={index}>{reminder}</li>)}
          </ul>
        </div>
      </div>

      <section className="daily-check-card">
        <div>
          <span className="card-kicker">Daily check-in</span>
          <h3>{isCurrentDayComplete ? `${day} completed` : `Complete ${day}`}</h3>
          <p>Mark this day as complete after you have reviewed or followed the guidance.</p>
        </div>
        <button type="button" disabled={isCurrentDayComplete || planCompleted} onClick={handleCompleteDay}>
          {isCurrentDayComplete ? 'Day Complete' : 'Mark Day Complete'}
        </button>
      </section>

      <div className="roadmap-button">
        <button type="button" disabled={planCompleted} onClick={handleCompleteWeek}>
          {isFinalWeek ? 'Finish Roadmap' : `Finish Week ${week.week} & Unlock Week ${week.week + 1}`}
        </button>
        {!isWeekReadyToComplete && !planCompleted ? (
          <p>Complete all 7 days in this week before unlocking the next week.</p>
        ) : null}
      </div>

      <div className="stats-panel">
        <span className="card-kicker">Progress</span>
        <h3>Your Roadmap</h3>
        <p><strong>Weeks completed:</strong> {completedWeeks} / {totalWeeks}</p>
        <p><strong>Days completed this week:</strong> {completedDaysThisWeek} / 7</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${displayOverallPercent}%` }} />
        </div>
        <p><strong>Total completion:</strong> {displayOverallPercent}%</p>
      </div>

      <div className="rings-wrapper">
        <span className="card-kicker">Weekly check-ins</span>
        <h3>Progress by Week</h3>
        <div className="rings-row">
          {ringsData.map((ring) => (
            <div key={ring.week} className="ring-item">
              <CircularProgressbar
                value={ring.value}
                text={`${ring.value}%`}
                styles={buildStyles({
                  pathColor: ring.value === 100 ? '#43b05c' : '#7B44FF',
                  textColor: '#333',
                  trailColor: '#eee',
                })}
              />
              <p>Week {ring.week}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
