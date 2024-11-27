import { sendPasswordResetEmail } from "firebase/auth";
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

export default ForgotPassword;