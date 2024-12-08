import "./Home.css";

import React, { useContext, useEffect, useState } from "react";

import { Link } from "react-router-dom";
import { UserContext } from "../../context/user.context";
import { FaRobot } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom";
import translations from "./translations.json"; 


const Home = () => {
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [showHeader, setShowHeader] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [language, setLanguage] = useState("en"); // 添加语言状态

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;

      if (currentScrollPos > prevScrollPos) {
        // Scrolling down
        setShowHeader(false);
      } else {
        // Scrolling up
        setShowHeader(true);
      }

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollPos]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Make the fetch request
    fetch("http://localhost:80/api/contactus", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        Origin: "http://localhost:3000/",
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        // Handle successful response
        console.log(response);
        alert("Message sent successfully!");
        // Reset form data after successful submission
        setFormData({ name: "", email: "", message: "" });
      })
      .catch((error) => {
        // Handle errors
        console.error("Error sending message:", error);
        alert("Failed to send message. Please try again later.");
      });
  };

  // Function to handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to handle language change
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <>
      {/* Language Selector */}
      <div className="language-selector">
        <label htmlFor="language">Language: </label>
        <select id="language" value={language} onChange={handleLanguageChange}>
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
        </select>
      </div>

      <section id="hero" className="d-flex align-items-center">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 pt-4 pt-lg-0 order-2 order-lg-1 d-flex flex-column justify-content-center">
              <img
                src="/images/logos_white.png"
                alt="NutriHelp Logo"
                style={{ width: "850px", height: "280px" }}
              />
              <h2>{translations[language].heroText}</h2>
              <div>
                <a href="#" className="btn-get-started scrollto">
                  {translations[language].getStarted}
                </a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img">
              <img src="images/30.png" className="img-fluid" alt="" />
            </div>
          </div>
        </div>
      </section>

      <main id="main">
        <section id="about" className="about">
          <div className="container">
            <div className="row">
              <div className="col-xl-5 col-lg-6 d-flex justify-content-center img-box align-items-stretch position-relative"></div>
              <div className="col-xl-7 col-lg-6 icon-boxes d-flex flex-column align-items-stretch justify-content-center py-5 px-lg-5">
                <h3>{translations[language].aboutTitle}</h3>
                <p>{translations[language].aboutDescription}</p>

                <div className="icon-box">
                  <div className="icon">
                    <i className="bx bx-heart"></i>
                  </div>
                  <h4 className="title">
                    <a href="">{translations[language].dietaryNeeds}</a>
                  </h4>
                  <p className="description">
                    {translations[language].dietaryNeedsDescription}
                  </p>
                </div>

                <div className="icon-box">
                  <div className="icon">
                    <i className="bx bx-plus-medical"></i>
                  </div>
                  <h4 className="title">
                    <a href="">{translations[language].createRecipes}</a>
                  </h4>
                  <p className="description">
                    {translations[language].createRecipesDescription}
                  </p>
                </div>

                <div className="icon-box">
                  <div className="icon">
                    <i className="bx bx-pulse"></i>
                  </div>
                  <h4 className="title">
                    <a href="">{translations[language].productScanning}</a>
                  </h4>
                  <p className="description">
                    {translations[language].productScanningDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="services section-bg">
          <div className="container">
            <div className="section-title">
              <h2>{translations[language].servicesTitle}</h2>
              <p>{translations[language].servicesDescription}</p>
            </div>

            <div className="row">
              <div className="col-lg-3 col-md-6">
                <div className="icon-box">
                  <div className="icon">
                    <img src="images/4.jpg" alt="" />
                  </div>
                  <h4 className="title">
                    <a href="#">{translations[language].mealPlanning}</a>
                  </h4>
                  <p className="description">
                    {translations[language].mealPlanningDescription}
                  </p>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="icon-box">
                  <div className="icon">
                    <img src="images/5.jpg" alt="" />
                  </div>
                  <h4 className="title">
                    <a href="#">{translations[language].dietaryNeeds}</a>
                  </h4>
                  <p className="description">
                    {translations[language].dietaryNeedsDescription}
                  </p>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="icon-box">
                  <div className="icon">
                    <img src="images/6.jpg" alt="" />
                  </div>
                  <h4 className="title">
                    <a href="#">{translations[language].createRecipes}</a>
                  </h4>
                  <p className="description">
                    {translations[language].createRecipesDescription}
                  </p>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="icon-box">
                  <div className="icon">
                    <img src="images/7.jpg" alt="" />
                  </div>
                  <h4 className="title">
                    <a href="#">{translations[language].productScanning}</a>
                  </h4>
                  <p className="description">
                    {translations[language].productScanningDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="contact">
          <div className="container">
            <div className="section-title">
              <h2>{translations[language].contactTitle}</h2>
              <p>{translations[language].contactDescription}</p>
            </div>

            <div className="row mt-5">
              <div className="col-lg-4">
                <div className="info">
                  <div className="address">
                    <i className="bi bi-geo-alt"></i>
                    <h4>Location:</h4>
                    <p>123123</p>
                  </div>

                  <div className="email">
                    <i className="bi bi-envelope"></i>
                    <h4>Email:</h4>
                    <p>info@example.com</p>
                  </div>

                  <div className="phone">
                    <i className="bi bi-phone"></i>
                    <h4>Call:</h4>
                    <p>+12132</p>
                  </div>
                </div>
              </div>

              <div className="col-lg-8 mt-5 mt-lg-0">
                <form
                  onSubmit={handleSubmit}
                  action="forms/contact.php"
                  method="post"
                  role="form"
                  className="php-email-form"
                >
                  <div className="row">
                    <div className="col-md-6 form-group">
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 form-group mt-3 mt-md-0">
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group mt-3">
                      <input
                        type="text"
                        className="form-control"
                        name="subject"
                        placeholder="Subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group mt-3">
                      <textarea
                        className="form-control"
                        name="message"
                        rows="5"
                        placeholder="Message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                  </div>
                  <button type="submit" className="submit-btn">
                    {translations[language].submit}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="footer">
        <div className="footer-newsletter">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <h4>{translations[language].subscribe}</h4>
                <p>{translations[language].subscribeDescription}</p>
                <form action="" method="post">
                  <input type="email" name="email" />
                  <input type="submit" value="Subscribe" />
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-top">
          <div className="container">
            <div className="row">
              <div className="col-lg-3 col-md-6 footer-contact">
                <h3>NutriHelp</h3>
                <hr />
                <p>1235584Y4Y83</p>
              </div>

              <div className="col-lg-3 col-md-6 footer-links">
                <h4>Connect with Us</h4>

                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
                <div className="social-links mt-3">
                  <a href="#" className="twitter">
                    <i className="bx bxl-twitter"></i>
                  </a>
                  <a href="#" className="facebook">
                    <i className="bx bxl-facebook"></i>
                  </a>
                  <a href="#" className="instagram">
                    <i className="bx bxl-instagram"></i>
                  </a>
                  <a href="#" className="google-plus">
                    <i className="bx bxl-skype"></i>
                  </a>
                  <a href="#" className="linkedin">
                    <i className="bx bxl-linkedin"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <button
        className="chatgpt-button"
        onClick={() => navigate("/chat")}
      >
        <FaRobot size={28} />
      </button>
    </>
  );
};

export default Home;