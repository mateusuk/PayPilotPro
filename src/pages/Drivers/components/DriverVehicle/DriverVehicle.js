import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDrivers } from '../../context/DriversContext';
import Alert from '../../../../components/ui/Alert';
import VehicleAddModal from './VehicleAddModal';
import '../../styles/drivers.css';
import './DriverVehicle.css';

const DriverVehicle = () => {
  const { id } = useParams();
  const { loading: contextLoading, getDriverById, updateDriver, error } = useDrivers();
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
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  // Fetch driver details
  useEffect(() => {
    const fetchDriverVehicle = async () => {
      try {
        setLoading(true);
        const driverData = await getDriverById(id);
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
        
        // Fetch available vehicles (mock data for now)
        // In a real app, you would fetch this from an API
        fetchAvailableVehicles();
      } catch (err) {
        console.error('Error fetching driver vehicle:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDriverVehicle();
  }, [id, getDriverById]);

  // Mock function to fetch available vehicles
  const fetchAvailableVehicles = () => {
    // In a real app, this would be an API call
    const mockVehicles = [
      {
        id: '1',
        registration: 'AB12CDE',
        make: 'Ford',
        model: 'Transit',
        year: '2021',
        color: 'White',
        fuelType: 'Diesel',
        vehicleType: 'Van',
        status: 'available'
      },
      {
        id: '2',
        registration: 'XY20ABC',
        make: 'Volkswagen',
        model: 'Transporter',
        year: '2020',
        color: 'Silver',
        fuelType: 'Diesel',
        vehicleType: 'Van',
        status: 'available'
      },
      {
        id: '3',
        registration: 'BC65FGH',
        make: 'Renault',
        model: 'Kangoo',
        year: '2022',
        color: 'Blue',
        fuelType: 'Electric',
        vehicleType: 'Van',
        status: 'available'
      }
    ];
    
    setAvailableVehicles(mockVehicles);
  };

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

  // Handle vehicle assignment from dropdown
  const handleVehicleAssignment = async () => {
    if (!selectedVehicleId) return;
    
    try {
      setUpdating(true);
      
      // Find the selected vehicle
      const selectedVehicle = availableVehicles.find(v => v.id === selectedVehicleId);
      
      if (!selectedVehicle) {
        throw new Error('Selected vehicle not found');
      }
      
      // Update vehicle data with selected vehicle details
      const newVehicleData = {
        registration: selectedVehicle.registration,
        make: selectedVehicle.make,
        model: selectedVehicle.model,
        fuelType: selectedVehicle.fuelType,
        vehicleType: selectedVehicle.vehicleType,
        vehicleComments: '',
        assignedAt: new Date().toISOString()
      };
      
      // Update driver with new vehicle data
      await updateDriver(id, { 
        vehicle: newVehicleData,
        drivesVan: newVehicleData.vehicleType === 'Van'
      });
      
      setSuccessMessage('Vehicle assigned successfully');
      
      // Update local state
      setVehicleData(newVehicleData);
      setDriver(prev => ({
        ...prev,
        vehicle: newVehicleData,
        drivesVan: newVehicleData.vehicleType === 'Van'
      }));
      
      // Update available vehicles (remove the assigned one)
      setAvailableVehicles(prev => prev.filter(v => v.id !== selectedVehicleId));
      setSelectedVehicleId('');
    } catch (err) {
      console.error('Error assigning vehicle:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Handle new vehicle addition
  const handleVehicleAdded = (newVehicle) => {
    // Add the new vehicle to available vehicles
    setAvailableVehicles(prev => [...prev, { ...newVehicle, id: String(prev.length + 1) }]);
    
    // Show success message
    setSuccessMessage('New vehicle added to the fleet');
  };

  // Handle vehicle removal from driver
  const handleRemoveVehicle = async () => {
    try {
      setUpdating(true);
      
      // If the vehicle was from available vehicles, make it available again
      if (driver.vehicle && driver.vehicle.registration) {
        const removedVehicle = {
          id: String(availableVehicles.length + 1),
          registration: driver.vehicle.registration,
          make: driver.vehicle.make,
          model: driver.vehicle.model,
          fuelType: driver.vehicle.fuelType,
          vehicleType: driver.vehicle.vehicleType,
          status: 'available'
        };
        
        setAvailableVehicles(prev => [...prev, removedVehicle]);
      }
      
      // Update driver to remove vehicle
      await updateDriver(id, { 
        vehicle: null,
        drivesVan: false
      });
      
      setSuccessMessage('Vehicle removed from driver');
      
      // Update local state
      setVehicleData({
        registration: '',
        make: '',
        model: '',
        fuelType: '',
        vehicleType: '',
        vehicleComments: ''
      });
      
      setDriver(prev => ({
        ...prev,
        vehicle: null,
        drivesVan: false
      }));
    } catch (err) {
      console.error('Error removing vehicle:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || contextLoading) {
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
    <>
      {error && <Alert message={error} type="error" />}
      {successMessage && <Alert message={successMessage} type="success" autoClose />}
      
      <div className="details-section">
        <div className="section-header">
          <h3 className="section-title">Vehicle Management</h3>
          <div className="vehicle-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddVehicleModal(true)}
            >
              Add New Vehicle
            </button>
          </div>
        </div>
        
        <div className="vehicle-assignment-section">
          <h4 className="section-subtitle">Assign Vehicle</h4>
          
          {driver.vehicle ? (
            <div className="current-vehicle">
              <p className="assignment-status">
                Currently assigned vehicle: <strong>{driver.vehicle.make} {driver.vehicle.model}</strong> ({driver.vehicle.registration})
              </p>
              <button
                className="btn btn-warning"
                onClick={handleRemoveVehicle}
                disabled={updating}
              >
                Remove Vehicle
              </button>
            </div>
          ) : (
            <div className="vehicle-assignment-form">
              <div className="form-row">
                <div className="form-group vehicle-selector">
                  <label htmlFor="vehicle-select">Select Vehicle</label>
                  <select
                    id="vehicle-select"
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="form-select"
                  >
                    <option value="">-- Select a vehicle --</option>
                    {availableVehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.registration}) - {vehicle.vehicleType}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group vehicle-assign-btn">
                  <button
                    className="btn btn-success"
                    onClick={handleVehicleAssignment}
                    disabled={!selectedVehicleId || updating}
                  >
                    Assign Vehicle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="details-section">
        <div className="section-header">
          <h3 className="section-title">Vehicle Details</h3>
          {!editMode && driver.vehicle && (
            <button className="btn btn-primary" onClick={toggleEditMode}>
              Edit Details
            </button>
          )}
        </div>
        
        <div className="details-container">
          {driver.vehicle ? (
            editMode ? (
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
                        className="form-select"
                        value={vehicleData.fuelType}
                        onChange={handleInputChange}
                      >
                        <option value="">Select fuel type</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    
                    <div className="detail-group">
                      <label className="detail-label">Vehicle Type</label>
                      <select
                        name="vehicleType"
                        className="form-select"
                        value={vehicleData.vehicleType}
                        onChange={handleInputChange}
                      >
                        <option value="">Select vehicle type</option>
                        <option value="Car">Car</option>
                        <option value="Van">Van</option>
                        <option value="Motorcycle">Motorcycle</option>
                      </select>
                    </div>
                    
                    <div className="detail-group">
                      <label className="detail-label">Comments</label>
                      <textarea
                        name="vehicleComments"
                        className="form-control"
                        value={vehicleData.vehicleComments}
                        onChange={handleInputChange}
                        rows="3"
                      />
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
              <div className="details-row">
                <div className="details-column">
                  <div className="detail-group">
                    <label className="detail-label">Registration</label>
                    <div className="detail-value">{driver.vehicle.registration || 'Not provided'}</div>
                  </div>
                  
                  <div className="detail-group">
                    <label className="detail-label">Make</label>
                    <div className="detail-value">{driver.vehicle.make || 'Not provided'}</div>
                  </div>
                  
                  <div className="detail-group">
                    <label className="detail-label">Model</label>
                    <div className="detail-value">{driver.vehicle.model || 'Not provided'}</div>
                  </div>
                </div>
                
                <div className="details-column">
                  <div className="detail-group">
                    <label className="detail-label">Fuel Type</label>
                    <div className="detail-value">{driver.vehicle.fuelType || 'Not provided'}</div>
                  </div>
                  
                  <div className="detail-group">
                    <label className="detail-label">Vehicle Type</label>
                    <div className="detail-value">
                      <span className={`vehicle-type-badge ${driver.vehicle.vehicleType?.toLowerCase() || ''}`}>
                        {driver.vehicle.vehicleType || 'Not provided'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="detail-group">
                    <label className="detail-label">Comments</label>
                    <div className="detail-value">{driver.vehicle.vehicleComments || 'None'}</div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="no-vehicle-message">
              <p>No vehicle is currently assigned to this driver.</p>
              <p>Assign a vehicle from the available fleet or add a new vehicle.</p>
            </div>
          )}
        </div>
      </div>
      
      <VehicleAddModal
        isOpen={showAddVehicleModal}
        onClose={() => setShowAddVehicleModal(false)}
        onVehicleAdded={handleVehicleAdded}
      />
    </>
  );
};

export default DriverVehicle; 