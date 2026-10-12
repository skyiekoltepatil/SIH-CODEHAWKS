import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import praamanIcon from '../assets/praaman-icon.png';
import logoTextLight from '../assets/logo-text-light.png';
import logoTextDark from '../assets/logo-text-dark.png';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow"></div>
      <div className="footer-content">
        <div className="footer-section brand-section">
          <div className="footer-logo">
            <img src={praamanIcon} alt="Praaman Portal Icon" className="footer-brand-logo-img" />
            <div className="logo-text-img-container">
              <img src={logoTextLight} alt="PRAAMAN PORTAL" className="logo-text-img logo-text-light" />
              <img src={logoTextDark} alt="PRAAMAN PORTAL" className="logo-text-img logo-text-dark" />
            </div>
          </div>
          <p className="brand-tagline">
            One App for all Government Services. Empowering citizens through secure, seamless digital access to state and central schemes.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
            <a href="#" aria-label="GitHub"><i className="fa-brands fa-github"></i></a>
            <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
            <a href="#" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
          </div>
        </div>

        <div className="footer-links-wrapper">
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/"><i className="fa-solid fa-chevron-right"></i> Home</Link></li>
              <li><Link to="/dashboard"><i className="fa-solid fa-chevron-right"></i> Dashboard</Link></li>
              <li><Link to="/about"><i className="fa-solid fa-chevron-right"></i> About Us</Link></li>
              <li><Link to="/schemes"><i className="fa-solid fa-chevron-right"></i> Schemes</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Legal & Help</h3>
            <ul>
              <li><Link to="/privacy-policy"><i className="fa-solid fa-chevron-right"></i> Privacy Policy</Link></li>
              <li><Link to="/terms-of-service"><i className="fa-solid fa-chevron-right"></i> Terms of Service</Link></li>
              <li><Link to="/faqs"><i className="fa-solid fa-chevron-right"></i> FAQs</Link></li>
              <li><Link to="/services"><i className="fa-solid fa-chevron-right"></i> Services</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-section contact-section">
          <h3>Stay Updated</h3>
          <p className="newsletter-text">Subscribe to receive notifications about new government schemes.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <i className="fa-regular fa-envelope"></i>
              <input type="email" placeholder="Email Address" required />
            </div>
            <button type="submit" className="subscribe-btn">Subscribe</button>
          </form>
          <div className="contact-info mt-4">
            <p><i className="fa-solid fa-headset"></i> 1800-111-222 (Toll Free)</p>
            <p><i className="fa-regular fa-envelope"></i> support@praamanportal.gov.in</p>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} PRAAMAN PORTAL. A Digital India Initiative.</p>
          <div className="bottom-links">
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms-of-service">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
