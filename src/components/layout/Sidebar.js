// src/components/layout/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaHome,
  FaUsers,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaHistory,
  FaChartBar,
  FaCog,
  FaComments,
  FaQuestionCircle
} from 'react-icons/fa';

const menuItems = [
  { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
  { path: '/drivers', icon: <FaUsers />, label: 'Drivers' },
  { path: '/compliance', icon: <FaClipboardCheck />, label: 'Compliance' },
  { path: '/payments', icon: <FaMoneyBillWave />, label: 'Payments' },
  { path: '/work-history', icon: <FaHistory />, label: 'Work History' },
  { path: '/reporting', icon: <FaChartBar />, label: 'Reporting' },
  { path: '/settings', icon: <FaCog />, label: 'Settings' },
  { path: '/comments', icon: <FaComments />, label: 'Comments' },
  { path: '/support', icon: <FaQuestionCircle />, label: 'Support' }
];

const Sidebar = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <>
      <div className="sidebar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "sidebar-item active" : "sidebar-item"
            }
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="sidebar-overlay" onClick={() => document.body.classList.remove('sidebar-visible')} />
    </>
  );
};

export default Sidebar;