// src/components/layout/Header.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaBars, FaTimes, FaBell, FaUser, FaSearch } from 'react-icons/fa';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const location = useLocation();
  
  // Get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/dashboard': 'Dashboard',
      '/drivers': 'Drivers',
      '/compliance': 'Compliance',
      '/payments': 'Payments',
      '/work-history': 'Work History',
      '/reporting': 'Reporting',
      '/settings': 'Settings',
      '/comments': 'Comments',
      '/support': 'Support'
    };
    
    return titles[path] || 'PayPilotPro';
  };
  
  // Handle click outside of menus
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchTerm);
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  // Toggle mobile menu and sidebar
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    document.body.classList.toggle('sidebar-visible');
  };
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {showMobileMenu ? <FaTimes /> : <FaBars />}
        </button>
        
        <Link to="/dashboard" className="logo">
          PayPilotPro
        </Link>
        
        <h1 className="page-title">{getPageTitle()}</h1>
      </div>
      
      <div className="header-center">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </form>
      </div>
      
      <div className="header-right">
        <div className="notification-wrapper" ref={notificationsRef}>
          <button
            className="header-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <FaBell />
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                <button className="mark-all-read">Mark all as read</button>
              </div>
              <div className="notification-list">
                {/* Add notification items here */}
                <div className="notification-empty">
                  No new notifications
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="profile-wrapper" ref={profileMenuRef}>
          <button
            className="header-icon-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="User menu"
          >
            <FaUser />
          </button>
          
          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-header">
                <div className="profile-name">
                  {currentUser?.displayName || 'User'}
                </div>
                <div className="profile-email">{currentUser?.email}</div>
              </div>
              
              <div className="profile-menu">
                <Link to="/profile" className="profile-menu-item">
                  <FaUser className="menu-icon" />
                  <span>My Profile</span>
                </Link>
                
                <Link to="/settings" className="profile-menu-item">
                  <span className="menu-icon">⚙️</span>
                  <span>Settings</span>
                </Link>
                
                <Link to="/help" className="profile-menu-item">
                  <span className="menu-icon">❓</span>
                  <span>Help & Support</span>
                </Link>
                
                <div className="profile-menu-divider"></div>
                
                <button 
                  className="profile-menu-item logout-button"
                  onClick={handleLogout}
                >
                  <span className="menu-icon">🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;