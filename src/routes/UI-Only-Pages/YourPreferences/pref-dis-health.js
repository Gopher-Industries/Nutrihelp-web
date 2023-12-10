import React from 'react';
import './../../../styles/auth.css'

function YourPreferences() {
  return (
    <div>
      <h2 className='mainpre'> Your Preferences</h2>
      <div className="pref-img">
        <img src="./images/pref.jpg" alt="Preferences" className="pref-image" />
      </div>
      <h4 className='selection'>Please confirm your selections</h4>
      <div className='containerpre'>
        <div className="form-group">
          <h3>Special Dietary Requirements</h3>
          <button className="selpre">None<img src="./images/close.png" alt="Close Icon" className="close-icon" /> </button>
        </div>
        <hr />
        <div className="form-group">
          <h3>Allergies</h3>
          <button className="selpre">Dairy<img src="./images/close.png" alt="Close Icon" className="close-icon" /> </button>
        </div>
        <hr />
        <div className="form-group">
          <h3>Dislikes</h3>
          <button className="selpre">Ginger<img src="./images/close.png" alt="Close Icon" className="close-icon" /> </button>
          <button className="selpre">Mushrooms<img src="./images/close.png" alt="Close Icon" className="close-icon" /> </button>
        </div>
        <hr />
        <div className="form-group">
          <h3>Health Conditions</h3>
          <button className="selpre">Vitamin B6 deficiency<img src="./images/close.png" alt="Close Icon" className="close-icon" /> </button>
          <button className="selpre">Vitamin D deficiency<img src="./images/close.png" alt="Close Icon" className="close-icon" /></button>
          <button className="selpre">Limit Sodium 2400mg<img src="./images/close.png" alt="Close Icon" className="close-icon" /></button>
          <button className="selpre">Limit Cholestrol 2800mg<img src="./images/close.png" alt="Close Icon" className="close-icon" /></button>
        </div>
      </div>

      <div className="buttonpre">
        <button className="btn-pre">CONFIRM CHOICES</button>
      </div>
      <div className="buttonre">
        <button className="btn-redo">REDO</button>
      </div>


    </div>
  );
}

export default YourPreferences;