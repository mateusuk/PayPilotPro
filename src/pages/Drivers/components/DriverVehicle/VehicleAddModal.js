import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/ui/Modal';
import Alert from '../../../../components/ui/Alert';
import './VehicleAddModal.css';

const VehicleAddModal = ({ isOpen, onClose, onVehicleAdded }) => {
  const [vehicleData, setVehicleData] = useState({
    registration: '',
    make: '',
    model: '',
    year: '',
    color: '',
    fuelType: '',
    vehicleType: '',
    status: 'available',
    insurance: {
      policyNumber: '',
      provider: '',
      expiryDate: ''
    },
    documents: [],
    vehicleComments: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMessage('');
    } else {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setVehicleData({
      registration: '',
      make: '',
      model: '',
      year: '',
      color: '',
      fuelType: '',
      vehicleType: '',
      status: 'available',
      insurance: {
        policyNumber: '',
        provider: '',
        expiryDate: ''
      },
      documents: [],
      vehicleComments: ''
    });
    setError('');
    setSuccessMessage('');
  };

  // Clear error message
  const clearError = () => {
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('insurance.')) {
      const insuranceField = name.split('.')[1];
      setVehicleData(prev => ({
        ...prev,
        insurance: {
          ...prev.insurance,
          [insuranceField]: value
        }
      }));
    } else {
      setVehicleData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      clearError();
      
      // Basic validation
      if (!vehicleData.registration || !vehicleData.make || !vehicleData.model) {
        throw new Error('Please fill in all required fields');
      }
      
      // Format registration to uppercase without spaces
      const formattedRegistration = vehicleData.registration.toUpperCase().replace(/\s/g, '');
      
      // Create a new vehicle object
      const newVehicle = {
        ...vehicleData,
        registration: formattedRegistration,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // In a real app, you would call an API to add the vehicle
      console.log('Adding new vehicle:', newVehicle);
      
      // Show success message
      setSuccessMessage('Vehicle added successfully');
      
      // Call the callback function from parent with the new vehicle
      if (onVehicleAdded) {
        onVehicleAdded(newVehicle);
      }
      
      // Reset form after short delay to show success message
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error adding vehicle:', err);
      setError(err.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Vehicle">
      <div className="vehicle-add-container">
        {error && (
          <Alert type="error" message={error} onClose={clearError} />
        )}
        
        {successMessage && (
          <Alert type="success" message={successMessage} />
        )}
        
        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="form-section">
            <h3 className="section-subtitle">Vehicle Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="registration">Registration *</label>
                <input
                  type="text"
                  id="registration"
                  name="registration"
                  value={vehicleData.registration}
                  onChange={handleInputChange}
                  placeholder="AB12 CDE"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="make">Make *</label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  value={vehicleData.make}
                  onChange={handleInputChange}
                  placeholder="e.g. Ford"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="model">Model *</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={vehicleData.model}
                  onChange={handleInputChange}
                  placeholder="e.g. Transit"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="year">Year</label>
                <input
                  type="text"
                  id="year"
                  name="year"
                  value={vehicleData.year}
                  onChange={handleInputChange}
                  placeholder="e.g. 2022"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="color">Color</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={vehicleData.color}
                  onChange={handleInputChange}
                  placeholder="e.g. White"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="fuelType">Fuel Type</label>
                <select
                  id="fuelType"
                  name="fuelType"
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
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="vehicleType">Vehicle Type</label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  value={vehicleData.vehicleType}
                  onChange={handleInputChange}
                >
                  <option value="">Select vehicle type</option>
                  <option value="Car">Car</option>
                  <option value="Van">Van</option>
                  <option value="Motorcycle">Motorcycle</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={vehicleData.status}
                  onChange={handleInputChange}
                >
                  <option value="available">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="maintenance">In Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3 className="section-subtitle">Insurance Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="insurance.provider">Insurance Provider</label>
                <input
                  type="text"
                  id="insurance.provider"
                  name="insurance.provider"
                  value={vehicleData.insurance.provider}
                  onChange={handleInputChange}
                  placeholder="e.g. Aviva"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="insurance.policyNumber">Policy Number</label>
                <input
                  type="text"
                  id="insurance.policyNumber"
                  name="insurance.policyNumber"
                  value={vehicleData.insurance.policyNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. POL-12345"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="insurance.expiryDate">Expiry Date</label>
                <input
                  type="date"
                  id="insurance.expiryDate"
                  name="insurance.expiryDate"
                  value={vehicleData.insurance.expiryDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3 className="section-subtitle">Additional Information</h3>
            
            <div className="form-group">
              <label htmlFor="vehicleComments">Comments</label>
              <textarea
                id="vehicleComments"
                name="vehicleComments"
                value={vehicleData.vehicleComments}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any additional notes about this vehicle..."
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default VehicleAddModal; 