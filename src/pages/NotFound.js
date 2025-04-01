// src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFound = () => {
  const { currentUser } = useAuth();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        
        {currentUser ? (
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        ) : (
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        )}
      </div>
    </div>
  );
};

export default NotFound;