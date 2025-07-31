import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import Sidebar from '../components/Sidebar';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';

const Dashboard = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      window.location.href = '/login';
    }

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser && storedUser.name) setUser(storedUser);

    const loadScripts = async () => {
      const aosScript = document.createElement('script');
      aosScript.src = '/assets/vendor/aos/aos.js';
      aosScript.onload = () => window.AOS && window.AOS.init();
      document.body.appendChild(aosScript);

      const mainScript = document.createElement('script');
      mainScript.src = '/assets/js/main.js';
      document.body.appendChild(mainScript);
    };

    loadScripts();
  }, []);

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  return (
    <div className="main-view index-page">
      <Sidebar />
      <div className="dashboard-main">
        <main className="main">
          {/* Hero Section */}
          <section id="hero" className="hero section dark-background">
            <div className="container">
              <div className="row gy-4">
                <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
                  <br />
                  <h1><span style={{ color: 'black' }}>THABO</span>ERA IT SOLUTIONS</h1>
                  <p style={{ color: 'rgba(255,255,255,0.81)' }}><strong>Bridge Your IT Gap</strong></p>
                  <p style={{ color: 'rgba(255,255,255,0.934)' }}>
                    We offer tailored IT solutions, including proactive network monitoring, system updates,
                    and security management. Our services ensure a secure and efficient IT environment,
                    allowing you to focus on your core activities.
                  </p>
                  <div className="d-flex">
                    <a href="https://thaboera.co.za/" target="_blank" rel="noreferrer" className="btn-get-started">
                      Our Website
                    </a>
                  </div>
                </div>

                <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
                  <div className="image-slider">
                    <img src="/assets/img/hero-img.png" className="mySlides" alt="First Image" />
                    <img src="/assets/img/Second-pic.png" className="mySlides" alt="Second Image" />
                    <div className="indicators">
                      <span className="indicator"></span>
                      <span className="indicator"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Clients Section */}
          <section id="clients" className="clients section light-background">
            <div className="container" data-aos="zoom-in">
              <h5>Partnerships & Platforms</h5>
              <Swiper
                modules={[Pagination, Autoplay]}
                loop={true}
                speed={600}
                autoplay={{ delay: 900 }}
                slidesPerView={'auto'}
                pagination={{ clickable: true }}
                breakpoints={{
                  320: { slidesPerView: 2, spaceBetween: 40 },
                  480: { slidesPerView: 3, spaceBetween: 60 },
                  640: { slidesPerView: 4, spaceBetween: 80 },
                  992: { slidesPerView: 5, spaceBetween: 120 },
                  1200: { slidesPerView: 6, spaceBetween: 120 },
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <SwiperSlide key={i}>
                    <img
                      src={`/assets/img/clients/client-${i}.png`}
                      className="img-fluid"
                      alt={`Client ${i}`}
                      height="100px"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </section>
        </main>

        {/* Scroll Top & Preloader */}
        <a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center">
          <i className="bi bi-arrow-up-short"></i>
        </a>
        <div id="preloader"></div>
      </div>
    </div>
  );
};

export default Dashboard;
