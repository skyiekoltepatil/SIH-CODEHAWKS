import React, { useState, useEffect } from 'react';
import banner1 from '../assets/banners/hero_banner_schemes.jpg';
import banner2 from '../assets/banners/hero_banner_languages.jpg';
import banner3 from '../assets/banners/hero_banner_ai_assistant.jpg';

export default function Home() {
  const banners = [banner1, banner2, banner3];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="page active">
      {/* Hero Carousel */}
      <div className="hero-carousel-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
        <div 
          className="hero-carousel-inner" 
          style={{ 
            display: 'flex', 
            transition: 'transform 0.5s ease-in-out',
            transform: `translateX(-${currentSlide * 100}%)`
          }}
        >
          {banners.map((banner, index) => (
            <img 
              key={index} 
              src={banner} 
              alt={`Hero Banner ${index + 1}`} 
              style={{ width: '100%', flexShrink: 0, objectFit: 'cover' }} 
            />
          ))}
        </div>
        
        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
          style={{
            position: 'absolute',
            top: '50%',
            left: '20px',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.3)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.2rem',
            zIndex: 10
          }}
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
          style={{
            position: 'absolute',
            top: '50%',
            right: '20px',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.3)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.2rem',
            zIndex: 10
          }}
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>

        {/* Carousel Indicators */}
        <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* UMANG Style Stats */}
      <div className="home-stats-wrapper" style={{ marginTop: '0' }}>
        <div className="home-stats-container">
          <div className="home-stat-item">
            <div className="home-stat-header">
              <i className="fa-regular fa-building stat-icon-large"></i>
              <div className="home-stat-title">
                <h3>207</h3>
                <p>Departments/Entities</p>
              </div>
            </div>
            <div className="home-stat-sub">
              <div>
                <span>Central</span>
                <strong>80</strong>
              </div>
              <div>
                <span>State</span>
                <strong>127</strong>
              </div>
            </div>
          </div>

          <div className="home-stat-item">
            <div className="home-stat-header">
              <i className="fa-solid fa-mobile-screen stat-icon-large"></i>
              <div className="home-stat-title">
                <h3>2,106</h3>
                <p>Services</p>
              </div>
            </div>
            <div className="home-stat-sub">
              <div>
                <span>Central</span>
                <strong>918</strong>
              </div>
              <div>
                <span>State</span>
                <strong>1,188</strong>
              </div>
            </div>
          </div>

          <div className="home-stat-item">
            <div className="home-stat-header">
              <i className="fa-solid fa-user-shield stat-icon-large"></i>
              <div className="home-stat-title">
                <h3 className="invisible-num">.</h3>
                <p>Registrations</p>
              </div>
            </div>
            <div className="home-stat-sub single-sub">
              <div>
                <span>Total</span>
                <strong>7.75 Crores</strong>
              </div>
            </div>
          </div>

          <div className="home-stat-item no-border">
            <div className="home-stat-header">
              <i className="fa-solid fa-money-check-dollar stat-icon-large"></i>
              <div className="home-stat-title">
                <h3 className="invisible-num">.</h3>
                <p>Transactions</p>
              </div>
            </div>
            <div className="home-stat-sub single-sub">
              <div>
                <span>Total</span>
                <strong>554.86 Crores</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What's New Section */}
      <div className="whats-new-section">
        <h2>What's New ?</h2>
        <p className="whats-new-subtitle">
          Citizens may explore the newly added services on SIH CODEHAWKS!
        </p>

        <div className="whats-new-grid">
          <div className="whats-new-card">
            <div className="icon-circle" style={{ color: '#e67e22' }}>
              <i className="fa-solid fa-hands-holding-child"></i>
            </div>
            <p>Poshan Tracker</p>
          </div>
          <div className="whats-new-card">
            <div className="icon-circle" style={{ color: '#27ae60' }}>
              <i className="fa-solid fa-landmark"></i>
            </div>
            <p>Aaple Sarkar</p>
          </div>
          <div className="whats-new-card">
            <div className="icon-circle" style={{ color: '#f39c12' }}>
              <i className="fa-solid fa-fingerprint"></i>
            </div>
            <p>Jeevan Pramaan</p>
          </div>
          <div className="whats-new-card">
            <div className="icon-circle" style={{ color: '#8e44ad' }}>
              <i className="fa-solid fa-dharmachakra"></i>
            </div>
            <p>Indian Culture</p>
          </div>
          <div className="whats-new-card">
            <div className="icon-circle" style={{ color: '#2c3e50' }}>
              <i className="fa-solid fa-torii-gate"></i>
            </div>
            <p>Goa Online</p>
          </div>
        </div>
      </div>
    </section>
  );
}
