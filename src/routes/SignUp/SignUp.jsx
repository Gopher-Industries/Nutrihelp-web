"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import signupImage from "../../images/Nutrihelp.jpg";
import logoImage from "../../images/logos_black_icon.png";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { useFormValidation } from "../../hooks/useFormValidation";
import {
  validateEmail,
  validatePassword,
  validatePhone,
  ERROR_MESSAGES,
} from "../../utils/validationRules";
import FieldError from "../../components/FieldError";
import { toast } from "react-toastify";
import { API_BASE_URL, parseJsonSafe } from "../../utils/authApi";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?mode=signup`,
      },
    });

    if (error) {
      setServerError(error.message);
    }
  };

  const handleAppleSignup = async () => {
    const message = "Apple sign-in is not configured in this sprint build yet.";
    setServerError(message);
    toast.info(message);
  };

  const navigate = useNavigate();

  const validate = (values) => {
    const err = {};
    if (!values.firstName.trim()) err.firstName = ERROR_MESSAGES.REQUIRED;
    if (!values.lastName.trim()) err.lastName = ERROR_MESSAGES.REQUIRED;

    const emailErr = validateEmail(values.email);
    if (emailErr) err.email = emailErr;

    const passErr = validatePassword(values.password);
    if (passErr) err.password = passErr;

    if (values.password !== values.confirmPassword)
      err.confirmPassword = ERROR_MESSAGES.PASSWORD_MISMATCH;

    const phoneErr = validatePhone(values.phone);
    if (phoneErr) err.phone = phoneErr;

    return err;
  };

  const {
    values: form,
    errors,
    touched,
    isSubmitting: loading,
    handleChange,
    handleBlur,
    handleSubmit: submit,
    setErrors,
  } = useFormValidation(
    {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    validate,
    async (values) => {
      setServerError("");
      try {
        const payload = {
          name: `${values.firstName} ${values.lastName}`.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
          contact_number: values.phone || "0412345678",
          address: "Placeholder address 123",
        };

        const res = await fetch(`${API_BASE_URL}/api/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text();
          let msg = `Sign up failed (HTTP ${res.status})`;
          try {
            const data = JSON.parse(text);

            if (typeof data.error === "string") {
              if (
                data.error.toLowerCase().includes("user already exists") ||
                data.error.toLowerCase().includes("email already")
              ) {
                setErrors({
                  email: "An account with this email already exists.",
                });
                return;
              }
              if (
                data.error.toLowerCase().includes("weak_password") ||
                data.error.toLowerCase().includes("weak password")
              ) {
                setErrors({
                  password:
                    "Password is too weak. Please choose a stronger password.",
                });
                return;
              }
            }

            if (data.errors && Array.isArray(data.errors)) {
              const fieldErrors = {};
              data.errors.forEach((err) => {
                const rawField = err.param || err.path || err.field;
                const errMsg = err.msg || err.message;

                if (rawField === "email") fieldErrors.email = errMsg;
                if (rawField === "password") {
                  if (errMsg && errMsg.toLowerCase().includes("weak")) {
                    fieldErrors.password =
                      "Password is too weak. Please choose a stronger password.";
                  } else {
                    fieldErrors.password = errMsg;
                  }
                }
                if (rawField === "contact_number" || rawField === "phone") {
                  fieldErrors.phone = errMsg;
                }
                if (rawField === "name") {
                  fieldErrors.firstName = fieldErrors.firstName ?? errMsg;
                  fieldErrors.lastName = fieldErrors.lastName ?? errMsg;
                }
                if (rawField === "address") {
                  msg = errMsg || msg;
                }
              });

              if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors);
                return;
              }
            }

            msg = data.error || data.message || msg;
          } catch {
            if (text) msg = text;
          }

          setServerError(msg);
          return;
        }

        if (res.status === 201 || res.status === 200) {
          toast.success(
            "Account created successfully. Please login to continue.",
          );
          navigate("/login");
          return;
        }

        const data = await parseJsonSafe(res);
        setServerError(data.error || `Sign up failed (HTTP ${res.status})`);
      } catch (error) {
        console.error("Sign up request failed:", error);
        setServerError(
          "Unable to reach the server. Please check that the API is running and try again.",
        );
      }
    },
  );

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      padding: "20px",
      fontFamily: '"Poppins", sans-serif',
    },

    cardWrapper: {
      display: "flex",
      width: "100%",
      height: "auto",
      backgroundColor: "white",
      borderRadius: "28px",
      overflow: "hidden",
      boxShadow: "0 8px 35px rgba(0,0,0,0.18)",
      maxWidth: "1200px",
      animation: "fadeSlide 0.35s ease",
    },

    cardImage: {
      width: "40%",
      minHeight: "400px",
    },

    cardImageImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },

    cardForm: {
      width: "60%",
      padding: "32px 55px",
      overflowY: "auto",
    },

    logoBlock: {
      textAlign: "center",
      marginBottom: "18px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },

    logo: {
      width: "52px",
      marginBottom: "12px",
    },

    brandTitle: {
      fontSize: "22px",
      fontWeight: 600,
      margin: 0,
    },

    heading: {
      fontSize: "26px",
      margin: "10px 0 12px 0",
      fontWeight: 600,
      textAlign: "center",
    },

    subtitle: {
      marginBottom: "22px",
      fontSize: "15px",
      color: "#555",
      textAlign: "center",
    },

    row: {
      display: "flex",
      gap: "18px",
      marginBottom: "14px",
    },

    field: { flex: 1 },

    label: {
      fontSize: "14px",
      fontWeight: 600,
      marginBottom: "5px",
      display: "block",
      color: "#000",
    },

    input: (name) => ({
      width: "100%",
      padding: "12px 16px",
      borderRadius: "8px",
      border:
        errors[name] && touched[name] ? "2px solid red" : "2px solid black",
      fontSize: "15px",
      backgroundColor: "transparent",
      color: "#000",
      transition: "border-color 0.2s ease",
    }),

    passwordWrap: {
      position: "relative",
      width: "100%",
    },

    passwordToggle: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#666",
    },

    error: {
      fontSize: "12px",
      color: "red",
      marginTop: "4px",
    },

    mainBtn: {
      width: "100%",
      padding: "12px",
      backgroundColor: "black",
      color: "white",
      borderRadius: "8px",
      border: "none",
      fontSize: "15px",
      fontWeight: 600,
      marginTop: "8px",
      cursor: "pointer",
    },

    divider: {
      textAlign: "center",
      margin: "18px 0 10px 0",
      position: "relative",
      fontSize: "14px",
    },

    dividerLine: {
      position: "absolute",
      width: "42%",
      height: "1px",
      backgroundColor: "#ccc",
      top: "50%",
    },

    socialBox: {
      display: "flex",
      gap: "15px",
      marginBottom: "0px",
    },

    socialBtn: {
      flex: 1,
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid black",
      backgroundColor: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 600,
    },
  };

  return (
    <div style={styles.container}>
      {/* RESPONSIVE CSS */}
      <style>{`
        @media (max-width: 992px) {
          .card-wrapper {
            flex-direction: column !important;
            height: auto !important;
          }
          .card-image {
            width: 100% !important;
            height: 260px !important;
          }
          .card-form {
            width: 100% !important;
            padding: 28px 32px !important;
          }
        }

        @media (max-width: 768px) {
          .row {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .card-image {
            height: 220px !important;
          }
          .card-form {
            padding: 24px 22px !important;
          }
        }

        @media (max-width: 480px) {
          .card-image {
            height: 180px !important;
          }
          .card-form {
            padding: 20px 16px !important;
          }
          input {
            font-size: 14px !important;
            padding: 10px 14px !important;
          }
        }
      `}</style>

      <div style={styles.cardWrapper} className="card-wrapper">
        {/* LEFT IMAGE */}
        <div style={styles.cardImage} className="card-image">
          <img src={signupImage} style={styles.cardImageImg} alt="Signup" />
        </div>

        {/* RIGHT FORM */}
        <div style={styles.cardForm} className="card-form">
          <div style={styles.logoBlock}>
            <img src={logoImage} style={styles.logo} alt="Logo" />
            <h2 style={styles.brandTitle}>NutriHelp</h2>
          </div>

          <h1 style={styles.heading}>Create Your NutriHelp Account</h1>
          <p style={styles.subtitle}>
            Start your personalized health journey with smart nutrition insights
            and wellness tracking.
          </p>

          <form onSubmit={submit}>
            {/* FIRST + LAST NAME */}
            <div style={styles.row} className="row">
              <div style={styles.field}>
                <label style={styles.label}>First Name</label>
                <input
                  name="firstName"
                  style={styles.input("firstName")}
                  placeholder="Enter first name"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={form.firstName}
                />
                <FieldError
                  error={errors.firstName}
                  touched={touched.firstName}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Last Name</label>
                <input
                  name="lastName"
                  style={styles.input("lastName")}
                  placeholder="Enter last name"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={form.lastName}
                />
                <FieldError
                  error={errors.lastName}
                  touched={touched.lastName}
                />
              </div>
            </div>

            {/* EMAIL + PHONE */}
            <div style={styles.row} className="row">
              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input
                  name="email"
                  style={styles.input("email")}
                  placeholder="Enter your email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={form.email}
                />
                <FieldError error={errors.email} touched={touched.email} />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Phone Number</label>
                <input
                  name="phone"
                  style={styles.input("phone")}
                  placeholder="Enter phone number"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={form.phone}
                />
                <FieldError error={errors.phone} touched={touched.phone} />
              </div>
            </div>

            {/* PASSWORD + CONFIRM */}
            <div style={styles.row} className="row">
              <div style={styles.field}>
                <label style={styles.label}>Password</label>
                <div style={styles.passwordWrap}>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    style={styles.input("password")}
                    placeholder="Enter password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={form.password}
                  />
                  <button
                    type="button"
                    style={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <FieldError
                  error={errors.password}
                  touched={touched.password}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Confirm Password</label>
                <div style={styles.passwordWrap}>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    style={styles.input("confirmPassword")}
                    placeholder="Re-enter password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={form.confirmPassword}
                  />
                  <button
                    type="button"
                    style={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                <FieldError
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                />
              </div>
            </div>

            {serverError && (
              <p style={{ ...styles.error, marginTop: 8 }}>{serverError}</p>
            )}

            <button
              type="submit"
              style={{ ...styles.mainBtn, opacity: loading ? 0.8 : 1 }}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p style={{ marginTop: "14px", textAlign: "center" }}>
            Already have an account?
            <a
              href="/login"
              style={{ textDecoration: "underline", marginLeft: "4px" }}
            >
              Login
            </a>
          </p>

          <div style={styles.divider}>
            <span
              style={{
                backgroundColor: "white",
                padding: "0 8px",
                position: "relative",
                zIndex: 1,
              }}
            >
              or
            </span>
            <div style={{ ...styles.dividerLine, left: 0 }} />
            <div style={{ ...styles.dividerLine, right: 0 }} />
          </div>

          {/* Social Buttons */}
          <div style={styles.socialBox}>
            <button
              type="button"
              style={styles.socialBtn}
              className="social-btn"
              onClick={handleGoogleSignup}
            >
              <span
                style={{
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
              </span>
            </button>

            <button
              type="button"
              style={styles.socialBtn}
              className="social-btn"
              onClick={handleAppleSignup}
            >
              <span
                style={{
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 50 50"
                >
                  <path d="M44.527344 34.75C43.449219 37.144531 42.929688 38.214844 41.542969 40.328125C39.601563 43.28125 36.863281 46.96875 33.480469 46.992188C30.46875 47.019531 29.691406 45.027344 25.601563 45.0625C21.515625 45.082031 20.664063 47.03125 17.648438 47C14.261719 46.96875 11.671875 43.648438 9.730469 40.699219C4.300781 32.429688 3.726563 22.734375 7.082031 17.578125C9.457031 13.921875 13.210938 11.773438 16.738281 11.773438C20.332031 11.773438 22.589844 13.746094 25.558594 13.746094C28.441406 13.746094 30.195313 11.769531 34.351563 11.769531C37.492188 11.769531 40.8125 13.480469 43.1875 16.433594C35.421875 20.691406 36.683594 31.78125 44.527344 34.75ZM31.195313 8.46875C32.707031 6.527344 33.855469 3.789063 33.4375 1C30.972656 1.167969 28.089844 2.742188 26.40625 4.78125C24.878906 6.640625 23.613281 9.398438 24.105469 12.066406C26.796875 12.152344 29.582031 10.546875 31.195313 8.46875Z" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
