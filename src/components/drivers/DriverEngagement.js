// Example for src/components/drivers/DriverEngagement.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDrivers } from '../../contexts/DriverContext';
import Alert from '../ui/Alert'; // Correct import path
import useFirestore from '../../hooks/useFirestore'; // Correct import pathe';
import { useNavigate } from 'react-router-dom';


const DriverEngagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDocument, updateDocument } = useFirestore('drivers');
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [externalId, setExternalId] = useState('');
  const [editingExternalId, setEditingExternalId] = useState(false);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const driverData = await getDocument(id);
        setDriver(driverData);
        setExternalId(driverData.externalId || '');
        setLocations(driverData.locations || []);
        setAgreements(driverData.agreements || []);
      } catch (err) {
        console.error('Error fetching driver:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [id, getDocument]);

  const handleExternalIdSave = async () => {
    try {
      await updateDocument(id, { externalId });
      setEditingExternalId(false);
    } catch (err) {
      console.error('Error updating external ID:', err);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!driver) {
    return <div>Driver not found</div>;
  }

  return (
    <div className="engagement-details">
      <div className="engagement-header">
        <div className="customer-tag">{driver.customer || 'N/A'}</div>
        <div className="download-container">
          <button className="btn btn-primary download-btn">
            <span className="download-icon">📄</span>
            Download Audit Pack
          </button>
        </div>
      </div>
      
      <div className="engagement-grid">
        <div className="engagement-item">
          <div className="engagement-label">Status</div>
          <div className="engagement-value onboarding">
            {driver.status === 'active' ? 'Active' : driver.status === 'invited' ? 'Onboarding' : 'Inactive'}
          </div>
        </div>
        <div className="engagement-item">
          <div className="engagement-label">Start Date</div>
          <div className="engagement-value">
            {driver.startDate ? new Date(driver.startDate).toLocaleDateString() : 'N/A'}
          </div>
        </div>
        <div className="engagement-item">
          <div className="engagement-label">End Date</div>
          <div className="engagement-value">
            {driver.endDate ? new Date(driver.endDate).toLocaleDateString() : 'N/A'}
          </div>
        </div>
        <div className="engagement-item">
          <div className="engagement-label">Employment type</div>
          <div className="engagement-value">Self-employed</div>
        </div>
        <div className="engagement-item">
          <div className="engagement-label">Department</div>
          <div className="engagement-value">Logistics</div>
        </div>
        <div className="engagement-item">
          <div className="engagement-label">Role</div>
          <div className="engagement-value">{driver.role || 'Standard Driver'}</div>
        </div>
      </div>

      <div className="external-id-container">
        <div className="external-id-label">External ID</div>
        {editingExternalId ? (
          <>
            <input 
              type="text" 
              className="form-control external-id-input" 
              value={externalId} 
              onChange={(e) => setExternalId(e.target.value)}
            />
            <button className="btn btn-primary save-btn" onClick={handleExternalIdSave}>Save</button>
          </>
        ) : (
          <>
            <div className="external-id-value">{externalId || 'Not yet provided'}</div>
            <button className="btn btn-primary edit-btn" onClick={() => setEditingExternalId(true)}>Edit</button>
          </>
        )}
      </div>

      <div className="locations-section">
        <div className="locations-header">
          <h3 className="section-title-tab active">Locations</h3>
          <h3 className="section-title-tab">Maps</h3>
          <button className="btn btn-primary add-location-btn">Add location</button>
        </div>
        
        <div className="locations-content">
          {locations.length > 0 ? (
            locations.map((location, index) => (
              <div className="location-card" key={index}>
                <div className="location-header">{location.name}</div>
                <div className="location-address">
                  {location.address && location.address.split(',').map((line, i) => (
                    <p key={i}>{line.trim()}</p>
                  ))}
                </div>
                <button className="location-close-btn">×</button>
              </div>
            ))
          ) : (
            <div className="location-card">
              <div className="location-header">{driver.location || 'Crawley'}</div>
              <div className="location-address">
                <p>No detailed address provided</p>
              </div>
              <button className="location-close-btn">×</button>
            </div>
          )}
        </div>
      </div>

      <div className="agreements-section">
        <div className="agreements-header">
          <h3 className="section-title">Agreements</h3>
          <div className="agreements-count">0/3</div>
        </div>
        
        <div className="agreements-list">
          <div className="agreement-item">
            <div className="agreement-icon">📄</div>
            <div className="agreement-title">Privacy Notice</div>
            <div className="agreement-status">Not yet Completed</div>
          </div>
          
          <div className="agreement-item">
            <div className="agreement-icon">📄</div>
            <div className="agreement-title">GDPR</div>
            <div className="agreement-status">Not yet Completed</div>
          </div>
          
          <div className="agreement-item">
            <div className="agreement-icon">📄</div>
            <div className="agreement-title">Medical fitness Declaration</div>
            <div className="agreement-status">Not yet Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverEngagement;