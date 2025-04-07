import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Alert from '../../../../components/ui/Alert';
import Loader from '../../../../components/ui/Loader';
import { useDrivers } from '../../context/DriversContext';
import { useFirestore } from '../../../../hooks/useFirestore';
import '../../styles/drivers.css';
import './DriverEngagement.css';

const DriverEngagement = () => {
  const { id } = useParams();
  const { getDriverById, updateDriver } = useDrivers();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [locations, setLocations] = useState([]);
  const [externalId, setExternalId] = useState('');
  const [editingExternalId, setEditingExternalId] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', address: '' });

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        setLoading(true);
        setError(null);
        const driverData = await getDriverById(id);
        if (!driverData) {
          throw new Error('Driver not found');
        }
        setDriver(driverData);
        setExternalId(driverData.externalId || '');
        setLocations(driverData.locations || []);
      } catch (err) {
        console.error('Error fetching driver:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [id, getDriverById]);

  const handleExternalIdSave = async () => {
    try {
      setError(null);
      await updateDriver(id, { externalId });
      setEditingExternalId(false);
      setSuccessMessage('External ID updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating external ID:', err);
      setError(err.message);
    }
  };

  const handleAddLocation = async () => {
    try {
      setError(null);
      const updatedLocations = [...locations, newLocation];
      await updateDriver(id, { locations: updatedLocations });
      setLocations(updatedLocations);
      setShowAddLocation(false);
      setNewLocation({ name: '', address: '' });
      setSuccessMessage('Location added successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error adding location:', err);
      setError(err.message);
    }
  };

  const handleRemoveLocation = async (index) => {
    try {
      setError(null);
      const updatedLocations = locations.filter((_, i) => i !== index);
      await updateDriver(id, { locations: updatedLocations });
      setLocations(updatedLocations);
      setSuccessMessage('Location removed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error removing location:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return <Loader message="Loading engagement details..." />;
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  if (!driver) {
    return <Alert message="Driver not found" type="error" />;
  }

  return (
    <div className="engagement-details">
      {successMessage && <Alert message={successMessage} type="success" autoClose />}
      
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
          <div className={`engagement-value status-${driver.status}`}>
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
          <div className="engagement-value">{driver.employmentType || 'Self-employed'}</div>
        </div>
        <div className="engagement-item">
          <div className="engagement-label">Department</div>
          <div className="engagement-value">{driver.department || 'Logistics'}</div>
        </div>
        <div className="engagement-item">
          <div className="engagement-label">Role</div>
          <div className="engagement-value">{driver.role || 'Standard Driver'}</div>
        </div>
      </div>

      <div className="external-id-container">
        <div className="external-id-label">External ID</div>
        {editingExternalId ? (
          <div className="external-id-edit">
            <input 
              type="text" 
              className="form-control external-id-input" 
              value={externalId} 
              onChange={(e) => setExternalId(e.target.value)}
              placeholder="Enter external ID"
            />
            <div className="external-id-actions">
              <button className="btn btn-secondary" onClick={() => setEditingExternalId(false)}>Cancel</button>
              <button className="btn btn-primary save-btn" onClick={handleExternalIdSave}>Save</button>
            </div>
          </div>
        ) : (
          <div className="external-id-display">
            <div className="external-id-value">{externalId || 'Not yet provided'}</div>
            <button className="btn btn-primary edit-btn" onClick={() => setEditingExternalId(true)}>Edit</button>
          </div>
        )}
      </div>

      <div className="locations-section">
        <div className="locations-header">
          <h3 className="section-title-tab active">Locations</h3>
          <h3 className="section-title-tab">Maps</h3>
          <button 
            className="btn btn-primary add-location-btn"
            onClick={() => setShowAddLocation(true)}
          >
            Add location
          </button>
        </div>
        
        <div className="locations-content">
          {showAddLocation && (
            <div className="location-card new-location">
              <input
                type="text"
                className="form-control location-input"
                placeholder="Location name"
                value={newLocation.name}
                onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
              />
              <textarea
                className="form-control location-textarea"
                placeholder="Address"
                value={newLocation.address}
                onChange={(e) => setNewLocation(prev => ({ ...prev, address: e.target.value }))}
              />
              <div className="location-actions">
                <button className="btn btn-secondary" onClick={() => setShowAddLocation(false)}>Cancel</button>
                <button 
                  className="btn btn-primary"
                  onClick={handleAddLocation}
                  disabled={!newLocation.name || !newLocation.address}
                >
                  Save
                </button>
              </div>
            </div>
          )}
          
          {locations.length > 0 ? (
            locations.map((location, index) => (
              <div className="location-card" key={index}>
                <div className="location-header">{location.name}</div>
                <div className="location-address">
                  {location.address && location.address.split(',').map((line, i) => (
                    <p key={i}>{line.trim()}</p>
                  ))}
                </div>
                <button 
                  className="location-close-btn"
                  onClick={() => handleRemoveLocation(index)}
                  aria-label="Remove location"
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <div className="location-card">
              <div className="location-header">{driver.location || 'Default Location'}</div>
              <div className="location-address">
                <p>No detailed address provided</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="agreements-section">
        <div className="agreements-header">
          <h3 className="section-title">Required Agreements</h3>
          <div className="agreements-count">
            {driver.agreements?.filter(a => a.completed).length || 0}/
            {driver.agreements?.length || 3}
          </div>
        </div>
        
        <div className="agreements-list">
          {(driver.agreements || [
            { id: 'privacy', title: 'Privacy Notice', completed: false },
            { id: 'gdpr', title: 'GDPR', completed: false },
            { id: 'medical', title: 'Medical Fitness Declaration', completed: false }
          ]).map(agreement => (
            <div className="agreement-item" key={agreement.id}>
              <div className="agreement-icon">
                {agreement.completed ? '✅' : '📄'}
              </div>
              <div className="agreement-title">{agreement.title}</div>
              <div className={`agreement-status ${agreement.completed ? 'completed' : ''}`}>
                {agreement.completed ? 'Completed' : 'Not yet Completed'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverEngagement; 