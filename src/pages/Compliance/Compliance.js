import React, { useState } from 'react';
import { FaFileAlt, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaUpload, FaDownload } from 'react-icons/fa';
import './compliance.css';

const Compliance = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual API call
  const complianceData = {
    overview: {
      totalDocuments: 45,
      compliantDocuments: 38,
      expiringDocuments: 4,
      missingDocuments: 3,
      complianceScore: 84,
    },
    documents: [
      {
        id: 1,
        name: 'Driver License',
        status: 'valid',
        expiryDate: '2025-12-31',
        lastUpdated: '2024-01-15',
        type: 'identification'
      },
      {
        id: 2,
        name: 'Vehicle Insurance',
        status: 'expiring',
        expiryDate: '2024-05-01',
        lastUpdated: '2023-05-01',
        type: 'insurance'
      },
      {
        id: 3,
        name: 'Background Check',
        status: 'expired',
        expiryDate: '2024-03-01',
        lastUpdated: '2023-03-01',
        type: 'verification'
      },
      // Add more mock data here
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid':
        return 'success';
      case 'expiring':
        return 'warning';
      case 'expired':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid':
        return <FaCheckCircle />;
      case 'expiring':
        return <FaExclamationTriangle />;
      case 'expired':
        return <FaTimesCircle />;
      default:
        return <FaFileAlt />;
    }
  };

  return (
    <div className="compliance-container">
      <div className="compliance-header">
        <div>
          <h1>Compliance Management</h1>
          <p>Track and manage compliance requirements</p>
        </div>
        <button className="upload-button">
          <FaUpload /> Upload Document
        </button>
      </div>

      <div className="compliance-overview">
        <div className="overview-card score">
          <h3>Compliance Score</h3>
          <div className="score-circle">
            <div className="score-value">{complianceData.overview.complianceScore}%</div>
          </div>
          <p>Overall compliance status</p>
        </div>
        <div className="overview-card">
          <h3>Total Documents</h3>
          <div className="stat-value">{complianceData.overview.totalDocuments}</div>
          <p>Required documents</p>
        </div>
        <div className="overview-card success">
          <h3>Compliant</h3>
          <div className="stat-value">{complianceData.overview.compliantDocuments}</div>
          <p>Up-to-date documents</p>
        </div>
        <div className="overview-card warning">
          <h3>Expiring Soon</h3>
          <div className="stat-value">{complianceData.overview.expiringDocuments}</div>
          <p>Documents needing renewal</p>
        </div>
        <div className="overview-card danger">
          <h3>Missing/Expired</h3>
          <div className="stat-value">{complianceData.overview.missingDocuments}</div>
          <p>Documents requiring attention</p>
        </div>
      </div>

      <div className="compliance-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
        <button
          className={`tab-button ${activeTab === 'requirements' ? 'active' : ''}`}
          onClick={() => setActiveTab('requirements')}
        >
          Requirements
        </button>
      </div>

      <div className="compliance-content">
        {activeTab === 'overview' && (
          <div className="documents-grid">
            {complianceData.documents.map(doc => (
              <div key={doc.id} className={`document-card ${doc.status}`}>
                <div className="document-icon">
                  {getStatusIcon(doc.status)}
                </div>
                <div className="document-info">
                  <h4>{doc.name}</h4>
                  <p>Expires: {doc.expiryDate}</p>
                  <span className={`status-badge ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </div>
                <div className="document-actions">
                  <button title="Download Document">
                    <FaDownload />
                  </button>
                  <button title="Upload New Version">
                    <FaUpload />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-table-container">
            <table className="documents-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Expiry Date</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complianceData.documents.map(doc => (
                  <tr key={doc.id}>
                    <td>{doc.name}</td>
                    <td>
                      <span className="document-type">{doc.type}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td>{doc.expiryDate}</td>
                    <td>{doc.lastUpdated}</td>
                    <td>
                      <div className="action-buttons">
                        <button title="Download Document">
                          <FaDownload />
                        </button>
                        <button title="Upload New Version">
                          <FaUpload />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="requirements-list">
            <div className="requirement-group">
              <h3>Driver Requirements</h3>
              <ul>
                <li className="complete">Valid Driver's License</li>
                <li className="complete">Background Check</li>
                <li className="pending">Drug Test</li>
                <li className="complete">Training Certification</li>
              </ul>
            </div>
            <div className="requirement-group">
              <h3>Vehicle Requirements</h3>
              <ul>
                <li className="complete">Vehicle Registration</li>
                <li className="complete">Insurance Coverage</li>
                <li className="pending">Safety Inspection</li>
                <li className="incomplete">Emissions Test</li>
              </ul>
            </div>
            <div className="requirement-group">
              <h3>Company Requirements</h3>
              <ul>
                <li className="complete">Business License</li>
                <li className="complete">Tax Documentation</li>
                <li className="complete">Operating Permits</li>
                <li className="pending">Safety Certifications</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compliance; 