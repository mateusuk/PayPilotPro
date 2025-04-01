// src/components/auth/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth.css';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    // Clear previous errors
    setFormError('');
    clearError();
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    
    // Check password strength (minimum 8 characters)
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      await register(email, password, firstName, lastName);
      
      // If registration is successful, navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      // Error is already handled in AuthContext
      console.log('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h1>PayPilotPro</h1>
        
        <div className="register-header">
          <h3>Create Your Account</h3>
          <p>Join PayPilotPro to manage your logistics operations.</p>
        </div>
        
        {(formError || error) && (
          <div className="error-message">
            {formError || error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group half">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="form-control"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control"
            />
            <small className="form-text">Password must be at least 8 characters long</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-control"
            />
          </div>
          
          <div className="terms-agreement">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
            </label>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <div className="login-link">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </form>
      </div>
      
      <div className="register-welcome">
        <h2>Welcome to PayPilotPro</h2>
        <p>The leading onboarding software designed to help companies manage and engage a self-employed workforce. Stay IR35 compliant and scale your business with our complete suite of powerful tools.</p>
        <div className="features-list">
          <div className="feature-item">
            <span className="feature-icon">✓</span>
            <span>Driver Onboarding</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✓</span>
            <span>Document Management</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✓</span>
            <span>Compliance Tracking</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✓</span>
            <span>Payment Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;