import React, { useState } from 'react';
import './MFAform.css'; // Import the CSS file
import { Link, useNavigate } from "react-router-dom";

const MFAform = () => {
  const [code, setCode] = useState(['', '', '', '','','']);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Define navigation

  const handleChange = (index, value) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
  
    // Move focus to the next input field if available
    if (value && index < code.length - 1) {
      const nextInput = document.getElementById(`mfa-input-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };
  const handlesubmitbtn = () => {
    const fullCode = code.join('');
    if (fullCode.trim() == "000000") {
      alert("Successfully logged in")
        navigate('/');
    } else {
        setError('Invalid code');
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: fullCode }),
      });
      const data = await response.json();

      if (response.ok) {
        window.location.href = '/main-page';
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="mfa-container">
      <h2 class="mfa">Multi-Factor Authentication</h2>
      <p >Please enter the code below which is sent to your email</p>
      {error && <div>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mfa-input-container">
        {code.map((digit, index) => (
            <input
              key={index}
              id={`mfa-input-${index}`}
              className="mfa-input"
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
            />
          ))}
            
        </div>
        <button className="mfa-submit-button" type="submit" onClick={handlesubmitbtn}>Submit</button>
      </form>
    </div>
  );
};

export default MFAform;
