import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { UserContext } from "../context/user.context";
import "./WaterTracker.css";

const DAILY_GOAL_CUPS = 8;
const SETTINGS_NOTIFICATIONS_KEY = "notifications";
const SETTINGS_NOTIFICATION_CACHE_KEY = "notificationPreferences";
const REMINDER_COOLDOWN_MS = 2 * 60 * 60 * 1000; // At most 1 nudge every 2 hours
const REMINDER_CHECK_INTERVAL_MS = 15 * 60 * 1000;
const HYDRATION_WINDOW_START_HOUR = 8;
const HYDRATION_WINDOW_END_HOUR = 22;

const STAGES = {
  SAD: "sad",           // 0-2
  NEUTRAL: "neutral",   // 3-5
  EXCITED: "excited",   // 6-7
  MEDAL: "medal"        // 8+
};

const MESSAGES = {
  sad: [
    "You need water start sipping 😟",
    "Hydration is key drink up 💧",
    "Your body is craving water 🥺",
    "Time for a water break 😮‍💨",
    "Don't let yourself dry out 💦"
  ],
  neutral: [
    "Doing okay keep going 🙂",
    "Halfway there sip sip 🙂",
    "You're on the right track 👍",
    "Keep up the good hydration 😊",
    "Water is life keep drinking 💧"
  ],
  excited: [
    "Almost there just a bit more 🚀",
    "Great job finish strong 💪",
    "You're doing fantastic 🌟",
    "One or two more to reach your goal 🎯",
    "You are a hydration champion 🏆"
  ],
  medal: [
    "Goal achieved amazing job 🥳",
    "You crushed your daily goal 🏅",
    "Perfect hydration today 💧",
    "Look at you go goal met 🎉",
    "Awesome work you are fully hydrated 💙"
  ]
};

const getStage = (cups) => {
  if (cups <= 2) return STAGES.SAD;
  if (cups <= 5) return STAGES.NEUTRAL;
  if (cups <= 7) return STAGES.EXCITED;
  return STAGES.MEDAL;
};

const getRandomMessage = (stage, prevMessageId) => {
  const options = MESSAGES[stage];
  let newIdx;
  do {
    newIdx = Math.floor(Math.random() * options.length);
  } while (newIdx === prevMessageId && options.length > 1);
  return { text: options[newIdx], id: newIdx };
};

const getLocalDateString = () => new Date().toLocaleDateString();

const getHydrationTargetByNow = (now = new Date()) => {
  const dayStart = new Date(now);
  dayStart.setHours(HYDRATION_WINDOW_START_HOUR, 0, 0, 0);

  const dayEnd = new Date(now);
  dayEnd.setHours(HYDRATION_WINDOW_END_HOUR, 0, 0, 0);

  if (now <= dayStart) return 0;
  if (now >= dayEnd) return DAILY_GOAL_CUPS;

  const progress = (now.getTime() - dayStart.getTime()) / (dayEnd.getTime() - dayStart.getTime());
  return Math.min(DAILY_GOAL_CUPS, Math.max(0, Math.floor(progress * DAILY_GOAL_CUPS)));
};

const readWaterReminderFlagFromSettings = () => {
  try {
    const notifications = JSON.parse(localStorage.getItem(SETTINGS_NOTIFICATIONS_KEY) || "{}");
    if (typeof notifications.waterReminders === "boolean") {
      return notifications.waterReminders;
    }
  } catch (_error) {
    // Fallback below
  }

  try {
    const cachedNotifications = JSON.parse(localStorage.getItem(SETTINGS_NOTIFICATION_CACHE_KEY) || "{}");
    if (typeof cachedNotifications.waterReminders === "boolean") {
      return cachedNotifications.waterReminders;
    }
  } catch (_error) {
    // Fallback below
  }

  return true;
};

const writeWaterReminderFlagToSettings = (enabled) => {
  const safeBoolean = Boolean(enabled);

  try {
    const notifications = JSON.parse(localStorage.getItem(SETTINGS_NOTIFICATIONS_KEY) || "{}");
    localStorage.setItem(
      SETTINGS_NOTIFICATIONS_KEY,
      JSON.stringify({
        ...notifications,
        waterReminders: safeBoolean,
      })
    );
  } catch (_error) {
    localStorage.setItem(
      SETTINGS_NOTIFICATIONS_KEY,
      JSON.stringify({ waterReminders: safeBoolean })
    );
  }

  try {
    const cachedNotifications = JSON.parse(
      localStorage.getItem(SETTINGS_NOTIFICATION_CACHE_KEY) || "{}"
    );
    localStorage.setItem(
      SETTINGS_NOTIFICATION_CACHE_KEY,
      JSON.stringify({
        ...cachedNotifications,
        waterReminders: safeBoolean,
      })
    );
  } catch (_error) {
    localStorage.setItem(
      SETTINGS_NOTIFICATION_CACHE_KEY,
      JSON.stringify({ waterReminders: safeBoolean })
    );
  }
};

const CONFETTI_COLORS = [
  "#f43f5e",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#06b6d4",
  "#f97316",
  "#eab308",
];

const CONFETTI_PIECES = Array.from({ length: 28 }, (_, index) => {
  const angle = (index / 28) * Math.PI * 2;
  const radius = 74 + (index % 5) * 10;

  return {
    x: `${Math.round(Math.cos(angle) * radius)}px`,
    y: `${Math.round(Math.sin(angle) * radius)}px`,
    rotate: `${(index * 29) % 360}deg`,
    spin: `${index % 2 === 0 ? 240 + (index % 4) * 40 : -(240 + (index % 4) * 40)}deg`,
    delay: `${(index % 6) * 0.03}s`,
    duration: `${1.25 + (index % 5) * 0.14}s`,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
  };
});

const WaterTracker = () => {
  const { currentUser } = useContext(UserContext);
  const [glasses, setGlasses] = useState(0);
  const [stage, setStage] = useState(STAGES.SAD);
  const [message, setMessage] = useState(() => getRandomMessage(STAGES.SAD, null));
  const [remindersEnabled, setRemindersEnabled] = useState(() => readWaterReminderFlagFromSettings());
  const reminderTimerRef = useRef(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTimeoutRef = useRef(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const today = getLocalDateString();
    const storedDataStr = localStorage.getItem("water_tracker_data");
    if (storedDataStr) {
      try {
        const storedData = JSON.parse(storedDataStr);
        const userId = currentUser ? currentUser.id : "guest";
        if (storedData.date === today && storedData.userId === userId) {
          setGlasses(storedData.glasses || 0);
        } else {
          localStorage.setItem("water_tracker_data", JSON.stringify({
            date: today,
            userId,
            glasses: 0
          }));
          setGlasses(0);
        }
      } catch (e) {
        console.error("Failed to parse water tracker data", e);
      }
    } else {
      const userId = currentUser ? currentUser.id : "guest";
      localStorage.setItem("water_tracker_data", JSON.stringify({
        date: today,
        userId,
        glasses: 0
      }));
    }
  }, [currentUser]);

  // Sync reminder flag from Settings storage
  useEffect(() => {
    const syncReminderFlag = () => {
      setRemindersEnabled(readWaterReminderFlagFromSettings());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncReminderFlag();
      }
    };

    syncReminderFlag();
    window.addEventListener("storage", syncReminderFlag);
    window.addEventListener("focus", syncReminderFlag);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", syncReminderFlag);
      window.removeEventListener("focus", syncReminderFlag);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Persist and Sync to Backend
  const updateIntake = useCallback(async (newGlasses) => {
    setGlasses(newGlasses);
    
    const today = getLocalDateString();
    const userId = currentUser ? currentUser.id : "guest";
    localStorage.setItem("water_tracker_data", JSON.stringify({
      date: today,
      userId,
      glasses: newGlasses
    }));

    if (currentUser && currentUser.id) {
       try {
         const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}/api/water-intake`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             user_id: currentUser.id,
             glasses_consumed: newGlasses
           })
         });
         const data = await response.json();
         if (!response.ok) {
           throw new Error(data.error || 'Failed to sync water intake');
         }
       } catch (error) {
         console.warn('Silent fallback: Error saving water intake to backend:', error);
       }
    }
  }, [currentUser]);

  // Update Stage and Message
  useEffect(() => {
    const newStage = getStage(glasses);
    if (newStage !== stage) {
      setStage(newStage);
      setMessage(getRandomMessage(newStage, message.id));
      
      if (newStage === STAGES.MEDAL) {
        setShowConfetti(true);
        if (confettiTimeoutRef.current) {
          clearTimeout(confettiTimeoutRef.current);
        }
        confettiTimeoutRef.current = setTimeout(() => {
          setShowConfetti(false);
        }, 2200);
        window.dispatchEvent(new CustomEvent('waterGoalReached', { detail: { glasses } }));
        console.log('Event: waterGoalReached');
      } else {
        setShowConfetti(false);
      }
    }
  }, [glasses, stage, message.id]);

  useEffect(() => {
    return () => {
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
    };
  }, []);

  const increment = () => {
    if (glasses < DAILY_GOAL_CUPS) updateIntake(glasses + 1);
  };

  const decrement = () => {
    if (glasses > 0) updateIntake(glasses - 1);
  };

  // Reminder logic based on "behind schedule" and Settings > notifications.waterReminders
  useEffect(() => {
    const maybeNotifyBehindSchedule = () => {
      if (!remindersEnabled || glasses >= DAILY_GOAL_CUPS) return;

      const now = new Date();
      const expectedByNow = getHydrationTargetByNow(now);
      const behindBy = expectedByNow - glasses;

      if (behindBy <= 0) return;
      if (!("Notification" in window) || Notification.permission !== "granted") return;

      const userId = currentUser?.id || "guest";
      const today = getLocalDateString();
      const reminderKey = `water_tracker_last_reminder:${userId}:${today}`;

      const lastReminderAt = Number.parseInt(localStorage.getItem(reminderKey) || "0", 10);
      if (Date.now() - (Number.isNaN(lastReminderAt) ? 0 : lastReminderAt) < REMINDER_COOLDOWN_MS) {
        return;
      }

      const remaining = Math.max(0, DAILY_GOAL_CUPS - glasses);
      new Notification("Hydration check-in 💧", {
        body: `You're ${behindBy} cup${behindBy === 1 ? "" : "s"} behind. ${remaining} cup${remaining === 1 ? "" : "s"} left to hit today's goal.`,
      });
      localStorage.setItem(reminderKey, String(Date.now()));
    };

    if (!remindersEnabled) {
      if (reminderTimerRef.current) {
        clearInterval(reminderTimerRef.current);
        reminderTimerRef.current = null;
      }
      return () => {};
    }

    maybeNotifyBehindSchedule();
    reminderTimerRef.current = setInterval(maybeNotifyBehindSchedule, REMINDER_CHECK_INTERVAL_MS);

    return () => {
      if (reminderTimerRef.current) {
        clearInterval(reminderTimerRef.current);
        reminderTimerRef.current = null;
      }
    };
  }, [glasses, remindersEnabled, currentUser]);

  const handleManualMessageUpdate = () => {
     setMessage(getRandomMessage(stage, message.id));
  };

  const handleInlineReminderToggle = async () => {
    const nextEnabled = !remindersEnabled;

    if (nextEnabled && "Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (_error) {
        // Continue to save preference even if permission API throws.
      }
    }

    writeWaterReminderFlagToSettings(nextEnabled);
    setRemindersEnabled(nextEnabled);
  };

  const hydrationPercent = Math.max(
    0,
    Math.min(100, Math.round((glasses / DAILY_GOAL_CUPS) * 100))
  );
  const waterTranslateY = 100 - hydrationPercent;
  const isGoalComplete = hydrationPercent === 100;

  return (
    <div className="water-tracker" aria-labelledby="tracker-heading">
      <div className="hydration-coach-toggle" role="group" aria-label="Hydration reminder quick toggle">
        <div className="coach-title">Hydration Coach 💧</div>
        <label className="coach-switch">
          <input
            type="checkbox"
            checked={remindersEnabled}
            onChange={handleInlineReminderToggle}
            aria-label="Enable hydration reminders"
          />
          <span className="coach-slider" />
        </label>
      </div>

      <h3 id="tracker-heading" style={{ margin: "1.0em" }}>Daily Water Intake</h3>
      
      <div className={`emotion-display stage-${stage}`} aria-label={`Current hydration stage: ${stage}`}>
        <div className="hydration-orb-wrap">
          {isGoalComplete && (
            <>
              <span className="orb-sparkle orb-sparkle-top-left" aria-hidden="true">✨</span>
              <span className="orb-sparkle orb-sparkle-bottom-right" aria-hidden="true">✨</span>
            </>
          )}

          {showConfetti && (
            <div className="confetti-burst" data-testid="goal-confetti" aria-hidden="true">
              {CONFETTI_PIECES.map((piece, index) => (
                <span
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className="confetti-piece"
                  style={{
                    "--tx": piece.x,
                    "--ty": piece.y,
                    "--rot": piece.rotate,
                    "--spin": piece.spin,
                    "--delay": piece.delay,
                    "--duration": piece.duration,
                    "--confetti-color": piece.color,
                  }}
                />
              ))}
            </div>
          )}

          <div
            className={`hydration-orb ${stage === STAGES.MEDAL ? "medal-animation" : ""}`}
            role="img"
            aria-label={`Hydration level ${hydrationPercent}%`}
          >
            <div
              className="hydration-orb-water"
              style={{ transform: `translateY(${waterTranslateY}%)` }}
            >
              <div className="orb-wave orb-wave-back" />
              <div className="orb-wave orb-wave-front" />
            </div>
            <div className="hydration-orb-shine" />
            <div className="hydration-orb-text" aria-hidden="true">
              {hydrationPercent}%
            </div>
          </div>
        </div>
        <p className="microcopy" onClick={handleManualMessageUpdate} aria-live="polite">
          {message.text}
        </p>
      </div>

      <div className="tracker-controls">
        <button onClick={decrement} aria-label="Decrease water glasses">−</button>
        <span data-testid="tracker-count" aria-live="polite" aria-atomic="true">{glasses} / {DAILY_GOAL_CUPS}</span>
        <button onClick={increment} aria-label="Increase water glasses" disabled={glasses >= DAILY_GOAL_CUPS}>+</button>
      </div>

      <div className="glass-display">
        {[...Array(DAILY_GOAL_CUPS)].map((_, index) => (
          <div
            key={index}
            className={`glass ${index < glasses ? "filled" : ""}`}
          ></div>
        ))}
      </div>

      <div className="reminder-status" style={{ marginTop: "1.5em" }} aria-live="polite">
        <p>
          Reminder status: <strong>{remindersEnabled ? "On" : "Off"}</strong>
        </p>
        <small>
          {remindersEnabled
            ? "Nudges are sent only when your intake is behind schedule."
            : "Enable water reminders in Settings to receive hydration nudges."}
        </small>
      </div>
    </div>
  );
};

export default WaterTracker;
