import React, { useState, useEffect } from 'react';
import '../../styles/ui.css';

const Alert = ({ message, type = 'info', onClose, autoClose = false, autoCloseTime = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  // Handle auto close
  useEffect(() => {
    let timer;
    
    if (autoClose && isVisible) {
      timer = setTimeout(() => {
        handleClose();
      }, autoCloseTime);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoClose, autoCloseTime, isVisible, handleClose]);

  if (!isVisible) return null;

  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-content">{message}</div>
      <button className="alert-close" onClick={handleClose}>&times;</button>
    </div>
  );
};

export default Alert;