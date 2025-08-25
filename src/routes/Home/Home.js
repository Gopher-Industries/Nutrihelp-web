import React, { useContext, useEffect, useState } from "react";
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
} from "lucide-react";

const Home = () => {
  const { currentUser } = useContext(UserContext);

  const [showHeader, setShowHeader] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const { darkMode } = useDarkMode();

  /*   useEffect(() => {
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
  }, [prevScrollPos]); */

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
    const reviews = Array.from({ length: 20 }, () => ({
      avatar: faker.image.avatar(),
      name: faker.name.fullName(),
      review: faker.lorem.sentences(2),
      rating: Math.ceil(Math.random() * 5),
    }));
    return reviews;
  };

  const reviews = generateReviews();

  const servicesData = [
    {
      title: "Meal Planning",
      description:
        "Access a variety of nutritious meal plans and recipes designed to meet your everyday nutritional needs and preferences.",
      image: "images/4.jpg",
    },
    {
      title: "Dietary Needs",
      description:
        "Our meal planning services cater to specific dietary requirements, allowing you to customize meal plans based on your needs.",
      image: "images/5.jpg",
    },
    {
      title: "Create Recipes",
      description:
        "Create your own personalized recipes tailored to your taste preferences and dietary requirements that suit your lifestyle.",
      image: "images/6.jpg",
    },
    {
      title: "Product Scanning",
      description:
        "Upload an image of a product to analyze its nutritional content and receive a detailed breakdown of its nutrients through a visual pie chart.",
      image: "images/7.jpg",
    },
  ];

  return (
    <FramerClient>
      <section
        className={`relative ${
          darkMode
            ? "bg-gradient-to-b from-slate-900 via-blue-900 to-bg"
            : "bg-gradient-to-b from-violet-500 via-fuchsia-500 to-bg"
        }`}
      >
        <div className="bg-transparent" id="no-bg">
          <div
            className={`w-screen flex flex-col md:flex-row justify-between items-center p-10 bg-transparent`}
            id="no-bg"
          >
            <div className={`shadow-none bg-transparent`} id="no-bg">
              <img src="/images/logos_white.png" alt="" className="w-[600px]" />
              <h2
                className={`text-4xl text-start leading-relaxed ${
                  darkMode ? "text-blue-300" : "text-black"
                }`}
              >
                NutriHelp supports you in managing your general wellbeing,
                nutrient-related diseases and deficiencies through personalised
                nutrition advice
              </h2>
              <div
                className={`flex justify-start items-center mt-6 shadow-none bg-transparent`}
                id="no-bg"
              >
                <button
                  type="button"
                  className={`h-16 w-64 font-medium rounded-lg text-2xl px-5 py-2.5 text-center me-2 mb-2 shadow-md ${
                    darkMode
                      ? "text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800"
                      : "text-gray-700 bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
                  }`}
                >
                  Get Start
                </button>
              </div>
            </div>
            <div className={`shadow-none bg-transparent`}>
              <motion.img
                initial={{
                  x: 200,
                  opacity: 0,
                }}
                transition={{ duration: 1 }}
                whileInView={{ opacity: 1, x: 0 }}
                src="https://cdni.iconscout.com/illustration/premium/thumb/cakes-taste-and-quality-feedback-illustration-download-in-svg-png-gif-file-formats--food-app-happy-customer-drink-illustrations-3444786.png"
              />
            </div>
          </div>
        </div>
      </section>

      <main>
        <section
          id="about"
          className={`w-screen py-16 ${
            darkMode ? "bg-transparent text-white" : "bg-gray-100 text-gray-900"
          }`}
        >
          <div
            id="no-bg"
            className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 md:px-12 lg:px-20"
          >
            <motion.img
              initial={{ x: -200, opacity: 0 }}
              transition={{ duration: 1 }}
              whileInView={{ opacity: 1, x: 0 }}
              src="https://cdni.iconscout.com/illustration/premium/thumb/doctor-consultation-illustration-download-in-svg-png-gif-file-formats--checking-patient-medical-check-up-hospital-checkup-anamnesis-system-pack-healthcare-illustrations-7065409.png"
              className="w-full md:w-[500px] rounded-md shadow-lg"
              alt="Doctor Consultation"
            />
            <div id="no-bg" className="md:w-1/2 mt-8 md:mt-0 md:pl-12">
              <h3 className="text-4xl font-bold mb-6 dark:text-blue-300">
                NutriHelp
              </h3>
              <p className="text-lg leading-relaxed mb-6">
                NutriHelp assists you in managing your overall well-being,
                preventing nutrient-related diseases, and overcoming
                deficiencies through personalized nutrition plans.
              </p>
              <div id="no-bg" className="space-y-6">
                <div id="no-bg" className="flex items-start space-x-4">
                  <HeartPulse
                    className="text-red-500 dark:text-red-300"
                    size={40}
                  />
                  <div id="no-bg">
                    <h4 className="text-2xl font-semibold">Diagnosis</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      Get accurate health assessments to identify nutritional
                      deficiencies and risks early.
                    </p>
                  </div>
                </div>
                <div id="no-bg" className="flex items-start space-x-4">
                  <Stethoscope
                    className="text-blue-500 dark:text-blue-300"
                    size={40}
                  />
                  <div id="no-bg">
                    <h4 className="text-2xl font-semibold">
                      Personalized Plan
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      Tailored nutrition plans designed to fit your specific
                      health needs and goals.
                    </p>
                  </div>
                </div>
                <div id="no-bg" className="flex items-start space-x-4">
                  <Utensils
                    className="text-green-500 dark:text-green-300"
                    size={40}
                  />
                  <div id="no-bg">
                    <h4 className="text-2xl font-semibold">Dine Pad</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      Smart meal tracking and recommendations for a balanced and
                      nutritious diet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="" className="py-16">
          <div
            id="no-bg"
            className="max-w-6xl mx-auto bg-transparent shadow-xl rounded-lg p-12 md:p-24"
          >
            <div id="no-bg" className="text-center">
              <h2
                className={`text-4xl font-bold mb-6 ${
                  darkMode ? "text-blue-200" : "text-gray-900"
                }`}
              >
                Services
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                At NutriHelp, we offer a range of services designed to support
                your overall well-being and nutritional needs. Our dedicated
                team provides personalized solutions to help you achieve your
                health goals and improve your quality of life.
              </p>
            </div>
            <div
              id="no-bg"
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {servicesData.map((service, index) => (
                <div
                  id="no-bg"
                  key={index}
                  className={`cursor-pointer shadow-2xl rounded-xl p-10 flex flex-col items-center text-center transition-all transform hover:scale-105 duration-300
                ${
                  servicesData.length === 4 && index === 3
                    ? "md:col-span-1 md:col-start-2"
                    : ""
                }`}
                >
                  <div id="no-bg" className="w-20 h-20">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <h4
                    id="no-bg"
                    className="font-bold text-2xl mt-5 text-gray-900 dark:text-gray-200"
                  >
                    {service.title}
                  </h4>
                  <p
                    id="no-bg"
                    className="mt-3 text-gray-600 dark:text-gray-400"
                  >
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="no-bg" className="py-16">
          <div className="bg-transparent text-center mb-10">
            <h2
              className={`text-4xl font-bold ${
                darkMode ? "text-blue-200" : "text-gray-900"
              }`}
            >
              User Reviews
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              See what our users have to say about NutriHelp!
            </p>
          </div>
          <div className="w-full px-4 md:px-12 lg:px-24">
            <Swiper
              effect={"coverflow"}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={"auto"}
              coverflowEffect={{
                rotate: 30,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: false,
              }}
              pagination={{ clickable: true }}
              navigation={true}
              modules={[EffectCoverflow, Pagination, Navigation]}
              className="mySwiper"
            >
              {reviews.map((review, index) => (
                <SwiperSlide key={index} className="max-w-md">
                  <div
                    className={`flex flex-col items-center p-8 shadow-lg rounded-lg h-auto transition-all duration-300 transform hover:scale-105 ${
                      darkMode
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    <img
                      src={review.avatar}
                      alt={`${review.name}'s avatar`}
                      className="w-20 h-20 rounded-full border-4 border-gray-300 shadow-lg"
                    />

                    <h4 className="mt-4 text-2xl font-semibold">
                      {review.name}
                    </h4>
                    <div className="text-yellow-500 text-xl mt-2">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                    <p className="mt-4 text-lg text-center italic text-gray-600 dark:text-gray-300">
                      "{review.review}"
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
        <section
          id="contact"
          className="py-16 px-5 bg-gray-50 dark:bg-transparent"
        >
          <div className="max-w-5xl mx-auto text-center" id="no-bg">
            <h2
              className={`text-3xl font-bold ${
                darkMode ? "text-blue-200" : "text-gray-900"
              }`}
            >
              Contact
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Have questions? Reach out to us! We're happy to help.
            </p>
          </div>

          {/* Contact Info & Form - Adjusted Grid for Width Balance */}
          <div
            className="mt-10 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 max-w-6xl mx-auto"
            id="no-bg"
          >
            {/* Contact Info - Smaller Width */}
            <div className="flex flex-col space-y-6" id="no-bg">
              <div
                className={`flex items-center space-x-4 p-5 rounded-lg shadow-md hover:transform hover:scale-105 transition-all duration-300 ${
                  darkMode ? "bg-gray-600" : "bg-white"
                }`}
                id="no-bg"
              >
                <MapPin className="text-blue-500 w-6 h-6" />
                <div id="no-bg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                    Location
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    398 Lonsdale St. Melbourne Victoria 3000
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center space-x-4 p-5 rounded-lg shadow-md hover:transform hover:scale-105 transition-all duration-300 ${
                  darkMode ? "bg-gray-600" : "bg-white"
                }`}
                id="no-bg"
              >
                <Mail className="text-blue-500 w-6 h-6" />
                <div id="no-bg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                    Email
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    info@example.com
                  </p>
                </div>
              </div>

              <div
                id="no-bg"
                className={`flex items-center space-x-4 p-5 rounded-lg shadow-md hover:transform hover:scale-105 transition-all duration-300 ${
                  darkMode ? "bg-gray-600" : "bg-white"
                }`}
              >
                <Phone className="text-blue-500 w-6 h-6" />
                <div id="no-bg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                    Call
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">+12132</p>
                </div>
              </div>
            </div>

            {/* Contact Form - Wider Width */}
            <form
              onSubmit={handleSubmit}
              className={`p-6 rounded-lg shadow-md ${
                darkMode ? "bg-transparent" : "bg-white"
              }`}
            >
              <div id="no-bg" className="flex flex-col gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-md dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-md dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-3 mt-4 border rounded-md dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />

              <textarea
                name="message"
                rows="4"
                placeholder="Message"
                value={formData.message}
                onChange={handleChange}
                className="w-full p-3 mt-4 border rounded-md dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>

              <button
                type="submit"
                className="w-full mt-5 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
              >
                Submit
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 dark:bg-transparent text-gray-900 dark:text-white py-10">
        {/* Newsletter Section */}
        <div className="bg-blue-50 dark:bg-gray-900 py-10">
          <div className="container mx-auto px-5 text-center">
            <h4 className="text-xl font-semibold">
              Subscribe to our Newsletter
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Stay updated with our latest news and insights.
            </p>
            <form className="mt-4 flex justify-center items-center gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="p-3 w-72 rounded-md border dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Footer Main Section */}
        <div className="container mx-auto px-5 mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-bold">NutriHelp</h3>
            <hr className="my-3 border-gray-400 dark:border-gray-700" />
            <p>1235584Y4Y83</p>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-xl font-semibold">Connect with Us</h4>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Follow us on social media for updates and more.
            </p>
            <div className="flex gap-4 mt-4">
              {[
                { icon: <Twitter />, link: "#" },
                { icon: <Facebook />, link: "#" },
                { icon: <Instagram />, link: "#" },
                { icon: <Linkedin />, link: "#" },
                { icon: <Mail />, link: "#" },
              ].map(({ icon, link }, index) => (
                <a
                  key={index}
                  href={link}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-blue-500 dark:hover:bg-blue-600 transition"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </FramerClient>
  );
};

export default Home;
