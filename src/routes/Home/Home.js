import "./Home.css";

import React, { useContext, useEffect, useState } from "react";

import { Link } from "react-router-dom";
import { UserContext } from "../../context/user.context";

import { faker } from "@faker-js/faker";

const Home = () => {
  const { currentUser } = useContext(UserContext);

  const [showHeader, setShowHeader] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

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


  const generateReviews = () => {
    const reviews = Array.from({ length: 5 }, () => ({
      avatar: faker.image.avatar(),
      name: faker.name.fullName(),
      review: faker.lorem.sentences(2),
      rating: Math.ceil(Math.random() * 5),
    }));
    return reviews;
  };

  const reviews = generateReviews();

  return (
    <>
      <section id="hero" className="d-flex align-items-center">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 pt-4 pt-lg-0 order-2 order-lg-1 d-flex flex-column justify-content-center">
              <img
                src="/images/logos_white.png"
                alt="NutriHelp Logo"
                style={{ width: "850px", height: "280px" }}
              />
              <h2>
                NutriHelp supports you in managing your general wellbeing,
                nutrient-related diseases and deficiencies through personalised
                nutrition advice
              </h2>
              <div>
                <a href="#" className="btn-get-started scrollto">
                  Get Started
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
                <h3>NutriHelp</h3>
                <p>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Voluptas accusamus eum architecto laboriosam autem quasi
                  consectetur quia tempora, voluptatibus nemo asperiores
                  similique exercitationem et quam cum dignissimos eveniet magni
                  ipsam!
                </p>

                <div className="icon-box">
                  <div className="icon">
                    <i className="bx bx-heart"></i>
                  </div>
                  <h4 className="title">
                    <a href="">Diagnosis</a>
                  </h4>
                  <p className="description">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Delectus iste totam corporis, autem laborum quas dolorem ab
                    quae debitis aliquid eveniet, cum provident non, corrupti
                    sequi praesentium voluptate atque! Porro!
                  </p>
                </div>

                <div className="icon-box">
                  <div className="icon">
                    <i className="bx bx-plus-medical"></i>
                  </div>
                  <h4 className="title">
                    <a href="">Personalized plan</a>
                  </h4>
                  <p className="description">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Modi cupiditate, cum aut expedita porro architecto
                    doloremque labore sed, beatae facere officia veniam
                    doloribus dolore veritatis ab voluptates recusandae nulla?
                    Ipsam.
                  </p>
                </div>

                <div className="icon-box">
                  <div className="icon">
                    <i className="bx bx-pulse"></i>
                  </div>
                  <h4 className="title">
                    <a href="">Dine Pad</a>
                  </h4>
                  <p className="description">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum
                    laudantium itaque consequatur autem ad beatae veritatis
                    totam quaerat voluptate distinctio quam accusamus, enim
                    voluptatum soluta commodi, nihil qui deleniti ipsum.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="services section-bg">
          <div className="container">
            <div className="section-title">
              <h2>Services</h2>
              <p>
                At NutriHelp, we offer a range of services designed to support
                your overall well-being and nutritional needs. Our dedicated
                team is committed to providing personalized solutions to help
                you achieve your health goals and improve your quality of life.
                Explore our key services below:
              </p>
            </div>

            <div className="row">
              <div className="col-lg-3 col-md-6">
                <div className="icon-box">
                  <div className="icon">
                    <img src="images/4.jpg" alt="" />
                  </div>
                  <h4 className="title">
                    <a href="#">Meal Planning</a>
                  </h4>
                  <p className="description">
                    Access a variety of nutritious meal plans and recipes
                    designed to meet your everyday nutritional needs and
                    preferences.
                  </p>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="icon-box">
                  <div className="icon">
                    <img src="images/5.jpg" alt="" />
                  </div>
                  <h4 className="title">
                    <a href="#">Dietary Needs</a>
                  </h4>
                  <p className="description">
                    Our meal planning services cater to specific dietary
                    requirements, allowing you to customize meal plans based on
                    your needs.
                  </p>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="icon-box">
                  <div className="icon">
                    <img src="images/6.jpg" alt="" />
                  </div>
                  <h4 className="title">
                    <a href="#">Create Recipes</a>
                  </h4>
                  <p className="description">
                    Create your own personalized recipes tailored to your taste
                    preferences and dietary requirements that suit your
                    lifestyle.
                  </p>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="icon-box">
                  <div className="icon">
                    <img src="images/7.jpg" alt="" />
                  </div>
                  <h4 className="title">
                    <a href="#">Product Scanning</a>
                  </h4>
                  <p className="description">
                    Upload an image of a product to analyze its nutritional
                    content and receive a detailed breakdown of its nutrients
                    through a visual pie chart.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        <section id="reviews" className="reviews section-bg">
          <div className="container">
            <div className="section-title">
              <h2>User Reviews</h2>
              <p>See what our users have to say about NutriHelp!</p>
            </div>

            <div className="row">
              {reviews.map((review, index) => (
                <div key={index} className="col-lg-4 col-md-6 mb-4">
                  <div className="review-card">
                    <img
                      src={review.avatar}
                      alt={`${review.name}'s avatar`}
                      className="review-avatar"
                    />
                    <h4 className="review-name">{review.name}</h4>
                    <div className="review-rating">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                    <p className="review-text">{review.review}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>



        <section id="contact" className="contact">
          <div className="container">
            <div className="section-title">
              <h2>Contact</h2>
              <p>
                Have questions or need assistance? Reach out to us! We are here
                to help you with any inquiries you may have.
              </p>
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
                    Submit
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
                <h4>Subscribe to our Newsletter</h4>
                <p>Lorem ipsum dolor sit amet consecte.</p>
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
    </>
  );
};

export default Home;
