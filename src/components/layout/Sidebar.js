// src/components/layout/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <div className="sidebar">
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => 
          isActive ? "sidebar-item active" : "sidebar-item"
        }
      >
        Dashboard
      </NavLink>
      
      <NavLink 
        to="/drivers" 
        className={({ isActive }) => 
          isActive ? "sidebar-item active" : "sidebar-item"
        }
      >
        Drivers
      </NavLink>
      
      <NavLink 
        to="/compliance" 
        className={({ isActive }) => 
          isActive ? "sidebar-item active" : "sidebar-item"
        }
      >
        Compliance
      </NavLink>
      
      <NavLink 
        to="/payments" 
        className={({ isActive }) => 
          isActive ? "sidebar-item active" : "sidebar-item"
        }
      >
        Payments
      </NavLink>
      
      <NavLink 
        to="/work-history" 
        className={({ isActive }) => 
          isActive ? "sidebar-item active" : "sidebar-item"
        }
      >
        Work history
      </NavLink>
      
      <NavLink 
        to="/reporting" 
        className={({ isActive }) => 
          isActive ? "sidebar-item active" : "sidebar-item"
        }
      >
        Reporting
      </NavLink>
      
      <NavLink 
        to="/settings" 
        className={({ isActive }) => 
          isActive ? "sidebar-item active" : "sidebar-item"
        }
      >
        Settings
      </NavLink>
      
      <NavLink 
        to="/comments" 
        className={({ isActive }) => 
          isActive ? "sidebar-item active" : "sidebar-item"
        }
      >
        Comments
      </NavLink>
      
      <NavLink 
        to="/support" 
        className={({ isActive }) => 
          isActive ? "sidebar-item active" : "sidebar-item"
        }
      >
        Support
      </NavLink>
    </div>
  );
};

export default Sidebar;