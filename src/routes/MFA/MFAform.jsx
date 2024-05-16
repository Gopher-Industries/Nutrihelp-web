import React, { useState, useContext  } from 'react';
import './MFAform.css'; // Import the CSS file
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/user.context";


const MFAform = () => {
  const [code, setCode] = useState(['', '', '', '','','']);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Define navigation
  const { setCurrentUser } = useContext(UserContext); // Extract context methods

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
  

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const fullCode = code.join('');
  //   try {
  //     const response = await fetch('/api/verify-code', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ code: fullCode }),
  //     });
  //     const data = await response.json();

  //     if (response.ok) {
  //       const { user, token } = await response.json();
  //       setCurrentUser(user);
  //       console.log(user);
  //       //setCurrentUser();
  //       //alert("hello")
  //       navigate("/");
  //     } else {
  //       setError(data.message);
  //     }
  //   } catch (error) {
  //     setError('An error occurred. Please try again later.');
  //   }
  // };

  const handleMfaVerification = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    const username = "keeratkaur2210@gmail.com"; // Replace with the username sent from Postman
    const password = "khushi"; // Replace with the password sent from Postman
    const mfa_token = fullCode; // Use the entered MFA code as mfa_token

    try {
      const response = await fetch('http://localhost:80/api/login/mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, mfa_token }), // Send username, password, and MFA token
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.user)
        setCurrentUser(data.user);
        navigate("/"); // Redirect to main page upon successful verification
        alert("MFA verification successful!");
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to verify MFA token');
      }
    } catch (error) {
      console.error('Error verifying MFA token:', error.message);
      setError("Failed to verify MFA token. An error occurred.");
    }
  };


  return (
    <div className="mfa-container">
      <h2 class="mfa">Multi-Factor Authentication</h2>
      <p >Please enter the code below which is sent to your email</p>
      {error && <div>{error}</div>}
      <form onSubmit={handleMfaVerification}>
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
        <button className="mfa-submit-button" type="submit" >Submit</button>
      </form>
    </div>
  );
};

export default MFAform;
