import React, { useState } from "react";
import { MdDynamicFeed } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { AiFillBug } from "react-icons/ai";
import { FaUserPen } from "react-icons/fa6";
import "./user-profile.css";

const UserProfilePage = () => {
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);

  const handleInputValue = (e) => {
    e.preventDefault();
    const userFirstName = firstName.value;
    const userLastName = lastName.value;
    const userNumber = number.value;
    const userEmail = email.value;
    const userPassword = password.value;
    const userHealth = health.value;
    const userPreferred = preferred.value;

    const inputArray = [
      {
        firstName: userFirstName,
        lastName: userLastName,
        number: userNumber,
        email: userEmail,
        password: userPassword,
        healthCondition: userHealth,
        preferredCuisine: userPreferred,
        isMFAEnabled: isMFAEnabled,
      },
    ];

    console.log(inputArray);
  };

  const toggleMFA = () => {
    setIsMFAEnabled(!isMFAEnabled);
  };

  return (
    <div className="container-fluid bg-white">
      <div className="container m-1">
        <div className="custom-row w-100">
          <div className="container70 w-70">
            <form className="was-validated">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input className="form-control is-invalid" id="name" placeholder="Type Your Name Here.." required />
                <span className="error">Valid Name </span>
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email Id</label>
                <input className="form-control is-invalid" id="email" placeholder="Type Your Email Here.." required />
                <span className="error">✗</span>
              </div>

              <div className="mb-3">
                <label htmlFor="contact" className="form-label">Contact No</label>
                <input className="form-control is-invalid" id="contact" placeholder="Type Your Phone No Here.." required />
                <span className="error">✗</span>
                <div className="invalidfeedback"> Phone no is invalid</div>
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input className="form-control is-invalid" id="password" type="password" required />
                <span className="error">✗</span>
              </div>

              <div className="mb-3">
                <label htmlFor="cpassword" className="form-label"> Confirm Password</label>
                <input className="form-control is-invalid" id="cpassword" type="password" required />
                <span className="error">✗</span>
              </div>

              <div className="form-group">
                <label>Choose Fitness Goal</label>
                <div className="gender-options">
                  <label>
                    <input
                      type="radio"
                      className="form-check-input"
                      name="fitnessGoal"
                      value="muscle"
                    />
                    Muscle Gain
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="fitnessGoal"
                      className="form-check-input"
                      value="weightloss"
                    />
                    Weight Loss
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="fitnessGoal"
                      className="form-check-input"
                      value="generalwell"
                    />
                    General Well Being
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="fitnessGoal"
                      className="form-check-input"
                      value="hypertension"
                    />
                    Hypertension Control
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="fitnessGoal"
                      className="form-check-input"
                      value="hearthealth"
                    />
                    Heart Health
                  </label>
                </div>
              </div>

              <label>
                <input type="checkbox" name="signup" />
                By Signing up you agree to receive updates and special offers
              </label>

              <button type="submit" className="btn buttoncolor">SUBMIT</button>
              <button type="reset" className="btn buttoncolor">RESET</button>
            </form>

            <div className="progress-bar">
              <div className="progress"></div>
            </div>
          </div>

          <div className="container310 w-30">
            <img src="./images/avatar.png" className="img" />
            <input type="file" className="form-control" name="image" />
            <div className="mt-4 pt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
