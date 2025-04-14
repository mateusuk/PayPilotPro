// src/components/auth/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './styles.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      clearError();
      
      await login(email, password);
      
      // If login is successful, navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      // Error is already handled in AuthContext
      console.log('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>PayPilotPro</h1>
        
        <div className="login-greeting">
          <p>Hello, We hope you are well.</p>
        </div>
        
        <div className="login-access">
          <h3>Access Your Account</h3>
          <p>Please enter your email and password to log in.</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
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
          </div>
          
          <div className="remember-forgot">
            <div>
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-link">Forgot Password</Link>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="register-link">
            Don&apos;t have an account? <Link to="/register">Sign up</Link>
          </div>
        </form>
      </div>
      
      <div className="login-welcome">
        <h2>Welcome to PayPilotPro</h2>
        <p>The leading onboarding software designed to help companies manage and engage a self-employed workforce. Stay IR35 compliant and scale your business with our complete suite of powerful tools.</p>
        <p className="quote">"Mindset is what separates us best from the rest."</p>
      </div>
    </div>
  );
};

export default Login;