import React, { useState, useContext } from "react";
import { UserContext } from "../../context/user.context";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/general_components/Input/Input";
import { Button, Icon } from 'semantic-ui-react';
import '../../App.css'
import './SignUp.css';

function LoginPopUp(props) {
    const navigate = useNavigate(); // Define navigation
    const { setCurrentUser } = useContext(UserContext); // Extract context methods

    // State management for user credentials
    const [contact, setContact] = useState({ username: '', password: '' });

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
                console.log(data.user)
                setCurrentUser(data.user);
                // Navigate to the desired page upon successful login
                navigate("/MFAform");
                alert("Successfully signed in. Welcome back, " + username + "!");
            } else {
                // Handle unsuccessful login
                alert("Failed to sign in. Please check your credentials and try again.");
            }
        } catch (error) {
            // Handle errors
            console.error('Error signing in:', error.message);
            alert("Failed to sign in. An error occurred.");
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

    return (props.trigger) ? (
        <div className="createpopup">
            <div className="createpopup-inner">
                <button className="close-btn" onClick={() => props.setTrigger(false)}>❌</button>
                <div className="login-style">
                    <h3 style={{ paddingTop: '20px' }}>Login</h3>
                    <br></br>
                    <Input
                        label="Username"
                        name="username"
                        type='text'
                        placeholder="Username"
                        onChange={handleChange}
                        value={username}
                    />
                    <br></br>
                    <Input
                        label="Password"
                        name='password'
                        type="password"
                        placeholder="Password"
                        onChange={handleChange}
                        value={password}
                    />
                    <br></br>
                    <Button style={{ width: '300px' }} positive onClick={handleSignIn}>Sign In</Button>
                    <br></br>
                    <Button style={{ width: '300px' }} onClick={logGoogleUser} color='blue'>
                        <Icon name='google' />
                        Sign In With Google
                    </Button>
                    <br></br>
                    <p className="forgot-password" onClick={handleForgotPasswordClick}>Forgot Password?</p>
                    <br></br>
                </div>
                { props.children }
            </div>
        </div>
    ) : "";
}

export default LoginPopUp;
