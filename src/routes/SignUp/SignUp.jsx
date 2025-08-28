/*import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  sendEmailVerification,
} from "firebase/auth";*/
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../App.css";
import Input from "../../components/general_components/Input/Input";
/*import {
  auth,
  createAuthUserWithEmailandPassword,
  createUserDocFromAuth,
} from "../../utils/firebase";*/
import { useDarkMode } from "../DarkModeToggle/DarkModeContext";
import NutrihelpLogo from "./Nutrihelp_Logo.PNG";
import "./SignUp.css";
import FramerClient from "../../components/framer-client";
import { UserIcon } from "lucide-react";

const API_BASE = "http://localhost";

const SignUp = (props) => {
  // Initialise state for user contact info and phone number
  const [contact, setContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const { darkMode } = useDarkMode();
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
  /*const handleSubmit = async (event) => {
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
  };*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const { firstName, lastName, email, password, confirmPassword } = contact;
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    const payload = {
      name: `${firstName} ${lastName}`.trim(),
      email: email.trim().toLowerCase(),
      password,
      contact_number: "0412345678",
      address: "Placeholder address 123",
    };

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        //credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = `Sign up failed (HTTP ${res.status})`;
        try {
          const data = JSON.parse(text);
          msg =
            data.error ||
            data.message ||
            (Array.isArray(data.errors)
              ? data.errors.map((e) => e.msg).join(", ")
              : msg);
        } catch {}
        throw new Error(msg);
      }

      if (res.status === 201) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Sign up failed (HTTP ${res.status})`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
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
    <FramerClient>
      <div className={`h-screen w-screen ${darkMode && "bg-[#555555]"}`}>
        <div className="h-auto w-[70%] flex flex-col md:flex-row justify-center items-center mt-24 ml-auto mr-auto shadow-2xl border-none rounded-2xl overflow-hidden p-[20px] pb-14">
          <div className="w-[100%]">
            <img
              src={NutrihelpLogo}
              alt="Nutrihelp Logo"
              className="rounded-xl w-[500px] mx-auto"
            />

            {/* NEW: wrap inputs in a form to use onSubmit */}
            <form onSubmit={handleSubmit}>
              <div className="user">
                <div className="first">
                  <Input
                    label="First Name*"
                    name="firstName"
                    type="text"
                    placeholder="First Name"
                    onChange={handleChange}
                    value={contact.firstName}
                    darkMode={darkMode}
                    required
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
                    darkMode={darkMode}
                    required
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
                    darkMode={darkMode}
                    required
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
                    darkMode={darkMode}
                    required
                  />
                </div>
              </div>

              <Input
                label="Confirm Password*"
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                onChange={handleChange}
                value={contact.confirmPassword}
                darkMode={darkMode}
                required
              />

              {errorMsg && (
                <p className="mt-2 text-red-600 font-medium">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-md mt-4 text-2xl font-bold flex justify-center gap-3 items-center ${
                  darkMode
                    ? "bg-purple-700 hover:bg-purple-500"
                    : "bg-purple-400 text-gray-800 hover:bg-purple-700 hover:text-white"
                }`}
              >
                <UserIcon size={24} />
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>

            <p className="text-2xl font-semibold text-center mt-4 mb-4">Or</p>
            <button
              className={`w-full rounded-md mb-6 text-2xl font-bold flex justify-center gap-3 items-center ${
                darkMode
                  ? "bg-green-700 hover:bg-green-500"
                  : "bg-green-500 text-gray-800 hover:bg-green-700 hover:text-white"
              }`}
            >
              <img
                src="https://static.vecteezy.com/system/resources/previews/022/613/027/non_2x/google-icon-logo-symbol-free-png.png"
                className="w-[25px]"
                alt="Google"
              />
              Sign In With Google
            </button>

            <div className="text-sm text-center text-gray-500">
              Already have an account?
              <span>
                <Link
                  to="/login"
                  className={`ml-3 ${
                    darkMode ? "text-purple-300" : "text-purple-800"
                  }`}
                >
                  Login
                </Link>
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center m-auto">
            <img
              src="https://cdni.iconscout.com/illustration/premium/thumb/woman-watching-food-menu-while-checkout-order-using-application-illustration-download-in-svg-png-gif-file-formats--online-service-mobile-app-pack-e-commerce-shopping-illustrations-10107922.png"
              alt="Nutrihelp Logo 2"
              className=""
            />
          </div>
        </div>
      </div>
    </FramerClient>
  );
};

export default SignUp;
