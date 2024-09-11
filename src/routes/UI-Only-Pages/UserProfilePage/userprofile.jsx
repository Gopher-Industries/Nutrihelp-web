import React, { useState } from "react";
import { MdDynamicFeed } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { AiFillBug } from "react-icons/ai";
import { FaUserPen } from "react-icons/fa6";
import "./user-profile.css";

const UserProfilePage = () => {
  // Use state to handle input values
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    contact: '',
    password: '',
    confirmPassword: '',
    fitnessGoal: '',
  });

  const [isMFAEnabled, setIsMFAEnabled] = useState(false);

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // Additional validation logic if needed
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
            <form className="was-validated" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="firstName" className="form-label">Full Name</label>
                <input
                  className="form-control is-invalid"
                  id="firstName"
                  placeholder="Type Your Name Here.."
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                <span className="error">Valid Name</span>
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email Id</label>
                <input
                  className="form-control is-invalid"
                  id="email"
                  placeholder="Type Your Email Here.."
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <span className="error">✗</span>
              </div>

              <div className="mb-3">
                <label htmlFor="contact" className="form-label">Contact No</label>
                <input
                  className="form-control is-invalid"
                  id="contact"
                  placeholder="Type Your Phone No Here.."
                  required
                  value={formData.contact}
                  onChange={handleInputChange}
                />
                <span className="error">✗</span>
                <div className="invalidfeedback"> Phone no is invalid</div>
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  className="form-control is-invalid"
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <span className="error">✗</span>
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  className="form-control is-invalid"
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
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
                      onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                    />
                    Muscle Gain
                  </label>
                  <label>
                    <input
                      type="radio"
                      className="form-check-input"
                      name="fitnessGoal"
                      value="weightloss"
                      onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                    />
                    Weight Loss
                  </label>
                  <label>
                    <input
                      type="radio"
                      className="form-check-input"
                      name="fitnessGoal"
                      value="generalwell"
                      onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                    />
                    General Well Being
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
          </div>

          <div className="container310 w-30">
            <img src="./images/main.png" className="img" alt="Profile"/>
            <input type="file" className="form-control" name="image" />
            <div className="mt-4 pt-4">
              <label htmlFor="Writetous" className="form-label">Write to Us</label>
              <textarea className="form-control" id="comment" rows="4" cols="30"></textarea>
            </div>
            <button className="signup-facebook mt-4 p-4">Leave Us a Comment.</button>
            <button className="signup-help mt-5 p-2">
              <img src="/images/Help.png" className="signupimg me-2" alt="Help" /> Need Help? Talk to Us.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
