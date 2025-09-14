import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SMSVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const { phone } = location.state ?? {};


  const [step, setStep] = useState("request"); 
  const [code, setCode] = useState(Array(6).fill("")); 
  const [message, setMessage] = useState("");

  const handleRequestCode = async () => {
    try {
      setMessage("SMS code sent successfully.");
      setStep("verify");
    } catch (err) {
      setMessage("Failed to send SMS code.");
    }
  };

  const handleChange = (i, value) => {
    const v = value.replace(/\D/g, "").slice(0, 1);
    setCode(prev => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const token = code.join(""); 
    try {
    
      setMessage("SMS verification successful!");
      navigate("/"); 
    } catch (err) {
      setMessage("Invalid code.");
    }
  };

  return (
    <div className="mfa-auth-wrapper">
      <div className="mfa-card-container">
        <div className="mfa-auth-card">
          <h2 className="mfa-title">SMS Verification</h2>
          {phone && <p className="mfa-subtitle">Code sent to: {phone}</p>}
          {message && <div className="text-center mb-4">{message}</div>}

          {step === "request" && (
            <button
              className="mfa-submit-button"
              type="button"
              onClick={handleRequestCode}
            >
              Send SMS Code
            </button>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifyCode}>
              <div className="mfa-input-container">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    className="mfa-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                  />
                ))}
              </div>
              <button className="mfa-submit-button" type="submit">
                Verify SMS Code
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
