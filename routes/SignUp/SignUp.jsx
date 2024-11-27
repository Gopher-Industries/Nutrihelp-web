import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/general_components/Input/Input";
import { Button } from "semantic-ui-react";
import {
  auth,
  createAuthUserWithEmailandPassword,
  createUserDocFromAuth,
} from "../../utils/firebase";
import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  sendEmailVerification,
} from "firebase/auth";
import Nutrihelp_Logo2 from "../Login/Nutrihelp_Logo2.PNG";
import Nutrihelp_Logo from "../Login/Nutrihelp_Logo.PNG";
import "../../App.css";
import "./SignUp.css";

const SignUp = (props) => {
  // Initialise state for user contact info and phone number
  const [contact, setContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [phoneNumber, setPhoneNumber] = useState("");
  // const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

  // Set up reCAPTCHA on component mount
  // useEffect(() => {
  //     try {
  //         const verifier = new RecaptchaVerifier('sign-up-button', {
  //             'size': 'invisible',
  //         }, auth);
  //         setRecaptchaVerifier(verifier);
  //     } catch (error) {
  //         // Log error if reCAPTCHA initialisation fails
  //         console.error('Error initializing reCAPTCHA:', error);
  //     }
  // }, []);

  // Function to handle submission of the sign-up form
  const handleSubmit = async (event) => {
    event.preventDefault();
    const { email, password, firstName, lastName, confirmPassword } = contact;

    // Check password confirmation
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // Create user, send email verification, create user doc, and set up MFA
      const { user } = await createAuthUserWithEmailandPassword(
        email,
        password
      );
      await sendEmailVerification(user);
      const displayName = `${firstName} ${lastName}`;
      await createUserDocFromAuth(user, {
        displayName,
        firstName,
        lastName,
        password,
      });
      await setupMultiFactorAuthentication(user);

      // Redirect to login if user object exists
      if (user) {
        window.location.href = "/login";
      }
    } catch (error) {
      // Log error if user creation or MFA setup fails
      console.log("Error in user creation or MFA setup:", error.message);
    }
  };

  // Function to handle form field changes and update state
  const handleChange = (event) => {
    const { name, value } = event.target;
    setContact((preValue) => ({
      ...preValue,
      [name]: value,
    }));
  };

  // Function to set up multi-factor authentication
  const setupMultiFactorAuthentication = async (user) => {
    try {
      const { firstName, lastName } = contact;

      // Set up phone number verification for MFA
      const multiFactorSession = await multiFactor(user).getSession();
      const phoneInfoOptions = {
        phoneNumber: phoneNumber,
        session: multiFactorSession,
      };
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        recaptchaVerifier
      );
      const verificationCode = prompt(
        "Enter the verification code you received:"
      );
      const cred = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

      // Enroll user in MFA
      const mfaDisplayName = `${firstName} ${lastName}`;
      await multiFactor(user).enroll(multiFactorAssertion, mfaDisplayName);
    } catch (error) {
      // Log error if MFA setup fails
      console.error("MFA setup failed:", error);
    }
  };

  return (
    <div className="signup-style">
      <div className="sign-up-form">
        <img
          src={Nutrihelp_Logo}
          alt="Nutrihelp Logo"
          className="nutrihelp-logo"
        />
        <div id="sign-up-button"></div>

        <div className="user">
          <div className="first">
            <Input
              label="First Name*"
              name="firstName"
              type="text"
              placeholder="First Name"
              onChange={handleChange}
              value={contact.firstName}
            />
          </div>
          <div className="last">
            <Input
              label="Last Name*"
              name="lastName"
              type="text"
              placeholder="Last Name"
              onChange={handleChange}
              value={contact.lastName}
            />
          </div>
        </div>

        <div className="user">
          <div className="first">
            <Input
              label="Email*"
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              value={contact.email}
            />
          </div>
          <div className="last">
            <Input
              label="Password*"
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              value={contact.password}
            />
          </div>
        </div>

        <Input
          label="Confirm Password*"
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          onChange={handleChange}
          value={contact.confirmPasswordpassword}
        />

        <button onClick={handleSubmit} className="sign_up">
          Sign Up
        </button>
        <div className="link-div">
          Already have and account?
          <span>
            {" "}
            <Link to="/login">Login</Link>
          </span>
        </div>
      </div>
      <div className="banner-img">
        <img
          src={Nutrihelp_Logo2}
          alt="Nutrihelp Logo 2"
          className="nutrihelp-logo2"
        />
      </div>
    </div>
  );
};

export default SignUp;
