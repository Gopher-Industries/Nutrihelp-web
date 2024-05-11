import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../../context/user.context";
import './CreateAccountPopUp.css'
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/general_components/Input/Input";
import { Button, Icon } from 'semantic-ui-react';
import { auth, createAuthUserWithEmailandPassword, createUserDocFromAuth, signInWithGooglePopup } from "../../utils/firebase";
import {
    multiFactor,
    PhoneAuthProvider,
    PhoneMultiFactorGenerator,
    RecaptchaVerifier,
    sendEmailVerification
} from "firebase/auth";
import '../../App.css'
import './SignUp.css'

function CreateAccountPopUp(props) {

    const navigate = useNavigate(); // Define navigation
    const { setCurrentUser } = useContext(UserContext); // Extract context methods

  const [contact, setContact] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [phoneNumber, setPhoneNumber] = useState("");
    const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

    // Set up reCAPTCHA on component mount
    useEffect(() => {
        try {
            const verifier = new RecaptchaVerifier('sign-up-button', {
                'size': 'invisible',
            }, auth);
            setRecaptchaVerifier(verifier);
        } catch (error) {
            // Log error if reCAPTCHA initialisation fails
            console.error('Error initializing reCAPTCHA:', error);
        }
    }, []);

    // Function to handle submission of the sign-up form
    // const handleSubmit = async (event) => {
    //     event.preventDefault();
    //     const { email, password, firstName, lastName, confirmPassword } = contact;

    //     // Check password confirmation
    //     if (password !== confirmPassword) {
    //         alert('Passwords do not match!');
    //         return;
    //     }

    //     try {
    //         // Create user, send email verification, create user doc, and set up MFA
    //         const { user } = await createAuthUserWithEmailandPassword(email, password);
    //         await sendEmailVerification(user);
    //         const displayName = `${firstName} ${lastName}`;
    //         await createUserDocFromAuth(user, { displayName, firstName, lastName, password });
    //         await setupMultiFactorAuthentication(user);

    //         // Redirect to login if user object exists
    //         if (user) {
    //             window.location.href = '/login';
    //         }
    //     } catch (error) {
    //         // Log error if user creation or MFA setup fails
    //         console.log('Error in user creation or MFA setup:', error.message);
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        // Define the form data including all user inputs
        const formData = {
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            username: contact.email,
            password: contact.password,
            confirmPassword: contact.confirmPassword
        };
    
        try {
            // Make the fetch request
            const response = await fetch('http://localhost:80/api/signup', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Origin': 'http://localhost:3000/',
                    'Content-Type': 'application/json'
                },
            });
    
            // Check the response status
            if (response.ok) {
                alert('Account created successfully');
                // Redirect or perform any other action upon successful sign-up
            } else {
                console.error('Failed to create account');
                // Handle error
            }
        } catch (error) {
            console.error('Error creating account:', error.message);
            // Handle error
        }
    };
    

    // Function to handle form field changes and update state
    const handleChange = (event) => {
        const { name, value } = event.target;
        setContact((preValue) => ({
            ...preValue,
            [name]: value
        }));
    }

    // Function to set up multi-factor authentication
    const setupMultiFactorAuthentication = async (user) => {
        try {
            const { firstName, lastName } = contact;

            // Set up phone number verification for MFA
            const multiFactorSession = await multiFactor(user).getSession();
            const phoneInfoOptions = {
                phoneNumber: phoneNumber,
                session: multiFactorSession
            };
            const phoneAuthProvider = new PhoneAuthProvider(auth);
            const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
            const verificationCode = prompt("Enter the verification code you received:");
            const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
            const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

            // Enroll user in MFA
            const mfaDisplayName = `${firstName} ${lastName}`;
            await multiFactor(user).enroll(multiFactorAssertion, mfaDisplayName);
        } catch (error) {
            // Log error if MFA setup fails
            console.error("MFA setup failed:", error);
        }
    }

    // Log in as Google user
    const logGoogleUser = async () => {
        // Similar to your previous implementation
        try {
            // Sign in with Google and navigate upon success
            const { user } = await signInWithGooglePopup();
            const userDocRef = await createUserDocFromAuth(user);
            setCurrentUser(user);
            if (userDocRef) alert("Successfully signed in with Google account. \nDisplay name: " + user.displayName);
            if (userDocRef) navigate('/');
        } catch (error) {
            console.error('Error signing in with Google', error.message);
        }
    };

  return (props.trigger) ? (
    <div className="createpopup">
      <div className="createpopup-inner">
        <button className="close-btn" onClick={() => props.setTrigger(false)}
        >❌</button>
        <div className="signup-style">

          <div id="sign-up-button"></div>

          <h3> Create Account </h3>

          <br></br>

          <Input
              label="First Name*"
              name="firstName"
              type='text'
              placeholder="First Name"
              onChange={handleChange}
              value={contact.firstName}
          />

          <br></br>

          <Input
              label="Last Name*"
              name="lastName"
              type='text'
              placeholder="Last Name"
              onChange={handleChange}
              value={contact.lastName}
          />

          <br></br>

          <Input
              label="Email*"
              name="email"
              type='email'
              placeholder="Email"
              onChange={handleChange}
              value={contact.email}
          />

          <br></br>

          <Input
              label="Password*"
              name='password'
              type="password"
              placeholder="Password"
              onChange={handleChange}
              value={contact.password}
          />

          <br></br>

          <Input
              label="Confirm Password*"
              name='confirmPassword'
              type="password"
              placeholder="Confirm Password"
              onChange={handleChange}
              value={contact.confirmPasswordpassword}
          />

          <br></br>

          <Button positive onClick={handleSubmit} style={{ width: '300px' }}>
              Sign Up
          </Button>

          <br></br>

            <Button style={{ width: '300px' }}
                onClick={logGoogleUser}
                color='blue'>
                <Icon
                    name='google'
                />
                Sign In With Google
            </Button>

          <br></br>
{/* 
          <Button onClick={() => props.setTrigger(false)} style={{ width: '150px' }}>
              Login instead
          </Button> */}

          </div>
                  { props.children }
                </div>
              </div>
              
            ) : "";
          }

export default CreateAccountPopUp


