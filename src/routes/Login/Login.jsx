import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/user.context";

import Nutrihelp_Logo from "../Login/Nutrihelp_Logo.PNG"
import Nutrihelp_Logo2 from "../Login/Nutrihelp_Logo2.PNG";

import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { setCurrentUser } = useContext(UserContext);

    const [contact, setContact] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        setContact(prevValue => ({ ...prevValue, [name]: value }));
    };

    const { email, password } = contact;

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:80/api/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentUser(data.user);
                navigate("/MFAform", { state: { email, password } });
                alert("Successfully signed in. Please complete MFA to continue.");
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to sign in. Please check your credentials and try again.');
            }
        } catch (error) {
            console.error('Error signing in:', error.message);
            setError("Failed to sign in. An error occurred.");
        }
    };

    // const logGoogleUser = async () => {
    //     // Handle Google sign-in here
    // };

    const handleForgotPasswordClick = () => {
        navigate("/forgotPassword");
    };


    

    return (
            <>
              <div className="login-container">
                <img src={Nutrihelp_Logo} alt="Nutrihelp Logo" className="nutrihelp-logo" />
                <h2 className="login-title">LOG IN</h2>
                <p className="login-subtitle">Enter your email and password to sign in!</p>
                {error && <p className="error-message">{error}</p>}
                <label htmlFor="email" className="input-label">Email*</label>
                <input
                  name="email"
                  type='text'
                  placeholder="email"
                  onChange={handleChange}
                  value={email}
                />
                <label htmlFor="password" className="input-label">Password*</label>
                <div className="password-field">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="input-field"
                    placeholder="Min. 8 characters"
                    onChange={handleChange}
                    value={password}
                  />
                  <span className="eye-icon">👁️</span>
                </div>
                <div className="options">
                  <div className="keep-logged-in">
                    <input type="checkbox" id="keepLoggedIn" />
                    <label htmlFor="keepLoggedIn">Keep me logged in</label>
                  </div>
                  <p className="forgot-password" onClick={handleForgotPasswordClick}>Forgot password?</p>
                </div>
                <button className="signin-btn" onClick={handleSignIn}>Sign In</button>
                <p className="signup-link">Not registered yet? <Link to='/signUp'>Create an Account</Link></p>
              </div>
              <img src={Nutrihelp_Logo2} alt="Nutrihelp Logo 2" className="nutrihelp-logo2" />
            </>
          );
          
};

export default Login;
