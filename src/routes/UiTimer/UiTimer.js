import { useState, useEffect, useRef } from "react";
import "./UiTimer.css";

function UiTimer() {
  const [seconds, setSeconds] = useState(0);
  const [branch, setBranch] = useState(0);
  const [hour, setHour] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const inputChange = (event, setter) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setter(value);
    } else {
      alert("The set time is incorrect");
    }
  };

  const branchRef = useRef(branch);
  const hourRef = useRef(hour);

  useEffect(() => {
    branchRef.current = branch;
    hourRef.current = hour;
  }, [branch, hour]);

  useEffect(() => {
    let intervalId;
    if (isRunning && seconds >= 0) {
      intervalId = setInterval(() => {
        setSeconds((preSeconds) => {
          if (preSeconds === 0) {
            if (branchRef.current === 0) {
              if (hourRef.current === 0) {
                alert("Time is over");
                setIsRunning(false);
                setSeconds(0);
              } else {
                setBranch(59);
                setHour(hourRef.current - 1);
              }
            } else {
              setBranch(branchRef.current - 1);
            }
            return 59;
          }
          return preSeconds - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning]);

  return (
    <>
      <div id="UiTimer">
        <div className="UiTimer">
          {!isRunning ? (
            <>
              <input
                type="number"
                value={hour}
                min="0"
                onChange={(e) => inputChange(e, setHour)}
              />
              hour
              <input
                type="number"
                value={branch}
                min="0"
                onChange={(e) => inputChange(e, setBranch)}
              />
              branch
              <input
                type="number"
                value={seconds}
                min="0"
                onChange={(e) => inputChange(e, setSeconds)}
              />
              seconds
              <button onClick={() => setIsRunning(!isRunning)}>
                begin time
              </button>
            </>
          ) : (
            <>
              {hour} hour : {branch} branch : {seconds} seconds
              <button onClick={() => setIsRunning(!isRunning)}>set time</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default UiTimer;
