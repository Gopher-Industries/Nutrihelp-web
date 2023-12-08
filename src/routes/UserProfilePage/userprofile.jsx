// src/App.js
import React, { useState } from 'react';
import './userprofile.css';
const UserProfilePage = () => {
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    weight: '',
    height: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
  };

  return (
    <div className="App">
      <h1>User Profile Page</h1>
      <form>
        <label>
          First Name:
          <input
            type="text"
            name="firstName"
            value={userProfile.firstName}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Last Name:
          <input
            type="text"
            name="lastName"
            value={userProfile.lastName}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Gender:
          <select
            name="gender"
            value={userProfile.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>
        <br />
        <label>
          Weight:
          <input
            type="text"
            name="weight"
            value={userProfile.weight}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Height:
          <input
            type="text"
            name="height"
            value={userProfile.height}
            onChange={handleChange}
          />
        </label>
        <br />
        <button type="button">Save</button>
      </form>
    </div>
  );
};

export default UserProfilePage;
