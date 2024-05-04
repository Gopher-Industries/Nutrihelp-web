import './Home.css';

import React, { useContext, useEffect, useState } from 'react';

import CreateAccountPopUp from './CreateAccountPopUp';
import { Link } from 'react-router-dom';
import LoginPopUp from './LoginPopUp';
import { UserContext } from "../../context/user.context";
//import axios from 'axios'; // Import axios for making HTTP requests

const Home = () => {

    const { currentUser } = useContext(UserContext)
    const isLoggedIn = Boolean(currentUser);

    const [createPopUp, setCreatePopup] = useState(false);
    const [loginPopUp, setLoginPopup] = useState(false);

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
    
        window.addEventListener('scroll', handleScroll);

        return () => {

            window.removeEventListener('scroll', handleScroll);
        };
      }, [prevScrollPos]);

      const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
  
    // Make the fetch request
    fetch('http://localhost:80/api/contactus', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
                'Origin': 'http://localhost:3000/',
            'Content-Type': 'application/json'
        },
    })
    .then((response) => {
        // Handle successful response
        console.log(response);
        alert('Message sent successfully!');
        // Reset form data after successful submission
        setFormData({ name: '', email: '', message: '' });
    })
    .catch((error) => {
        // Handle errors
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again later.');
    });
    };

    // Function to handle form input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <>
            {!isLoggedIn && (
                <header id="header" className={`fixed-top ${showHeader ? 'header-visible' : 'header-hidden'}`}>
                    <div className="container d-flex align-items-center justify-content-between">
                        <a href="index.html" className="logo">
                            <img src="" alt="" />
                        </a>
                        <nav id="navbar" className="navbar">
                            <ul>
                                <li>
                                    <a className="nav-link scrollto active" href="index.html">
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <a className="nav-link scrollto" href="#about">
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a className="nav-link scrollto" href="#services">
                                        Services
                                    </a>
                                </li>
                                <li>
                                    <a className="nav-link scrollto" href="#contact">
                                        Contact
                                    </a>
                                </li>

                                <li>
                                    <Link onClick={() => setLoginPopup(true) & setCreatePopup(false)} className="nav-link scrollto">
                                        Sign In
                                    </Link>
                                </li>

                                <li>
                                    <Link onClick={() => setCreatePopup(true) & setLoginPopup(false)} className="nav-link scrollto">
                                        Create Account
                                    </Link>
                                </li>

                            </ul>
                        </nav>
                    </div>
                </header>
            )}

            <section id="hero" className="d-flex align-items-center">
      
                <CreateAccountPopUp trigger={createPopUp} setTrigger={setCreatePopup}>
                </CreateAccountPopUp>

                <LoginPopUp trigger={loginPopUp} setTrigger={setLoginPopup}>
                </LoginPopUp>

                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 pt-4 pt-lg-0 order-2 order-lg-1 d-flex flex-column justify-content-center">
                        <img src="/images/logos_white.png" alt="NutriHelp Logo" style={{ width: '850px', height: '280px' }} />
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
                                        Modi cupiditate, cum aut expedita porro architecto doloremque
                                        labore sed, beatae facere officia veniam doloribus dolore
                                        veritatis ab voluptates recusandae nulla? Ipsam.
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
                                        laudantium itaque consequatur autem ad beatae veritatis totam
                                        quaerat voluptate distinctio quam accusamus, enim voluptatum
                                        soluta commodi, nihil qui deleniti ipsum.
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
                                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Animi
                                mollitia alias consectetur doloremque voluptates, eos voluptate
                                eligendi, vitae, quia est perferendis molestias laborum beatae
                                deserunt placeat blanditiis cumque magnam in!
                            </p>
                        </div>

                        <div className="row">
                            <div className="col-lg-4 col-md-6">
                                <div className="icon-box">
                                    <div className="icon">
                                        <img src="images/3.png" alt="" />
                                    </div>
                                    <h4 className="title">
                                        <a href="">Lorem Ipsum</a>
                                    </h4>
                                    <p className="description">
                                        Voluptatum deleniti atque corrupti quos dolores et quas
                                        molestias excepturi sint occaecati cupiditate non provident
                                    </p>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6">
                                <div className="icon-box">
                                    <div className="icon">
                                        <img src="images/2.png" alt="" />
                                    </div>
                                    <h4 className="title">
                                        <a href="">Dolor Sitema</a>
                                    </h4>
                                    <p className="description">
                                        Minim veniam, quis nostrud exercitation ullamco laboris nisi
                                        ut aliquip ex ea commodo consequat tarad limino ata
                                    </p>
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6" data-wow-delay="0.1s">
                                <div className="icon-box">
                                    <div className="icon">
                                        <img src="images/1.png" alt="" />
                                    </div>
                                    <h4 className="title">
                                        <a href="">Sed ut perspiciatis</a>
                                    </h4>
                                    <p className="description">
                                        Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                                        Magnam quas atque qui, iusto debitis modi labore fugit
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="contact" className="contact">
            <div className="container">
                <div className="section-title">
                    <h2>Contact</h2>
                    <p>Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex aliquid fuga eum quidem.</p>
                </div>

                <div className="row mt-5">
                    <div className="col-lg-8 mt-5 mt-lg-0">
                        <form onSubmit={handleSubmit} className="php-email-form">
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
                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <button type="submit" className="btn btn-primary">Submit</button>
                            </div>
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

                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                </p>
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
