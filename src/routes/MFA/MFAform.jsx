import React, { useState, useContext, useEffect } from 'react';
import './MFAform.css';
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../../context/user.context";

const MFAform = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']); // 6-digit email MFA code
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);              // email resend cooldown
  const [showSMSOption, setShowSMSOption] = useState(false);  // show SMS option after 10s
  const [smsCountdown, setSmsCountdown] = useState(0);        // SMS send cooldown

  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);
  const location = useLocation();
  const { email, password } = location.state || {};

  // Show the SMS option after 10 seconds (keep original behavior)
  useEffect(() => {
    setShowSMSOption(false);
    const t = setTimeout(() => setShowSMSOption(true), 10000);
    return () => clearTimeout(t);
  }, []);

  // Handle digit change for the email MFA inputs (auto-advance)
  const handleChange = (index, value) => {
    const sanitized = value.replace(/\D/, '');
    const newCode = [...code];
    newCode[index] = sanitized;
    setCode(newCode);
    if (sanitized && index < code.length - 1) {
      document.getElementById(`mfa-input-${index + 1}`)?.focus();
    }
  };

  // Verify email MFA token (original feature)
  const handleMfaVerification = async (e) => {
    e.preventDefault();
    const mfa_token = code.join('');
    try {
      const response = await fetch('http://localhost:80/api/login/mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, mfa_token }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        navigate("/");
        alert("MFA verification successful!");
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.error || 'Failed to verify MFA token.');
      }
    } catch (err) {
      console.error('Error verifying MFA token:', err);
      setError("Failed to verify MFA token. An error occurred.");
    }
  };

  // Resend email code (mock + cooldown; original behavior)
  const handleResendCode = async () => {
    if (countdown > 0) return;
    alert("Code resent to your email.");
    setCountdown(10);
    setShowSMSOption(false);
    setTimeout(() => setShowSMSOption(true), 10000);
  };

  // Email resend countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // NEW: Send SMS code then redirect to the SMSVerification page
  const handleSendSMS = async () => {
    if (smsCountdown > 0) return;

    if (!email) {
      alert("Missing email. Please go back and log in again.");
      return;
    }

    try {
      const response = await fetch("http://localhost/api/sms/send-sms-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Be tolerant to non-JSON responses (e.g., HTML fallback)
      const ct = response.headers.get("content-type") || "";
      const raw = await response.text();
      const data = ct.includes("application/json") ? JSON.parse(raw) : { error: raw };

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send SMS code.");
      }

      alert("SMS code sent. Please check your phone (in dev, see backend console).");
      console.log("✅ SMS response:", data);

      setSmsCountdown(30); // start cooldown

      // Redirect to SMSVerification page and pass the email
      navigate("/sms-verification", { state: { email } });
    } catch (err) {
      console.error("❌ SMS error:", err);
      alert("Failed to send SMS: " + err.message);
    }
  };

  // SMS send cooldown
  useEffect(() => {
    if (smsCountdown <= 0) return;
    const t = setInterval(() => setSmsCountdown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [smsCountdown]);

  return (
    <div className="mfa-auth-wrapper">
      <div className="mfa-card-container">
        <div className="mfa-auth-card">
          <h2 className="mfa-title">Multi-Factor Authentication</h2>
          <p className="mfa-subtitle">Please enter the 6-digit code sent to your email</p>

          {error && <div>{error}</div>}

          <form onSubmit={handleMfaVerification} autoComplete="off">
            <div className="mfa-input-container">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`mfa-input-${index}`}
                  className="mfa-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                />
              ))}
            </div>

            <p className="resend-text">
              Didn’t get the code?{" "}
              <button
                type="button"
                onClick={handleResendCode}
                className="resend-link"
                disabled={countdown > 0}
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
              </button>
            </p>

            {showSMSOption && (
              <p className="sms-option">
                Still not verified? Try SMS verification instead.{" "}
                <button
                  type="button"
                  onClick={handleSendSMS}
                  disabled={smsCountdown > 0}
                  className="resend-link"
                >
                  {smsCountdown > 0
                    ? `Resend SMS in ${smsCountdown}s`
                    : "Send SMS Code"}
                </button>
              </p>
            )}

            <button className="mfa-submit-button" type="submit">
              Verify account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MFAform;
