import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "40px 20px",
        fontFamily: '"Poppins", sans-serif',
      }}
    >
      <section
        style={{
          maxWidth: "850px",
          margin: "0 auto",
          backgroundColor: "white",
          padding: "36px",
          borderRadius: "20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            textDecoration: "underline",
            marginBottom: "20px",
            fontSize: "15px",
          }}
        >
          Back
        </button>

        <h1>NutriHelp Privacy Policy</h1>
        <p>
          This policy explains what personal information NutriHelp collects,
          why it is collected, and how it is protected.
        </p>

        <h2>Information we collect</h2>
        <p>
          NutriHelp may collect your name, contact details, dietary
          preferences, allergies, health information, meal plans, and other
          information you choose to provide.
        </p>

        <h2>Why we collect it</h2>
        <p>
          We use this information to provide personalised nutrition guidance,
          meal planning, food-safety warnings, and other NutriHelp features.
        </p>

        <h2>How we protect it</h2>
        <p>
          NutriHelp uses access controls, encryption, secure connections, and
          security monitoring to help protect your information.
        </p>

        <h2>Your choices</h2>
        <p>
          You can review and update your account information. You may also ask
          for support regarding your personal information through the
          NutriHelp contact form.
        </p>

        <h2>Consent</h2>
        <p>
          By creating an account and selecting the consent checkbox, you
          confirm that you have read and agreed to this privacy policy.
        </p>

        <p>
          <strong>Policy version:</strong> 1.0
        </p>
      </section>
    </main>
  );
}