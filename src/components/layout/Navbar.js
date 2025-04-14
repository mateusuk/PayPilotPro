// src/components/layout/Navbar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when clicking a link
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">PayPilotPro</Link>
      
      {/* Mobile menu button */}
      <div className="mobile-menu-btn" onClick={toggleMobileMenu}>
        <span className={`menu-icon ${mobileMenuOpen ? 'open' : ''}`}></span>
      </div>
      
      {/* Navigation links */}
      <div className={`nav-links ${mobileMenuOpen ? 'show' : ''}`}>
        {!currentUser ? (
          <>
            <Link to="/#features" className="nav-link" onClick={closeMobileMenu}>Features</Link>
            <Link to="/#pricing" className="nav-link" onClick={closeMobileMenu}>Pricing</Link>
            <Link to="/#about" className="nav-link" onClick={closeMobileMenu}>About</Link>
            <Link to="/login" className="btn btn-secondary" onClick={closeMobileMenu}>Login</Link>
            <Link to="/register" className="btn btn-primary" onClick={closeMobileMenu}>Get Started</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link>
            <Link to="/drivers" className="nav-link" onClick={closeMobileMenu}>Drivers</Link>
            <Link to="/payments" className="nav-link" onClick={closeMobileMenu}>Payments</Link>
            <button className="btn btn-secondary logout-btn" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;