import React, { useState } from "react";
import "./SignUp.css";

const API_BASE = "http://localhost";
const FETCH_URL = `${API_BASE}/api/auth/register`;
const Banner = () => (
  <div className="banner-img">
    <img
      src="/images/signup-illustration.svg"
      alt="NutriHelp"
      className="nutrihelp-logo2"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  </div>
);

const SignUp = () => {

  const [contact, setContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [pwdScore, setPwdScore] = useState(0); 
  const [rules, setRules] = useState({
    length: false, 
    lower: false,  
    upper: false,  
    digit: false,  
    special: false,
    match: false,  
  });


  const handleChange = (event) => {
    const { name, value } = event.target;

    setContact((prev) => {
      const next = { ...prev, [name]: value };

      const pw = next.password || "";
      const cpw = next.confirmPassword || "";

      const newRules = {
        length: pw.length >= 8,
        lower: /[a-z]/.test(pw),
        upper: /[A-Z]/.test(pw),
        digit: /\d/.test(pw),
        special: /[^A-Za-z0-9]/.test(pw),
        match: cpw ? pw === cpw : false,
      };
      setRules(newRules);

      const satisfied = ["length", "lower", "upper", "digit", "special"]
        .reduce((acc, k) => acc + (newRules[k] ? 1 : 0), 0);
      const score =
        satisfied <= 1 ? 0 :
        satisfied === 2 ? 1 :
        satisfied === 3 ? 2 :
        satisfied === 4 ? 3 : 4;
      setPwdScore(score);

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const { firstName, lastName, email, password, confirmPassword } = contact;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    const allOk =
      rules.length && rules.lower && rules.upper && rules.digit && rules.special && rules.match;
    const minScore = 3; 
    if (!allOk || pwdScore < minScore) {
      setErrorMsg("Please choose a stronger password that meets all requirements.");
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
      const res = await fetch(FETCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {

        window.location.href = "/login";
        return;
      }

      const text = await res.text();
      try {
        const data = JSON.parse(text);
        const msg =
          data.error ||
          data.message ||
          (Array.isArray(data.errors) ? data.errors.map((e) => e.msg).join(", ") : "");
        throw new Error(msg || `Sign up failed (HTTP ${res.status})`);
      } catch {
        throw new Error(text || `Sign up failed (HTTP ${res.status})`);
      }
    } catch (err) {
      setErrorMsg(err.message || "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  const { firstName, lastName, email, password, confirmPassword } = contact;

  return (
    <div className="signup-style signup-auth-wrapper">
      <div className="sign-up-form signup-card-container">
        <div className="signup-auth-card">
          <h2 className="signup-title">Create your account</h2>
          <p className="signup-subtitle">Sign up to get started</p>

          {errorMsg && <div className="signup-error">{errorMsg}</div>}

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="signup-row user">
              <div className="signup-field form-group">
                <label className="signup-label">First name*</label>
                <input
                  className="signup-input input-field"
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={handleChange}
                  placeholder="John"
                />
              </div>

              <div className="signup-field form-group">
                <label className="signup-label">Last name*</label>
                <input
                  className="signup-input input-field"
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="signup-field form-group">
              <label className="signup-label">Email*</label>
              <input
                className="signup-input input-field"
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>

            <div className="signup-field form-group">
              <label className="signup-label">Password*</label>
              <input
                className="signup-input input-field"
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Min. 8 characters incl. Aa, 0-9, symbol"
              />
              <div className={`pwd-meter meter-${pwdScore}`} aria-label="password strength">
                <div className="bar" />
              </div>
              <div className="pwd-meter-label">
                {["Very weak", "Weak", "Fair", "Strong", "Very strong"][pwdScore]}
              </div>
              <ul className="pwd-rules">
                <li className={rules.length ? "ok" : ""}>At least 8 characters</li>
                <li className={rules.lower ? "ok" : ""}>Lowercase letter</li>
                <li className={rules.upper ? "ok" : ""}>Uppercase letter</li>
                <li className={rules.digit ? "ok" : ""}>Number</li>
                <li className={rules.special ? "ok" : ""}>Special character</li>
              </ul>
            </div>

            <div className="signup-field form-group">
              <label className="signup-label">Confirm password*</label>
              <input
                className="signup-input input-field"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
              />
              <div className={`pwd-match ${rules.match ? "ok" : ""}`}>
                {rules.match ? "Passwords match" : "Passwords do not match"}
              </div>
            </div>

            <button
              className="signup-submit-button submit-btn"
              type="submit"
              disabled={
                loading ||
                !(rules.length && rules.lower && rules.upper && rules.digit && rules.special && rules.match) ||
                pwdScore < 3
              }
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <p className="signup-footnote">
            By signing up you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>

      <Banner />
    </div>
  );
};

export default SignUp;
