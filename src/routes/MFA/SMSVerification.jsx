// SMSVerification.jsx — full version with redirect to home on success
import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SMSVerification.css";
import { UserContext } from "../../context/user.context";

const RESEND_COOLDOWN = 30;

export default function SMSVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser } = useContext(UserContext);

  // email passed from MFAform: navigate("/sms-verification", { state: { email } })
  const emailFromState = location.state?.email || "";
  const [email, setEmail] = useState(emailFromState);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("ok"); // "ok" | "error"

  const [step, setStep] = useState("request"); // request | verify
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  // 6-digit code inputs
  const [code, setCode] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);

  // cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const isEmailValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  // send SMS code
  async function handleRequestCode() {
    if (!isEmailValid(email)) {
      setMessage("Please enter a valid email.");
      setMsgType("error");
      return;
    }
    if (cooldown > 0) return;

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("http://localhost/api/sms/send-sms-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const ct = response.headers.get("content-type") || "";
      const raw = await response.text();
      const data = ct.includes("application/json") ? JSON.parse(raw) : { error: raw };

      if (!response.ok) throw new Error(data?.error || "Failed to send SMS code.");

      setMaskedPhone(data.phone || "");
      setCooldown(RESEND_COOLDOWN);
      setStep("verify");
      setMessage("SMS code sent. Check your phone (in dev, see backend console).");
      setMsgType("ok");
    } catch (err) {
      console.error("Send SMS error:", err);
      setMessage(err.message || "Failed to send SMS code.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  }

  // verify code → set user → go home
  async function handleVerifyCode(e) {
    e?.preventDefault?.();
    const token = code.join("");

    if (!isEmailValid(email)) {
      setMessage("Please enter a valid email.");
      setMsgType("error");
      return;
    }
    if (!token || token.length < 4) {
      setMessage("Please enter the 6-digit code.");
      setMsgType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("http://localhost/api/sms/verify-sms-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: token }),
      });

      const ct = response.headers.get("content-type") || "";
      const raw = await response.text();
      const data = ct.includes("application/json") ? JSON.parse(raw) : { error: raw };

      if (!response.ok) throw new Error(data?.error || "Verification failed.");

      // ✅ success: mark user as authenticated (basic payload) and go home
      setCurrentUser({ email, mfa: "sms" });
      setMessage("SMS verification successful! Redirecting...");
      setMsgType("ok");
      navigate("/"); // redirect to home
    } catch (err) {
      console.error("Verify SMS error:", err);
      setMessage(err.message || "Invalid code.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  }

  // inputs UX
  const handleChange = (i, value) => {
    const v = value.replace(/\D/g, "").slice(0, 1);
    setCode((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    if (v && i < 5) inputsRef.current[i + 1]?.focus();
  };
  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };
  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const arr = Array(6).fill("");
    for (let i = 0; i < text.length; i++) arr[i] = text[i];
    setCode(arr);
    const last = Math.min(text.length - 1, 5);
    inputsRef.current[last]?.focus();
    e.preventDefault();
  };

  return (
    <div className="sms-wrap">
      <div className="sms-card shadow">
        <h2 className="sms-title">SMS Verification</h2>
        <p className="sms-sub">
          Request a code to your phone, then enter the 6-digit code to verify.
        </p>

        {/* Email input (read-only if passed from previous page) */}
        {!emailFromState ? (
          <div className="sms-form">
            <label className="sms-label">Email</label>
            <input
              className="sms-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>
        ) : (
          <div className="sms-form">
            <label className="sms-label">Email</label>
            <input className="sms-input" value={email} disabled />
          </div>
        )}

        {/* Request code */}
        <div className="sms-actions">
          <button
            className="sms-btn primary"
            type="button"
            onClick={handleRequestCode}
            disabled={loading || cooldown > 0}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Send SMS Code"}
          </button>

          <button className="sms-btn" type="button" onClick={() => navigate(-1)} disabled={loading}>
            Back
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`sms-msg ${msgType === "ok" ? "ok" : "error"}`}>
            {maskedPhone && step === "verify" ? (
              <span>
                Code sent to: <strong>{maskedPhone}</strong> — {message}
              </span>
            ) : (
              message
            )}
          </div>
        )}

        {/* Verify step */}
        {step === "verify" && (
          <form className="sms-form" onSubmit={handleVerifyCode}>
            <label className="sms-label">6-digit code</label>
            <div
              className="mfa-input-container"
              onPaste={handlePaste}
              style={{ marginBottom: 10 }}
            >
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  className="mfa-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>
            <button className="sms-btn primary" type="submit" disabled={loading}>
              Verify
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
