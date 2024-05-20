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
    <div>
      <div className="userProfile-container">
        <div className="userProfile-section">
          <div className="userProfile-content">
            <div>
              <div className="user-img-container">
                <FaUserCircle size="150px" color="rgba(18, 18, 255, 0.701)" />
              </div>
              <p className="choose-photo-text">
                <FaUserPen size="25px" /> Choose avatar
              </p>

              <div className="bottom-text">
                <div className="bottom-text-pair">
                  <p>
                    <AiFillBug /> Report a bug
                  </p>
                  <p>Something wrong? Let us know</p>
                </div>
                <div className="bottom-text-pair">
                  <p>
                    <MdDynamicFeed /> Feedback
                  </p>
                  <p>Have any suggestions? </p>
                </div>
              </div>
            </div>
            {/* form */}
            <div className="user-form-container">
              <form>
                <div className="form-content">
                  <label htmlFor="firstName">First Name</label>
                  <input type="text" name="firstName" id="firstName" />
                </div>
                
                <div className="form-content">
                  <label htmlFor="lastName">Last Name</label>
                  <input type="text" name="lastName" id="lastName" />
                </div>
                <div className="form-content">
                  <label htmlFor="number">Number</label>
                  <input type="text" name="number" id="number" />
                </div>
                <div className="form-content">
                  <label htmlFor="email">Email</label>
                  <input type="email" name="email" id="email" />
                </div>
                
                <div className="form-content">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-content">
                <label htmlFor="mfa">MFA</label>
                  <div className="mfa-toggle">
                  <label class="switch">
                    <input
                      type="checkbox"
                      id="mfa"
                      checked={isMFAEnabled}
                      onChange={toggleMFA}
                    />
                    <span class="slider round"></span>
                    </label>
                  </div>
                </div>

                <div className="logout-btn-content">
                  <button type="button" className="logout-btn">
                    LogOut
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="logout-btn-content">
            <button className="logout-btn">Save</button>
            <button className="logout-btn">Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
