// src/components/ui/Loader.js
import React from 'react';
import './Loader.css';

const Loader = ({ message = 'Loading...', fullScreen = false }) => {
  const loaderContent = (
    <div className="loader-container">
      <div className="loader-spinner"></div>
      {message && <div className="loader-message">{message}</div>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export default Loader;