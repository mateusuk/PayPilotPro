import React from 'react';
import { FaDownload, FaClipboardCheck, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import '../reporting.css';

const ComplianceReport = ({ data }) => {
  return (
    <div className="report-content">
      <div className="report-grid">
        <div className="stat-card compliance-overview">
          <div className="stat-card-header">
            <FaClipboardCheck className="stat-icon" />
            <h3>Compliance Overview</h3>
          </div>
          <div className="stat-card-body">
            <div className="stat-row">
              <span className="stat-label">Overall Compliance</span>
              <span className="stat-value success">{data.complianceRate}%</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Total Documents</span>
              <span className="stat-value">{data.documentStats.valid + data.documentStats.expiring + data.documentStats.expired}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Missing Documents</span>
              <span className="stat-value danger">{data.documentStats.missing}</span>
            </div>
          </div>
          <button className="download-button">
            <FaDownload /> Export Overview
          </button>
        </div>

        <div className="stat-card document-status">
          <div className="stat-card-header">
            <FaExclamationTriangle className="stat-icon" />
            <h3>Document Status</h3>
          </div>
          <div className="stat-card-body">
            <div className="stat-row">
              <span className="stat-label">Valid Documents</span>
              <span className="stat-value success">{data.documentStats.valid}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Expiring Soon</span>
              <span className="stat-value warning">{data.documentStats.expiring}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Expired</span>
              <span className="stat-value danger">{data.documentStats.expired}</span>
            </div>
          </div>
          <button className="download-button">
            <FaDownload /> Export Status
          </button>
        </div>

        <div className="stat-card renewal-tracking">
          <div className="stat-card-header">
            <FaClock className="stat-icon" />
            <h3>Renewal Tracking</h3>
          </div>
          <div className="stat-card-body">
            <div className="stat-row">
              <span className="stat-label">Due This Week</span>
              <span className="stat-value warning">5</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Due Next Week</span>
              <span className="stat-value">8</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Due This Month</span>
              <span className="stat-value">15</span>
            </div>
          </div>
          <button className="download-button">
            <FaDownload /> Export Schedule
          </button>
        </div>
      </div>

      <div className="compliance-table-container">
        <h3>Document Compliance Status</h3>
        <table className="compliance-table">
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>Document Type</th>
              <th>Status</th>
              <th>Expiry Date</th>
              <th>Action Required</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John Smith</td>
              <td>Driver's License</td>
              <td><span className="status-badge warning">Expiring Soon</span></td>
              <td>2024-04-15</td>
              <td>Renewal Required</td>
            </tr>
            <tr>
              <td>Maria Garcia</td>
              <td>Insurance</td>
              <td><span className="status-badge success">Valid</span></td>
              <td>2024-12-31</td>
              <td>No Action</td>
            </tr>
            <tr>
              <td>David Chen</td>
              <td>Vehicle Registration</td>
              <td><span className="status-badge danger">Expired</span></td>
              <td>2024-02-28</td>
              <td>Immediate Update Required</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplianceReport; 