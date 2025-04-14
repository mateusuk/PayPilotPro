// src/components/auth/ForgotPassword.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from '../../services/emailService';
import './styles.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return setError('Please enter your email address');
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      // Generate a password reset link
      const resetLink = `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`;
      
      // Send password reset email using our custom service
      await sendPasswordResetEmail(email, resetLink);
      
      setMessage('Check your email inbox for password reset instructions');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to reset password. Please make sure your email is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-reset-container">
      <div className="password-reset-form">
        <h1>PayPilotPro</h1>
        
        <div className="password-reset-header">
          <h3>Reset Password</h3>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="form-control"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Sending...' : 'Reset Password'}
          </button>
          
          <div className="back-to-login">
            Remembered your password? <Link to="/login">Back to Login</Link>
          </div>
        </form>
      </div>
      
      <div className="password-reset-image">
        <div className="password-reset-content">
          <h2>Forgot your password?</h2>
          <p>No worries! We'll help you get back into your account. Enter your email address and we'll send you a link to reset your password.</p>
          <p>If you don't receive an email within a few minutes, check your spam folder or try again.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;