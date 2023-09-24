import React from 'react';
import '../styles/auth.css';

function PreferencesComponent() {
  return (
    <div className="main">
      <section className="signup">
        <div className="container">
          <div className="signup-content">
            <div className="signup-form">
              <h2 className="form-title">Your Preferences</h2>
              <hr />
              <h4>Please confirm your selections</h4>
              <div className="form-group">
                <h3>Special Dietary Requirements</h3>
                <button className="sel confirm">None</button>
              </div>
              <hr />
              <div className="form-group">
                <h3>Allergies</h3>
                <button className="sel confirm">Dairy</button>
              </div>
              <hr />
              <div className="form-group">
                <h3>Dislikes</h3>
                <button className="sel confirm">Ginger</button>
                <button className="sel confirm">Mushrooms</button>
              </div>
              <hr />
              <div className="form-group">
                <h3>Health Conditions</h3>
                <button className="sel confirm">Vitamin B6 deficiency</button>
                <button className="sel confirm">Vitamin D deficiency</button>
                <button className="sel confirm">Limit Sodium 2400mg</button>
                <button className="sel confirm">Limit Cholestrol 2800mg</button>
              </div>
              <hr />
              <div className="form-group form-button">
                <input type="submit" name="continue" className="form-submit" value="Continue" />
                <input type="submit" name="redo" className="form-submit" value="Redo" style={{ position: 'absolute', right: '10px' }} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="signup">
        <div className="container">
          <div className="signup-content">
            <div className="signup-form">
              <h2 className="form-title">Dislikes</h2>
              <div className="diet-form">
                <div className="form-group" id="sd">
                  <div className="searchable-dropdown">
                    <input type="text" id="diet-input" placeholder="Search dislikes" />
                    <ul id="diet-list">
                      <li id="option-1" data-value="1">input 1</li>
                      <hr />
                      <li data-value="2">input 2</li>
                      <hr />
                      <li data-value="3">input 3</li>
                      <hr />
                      <li data-value="4">input 4</li>
                    </ul>
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-group">
                    <button className="sel">Mushrooms</button>
                    <button className="sel">Ginger</button>
                    <button className="sel">Raisins</button>
                    <button className="sel">Tofu</button>
                    <button className="sel">Anchovies</button>
                  </div>
                </div>
                <hr />
                <h2 className="form-title">Health Conditions</h2>
                <div className="form-group" id="sd2">
                  <div className="searchable-dropdown">
                    <input type="text" id="allergy-input" placeholder="Search conditions" />
                    <ul id="allergy-list">
                      <li id="option-1" data-value="1">item 1</li>
                      <hr />
                      <li data-value="2">item 2</li>
                      <hr />
                      <li data-value="3">item 3</li>
                      <hr />
                      <li data-value="4">item 4</li>
                    </ul>
                  </div>
                </div>
                <div className="form-group">
                  <button className="sel">Hypertension</button>
                  <button className="sel">Heart Disease</button>
                  <button className="sel">Diabetes type 2</button>
                  <button className="sel">Cardiovascular</button>
                  <button className="sel">Iron deficiency</button>
                </div>
                <div className="form-group form-button">
                  <input type="submit" name="conitnue" className="form-submit" value="Continue" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PreferencesComponent;
