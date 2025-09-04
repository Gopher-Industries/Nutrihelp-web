/*import { sendPasswordResetEmail } from "firebase/auth";
import React from "react";
import { auth } from "../../utils/firebase";
import { useNavigate } from "react-router-dom";

// Component for password resetting
const ForgotPassword = (props) => {
    // Enable navigation functionality
    const navigate = useNavigate();

    // Handle form submission
    const handleSubmit = async (e) => {
        // Prevent default form behaviour
        e.preventDefault()

        // Retrieve email from the form
        const emailVal = e.target.email.value;

        // Try sending a reset email and navigate to home on success
        sendPasswordResetEmail(auth, emailVal).then(data => {
            alert("Check your email")
            navigate("/")
        }).catch(err => {
            // Inform the user in case of an error
            alert(err.code)
        })
    }

    return (
        <div className="App">
            <h1>Recover Password</h1>
            <form onSubmit={(e) => handleSubmit(e)}>
                <input size={25}
                    name="email"
                    placeholder="Email to reset password" />
                <br /><br />
                <button>Reset Password</button>
            </form>
        </div>
    )
}

export default ForgotPassword; */

import React, { useRef, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { useNavigate, Link } from "react-router-dom";
 
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const fieldRef = useRef(null);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
 
    const emailVal = e.target.email.value.trim();
    if (!emailVal) {
      setMsg({ type: "error", text: "Please enter your email." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setMsg({ type: "error", text: "Please enter a valid email address." });
      return;
    }
 
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, emailVal);
      setMsg({ type: "success", text: "Reset link sent! Please check your email." });
      setTimeout(() => navigate("/"), 900);
    } catch (err) {
      setMsg({
        type: "error",
        text:
          err?.code?.replace("auth/", "").replaceAll("-", " ") ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
 
  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "linear-gradient(180deg, rgba(246,237,255,1) 0%, rgba(243,226,255,1) 100%)",
      padding: 24,
      fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
    },
    card: {
      width: "100%",
      maxWidth: 520,
      background: "#fff",
      borderRadius: 20,
      boxShadow: "0 18px 60px rgba(90,39,139,.18)",
      padding: "30px 34px 26px",
    },
    brand: { textAlign: "center", marginBottom: 10 },
    title: { margin: 0, fontSize: 28, color: "#2a1b3d", fontWeight: 800 },
    subtitle: { marginTop: 10, color: "#756483", fontSize: 15 },
 
    form: { marginTop: 20 },
    label: {
      display: "block",
      fontSize: 14,
      color: "#4b3a63",
      marginBottom: 8,
      fontWeight: 700,
    },
 
    field: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      height: 52,
      padding: "0 14px",
      borderRadius: 14,
      border: "1px solid #d9c9f2",
      background: "#f7f2ff",
      boxShadow: "0 1px 0 rgba(0,0,0,.03) inset",
      transition: "box-shadow .15s, border-color .15s, background .15s",
    },
    focusRing: "0 0 0 4px rgba(168,85,247,.16)",
    icon: { display: "grid", placeItems: "center", width: 22, height: 22, opacity: .85 },
    input: {
      flex: 1,
      height: "100%",
      border: 0,
      borderRadius: 0,
      outline: "none",
      background: "transparent",
      boxShadow: "none",
      WebkitAppearance: "none",
      appearance: "none",
      fontSize: 16,
      color: "#2a1b3d",
    },
 
    button: {
      width: "100%",
      marginTop: 16,
      padding: "14px 18px",
      borderRadius: 14,
      border: "none",
      color: "#fff",
      background:
        "linear-gradient(90deg, rgba(132,88,242,1) 0%, rgba(109,67,236,1) 100%)",
      fontWeight: 800,
      fontSize: 16,
      cursor: "pointer",
      boxShadow: "0 10px 22px rgba(109,67,236,.25)",
      transition: "transform .04s, opacity .15s",
    },
    buttonDisabled: { opacity: 0.75, cursor: "not-allowed" },
 
    inlineMsg: (type) => ({
      marginTop: 12,
      padding: "10px 12px",
      borderRadius: 12,
      fontSize: 14,
      lineHeight: 1.35,
      color: type === "success" ? "#065f46" : "#7f1d1d",
      background: type === "success" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
      border: type === "success" ? "1px solid #34d399" : "1px solid #f87171",
    }),
 
    hintRow: {
      marginTop: 12,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 14,
      color: "#6b5a80",
    },
    link: { color: "#6d49f0", textDecoration: "none", fontWeight: 700 },
 
    resets: `
      #fp-email, #fp-email:focus {
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        outline: none !important;
      }
      #fp-email::placeholder { color: #8b7a9e; opacity: .7; }
    `,
  };
 
  return (
    <div style={styles.page}>
      <style>{styles.resets}</style>
 
      <div style={styles.card}>
        <div style={styles.brand}>
          <h1 style={styles.title}>Recover Password</h1>
          <p style={styles.subtitle}>
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>
 
        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <label htmlFor="fp-email" style={styles.label}>Email address</label>
 
          <div
            ref={fieldRef}
            style={styles.field}
            onFocus={() => (fieldRef.current.style.boxShadow = styles.focusRing)}
            onBlur={() => (fieldRef.current.style.boxShadow = styles.field.boxShadow)}
          >
            <span aria-hidden style={styles.icon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="6" width="18" height="12" rx="2" stroke="#7b6b91" strokeWidth="1.6" />
                <path d="M3 7l9 6 9-6" stroke="#7b6b91" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
 
            <input
              id="fp-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
              required
              style={styles.input}
              aria-describedby={msg.text ? "status-msg" : undefined}
            />
          </div>
 
          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(1px)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            {loading ? "Sending…" : "Reset Password"}
          </button>
 
          {msg.text ? (
            <div id="status-msg" role="status" style={styles.inlineMsg(msg.type)}>
              {msg.text}
            </div>
          ) : null}
 
          <div style={styles.hintRow}>
            <span>Remembered it?</span>
            <Link to="/" style={styles.link}>Back to Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
 
export default ForgotPassword;
 
 