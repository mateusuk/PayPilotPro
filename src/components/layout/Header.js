// src/components/layout/Header.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const location = useLocation();
  
  // Get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/dashboard') {
      return 'Enterprise Logistics - Dashboard';
    } else if (path.includes('/drivers')) {
      return 'Enterprise Logistics - Drivers';
    } else if (path.includes('/compliance')) {
      return 'Enterprise Logistics - Compliance';
    } else if (path.includes('/payments')) {
      return 'Enterprise Logistics - Payments';
    } else if (path.includes('/work-history')) {
      return 'Enterprise Logistics - Work History';
    } else if (path.includes('/reporting')) {
      return 'Enterprise Logistics - Reporting';
    } else if (path.includes('/settings')) {
      return 'Enterprise Logistics - Settings';
    } else if (path.includes('/comments')) {
      return 'Enterprise Logistics - Comments';
    } else if (path.includes('/support')) {
      return 'Enterprise Logistics - Support';
    }
    
    return 'Enterprise Logistics';
  };
  
  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    // Implement search functionality
    console.log('Searching for:', searchTerm);
    
    // Clear search term
    setSearchTerm('');
  };
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <div className="dashboard-header">
      <Link to="/dashboard" className="logo">PayPilotPro</Link>
      
      <div>{getPageTitle()}</div>
      
      <div className="search-bar">
        <form onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </div>
      
      <div className="header-icons">
        <div className="notification-wrapper" ref={notificationsRef}>
          <span 
            className="notification-icon" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
          </span>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                <button className="mark-all-read">Mark all as read</button>
              </div>
              
              <div className="notification-list">
                <div className="notification-item unread">
                  <div className="notification-icon">📄</div>
                  <div className="notification-content">
                    <p>New driver application submitted</p>
                    <span className="notification-time">2 hours ago</span>
                  </div>
                </div>
                
                <div className="notification-item">
                  <div className="notification-icon">🚗</div>
                  <div className="notification-content">
                    <p>Vehicle inspection reminder for John Smith</p>
                    <span className="notification-time">1 day ago</span>
                  </div>
                </div>
                
                <div className="notification-item">
                  <div className="notification-icon">📊</div>
                  <div className="notification-content">
                    <p>Monthly report is ready to view</p>
                    <span className="notification-time">3 days ago</span>
                  </div>
                </div>
              </div>
              
              <div className="notification-footer">
                <Link to="/notifications">View all notifications</Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="profile-wrapper" ref={profileMenuRef}>
          <span 
            className="profile-icon" 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            👤
          </span>
          
          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-header">
                <div className="profile-name">
                  {currentUser.firstName} {currentUser.lastName}
                </div>
                <div className="profile-email">{currentUser.email}</div>
              </div>
              
              <div className="profile-menu">
                <Link to="/profile" className="profile-menu-item">
                  <span className="profile-menu-icon">👤</span>
                  <span>My Profile</span>
                </Link>
                
                <Link to="/settings" className="profile-menu-item">
                  <span className="profile-menu-icon">⚙️</span>
                  <span>Settings</span>
                </Link>
                
                <Link to="/help" className="profile-menu-item">
                  <span className="profile-menu-icon">❓</span>
                  <span>Help & Support</span>
                </Link>
                
                <div className="profile-menu-divider"></div>
                
                <button 
                  className="profile-menu-item logout-button"
                  onClick={handleLogout}
                >
                  <span className="profile-menu-icon">🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;