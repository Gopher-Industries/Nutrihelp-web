import React, { useState } from 'react';
import './../../../styles/auth.css'
import SubHeading from'../../../components/general_components/headings/SubHeading'
import './DietaryRequirements.css'

import { Image, Button} from 'semantic-ui-react'
import PreferenceImage from './images/pref.jpg'

function UserPreference() {
  // Create a separate selectedItems state array for each dropdown list
  const [specialDietaryRequirements, setSpecialDietaryRequirements] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [healthConditions, setHealthConditions] = useState([]);
  const [cuisine, setCuisine] = useState([]);
  const [spiceLevel, setSpiceLevel] = useState([]);
  const [cookingMethod, setCookingMethod] = useState([]);

  // Handle close icon click
  const handleCloseClick = (index, value) => {
    if (index === 0) {
      setSpecialDietaryRequirements(specialDietaryRequirements.filter(item => item !== value));
    } else if (index === 1) {
      setAllergies(allergies.filter(item => item !== value));
    } else if (index === 2) {
      setDislikes(dislikes.filter(item => item !== value));
    } else if (index === 3) {
      setHealthConditions(healthConditions.filter(item => item !== value));
    } else if (index === 4) {
      setCuisine(cuisine.filter(item => item !== value));
    } else if (index === 5) {
      setSpiceLevel(spiceLevel.filter(item => item !== value));
    } else if (index === 6) {
      setCookingMethod(cookingMethod.filter(item => item !== value));
    }
  };

  // Handle dropdown change
  const handleDropdownChange = (event, index) => {
    const value = event.target.value;
    if (index === 0) {
      if (specialDietaryRequirements.includes(value)) {
        setSpecialDietaryRequirements(specialDietaryRequirements.filter(item => item !== value));
      } else {
        setSpecialDietaryRequirements([...specialDietaryRequirements, value]);
      }
    } else if (index === 1) {
      if (allergies.includes(value)) {
        setAllergies(allergies.filter(item => item !== value));
      } else {
        setAllergies([...allergies, value]);
      }
    } else if (index === 2) {
      if (dislikes.includes(value)) {
        setDislikes(dislikes.filter(item => item !== value));
      } else {
        setDislikes([...dislikes, value]);
      }
    } else if (index === 3) {
      if (healthConditions.includes(value)) {
        setHealthConditions(healthConditions.filter(item => item !== value));
      } else {
        setHealthConditions([...healthConditions, value]);
      }
    } else if (index === 4) {
      if (cuisine.includes(value)) {
        setCuisine(cuisine.filter(item => item !== value));
      } else {
        setCuisine([...cuisine, value]);
      }
    } else if (index === 5) {
      if (spiceLevel.includes(value)) {
        setSpiceLevel(spiceLevel.filter(item => item !== value));
      } else {
        setSpiceLevel([...spiceLevel, value]);
      }
    } else if (index === 6) {
      if (cookingMethod.includes(value)) {
        setCookingMethod(cookingMethod.filter(item => item !== value));
      } else {
        setCookingMethod([...cookingMethod, value]);
      }
    }
  };

  // Handle redo button click
  const handleRedoClick = () => {
    setSpecialDietaryRequirements([]);
    setAllergies([]);
    setDislikes([]);
    setHealthConditions([]);
    setCuisine([]);
    setSpiceLevel([]);
    setCookingMethod([]);
    document.querySelectorAll('.dropdown select').forEach(select => {
      select.value = '';
    });
  };

  // Handle confirm button
  const handleConfirmClick = () => {
    const id = 1;
    const preferencedata = {
      specialDietaryRequirements,
      allergies,
      dislikes,
      healthConditions,
      cuisine,
      spiceLevel,
      cookingMethod,
    };

    console.log("preferencedata", preferencedata);

    // Make the fetch request
    fetch('http://localhost:80/api/userPreference', {
      method: 'POST',
      body: JSON.stringify({ id, preferencedata }),
      headers: {
        'Origin': 'http://localhost:3000/',
        'Content-Type': 'application/json'
      },
    })
    .then((response) => {
      // Handle successful response
      console.log(response);
      alert('User Preference selected successfully!');
      // Reset form data after successful submission
      handleRedoClick();
    })
    .catch((error) => {
      // Handle errors
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again later.');
    });
  };

  return (
    <div className="preferences-container">
      <SubHeading text="Your Preferences" />
      <div className="pref-img">
        <Image src={PreferenceImage} />
      </div>
      <div className='select'>
        <h4>Please confirm your selections</h4>
      </div>

      <div className='containerpre'>
        <div className="form-group">
          <h3>Special Dietary Requirements</h3>
          <div className="dropdown">
            <select onChange={(event) => handleDropdownChange(event, 0)}>
              <option value="">Select an option</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Gluten-free">Gluten-free</option>
            </select>
            {specialDietaryRequirements.map((value, index) => (
              <div key={index} className="selected-option">
                {value}
                <img src="./images/close.png" alt="Close Icon" className="close-icon" onClick={() => handleCloseClick(0, value)} />
              </div>
            ))}
          </div>
        </div>
        <hr />
        <div className="form-group">
          <h3>Allergies</h3>
          <div className="dropdown">
            <select onChange={(event) => handleDropdownChange(event, 1)}>
              <option value="">Select an option</option>
              <option value="Dairy">Dairy</option>
              <option value="Eggs">Eggs</option>
              <option value="Nuts">Nuts</option>
            </select>
            {allergies.map((value, index) => (
              <div key={index} className="selected-option">
                {value}
                <img src="./images/close.png" alt="Close Icon" className="close-icon" onClick={() => handleCloseClick(1, value)} />
              </div>
            ))}
          </div>
        </div>
        <hr />
        <div className="form-group">
          <h3>Dislikes</h3>
          <div className="dropdown">
            <select onChange={(event) => handleDropdownChange(event, 2)}>
              <option value="">Select an option</option>
              <option value="Ginger">Ginger</option>
              <option value="Mushrooms">Mushrooms</option>
              <option value="Onions">Onions</option>
            </select>
            {dislikes.map((value, index) => (
              <div key={index} className="selected-option">
                {value}
                <img src="./images/close.png" alt="Close Icon" className="close-icon" onClick={() => handleCloseClick(2, value)} />
              </div>
            ))}
          </div>
        </div>
        <hr />
        <div className="form-group">
          <h3>Health Conditions</h3>
          <div className="dropdown">
            <select onChange={(event) => handleDropdownChange(event, 3)}>
              <option value="">Select an option</option>
              <option value="Vitamin B6 deficiency">Vitamin B6 deficiency</option>
              <option value="Vitamin D deficiency">Vitamin D deficiency</option>
              <option value="Limit Sodium 2400mg">Limit Sodium 2400mg</option>
              <option value="Limit Cholesterol 2800mg">Limit Cholesterol 2800mg</option>
            </select>
            {healthConditions.map((value, index) => (
              <div key={index} className="selected-option">
                {value}
                <img src="./images/close.png" alt="Close Icon" className="close-icon" onClick={() => handleCloseClick(3, value)} />
              </div>
            ))}
          </div>
        </div>
        <hr />
        <div className="form-group">
          <h3>Choice of Cuisine</h3>
          <div className="dropdown">
            <select onChange={(event) => handleDropdownChange(event, 4)}>
              <option value="">Select an option</option>
              <option value="Italian">Italian</option>
              <option value="Chinese">Chinese</option>
              <option value="Indian">Indian</option>
            </select>
            {cuisine.map((value, index) => (
              <div key={index} className="selected-option">
                {value}
                <img src="./images/close.png" alt="Close Icon" className="close-icon" onClick={() => handleCloseClick(4, value)} />
              </div>
            ))}
          </div>
        </div>
        <hr />
        <div className="form-group">
          <h3>Level of Spice</h3>
          <div className="dropdown">
            <select onChange={(event) => handleDropdownChange(event, 5)}>
              <option value="">Select an option</option>
              <option value="Mild">Mild</option>
              <option value="Medium">Medium</option>
              <option value="Spicy">Spicy</option>
            </select>
            {spiceLevel.map((value, index) => (
              <div key={index} className="selected-option">
                {value}
                <img src="./images/close.png" alt="Close Icon" className="close-icon" onClick={() => handleCloseClick(5, value)} />
              </div>
            ))}
          </div>
        </div>
        <hr />
        <div className="form-group">
          <h3>Method of Cooking</h3>
          <div className="dropdown">
            <select onChange={(event) => handleDropdownChange(event, 6)}>
              <option value="">Select an option</option>
              <option value="Grilled">Grilled</option>
              <option value="Baked">Baked</option>
              <option value="Fried">Fried</option>
            </select>
            {cookingMethod.map((value, index) => (
              <div key={index} className="selected-option">
                {value}
                <img src="./images/close.png" alt="Close Icon" className="close-icon" onClick={() => handleCloseClick(6, value)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="buttonpre">
        <button className="btn-pre" onClick={handleConfirmClick}>CONFIRM CHOICES</button>
      </div>
      <div className="buttonre">
        <button className="btn-redo" onClick={handleRedoClick}>REDO</button>
      </div>
    </div>
  );
}

export default UserPreference;
