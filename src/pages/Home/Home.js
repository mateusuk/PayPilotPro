import React from 'react';
import { Link } from 'react-router-dom';
import './home.css';

const Home = () => {
  return (
    <div className="home-container">
      <nav className="navbar">
        <Link to="/" className="logo">PayPilotPro</Link>
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#about" className="nav-link">About</a>
          <Link to="/login" className="btn btn-secondary">Login</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>
      
      <section className="hero">
        <h1>Streamline Your <span className="highlight">Logistics Operations</span></h1>
        <p>
          PayPilotPro is the leading onboarding software designed to help companies manage and engage 
          a self-employed workforce. Stay IR35 compliant and scale your business with our complete 
          suite of powerful tools.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn btn-primary">Get Started</Link>
          <a href="#features" className="btn btn-secondary">Learn More</a>
        </div>
      </section>
      
      <section id="features" className="features-section">
        <h2>Powerful Features for Logistics Management</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>Driver Onboarding</h3>
            <p>Streamline the driver onboarding process with our intuitive digital workflow.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Document Management</h3>
            <p>Securely store, manage, and track all driver documents in one central location.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">✓</div>
            <h3>Compliance Tracking</h3>
            <p>Ensure all drivers meet regulatory requirements with automated compliance checks.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Payment Processing</h3>
            <p>Manage driver payments efficiently with our integrated payment processing system.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Reporting & Analytics</h3>
            <p>Gain insights into your operations with comprehensive reporting and analytics tools.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile App</h3>
            <p>Drivers can manage their profiles, documents, and payments on the go.</p>
          </div>
        </div>
      </section>
      
      <section id="pricing" className="pricing-section">
        <h2>Simple, Transparent Pricing</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Starter</h3>
              <div className="price">£99<span>/month</span></div>
            </div>
            <ul className="pricing-features">
              <li>Up to 50 drivers</li>
              <li>Document management</li>
              <li>Basic reporting</li>
              <li>Email support</li>
            </ul>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
          
          <div className="pricing-card featured">
            <div className="pricing-badge">Most Popular</div>
            <div className="pricing-header">
              <h3>Pro</h3>
              <div className="price">£199<span>/month</span></div>
            </div>
            <ul className="pricing-features">
              <li>Up to 200 drivers</li>
              <li>Advanced document management</li>
              <li>Comprehensive reporting</li>
              <li>Priority email & phone support</li>
              <li>Payment processing</li>
            </ul>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
          
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Enterprise</h3>
              <div className="price">Custom</div>
            </div>
            <ul className="pricing-features">
              <li>Unlimited drivers</li>
              <li>Custom integrations</li>
              <li>Advanced analytics</li>
              <li>Dedicated account manager</li>
              <li>Custom features</li>
            </ul>
            <Link to="/contact" className="btn btn-primary">Contact Sales</Link>
          </div>
        </div>
      </section>
      
      <section id="about" className="about-section">
        <h2>About PayPilotPro</h2>
        <div className="about-content">
          <div className="about-text">
            <p>
              PayPilotPro was founded in 2020 with a mission to simplify logistics management for 
              businesses of all sizes. Our team of industry experts and developers has created a 
              comprehensive solution that addresses the unique challenges faced by logistics companies.
            </p>
            <p>
              With a focus on compliance, efficiency, and user experience, PayPilotPro has quickly 
              become the leading platform for managing self-employed drivers in the logistics industry.
            </p>
            <button className="btn btn-secondary">Learn More About Us</button>
          </div>
          <div className="about-image">
            <div className="image-placeholder"></div>
          </div>
        </div>
      </section>
      
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <Link to="/" className="logo">PayPilotPro</Link>
            <p>Streamlining logistics operations for businesses worldwide.</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-links-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#demo">Request Demo</a>
            </div>
            
            <div className="footer-links-column">
              <h4>Company</h4>
              <a href="#about">About Us</a>
              <a href="#careers">Careers</a>
              <a href="#contact">Contact</a>
            </div>
            
            <div className="footer-links-column">
              <h4>Resources</h4>
              <a href="#blog">Blog</a>
              <a href="#help">Help Center</a>
              <a href="#guides">Guides</a>
            </div>
            
            <div className="footer-links-column">
              <h4>Legal</h4>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} PayPilotPro. All rights reserved.</p>
          <div className="social-links">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 