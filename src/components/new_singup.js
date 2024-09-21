// Function to validate form fields
function validateForm() {
    const name = document.getElementById("name").value;
    const address = document.getElementById("address").value;
    const email = document.getElementById("email").value;
    const mobile = document.getElementById("mobile").value;
    const password = document.getElementById("password").value;
    const repassword = document.getElementById("repassword").value;
  
    // Name validation (only alphabets)
    const namePattern = /^[A-Za-z ]+$/;
    if (!name.match(namePattern)) {
      alert("Name must contain only alphabets.");
      return false;
    }
  
    // Address validation (ensure it's not empty)
    if (address.trim() === "") {
      alert("Please enter an address.");
      return false;
    }
  
    // Mobile number validation (10-digit number)
    const mobilePattern = /^\d{10}$/;
    if (!mobile.match(mobilePattern)) {
      alert("Mobile number must be a 10-digit number.");
      return false;
    }
  
    // Email validation (basic email format)
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!email.match(emailPattern)) {
      alert("Please enter a valid email address.");
      return false;
    }
  
    // Password validation (letters and numbers)
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/; // At least 6 characters with letters and numbers
    if (!password.match(passwordPattern)) {
      alert("Password must contain at least one letter and one number.");
      return false;
    }
  
    // Re-enter password validation (should match password)
    if (password !== repassword) {
      alert("Passwords do not match.");
      return false;
    }
  
    // If all validations pass
    alert("Form submitted successfully!");
    return true;
  }

  
  // Google Sign-In Functionality
function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
  
    // Process the response here or send it to your server
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    console.log(payload); // Logs user information
    alert(`Hello ${payload.name}, you are signed in with Google.`);
  }
  
  // Function to render the Google Sign-In button
  function initializeGoogleSignIn() {
    google.accounts.id.initialize({
      client_id: "YOUR_GOOGLE_CLIENT_ID", 
      callback: handleCredentialResponse,
      auto_select: false 
    });
  
    google.accounts.id.renderButton(
      document.getElementById("googleSignInBtn"), 
      {
        theme: "outline",
        size: "medium",
        type: "standard",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left"
      }
    );
  }
  
  // Initialize Google Sign-In button when the page loads
  window.onload = function () {
    initializeGoogleSignIn();
  };
  
