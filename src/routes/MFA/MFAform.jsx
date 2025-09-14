import React, { useState, useContext, useEffect } from 'react';
import './MFAform.css';
import { useNavigate, useLocation, Link } from "react-router-dom";
import { UserContext } from "../../context/user.context";

const MFAform = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);


  const [showSMSOption, setShowSMSOption] = useState(false);

  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);
  const location = useLocation();
  const { email, password } = location.state || {};


  useEffect(() => {
    setShowSMSOption(false);
    const t = setTimeout(() => setShowSMSOption(true), 10000);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (index, value) => {
    const newCode = [...code];
    newCode[index] = value.replace(/\D/, '');
    setCode(newCode);
    if (value && index < code.length - 1) {
      document.getElementById(`mfa-input-${index + 1}`)?.focus();
    }
  };

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
        const data = await response.json();
        alert(data.error || 'Failed to verify MFA token');
      }
    } catch (err) {
      console.error('Error verifying MFA token:', err);
      setError("Failed to verify MFA token. An error occurred.");
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;  
    alert("Code resent to your email.");
    setCountdown(10);                 
    setShowSMSOption(false);         
    setTimeout(() => setShowSMSOption(true), 10000);
  
  };

 
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

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
              Didn’t get the code?{' '}
              <button
                type="button"
                onClick={handleResendCode}
                className="resend-link"
                disabled={countdown > 0}
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
              </button>
            </p>

            {showSMSOption && (
              <p className="sms-option">
                Still not verified? Try SMS verification instead.{' '}
                <Link to="/sms-verification">(here)</Link>
              </p>
            )}

            <button className="mfa-submit-button" type="submit">Verify account</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MFAform;
