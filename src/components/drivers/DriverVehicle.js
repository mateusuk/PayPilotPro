import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDrivers } from '../../contexts/DriverContext';
import Alert from '../ui/Alert';
import '../../styles/drivers.css';

const DriverVehicle = () => {
  const { id } = useParams();
  const { getDriver, updateDriver, error } = useDrivers();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [vehicleData, setVehicleData] = useState({
    registration: '',
    make: '',
    model: '',
    fuelType: '',
    vehicleType: '',
    vehicleComments: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch driver details
  useEffect(() => {
    const fetchDriverVehicle = async () => {
      try {
        setLoading(true);
        const driverData = await getDriver(id);
        setDriver(driverData);
        
        // Initialize form with existing vehicle data if available
        if (driverData.vehicle) {
          setVehicleData({
            registration: driverData.vehicle.registration || '',
            make: driverData.vehicle.make || '',
            model: driverData.vehicle.model || '',
            fuelType: driverData.vehicle.fuelType || '',
            vehicleType: driverData.vehicle.vehicleType || '',
            vehicleComments: driverData.vehicle.vehicleComments || ''
          });
        }
      } catch (err) {
        console.error('Error fetching driver vehicle:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDriverVehicle();
  }, [id, getDriver]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
    setSuccessMessage('');
  };

  // Save vehicle details
  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      
      // Update driver with new vehicle data
      await updateDriver(id, { 
        vehicle: vehicleData,
        drivesVan: vehicleData.vehicleType === 'Van'
      });
      
      setEditMode(false);
      setSuccessMessage('Vehicle details updated successfully');
      
      // Update local driver state
      setDriver(prev => ({
        ...prev,
        vehicle: vehicleData,
        drivesVan: vehicleData.vehicleType === 'Van'
      }));
    } catch (err) {
      console.error('Error updating vehicle details:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading driver vehicle details...</div>;
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
            onClick={() => {}}
          >
            Offboard driver
          </button>
        </div>
      </div>
      
      <div className="driver-tabs">
        <Link to={`/drivers/${id}`} className="driver-tab">Personal Details</Link>
        <Link to={`/drivers/${id}/vehicle`} className="driver-tab active">Vehicle</Link>
        <Link to={`/drivers/${id}/financial`} className="driver-tab">Financial Details</Link>
        <Link to={`/drivers/${id}/incidents`} className="driver-tab">Incidents</Link>
        <Link to={`/drivers/${id}/engagement`} className="driver-tab">Engagement Details</Link>
      </div>
      
      {error && <Alert message={error} type="error" />}
      {successMessage && <Alert message={successMessage} type="success" autoClose />}
      
      <div className="details-section">
        <div className="section-header">
          <h3 className="section-title">Vehicle Details</h3>
          {!editMode && (
            <button className="btn btn-primary" onClick={toggleEditMode}>
              Edit Details
            </button>
          )}
        </div>
        
        <div className="details-container">
          {editMode ? (
            <form onSubmit={handleSaveVehicle}>
              <div className="details-row">
                <div className="details-column">
                  <div className="detail-group">
                    <label className="detail-label">Registration</label>
                    <input
                      type="text"
                      name="registration"
                      className="form-control"
                      value={vehicleData.registration}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="detail-group">
                    <label className="detail-label">Make</label>
                    <input
                      type="text"
                      name="make"
                      className="form-control"
                      value={vehicleData.make}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="detail-group">
                    <label className="detail-label">Model</label>
                    <input
                      type="text"
                      name="model"
                      className="form-control"
                      value={vehicleData.model}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="details-column">
                  <div className="detail-group">
                    <label className="detail-label">Fuel Type</label>
                    <select
                      name="fuelType"
                      className="form-control"
                      value={vehicleData.fuelType}
                      onChange={handleInputChange}
                    >
                      <option value="">Select fuel type</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="LPG">LPG</option>
                    </select>
                  </div>
                  
                  <div className="detail-group">
                    <label className="detail-label">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      className="form-control"
                      value={vehicleData.vehicleType}
                      onChange={handleInputChange}
                    >
                      <option value="">Select vehicle type</option>
                      <option value="Car">Car</option>
                      <option value="Van">Van</option>
                      <option value="Truck">Truck</option>
                      <option value="Motorcycle">Motorcycle</option>
                    </select>
                  </div>
                  
                  <div className="detail-group">
                    <label className="detail-label">Vehicle Comments</label>
                    <textarea
                      name="vehicleComments"
                      className="form-control"
                      value={vehicleData.vehicleComments}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={toggleEditMode}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="details-row">
                <div className="details-column">
                  <div className="detail-group">
                    <label className="detail-label">Registration</label>
                    <div className="detail-value">
                      {driver.vehicle?.registration || ''}
                    </div>
                  </div>
                  
                  <div className="detail-group">
                    <label className="detail-label">Make</label>
                    <div className="detail-value">
                      {driver.vehicle?.make || ''}
                    </div>
                  </div>
                  
                  <div className="detail-group">
                    <label className="detail-label">Model</label>
                    <div className="detail-value">
                      {driver.vehicle?.model || ''}
                    </div>
                  </div>
                </div>
                
                <div className="details-column">
                  <div className="detail-group">
                    <label className="detail-label">Fuel Type</label>
                    <div className="detail-value">
                      {driver.vehicle?.fuelType || ''}
                    </div>
                  </div>
                  
                  <div className="detail-group">
                    <label className="detail-label">Vehicle Type</label>
                    <div className="detail-value">
                      {driver.vehicle?.vehicleType || ''}
                    </div>
                  </div>
                  
                  <div className="detail-group">
                    <label className="detail-label">Vehicle Comments</label>
                    <div className="detail-value comment-value">
                      {driver.vehicle?.vehicleComments || 'No Comments'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="details-actions">
                <button className="btn btn-primary download-btn">
                  <span className="download-icon">📄</span>
                  Download Details
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverVehicle;