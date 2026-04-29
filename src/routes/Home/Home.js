import React, { useContext, useMemo, useState } from "react";
import { UserContext } from "../../context/user.context";
import "./Home.css";
import { faker } from "@faker-js/faker";
import { useDarkMode } from "../DarkModeToggle/DarkModeContext";
import { motion } from "framer-motion";
import FramerClient from "../../components/framer-client";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import {
  Facebook,
  HeartPulse,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Stethoscope,
  Twitter,
  Utensils,
  Bot,
  Quote,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail, ERROR_MESSAGES } from "../../utils/validationRules";
import FieldError from "../../components/FieldError";
import { toast } from "react-toastify";

const Home = () => {
  const { currentUser } = useContext(UserContext);
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();

  // Reviews
  const reviews = useMemo(
    () =>
      Array.from({ length: 15 }, () => ({
        avatar: faker.image.avatar(),
        name: faker.person.fullName(),
        review: faker.lorem.sentences(2),
        rating: Math.ceil(Math.random() * 5),
      })),
    []
  );

  // Service cards, bigger images
  const services = [
    {
      title: "Meal Planning",
      description:
        "Access a variety of nutritious meal plans and recipes designed to meet your everyday needs.",
      image: "/images/4.jpg",
      route: "/Meal",
      cta: "Learn More →",
    },
    {
      title: "Dietary Needs",
      description:
        "Customise plans based on dietary requirements, allergies, and preferences.",
      image: "/images/5.jpg",
      route: "/dietaryRequirements",
      cta: "Browse Options →",
    },
    {
      title: "Create Recipes",
      description:
        "Create personalised recipes tailored to your taste and nutrition goals.",
      image: "/images/6.jpg",
      route: "/createRecipe",
      cta: "Start Cooking →",
    },
    {
      title: "Product Scanning",
      description:
        "Scan a product to analyse nutrition and receive an easy-to-understand breakdown.",
      image: "/images/7.jpg",
      route: "/ScanProducts",
      cta: "Try Scanner →",
    },
  ];

  // Contact form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [contactErrors, setContactErrors] = useState({});
  const [contactTouched, setContactTouched] = useState({});

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const err = {};
    if (!formData.name.trim()) err.name = ERROR_MESSAGES.REQUIRED;
    const emailErr = validateEmail(formData.email);
    if (emailErr) err.email = emailErr;
    if (!formData.subject.trim()) err.subject = ERROR_MESSAGES.REQUIRED;
    if (!formData.message.trim()) err.message = ERROR_MESSAGES.REQUIRED;

    if (Object.keys(err).length > 0) {
      setContactErrors(err);
      setContactTouched({ name: true, email: true, subject: true, message: true });
      return;
    }

    fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}/api/contactus`, {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        Origin: "http://localhost:3000/",
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to send message");
        toast.success("Message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setContactErrors({});
        setContactTouched({});
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        toast.error("Failed to send message. Please try again later.");
      });
  };

  const [subscriptEmail, setSubscriptEmail] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const [newsletterTouched, setNewsletterTouched] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(subscriptEmail);
    if (emailErr) {
      setNewsletterError(emailErr);
      setNewsletterTouched(true);
      return;
    }

    fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}/api/home/subscribe`, {
      method: "POST",
      body: JSON.stringify({ email: subscriptEmail }),
      headers: {
        Origin: "http://localhost:3000/",
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to Subscribe");
        toast.success("Subscribed successfully!");
        setSubscriptEmail("");
        setNewsletterError("");
        setNewsletterTouched(false);
      })
      .catch((error) => {
        console.error("Error Subscribe message:", error);
        toast.error("Failed to Subscribe. Please try again later.");
      });
  };

  const onGetStarted = () => {
    // If logged in, go to dashboard (menu/meal details); otherwise login
    navigate(currentUser ? "/dashboard" : "/login");
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [activeReview, setActiveReview] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState(null);

  const onAssistant = () => {
    navigate(currentUser ? "/chat" : "/login");
  };

  return (
    <FramerClient>
      <main className={`home ${darkMode ? "home-dark" : ""}`}>
        {/* == HERO == */}
        <section className="home-hero" aria-label="NutriHelp hero">
          <div className="home-hero-inner">
            <motion.div
              className="home-hero-left"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="home-hero-title">Personalised Nutrition for Better Health</h1>
              <p className="home-hero-subtitle">
                NutriHelp supports you in managing your general wellbeing and
                nutrient-related conditions through personalised nutrition
                advice.
              </p>

              <div className="home-hero-actions">
                <button className="hero-btn-primary" type="button" onClick={onGetStarted}>
                  Get started
                </button>
                <button className="hero-btn-secondary" type="button" onClick={() => scrollToSection("contact")}>
                  Contact Us
                </button>
              </div>
            </motion.div>

            <motion.div
              className="home-hero-right"
              initial={{ opacity: 0, x: 120 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              {/* effect image approach, but consistent */}
              <img
                src="/images/hero_illustration.png"
                alt="Illustration of healthy food items in a circle"
                className="home-hero-illustration"
                loading="lazy"
              />
            </motion.div>
          </div>
        </section>

        {/* == ABOUT == */}
        <section id="about" className="home-about" aria-label="About NutriHelp">
          <div className="home-container about-inner">
            <div className="about-header">
              <h2 className="section-title">NutriHelp</h2>
              <p className="section-lead">
                NutriHelp assists you in managing your overall well-being,
                preventing nutrient-related diseases, and overcoming
                deficiencies through personalised nutrition plans.
              </p>
            </div>

            <div className="about-features" role="list">
              <div className="about-feature" role="listitem">
                <HeartPulse size={36} aria-hidden="true" className="feature-icon" />
                <h3>Diagnosis</h3>
                <p>Identify nutritional risks early with accurate assessments.</p>
              </div>

              <div className="about-feature" role="listitem">
                <Stethoscope size={36} aria-hidden="true" className="feature-icon" />
                <h3>Personalised plan</h3>
                <p>Tailored nutrition guidance to support your health goals.</p>
              </div>

              <div className="about-feature" role="listitem">
                <Utensils size={36} aria-hidden="true" className="feature-icon" />
                <h3>Dine Pad</h3>
                <p>Smart meal tracking and recommendations for balanced eating.</p>
              </div>
            </div>
          </div>
        </section>

        {/* == SERVICES (BIG images, modern card look) == */}
        <section className="home-services" aria-label="NutriHelp services">
          <div className="home-container">
            <header className="section-header services-header">
              <div className="services-header-left">
                <h2 className="section-title">Our Services</h2>
                <p className="section-lead">
                  Explore key services designed to support your nutrition journey.
                </p>
              </div>
              <Link to="/searchRecipes" className="explore-all">
                Explore all services <ArrowRight size={20} />
              </Link>
            </header>

            <div className="services-grid">
              {services.map((s, i) => (
                <motion.article
                  key={i}
                  className="service-card"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    type="button"
                    className="service-card-btn"
                    onClick={() => navigate(s.route)}
                    aria-label={`Learn more about ${s.title}`}
                  >
                    <img src={s.image} alt={s.title} className="service-image" loading="lazy" />
                    <div className="service-body">
                      <h3 className="service-title">{s.title}</h3>
                      <p className="service-desc">{s.description}</p>
                      <span className="service-cta">{s.cta}</span>
                    </div>
                  </button>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* == REVIEWS == */}
        <section className="home-reviews" aria-label="User reviews">
          <div className="home-container">
            <Swiper
              onSwiper={setSwiperInstance}
              onSlideChange={(swiper) => setActiveReview(swiper.activeIndex)}
              modules={[Pagination, Navigation]}
              className="reviews-slider"
            >
              {reviews.map((review, index) => (
                <SwiperSlide key={index} className="review-slide-full">
                  <div className={`review-split ${darkMode ? "review-split-dark" : ""}`}>
                    <div className="review-content-left">
                      <Quote className="review-quote-icon" size={40} fill="currentColor" opacity={0.2} />
                      <h2 className="review-text-large">“{review.review}”</h2>
                      <div className="review-user-block">
                        <img
                          src={review.avatar}
                          alt={`${review.name}'s avatar`}
                          className="review-avatar"
                          loading="lazy"
                        />
                        <div className="review-user-info">
                          <h3 className="review-name">{review.name}</h3>
                          <span className="review-verified">Verified user</span>
                        </div>
                      </div>
                      <div className="review-rating" aria-label={`Rating ${review.rating} out of 5`}>
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                    <div className="review-image-right">
                      <img src="/images/7.jpg" alt="Review related view" className="review-large-img" />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="review-nav-footer">
              <button 
                className="review-nav-btn" 
                onClick={() => swiperInstance?.slidePrev()}
                aria-label="Previous review"
              >
                <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
              </button>
              
              <span className="review-status">Review {activeReview + 1} of {reviews.length}</span>

              <button 
                className="review-nav-btn" 
                onClick={() => swiperInstance?.slideNext()}
                aria-label="Next review"
              >
                <ChevronRight size={20} />
              </button>
            </div>



          </div>
        </section>

        {/* == CONTACT == */}
        <section id="contact" className="home-contact" aria-label="Contact us">
          <div className="home-container">
            <header className="section-header">
              <h2 className="section-title">Contact Us</h2>
              <p className="section-lead">
                Have questions or need assistance? Reach out to us.
              </p>
            </header>

            <div className="contact-form-wrapper">
              <form className="contact-form" onSubmit={handleSubmit} aria-label="Contact form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={() => setContactTouched(prev => ({ ...prev, name: true }))}
                      style={{ borderColor: contactErrors.name && contactTouched.name ? 'var(--error-color, red)' : '' }}
                    />
                    <FieldError error={contactErrors.name} touched={contactTouched.name} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => setContactTouched(prev => ({ ...prev, email: true }))}
                      style={{ borderColor: contactErrors.email && contactTouched.email ? 'var(--error-color, red)' : '' }}
                    />
                    <FieldError error={contactErrors.email} touched={contactTouched.email} />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    onBlur={() => setContactTouched(prev => ({ ...prev, subject: true }))}
                    style={{ borderColor: contactErrors.subject && contactTouched.subject ? 'var(--error-color, red)' : '' }}
                  />
                  <FieldError error={contactErrors.subject} touched={contactTouched.subject} />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={() => setContactTouched(prev => ({ ...prev, message: true }))}
                    style={{ borderColor: contactErrors.message && contactTouched.message ? 'var(--error-color, red)' : '' }}
                  />
                  <FieldError error={contactErrors.message} touched={contactTouched.message} />
                </div>

                <button type="submit" className="btn-primary btn-full btn-send">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* == FOOTER (social links + contact) == */}
        <footer className="home-footer" aria-label="Footer">
          <div className="footer-inner home-container">
            
            <div className="footer-column footer-brand">
              <img src="/images/logo.png" alt="NutriHelp logo" className="footer-logo" />
              <div className="footer-details">
                <div className="footer-detail-row">
                  <span>799 Nutrihelp Rd,<br/>Melbourne, Vic, 3000</span>
                </div>
                <div className="footer-detail-row">
                  <span>info@nutrihelp.com.au<br/>1300 798 999</span>
                </div>
              </div>
            </div>

            <div className="footer-column footer-nav-col">
              <h3>NAVIGATION</h3>
              <ul className="footer-nav-list">
                <li><button type="button" onClick={() => scrollToSection("about")}>About</button></li>
                <li><Link to="/faq">Privacy</Link></li>
                <li><Link to="/faq">Terms</Link></li>
                <li><button type="button" onClick={() => scrollToSection("contact")}>Contact</button></li>
              </ul>
            </div>

            <div className="footer-column footer-social-col">
              <h3>SOCIAL</h3>
              <div className="footer-social" aria-label="Social media links">
                <a href="#" aria-label="Facebook"><Facebook size={20}/></a>
                <a href="#" aria-label="Instagram"><Instagram size={20}/></a>
                <a href="#" aria-label="LinkedIn"><Linkedin size={20}/></a>
                <a href="#" aria-label="Twitter"><Twitter size={20}/></a>
              </div>
            </div>

            <div className="footer-column footer-newsletter">
              <h3>NEWSLETTER</h3>
              <p>Stay updated with our latest news and insights.</p>
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <label className="sr-only" htmlFor="newsletterEmail">Email</label>
                <div className="newsletter-input-group">
                  <input
                    id="newsletterEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={subscriptEmail}
                    onChange={(e) => {
                      setSubscriptEmail(e.target.value);
                      setNewsletterError("");
                    }}
                    onBlur={() => setNewsletterTouched(true)}
                    style={{ borderColor: newsletterError && newsletterTouched ? 'red' : '' }}
                  />
                  <button type="submit" className="btn-primary btn-subscribe">
                    Subscribe
                  </button>
                </div>
                <FieldError error={newsletterError} touched={newsletterTouched} />
              </form>
            </div>

          </div>
          <div className="footer-bottom">
            <p className="copyright">©️ 2026 NutriHelp. All rights reserved.</p>
          </div>
        </footer>

        {/* == Floating Assistant Button == */}
        <button
          className="assistant-btn"
          aria-label="Open assistant"
          type="button"
          onClick={onAssistant}
        >
          <Bot size={26} aria-hidden="true" />
          <span>Assistant</span>
        </button>
      </main>
    </FramerClient>
  );
};

export default Home;