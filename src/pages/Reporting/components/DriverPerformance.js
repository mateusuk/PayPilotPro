import React from 'react';
import { FaDownload, FaUsers, FaCar, FaStar } from 'react-icons/fa';
import '../reporting.css';

const DriverPerformance = ({ data }) => {
  return (
    <div className="report-content">
      <div className="report-grid">
        <div className="stat-card performance-stats">
          <div className="stat-card-header">
            <FaUsers className="stat-icon" />
            <h3>Driver Overview</h3>
          </div>
          <div className="stat-card-body">
            <div className="stat-row">
              <span className="stat-label">Total Drivers</span>
              <span className="stat-value">{data.driverStats.total}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Active Drivers</span>
              <span className="stat-value success">{data.driverStats.active}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Inactive Drivers</span>
              <span className="stat-value warning">{data.driverStats.inactive}</span>
            </div>
          </div>
          <button className="download-button">
            <FaDownload /> Export Overview
          </button>
        </div>

        <div className="stat-card delivery-stats">
          <div className="stat-card-header">
            <FaCar className="stat-icon" />
            <h3>Delivery Performance</h3>
          </div>
          <div className="stat-card-body">
            <div className="stat-row">
              <span className="stat-label">Total Deliveries</span>
              <span className="stat-value highlight">1,234</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">On-Time Rate</span>
              <span className="stat-value success">95%</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Average Time</span>
              <span className="stat-value">28 min</span>
            </div>
          </div>
          <button className="download-button">
            <FaDownload /> Export Performance
          </button>
        </div>

        <div className="stat-card rating-stats">
          <div className="stat-card-header">
            <FaStar className="stat-icon" />
            <h3>Driver Ratings</h3>
          </div>
          <div className="stat-card-body">
            <div className="stat-row">
              <span className="stat-label">Average Rating</span>
              <span className="stat-value success">4.8</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Total Reviews</span>
              <span className="stat-value">3,456</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">5-Star Rate</span>
              <span className="stat-value highlight">82%</span>
            </div>
          </div>
          <button className="download-button">
            <FaDownload /> Export Ratings
          </button>
        </div>
      </div>

      <div className="performance-table-container">
        <h3>Top Performing Drivers</h3>
        <table className="performance-table">
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>Deliveries</th>
              <th>On-Time Rate</th>
              <th>Rating</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John Smith</td>
              <td>156</td>
              <td>98%</td>
              <td>4.9</td>
              <td><span className="status-badge success">Active</span></td>
            </tr>
            <tr>
              <td>Maria Garcia</td>
              <td>142</td>
              <td>96%</td>
              <td>4.8</td>
              <td><span className="status-badge success">Active</span></td>
            </tr>
            <tr>
              <td>David Chen</td>
              <td>138</td>
              <td>95%</td>
              <td>4.8</td>
              <td><span className="status-badge success">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriverPerformance; 