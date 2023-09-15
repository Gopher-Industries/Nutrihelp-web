import React from 'react';
import '../styles/auth.css';

function SignUp() {
  return (
    <section className="signup">
      <div className="container">
        <div className="signup-content">
          <div className="signup-form">
            <h2 className="form-title">Sign up</h2>
            <form method="POST" className="register-form" id="register-form">
              <div className="form-group">
                <label htmlFor="name">
                  <span className="material-symbols-outlined">person</span>
                </label>
                <input type="text" name="name" id="name" placeholder="Your Name" />
              </div>
              <div className="form-group">
                <label htmlFor="email">
                  <span className="material-symbols-outlined">mail</span>
                </label>
                <input type="email" name="email" id="email" placeholder="Your Email" />
              </div>
              <div className="form-group">
                <label htmlFor="pass">
                  <span className="material-symbols-outlined">password</span>
                </label>
                <input type="password" name="pass" id="pass" placeholder="Password" />
              </div>
              <div className="form-group">
                <label htmlFor="re-pass">
                  <span className="material-symbols-outlined">lock</span>
                </label>
                <input
                  type="password"
                  name="re_pass"
                  id="re_pass"
                  placeholder="Repeat your password"
                />
              </div>
              <div className="form-group">
                <input
                  type="checkbox"
                  name="agree-term"
                  id="agree-term"
                  className="agree-term"
                />
                <label htmlFor="agree-term" className="label-agree-term">
                  <span>
                    <span></span>
                  </span>
                  I agree all statements in{' '}
                  <a href="#" className="term-service">
                    Terms of service
                  </a>
                </label>
              </div>
              <div className="form-group form-button">
                <input
                  type="submit"
                  name="signup"
                  id="signup"
                  className="form-submit"
                  value="Register"
                />
                <input style={{marginLeft: "20px"}} type="submit" id="toLogin" className="btn" value="Login" />
              </div>
            </form>
          </div>
          <div className="signup-image">
            <img src="./images/1.png" alt="Sign Up" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default SignUp;
