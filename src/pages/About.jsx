import React from 'react';
import './About.css';
import {
  MapPin,
  Users,
  FileText,
  ShieldCheck,
  Grid,
  UserCheck,
  Bell,
  Lock,
  Building,
  CheckSquare,
  Landmark,
  Building2,
  Home,
  Lightbulb
} from 'lucide-react';

export default function About() {
  return (
    <div className="about-page-container page active">
      {/* Hero Section */}
      <section className="about-hero-banner">
        <div className="hero-banner-content">

          
          <div className="hero-accent-bar"></div>
          <div className="hero-subtitle">ABOUT PRAAMAN PORTAL</div>
          <h1 className="hero-title">Bridging Citizens <br/> and Government</h1>
          <p className="hero-description">
            PRAAMAN PORTAL is a unified digital platform designed to bridge the gap 
            between government and its citizens. We integrate government services, 
            schemes, and information into a single, transparent, and easy-to-use 
            platform for every individual across the nation.
          </p>
          
          <div className="hero-badges-row">
            <div className="hero-badge">
              <Lightbulb size={18} />
              <span>Smart India Hackathon 2026</span>
            </div>
            <div className="hero-badge">
              <Users size={18} />
              <span>Team CODEHAWKS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Banner */}
      <section className="feature-banner">
        <div className="feature-item">
          <div className="feature-icon"><Users size={36} strokeWidth={1.5} /></div>
          <div className="feature-text">
            <h4>One unified access point</h4>
            <p>All government schemes and services in a single, easy-to-use platform.</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon"><FileText size={36} strokeWidth={1.5} /></div>
          <div className="feature-text">
            <h4>Transparent application tracking</h4>
            <p>Real-time updates at every stage of your application.</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon"><ShieldCheck size={36} strokeWidth={1.5} /></div>
          <div className="feature-text">
            <h4>Secure inter-department data exchange</h4>
            <p>End-to-end encryption with trusted government systems.</p>
          </div>
        </div>
      </section>

      {/* What we are building */}
      <section className="info-section">
        <div className="section-header-row">
          <div className="section-title-wrapper">
            <div className="accent-line"></div>
            <h2>What we are building</h2>
          </div>
          <div className="section-desc">
            <p>A unified digital platform that connects citizens with government schemes through smart assistance, real-time tracking, and secure data integration across departments.</p>
          </div>
        </div>
        <div className="grid-cards-4">
          <div className="info-card">
            <div className="card-icon"><Grid size={28} strokeWidth={1.5} /></div>
            <div className="card-content">
              <h4>Unified Access</h4>
              <p>A single portal to manage all your government interactions, from discovering schemes to applying and tracking.</p>
            </div>
          </div>
          <div className="info-card">
            <div className="card-icon"><UserCheck size={28} strokeWidth={1.5} /></div>
            <div className="card-content">
              <h4>Smart Eligibility</h4>
              <p>AI-powered assistance to help you find the right schemes based on your profile and guide you through the application process.</p>
            </div>
          </div>
          <div className="info-card">
            <div className="card-icon"><FileText size={28} strokeWidth={1.5} /></div>
            <div className="card-content">
              <h4>Real-time Tracking</h4>
              <p>Get transparent and timely updates for all your submitted applications, with notifications at every stage.</p>
            </div>
          </div>
          <div className="info-card">
            <div className="card-icon"><ShieldCheck size={28} strokeWidth={1.5} /></div>
            <div className="card-content">
              <h4>Secure Integration</h4>
              <p>End-to-end encryption and inter-departmental data exchange to ensure your documents and personal details remain safe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Built around citizens */}
      <section className="info-section">
        <div className="section-header-row">
          <div className="section-title-wrapper">
            <div className="accent-line"></div>
            <h2>Built around citizens</h2>
            <p className="built-desc">
              We believe government services should be simple, inclusive, and trustworthy.
              PRAAMAN PORTAL is designed with a citizen-centric approach to eliminate
              bureaucratic hurdles and ensure that every individual can access the benefits
              they are entitled to.
            </p>
          </div>
          <div className="grid-cards-3">
            <div className="info-card minimalist">
              <div className="card-icon"><Users size={32} strokeWidth={1.5} /></div>
              <div className="card-content">
                <h4>Accessibility</h4>
                <p>Simple, multilingual, and inclusive for every citizen.</p>
              </div>
            </div>
            <div className="info-card minimalist">
              <div className="card-icon"><Building size={32} strokeWidth={1.5} /></div>
              <div className="card-content">
                <h4>Accountability</h4>
                <p>Transparent processes and clear information.</p>
              </div>
            </div>
            <div className="info-card minimalist">
              <div className="card-icon"><ShieldCheck size={32} strokeWidth={1.5} /></div>
              <div className="card-content">
                <h4>Privacy by design</h4>
                <p>Your data is yours, always protected and never misused.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
