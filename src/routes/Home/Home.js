import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../../context/user.context";
import "./Home.css";
import { faker } from "@faker-js/faker";
import { useDarkMode } from "../DarkModeToggle/DarkModeContext";
import { motion } from "framer-motion";
import FramerClient from "../../components/framer-client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import {
  Apple,
  Brain,
  Dumbbell,
  Facebook,
  HeartPulse,
  Instagram,
  Linkedin,
  Leaf,
  MilkOff,
  Sparkles,
  Snowflake,
  Twitter,
  Utensils,
  Scale,
  Droplets,
  Users,
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
      route: "/scan",
      cta: "Try Scanner →",
    },
  ];

  const superSnackBenefits = [
    { Icon: Apple, label: "organic fruits & veggies" },
    { Icon: Dumbbell, label: "plant protein" },
    { Icon: HeartPulse, label: "prebiotic fiber" },
    { Icon: Brain, label: "flax & omega-3s" },
    { Icon: Sparkles, label: "vitamins & minerals" },
    { Icon: Scale, label: "no sugar added" },
    { Icon: Snowflake, label: "no refrigeration needed" },
    { Icon: Users, label: "for adults & kids" },
  ];

  const superSnackHighlights = [
    { Icon: Sparkles, label: "vibrant, elevated flavors", tone: "orange" },
    { Icon: Droplets, label: "smooth & refreshing", tone: "blue" },
    { Icon: Leaf, label: "packed full of superfoods", tone: "green" },
    { Icon: MilkOff, label: "effortless, grab & go meal", tone: "magenta" },
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
  const aboutSectionRef = useRef(null);

  const onAssistant = () => {
    navigate(currentUser ? "/chat" : "/login");
  };

  useEffect(() => {
    const lockHeroMaxWidth = () => {
      const width = window.screen?.width || window.innerWidth;
      document.documentElement.style.setProperty("--home-hero-max-width", `${width}px`);
    };

    lockHeroMaxWidth();
    window.addEventListener("orientationchange", lockHeroMaxWidth);

    return () => {
      window.removeEventListener("orientationchange", lockHeroMaxWidth);
    };
  }, []);

  useEffect(() => {
    const aboutSection = aboutSectionRef.current;
    if (!aboutSection) return undefined;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      aboutSection.style.setProperty("--about-progress", "1");
      return undefined;
    }

    let rafId = null;
    const updateAboutProgress = () => {
      const rect = aboutSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const triggerRange = viewportHeight * 0.85;

      const enterProgress = (viewportHeight - rect.top) / triggerRange;
      const exitProgress = rect.bottom / triggerRange;
      const rawProgress = Math.min(enterProgress, exitProgress);
      const progress = Math.max(0, Math.min(1, rawProgress));

      aboutSection.style.setProperty("--about-progress", progress.toFixed(4));
      rafId = null;
    };

    const queueUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateAboutProgress);
    };

    queueUpdate();
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);

    return () => {
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <FramerClient>
      <main className={`home ${darkMode ? "home-dark" : ""}`}>
        {/* == HERO == */}
        <section className="home-hero" aria-label="NutriHelp hero">
          <div className="home-hero-split">
            {/* Left: full-bleed food photo */}
            <motion.div
              className="home-hero-left"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src="/images/home_hero_left.png"
                alt="Nutritious foods and healthy ingredients"
                className="home-hero-illustration"
                loading="lazy"
              />
              <div className="hero-left-overlay" aria-hidden="true" />
              <motion.div
                className="hero-floating-badge"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden="true"
              >
                <span className="hero-badge-pulse" />
                <span>Science-backed nutrition</span>
              </motion.div>
            </motion.div>

            {/* Right: editorial content */}
            <motion.div
              className="home-hero-right"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.11, delayChildren: 0.2 } },
              }}
            >
              {/* Row 1: eyebrow + title group */}
              <motion.div
                className="hero-title-group"
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                <div className="hero-eyebrow">
                  <span className="hero-eyebrow-dot" aria-hidden="true" />
                  Your Health. Personalised.
                </div>
                <h1 className="home-hero-title">
                  <span className="hero-title-line1">Empower</span>
                  <span className="hero-title-line2">Journey</span>
                </h1>
              </motion.div>

              {/* Row 2: divider */}
              <motion.div
                className="home-hero-divider"
                aria-hidden="true"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 0.45 } },
                }}
              >
                <span>GOALS</span>
                <div className="home-hero-divider-line" />
                <span>HEALTH</span>
              </motion.div>

              {/* Row 3: blob image */}
              <motion.div
                className="home-hero-blob"
                variants={{
                  hidden: { opacity: 0, scale: 0.96, y: 12 },
                  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                <img
                  src="/images/home_hero_right.png"
                  alt="Fresh fruit smoothie and nutritious ingredients"
                  className="home-hero-right-image"
                  loading="lazy"
                />
                <div className="hero-right-berries" aria-hidden="true">
                  <span className="hero-right-berry hero-right-berry-1">
                    <img src="/images/hero_blueberry.png" alt="" loading="lazy" />
                  </span>
                  <span className="hero-right-berry hero-right-berry-2">
                    <img src="/images/hero_blueberry.png" alt="" loading="lazy" />
                  </span>
                </div>
              </motion.div>

              {/* Row 4: summary + pillars */}
              <motion.div
                className="home-hero-bottom"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                <div className="home-hero-summary">
                  <h2>Our 4 Nutri-help Pillars</h2>
                  <p>
                    Practical nutrition support to build healthy habits, improve
                    energy, and stay consistent with long-term wellness goals.
                  </p>
                  {/* <div className="home-hero-actions">
                    <button className="hero-btn-primary" type="button" onClick={onGetStarted}>
                      <span className="hero-btn-track">
                        <span className="hero-btn-icon" aria-hidden="true">
                          <ArrowRight size={24} />
                        </span>
                        <span className="hero-btn-text hero-btn-text-start">Get Started</span>
                        <span className="hero-btn-text hero-btn-text-end">Boost Your Life Style</span>
                      </span>
                    </button>
                  </div> */}
                </div>

                <div className="home-hero-actions">
                    <button className="hero-btn-primary" type="button" onClick={onGetStarted}>
                      <span className="hero-btn-track">
                        <span className="hero-btn-icon" aria-hidden="true">
                          <ArrowRight size={24} />
                        </span>
                        <span className="hero-btn-text hero-btn-text-start">Get Started</span>
                        <span className="hero-btn-text hero-btn-text-end">Boost Your Life Style</span>
                      </span>
                    </button>
                </div>
                {/* <ul className="home-hero-pillars" aria-label="Nutri-help pillars">
                  {[
                    { Icon: Utensils, label: "Balanced Meals" },
                    { Icon: Scale, label: "Smart Portion Control" },
                    { Icon: HeartPulse, label: "Quality Protein Choices" },
                    { Icon: Droplets, label: "Daily Hydration" },
                  ].map(({ Icon, label }, i) => (
                    <li key={label}>
                      <span className="pillar-num" aria-hidden="true">0{i + 1}</span>
                      <span className="pillar-icon" aria-hidden="true">
                        <Icon size={16} />
                      </span>
                      <p>{label}</p>
                    </li>
                  ))}
                </ul> */}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* == ABOUT == */}
        <section
          id="about"
          ref={aboutSectionRef}
          className="home-about"
          aria-label="About NutriHelp"
        >
          <div className="home-container about-spotlight">
            <div className="about-spotlight-copy">
              <h2 className="about-spotlight-title">Your personal nutritionist</h2>
              <p className="about-spotlight-text">
                We bridge the gap between complex dietary science and your daily life.
                Our approach combines personalized meal planning with medical-grade
                nutritional support, ensuring every bite is tailored to your unique
                health needs and preferences.
              </p>
            </div>

            <div className="about-spotlight-media" aria-hidden="true">
              <img
                src="/images/about_spotlight_main.png"
                alt=""
                className="about-spotlight-main"
                loading="lazy"
              />
              <img
                src="/images/symptom_assessment/grilled_chicken.jpg"
                alt=""
                className="about-spotlight-accent"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* == SUPERFOOD STORY == */}
        <section className="home-super-snack" aria-label="Superfood meal feature">
          <div className="home-container">
            <div className="super-snack-benefits" role="list" aria-label="Benefits">
              {superSnackBenefits.map(({ Icon, label }) => (
                <article key={label} className="super-benefit-item" role="listitem">
                  <span className="super-benefit-icon" aria-hidden="true">
                    <Icon size={30} />
                  </span>
                  <p>{label}</p>
                </article>
              ))}
            </div>

            <div className="super-snack-hero">
              <div className="super-snack-copy">
                <span className="super-snack-pill">ditch the dry bar</span>
                <h2>
                  a new kind
                  <br />
                  of super
                  <br />
                  snack
                </h2>
                <p>
                  Our nutrient-rich bowls combine freshness, balanced macros,
                  and clean ingredients in a convenient format for everyday health.
                </p>
              </div>

              <div className="super-snack-visual">
                <div className="super-snack-bg" aria-hidden="true" />
                <img
                  src="/images/home-super-snack/meal-plate.png"
                  alt="Healthy meal plate"
                  className="super-snack-plate"
                  loading="lazy"
                />

                <div className="super-snack-highlights">
                  {superSnackHighlights.map(({ Icon, label, tone }) => (
                    <div key={label} className="super-highlight-row">
                      <span className={`super-highlight-dot ${tone}`} aria-hidden="true">
                        <Icon size={24} />
                      </span>
                      <p>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* == TOOLS == */}
        <section className="home-services home-tools" aria-label="Our Tools for Healthy Aging">
          <div className="home-container">
            <header className="home-tools-header">
              <p className="home-tools-try">TRY NOW</p>
              <h2 className="home-tools-title">Our Services</h2>
            </header>

            <Swiper
              modules={[Pagination, Autoplay]}
              className="home-tools-carousel"
              grabCursor
              centeredSlides
              initialSlide={0}
              loop
              speed={6200}
              spaceBetween={24}
              touchEventsTarget="container"
              touchStartPreventDefault={false}
              autoplay={{
                delay: 1,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                waitForTransition: false,
              }}
              preventClicks={false}
              preventClicksPropagation={false}
              slideToClickedSlide
              watchSlidesProgress
              slidesPerView={1.12}
              breakpoints={{
                640: { slidesPerView: 1.5, spaceBetween: 18 },
                992: { slidesPerView: 3, spaceBetween: 26 },
                1280: { slidesPerView: 3, spaceBetween: 28 },
              }}
              pagination={{ clickable: true }}
            >
              {services.map((s, i) => (
                <SwiperSlide key={s.title} className="home-tools-slide">
                  <article className="home-tools-card w-100">
                    <button
                      type="button"
                      className="home-tools-card-btn"
                      onClick={() => navigate(s.route)}
                      aria-label={`Learn more about ${s.title}`}
                    >
                      <div className="home-tools-card-media">
                        <img src={s.image} alt={s.title} className="home-tools-card-image" loading="lazy" />
                        <span className="home-tools-card-index">{String(i + 1).padStart(2, "0")}</span>
                      </div>

                      <div className="home-tools-card-body">
                        <h3 className="home-tools-card-title">{s.title}</h3>
                        <p className="home-tools-card-desc">{s.description}</p>
                        <span className="home-tools-card-cta">{s.cta.replace("→", "").trim()}</span>
                      </div>
                    </button>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>
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
            <div className="home-contact-layout">
              <div className="home-contact-intro">
                <h2 className="home-contact-title">Let's Begin Your Wellness Journey</h2>
                <p className="home-contact-lead">
                  We are here to simplify your nutrition journey. Reach out to schedule
                  a personalized consultation and start your path to healthy aging today.
                </p>             
              </div>

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
                        placeholder="example@email.com"
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
                      placeholder="Tell us about your dietary goals or concerns"
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
