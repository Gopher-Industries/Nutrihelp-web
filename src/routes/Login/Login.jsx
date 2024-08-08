import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/user.context";
import Input from "../../components/general_components/Input/Input";
import { Button, Icon } from 'semantic-ui-react';
import '../../App.css';
import './Login.css';

const Login = () => {
    const navigate = useNavigate(); // Define navigation
    const { setCurrentUser } = useContext(UserContext); // Extract context methods

    // State management for user credentials and error messages
    const [contact, setContact] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    // Define what happens when change is made into the username/password inputs
    const handleChange = (event) => {
        const { name, value } = event.target;
        // Handle form input changes
        setContact(prevValue => ({ ...prevValue, [name]: value }));
    };

    const { username, password } = contact;

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            // Make the fetch request to authenticate the user
            const response = await fetch('http://localhost:80/api/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            // Check the response status
            if (response.ok) {
                const data = await response.json();
                // Update context with authenticated user
                console.log(data);
                setCurrentUser(data.user);

                // Navigate to the MFA form, passing username and password in state
                navigate("/MFAform", { state: { username, password } });
                alert("Successfully signed in. Please complete MFA to continue.");
            } else {
                // Handle unsuccessful login
                const data = await response.json();
                setError(data.error || 'Failed to sign in. Please check your credentials and try again.');
            }
        } catch (error) {
            // Handle errors
            console.error('Error signing in:', error.message);
            setError("Failed to sign in. An error occurred.");
        }
    };

    // Function to handle Google sign-in
    const logGoogleUser = async () => {
        // Handle Google sign-in here
    };

    // Function to handle forgot password click
    const handleForgotPasswordClick = () => {
        navigate("/forgotPassword"); // Navigate to forgot password page
    };

    return (
        <div className="login-style">
            <h3 style={{ paddingTop: '20px' }}>Login</h3>
            {error && <p className="error-message">{error}</p>} {/* Display error messages */}
            <br />
            <Input
                label="Username"
                name="username"
                type='text'
                placeholder="Username"
                onChange={handleChange}
                value={username}
            />
            <br />
            <Input
                label="Password"
                name='password'
                type="password"
                placeholder="Password"
                onChange={handleChange}
                value={password}
            />
            <br />
            <Button style={{ width: '300px' }} positive onClick={handleSignIn}>Sign In</Button>
            <br />
            <Button style={{ width: '300px' }} onClick={logGoogleUser} color='blue'>
                <Icon name='google' />
                Sign In With Google
            </Button>
            <br />
            <p className="forgot-password" onClick={handleForgotPasswordClick}>Forgot Password?</p>
            <br />
            <Link className="link-div" to='/signUp'>Create Account</Link>
        </div>
    );
};

export default Login;
