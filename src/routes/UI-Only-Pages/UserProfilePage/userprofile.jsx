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
      <h2 className="text-center mycolor"> Register with us</h2>
      <div className="container m-1">
    <div className="custom-row w-100">
        <div className="container70 w-70">
        <form className="was-validated">
        <div className="mb-3">
    <label for="name" className="form-label">Full Name</label>
    <input className="form-control is-invalid" id="name" placeholder="Type Your Name Here.." required/>
    <span className="error">Valid Name </span>
  </div>


  <div className="mb-3">
    <label for="email" className="form-label">Email Id</label>
    <input className="form-control is-invalid" id="email" placeholder="Type Your Email Here.." required/>
    <span className="error">✗</span>
  </div>

  <div className="mb-3">
    <label for="contact" className="form-label">Contact No</label>
    <input className="form-control is-invalid" id="contact" placeholder="Type Your Phone No Here.." required/>
    <span className="error">✗</span>
    <div className="invalidfeedback"> Phone no is invalid</div>
  </div>
  <div className="mb-3">
    <label for="password" className="form-label">Password</label>
    <input className="form-control is-invalid"  id="password" type="password" required/>
    <span className="error">✗</span>
  </div>

  <div className="form-group">
            <label>Choose Gender</label>
            <div className="gender-options">
              <label>
                <input
                  type="radio"
                  className="form-check-input"
                  name="gender"
                  value="male"
                />
                Male
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  className="form-check-input"
                  value="female"
                />
                Female
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  className="form-check-input"
                  value="other"
                />
                Other
              </label>
            </div>
          </div>
          <div className="form-group">
            <label for="food" className="formlabel">Food Preference</label>
                <input
                  type="radio"
                  className="form-check-input"
                  name="foodPreference"
                  value="veg"
                />
                <img src="./images/veg.png" className="foodimg"/><br/><br/>
                <label>Veg</label>
                <input
                  type="radio"
                  className="form-check-input"
                  name="foodPreference"
                  value="vegan"
                />
                <img src="./images/vegan.png" className="foodimg"/><br/><br/>
                <label>Vegan</label>
                <input
                  type="radio"
                  className="form-check-input"
                  name="foodPreference"
                  value="eggetarian"
                />
                <img src="./images/egg.png" className="foodimg"/><br/><br/>
                <label>Eggetarian</label>
                <input
                  type="radio"
                  className="form-check-input"
                  name="foodPreference"
                  value="non-veg"
                />
               <img src="./images/nonveg.png" className="foodimg"/><br/><br/>
               <label>Non Veg</label>

          </div>
          <div className="form-group">
            <label className="checkbox">
              <input type="checkbox" name="signup" className="form-check-input"/>
              By Signing up you agree to receive updates and special offers
            </label>
          </div>
          <button type="submit" className="btn buttoncolor">SUBMIT</button>
          <button type="reset" className="btn buttoncolor">RESET</button>
</form>
<div className="progress-bar">
          <div className="progress"></div>
        </div>
        </div>
        <div className="container30 w-30">
          <img src='./images/main.png' className="img"/>
          <input type="file" className="form-control" name="image"/>
        <div className="signup-options mt-5">
          <button className="signup-google mt-5"><img src="/images/g1.png" class="signupimg me-2"/> Sign Up with Google</button>
          <button className="signup-facebook mt-5"><img src="/images/f1.png" class="signupimg me-2"/> Sign Up with Facebook</button>
          <button className="signup-help mt-5"><img src="/images/h.png" class="signupimg me-2"/> Need Help? Talk to Us.</button>
        </div>
        </div>
    </div>
    </div>
    </div>
  );
};

export default UserProfilePage;
