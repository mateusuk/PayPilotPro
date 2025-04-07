import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './settings.css';

const Settings = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    monthlyReports: true,
  });

  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          className={`tab-button ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          System
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'profile' && (
          <div className="profile-settings">
            <div className="settings-section">
              <h2>Profile Information</h2>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={currentUser?.email} disabled />
              </div>
              <div className="form-group">
                <label>Display Name</label>
                <input type="text" placeholder="Enter your display name" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="Enter your phone number" />
              </div>
              <button className="save-button">Save Changes</button>
            </div>

            <div className="settings-section">
              <h2>Password</h2>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" placeholder="Enter current password" />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" placeholder="Enter new password" />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Confirm new password" />
              </div>
              <button className="save-button">Update Password</button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notification-settings">
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <div className="notification-options">
                <div className="notification-option">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                    />
                    <span className="toggle-slider"></span>
                    Email Notifications
                  </label>
                  <p>Receive notifications via email</p>
                </div>

                <div className="notification-option">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={() => handleNotificationChange('pushNotifications')}
                    />
                    <span className="toggle-slider"></span>
                    Push Notifications
                  </label>
                  <p>Receive push notifications in browser</p>
                </div>

                <div className="notification-option">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsNotifications}
                      onChange={() => handleNotificationChange('smsNotifications')}
                    />
                    <span className="toggle-slider"></span>
                    SMS Notifications
                  </label>
                  <p>Receive notifications via SMS</p>
                </div>

                <div className="notification-option">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={notificationSettings.weeklyReports}
                      onChange={() => handleNotificationChange('weeklyReports')}
                    />
                    <span className="toggle-slider"></span>
                    Weekly Reports
                  </label>
                  <p>Receive weekly summary reports</p>
                </div>

                <div className="notification-option">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={notificationSettings.monthlyReports}
                      onChange={() => handleNotificationChange('monthlyReports')}
                    />
                    <span className="toggle-slider"></span>
                    Monthly Reports
                  </label>
                  <p>Receive monthly summary reports</p>
                </div>
              </div>
              <button className="save-button">Save Preferences</button>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="system-settings">
            <div className="settings-section">
              <h2>System Preferences</h2>
              <div className="form-group">
                <label>Language</label>
                <select defaultValue="en">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="pt">Português</option>
                </select>
              </div>
              <div className="form-group">
                <label>Time Zone</label>
                <select defaultValue="UTC">
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="CST">Central Time</option>
                  <option value="PST">Pacific Time</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date Format</label>
                <select defaultValue="MM/DD/YYYY">
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <button className="save-button">Save Preferences</button>
            </div>

            <div className="settings-section">
              <h2>Data Management</h2>
              <div className="data-management-options">
                <button className="danger-button">Export All Data</button>
                <button className="danger-button">Delete Account</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings; 