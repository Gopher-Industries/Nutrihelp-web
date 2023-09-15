import React from 'react';
import '../styles/landing.css';

const App = () => {
  return (
    <>
      <header id="header" className="fixed-top">
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
            </ul>
          </nav>
        </div>
      </header>

      <section id="hero" className="d-flex align-items-center">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 pt-4 pt-lg-0 order-2 order-lg-1 d-flex flex-column justify-content-center">
              <h1>NutriHelp</h1>
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
              <p>
                Magnam dolores commodi suscipit. Necessitatibus eius consequatur
                ex aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam
                quos quisquam cupiditate. Et nemo qui impedit suscipit alias ea.
                Quia fugiat sit in iste officiis commodi quidem hic quas.
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
                        id="name"
                        placeholder="Your Name"
                        required
                      />
                    </div>
                    <div className="col-md-6 form-group mt-3 mt-md-0">
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        id="email"
                        placeholder="Your Email"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group mt-3">
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      id="subject"
                      placeholder="Subject"
                      required
                    />
                  </div>
                  <div className="form-group mt-3">
                    <textarea
                      className="form-control"
                      name="message"
                      rows="5"
                      placeholder="Message"
                      required
                    ></textarea>
                  </div>

                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <a href="#">
                      <b style={{ color: 'purple' }}>Submit</b>
                    </a>
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

export default App;
