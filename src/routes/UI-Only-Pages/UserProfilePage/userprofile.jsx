// src/pages/UserProfilePage.js
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../../context/user.context";
import { MdDynamicFeed } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { AiFillBug } from "react-icons/ai";
import { FaUserPen } from "react-icons/fa6";
import "./user-profile.css";

const UserProfilePage = () => {
  const { currentUser } = useContext(UserContext);
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact_number: "",
    username: currentUser?.username || "" 
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`http://localhost:80/api/userprofile?username=${currentUser.username}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const firstUser = data[0]; // Get the first user profile
            setFormData({
              firstName: firstUser.first_name,
              lastName: firstUser.last_name,
              email: firstUser.email,
              contact_number: firstUser.contact_number,
              username: firstUser.username
            });
            setIsMFAEnabled(firstUser.isMFAEnabled);
          } else {
            console.error('No user profile data found');
          }
        } else {
          console.error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
  
    if (currentUser?.username) {
      fetchUserProfile();
    }
  }, [currentUser]);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:80/api/userprofile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          contact_number: formData.contact_number,
          isMFAEnabled: isMFAEnabled,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile updated successfully:', data);
        alert('Profile updated successfully');
      } else {
        const errorText = await response.text();
        console.error('Failed to update profile', response.status, errorText);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
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
            <div className="user-form-container">
              <form onSubmit={handleFormSubmit}>
                <div className="form-content">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-content">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-content">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-content">
                  <label htmlFor="contact_number">Contact Number</label>
                  <input
                    type="text"
                    name="contact_number"
                    id="contact_number"
                    autoComplete="contact_number"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-content">
                  <label htmlFor="mfa">MFA</label>
                  <div className="mfa-toggle">
                    <label className="switch">
                      <input
                        type="checkbox"
                        id="mfa"
                        checked={isMFAEnabled}
                        onChange={toggleMFA}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
                <div className="form-content">
                  <button type="submit">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
