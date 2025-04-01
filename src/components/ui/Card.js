// src/components/ui/Card.js
import React from 'react';
import '../../styles/ui.css';

const Card = ({ title, subtitle, value, variant, icon, children }) => {
  // Calculate card class based on variant
  const getCardClass = () => {
    const baseClass = 'metric-card';
    
    if (variant) {
      return `${baseClass} ${variant}`;
    }
    
    return baseClass;
  };

  return (
    <div className={getCardClass()}>
      {title && <div className="metric-title">{title}</div>}
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
      {value !== undefined && <div className="metric-value">{value}</div>}
      {icon && <div className="metric-icon">{icon}</div>}
      {children && <div className="card-content">{children}</div>}
    </div>
  );
};

export default Card;