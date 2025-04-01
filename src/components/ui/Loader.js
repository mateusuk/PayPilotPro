// src/components/ui/Loader.js
import React from 'react';
import '../../styles/ui.css';

const Loader = ({ size = 'medium', fullScreen = false, text = 'Loading...' }) => {
  const sizeClass = `loader-${size}`;
  
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className={`loader ${sizeClass}`}></div>
        {text && <div className="loader-text">{text}</div>}
      </div>
    );
  }
  
  return (
    <div className="loader-container">
      <div className={`loader ${sizeClass}`}></div>
      {text && <div className="loader-text">{text}</div>}
    </div>
  );
};

export default Loader;