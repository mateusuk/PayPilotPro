// src/components/drivers/DriverDetails.js
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDrivers } from '../../contexts/DriverContext';
import '../../styles/drivers.css';

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDriver, updateDriver, deleteDriver, uploadDriverDocument, error } = useDrivers();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirmOffboard, setConfirmOffboard] = useState(false);
  
  // Fetch driver details
  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        setLoading(true);
        const driverData = await getDriver(id);
        setDriver(driverData);
      } catch (err) {
        console.error('Error fetching driver details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDriverDetails();
  }, [id, getDriver]);
  
  const handleOffboardDriver = async () => {
    if (!confirmOffboard) {
      setConfirmOffboard(true);
      return;
    }
    
    try {
      await updateDriver(id, { status: 'inactive', offboardedAt: new Date().toISOString() });
      navigate('/drivers?tab=inactive');
    } catch (err) {
      console.error('Error offboarding driver:', err);
    } finally {
      setConfirmOffboard(false);
    }
  };
  
  const handleDocumentUpload = async (event, documentType) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      setUploading(true);
      const downloadURL = await uploadDriverDocument(id, file, documentType);
      
      // Update the driver state to reflect the new document
      setDriver(prevDriver => ({
        ...prevDriver,
        documents: {
          ...(prevDriver.documents || {}),
          [documentType]: {
            url: downloadURL,
            fileName: file.name,
            uploadedAt: new Date().toISOString(),
            status: 'pending_review'
          }
        }
      }));
    } catch (err) {
      console.error('Error uploading document:', err);
    } finally {
      setUploading(false);
    }
  };
  
  if (loading) {
    return <div className="loading-container">Loading driver details...</div>;
  }
  
  if (!driver) {
    return (
      <div className="error-container">
        <h3>Driver not found</h3>
        <p>The driver you're looking for could not be found.</p>
        <Link to="/drivers" className="btn btn-primary">Back to Drivers</Link>
      </div>
    );
  }
  
  return (
    <div className="dashboard-content">
      <div className="back-navigation">
        <Link to="/drivers" className="back-button">
          <span className="back-icon">←</span> Back to All Drivers
        </Link>
      </div>
      
      <div className="driver-profile-header">
        <div className="driver-avatar">
          <div className="avatar-circle">
            <span className="avatar-icon">👤</span>
          </div>
        </div>
        <div className="driver-info">
          <h2 className="driver-name">{driver.firstName} {driver.lastName}</h2>
          <p className="driver-status">
            Driver status: <span className={`status-${driver.status}`}>{driver.status}</span> - 
            Access number: {driver.accessNumber || '0000000'}
          </p>
        </div>
        <div className="driver-actions">
          <button 
            className="btn btn-danger"
            onClick={handleOffboardDriver}
          >
            {confirmOffboard ? 'Confirm Offboard' : 'Offboard driver'}
          </button>
        </div>
      </div>
      
      <div className="driver-tabs">
        <Link to={`/drivers/${id}`} className="driver-tab active">Personal Details</Link>
        <Link to={`/drivers/${id}/vehicle`} className="driver-tab">Vehicle</Link>
        <Link to={`/drivers/${id}/financial`} className="driver-tab">Financial Details</Link>
        <Link to={`/drivers/${id}/incidents`} className="driver-tab">Incidents</Link>
        <Link to={`/drivers/${id}/engagement`} className="driver-tab">Engagement Details</Link>
      </div>
      
      <div className="details-section">
        <h3 className="section-title">Personal Details</h3>
        
        <div className="details-container">
          <div className="details-row">
            <div className="details-column">
              <div className="detail-group">
                <label className="detail-label">Full name</label>
                <div className="detail-value">{driver.firstName} {driver.lastName}</div>
              </div>
              
              <div className="detail-group">
                <label className="detail-label">Email</label>
                <div className="detail-value">{driver.email}</div>
              </div>
              
              <div className="detail-group">
                <label className="detail-label">Date of birth</label>
                <div className="detail-value">{driver.dateOfBirth || ''}</div>
              </div>
            </div>
            
            <div className="details-column">
              <div className="detail-group">
                <label className="detail-label">National Insurance Number</label>
                <div className="detail-value">{driver.nationalInsurance || ''}</div>
              </div>
              
              <div className="detail-group">
                <label className="detail-label">Contact number</label>
                <div className="detail-value">{driver.phone || ''}</div>
              </div>
              
              <div className="detail-group">
                <label className="detail-label">Full Address</label>
                <div className="detail-value">{driver.address || ''}</div>
              </div>
            </div>
          </div>
          
          <div className="details-actions">
            <button className="btn btn-primary download-btn">
              <span className="download-icon">📄</span>
              Download Details
            </button>
          </div>
        </div>
      </div>
      
      <div className="details-section">
        <h3 className="section-title">Business Details</h3>
        
        <div className="details-container">
          <div className="details-row">
            <div className="details-column">
              <div className="detail-group">
                <label className="detail-label">Drives a van?</label>
                <div className="detail-value">{driver.drivesVan ? 'Yes' : 'No'}</div>
              </div>
            </div>
            
            <div className="details-column">
              <div className="detail-group">
                <label className="detail-label">Business type</label>
                <div className="detail-value">{driver.businessType || ''}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="details-section">
        <h3 className="section-title">Documents</h3>
        
        <div className="details-container">
          <div className="documents-list">
            {driver.documents && Object.keys(driver.documents).length > 0 ? (
              <div className="document-grid">
                {Object.entries(driver.documents).map(([docType, docInfo]) => (
                  <div key={docType} className="document-card">
                    <div className="document-header">
                      <h4>{docType.replace(/([A-Z])/g, ' $1').trim()}</h4>
                      <div className="document-status">{docInfo.status}</div>
                    </div>
                    <div className="document-preview">
                      {docInfo.url ? (
                        <a href={docInfo.url} target="_blank" rel="noopener noreferrer">
                          <img src={docInfo.url} alt={docType} className="document-thumbnail" />
                        </a>
                      ) : (
                        <div className="document-placeholder">No document uploaded</div>
                      )}
                    </div>
                    <div className="document-info">
                      <div>Uploaded: {new Date(docInfo.uploadedAt).toLocaleDateString()}</div>
                      <div>Filename: {docInfo.fileName}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-documents-message">No documents uploaded yet.</div>
            )}
          </div>
          
          <div className="details-actions">
            <label className="btn btn-primary upload-btn">
              <span className="upload-icon">📤</span>
              Upload Documents
              <input 
                type="file" 
                style={{ display: 'none' }} 
                onChange={(e) => handleDocumentUpload(e, 'drivingLicense')} 
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDetails;