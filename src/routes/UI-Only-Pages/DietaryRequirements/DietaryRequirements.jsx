import React, { useState } from 'react';
import './../../../styles/auth.css'
import SubHeading from'../../../components/general_components/headings/SubHeading'
import './DietaryRequirements.css'
import { Image, Button} from 'semantic-ui-react'
import PreferenceImage from './images/pref.jpg'

function DietaryRequirements() {
  // Create a separate selectedItems state array for each dropdown list
  const [specialDietaryRequirements, setSpecialDietaryRequirements] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [healthConditions, setHealthConditions] = useState([]);

  // Handle close icon click
  const handleCloseClick = (index, value) => {
    if (index === 0) {
      setSpecialDietaryRequirements(specialDietaryRequirements.filter(item => item!== value));
    } else if (index === 1) {
      setAllergies(allergies.filter(item => item!== value));
    } else if (index === 2) {
      setDislikes(dislikes.filter(item => item!== value));
    } else if (index === 3) {
      setHealthConditions(healthConditions.filter(item => item!== value));
    }
  };

  // Handle dropdown change
  const handleDropdownChange = (event, index) => {
    if (index === 0) {
      const value = event.target.value;
      if (specialDietaryRequirements.includes(value)) {
        setSpecialDietaryRequirements(specialDietaryRequirements.filter(item => item!== value));
      } else {
        setSpecialDietaryRequirements([...specialDietaryRequirements, value]);
      }
    } else if (index === 1) {
      const value = event.target.value;
      if (allergies.includes(value)) {
        setAllergies(allergies.filter(item => item!== value));
      } else {
        setAllergies([...allergies, value]);
      }
    } else if (index === 2) {
      const value = event.target.value;
      if (dislikes.includes(value)) {
        setDislikes(dislikes.filter(item => item!== value));
      } else {
        setDislikes([...dislikes, value]);
      }
    } else if (index === 3) {
      const value = event.target.value;
      if (healthConditions.includes(value)) {
        setHealthConditions(healthConditions.filter(item => item!== value));
      } else {
        setHealthConditions([...healthConditions, value]);
      }
    }
  };

  // Handle redo button click
  const handleRedoClick = () => {
    setSpecialDietaryRequirements([]);
    setAllergies([]);
    setDislikes([]);
    setHealthConditions([]);
    document.querySelectorAll('.dropdown select').forEach(select => {
      select.value = '';
    });
  };

  return (
    <div className="preferences-container">
      <SubHeading text="Your Preferences" />
      <div className="pref-img">
        <Image src={ PreferenceImage } />
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
              <option value="Limit Cholestrol 2800mg">Limit Cholestrol 2800mg</option>
            </select>
            {healthConditions.map((value, index) => (
              <div key={index} className="selected-option">
                {value}
                <img src="./images/close.png" alt="Close Icon" className="close-icon" onClick={() => handleCloseClick(3, value)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="buttonpre">
        <button className="btn-pre" onClick={() => handleRedoClick()}>CONFIRM CHOICES</button>
      </div>
      <div className="buttonre">
        <button className="btn-redo" onClick={() => handleRedoClick()}>REDO</button>
      </div>
    </div>
  );
}

export default DietaryRequirements;