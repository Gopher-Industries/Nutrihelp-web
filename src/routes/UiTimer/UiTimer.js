import { useState, useEffect, useRef } from "react";
import "./UiTimer.css";

function UiTimer() {
  const [seconds, setSeconds] = useState(0);
  const [branch, setBranch] = useState(0);
  const [hour, setHour] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [animate, setAnimate] = useState({ hour: false, branch: false, second: false });

  const inputChange = (event, setter) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setter(value);
    } else {
      alert("The set time is incorrect");
    }
  };

  const inputBlur = (event, setterType) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      let newBranch = branch;
      let newHour = hour;

      if (setterType === 1) { // branch
        if (value >= 60) {
          newBranch = value % 60;
          const addedHours = Math.floor(value / 60);
          newHour += addedHours;
        } else {
          newBranch = value;
        }
        setBranch(newBranch);
        setHour(newHour);
      } else if (setterType === 2) { // seconds
        if (value >= 60) {
          const newSeconds = value % 60;
          const addedMinutes = Math.floor(value / 60);
          newBranch += addedMinutes;

          if (newBranch >= 60) {
            const extraHours = Math.floor(newBranch / 60);
            newBranch %= 60;
            newHour += extraHours;
          }
          setBranch(newBranch);
          setHour(newHour);
          setSeconds(newSeconds);
        } else {
          setSeconds(value);
        }
      }
    }
  };

  const branchRef = useRef(branch);
  const hourRef = useRef(hour);

  useEffect(() => {
    branchRef.current = branch;
    hourRef.current = hour;
  }, [branch, hour]);

  useEffect(() => {
    if (isRunning) {
      const intervalId = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            if (branchRef.current === 0) {
              if (hourRef.current === 0) {
                alert("Time is over");
                setIsRunning(false);
                setSeconds(0);
              } else {
                setAnimate((prev) => ({ ...prev, hour: true, branch: true, second: true }));
                setHour(hourRef.current - 1);
                setBranch(59);
              }
            } else {
              setAnimate((prev) => ({ ...prev, branch: true, second: true }));
              setBranch(branchRef.current - 1);
            }
            return 59;
          }
          setAnimate((prev) => ({ ...prev, second: true }));
          return prevSeconds - 1;
        });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [isRunning]);

  useEffect(() => {
    const timeoutId = setTimeout(() => setAnimate({ hour: false, branch: false, second: false }), 500);
    return () => clearTimeout(timeoutId);
  }, [animate]);

  return (
    <>
      <div id="UiTimer">
        <div className="UiTimer">
          {!isRunning ? (
            <>
              <div className="runningFalse">
                <div className="runningDiv">
                  <input
                    type="number"
                    value={hour}
                    min="0"
                    onChange={(e) => inputChange(e, setHour)}
                  />
                  hour
                </div>
                <div className="runningDiv">
                  <input
                    type="number"
                    value={branch}
                    min="0"
                    onChange={(e) => inputChange(e, setBranch)}
                    onBlur={(e) => inputBlur(e, 1)}
                  />
                  branch
                </div>
                <div className="runningDiv">
                  <input
                    type="number"
                    value={seconds}
                    min="0"
                    onChange={(e) => inputChange(e, setSeconds)}
                    onBlur={(e) => inputBlur(e, 2)}
                  />
                  seconds
                </div>
              </div>
              <button onClick={() => setIsRunning(!isRunning)}>Start timing</button>
            </>
          ) : (
            <>
              <div className="runningTrue">
                <div className={`runningDiv ${animate.hour ? "animate" : ""}`}>{hour}</div>
                <div className={`runningDiv ${animate.branch ? "animate" : ""}`}>{branch}</div>
                <div className={`runningDiv ${animate.second ? "animate" : ""}`}>{seconds}</div>
              </div>
              <button onClick={() => setIsRunning(!isRunning)}>set time</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default UiTimer;
