import React, { useState, useEffect } from 'react';
import { useDrivers } from '../../context/DriversContext';
import Modal from '../../../../components/ui/Modal';
import Alert from '../../../../components/ui/Alert';
import './AddDriver.css';

const AddDriver = ({ isOpen, onClose, onDriverAdded }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState('');
  const [role, setRole] = useState('Driver');
  const [location, setLocation] = useState('');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { addDriver, error, clearError } = useDrivers();

  // Sample data for dropdowns
  const customers = ['Amazon', 'DHL', 'Royal Mail', 'UPS', 'FedEx'];
  const roles = ['Driver', 'Lead Driver', 'Supervisor'];
  const locations = ['Crawley', 'London', 'Manchester', 'Birmingham', 'Leeds'];

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      clearError();
    } else {
      resetForm();
    }
  }, [isOpen, clearError]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest('.dropdown')) {
        setCustomerDropdownOpen(false);
        setRoleDropdownOpen(false);
        setLocationDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close modal with escape key
  useEffect(() => {
    function handleEscKey(event) {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);
  
  const resetForm = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setCustomer('');
    setRole('Driver');
    setLocation('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      clearError();
      
      // Validate form
      if (!email || !firstName || !lastName || !phone || !customer || !role || !location) {
        throw new Error('Please fill in all fields');
      }
      
      // Create driver object
      const driverData = {
        email,
        firstName,
        lastName,
        phone,
        customer,
        role,
        location,
        accessNumber: generateAccessNumber(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // Add driver to database
      const newDriver = await addDriver(driverData);
      
      // Reset form and close modal
      resetForm();
      onClose();
      
      // Notify parent component
      if (onDriverAdded) {
        onDriverAdded(newDriver);
      }
    } catch (err) {
      console.error('Error adding driver:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate random access number
  const generateAccessNumber = () => {
    return String(Math.floor(1000000 + Math.random() * 9000000));
  };
  
  const handleCustomerSelect = (selected) => {
    setCustomer(selected);
    setCustomerDropdownOpen(false);
  };
  
  const handleRoleSelect = (selected) => {
    setRole(selected);
    setRoleDropdownOpen(false);
  };
  
  const handleLocationSelect = (selected) => {
    setLocation(selected);
    setLocationDropdownOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add a new driver">
      <div className="add-driver-container">
        <p className="modal-subtitle">Enter the new driver details and select the customer</p>
        
        {error && <Alert message={error} type="error" />}
        
        <form className="driver-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="firstName">First name</label>
              <input 
                type="text" 
                id="firstName" 
                className="form-control" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group half">
              <label htmlFor="lastName">Last name</label>
              <input 
                type="text" 
                id="lastName" 
                className="form-control" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone number</label>
            <input 
              type="tel" 
              id="phone" 
              className="form-control" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="customer">Customer</label>
            <div className="dropdown">
              <button 
                type="button" 
                className={`dropdown-toggle ${customer === 'Amazon' ? 'amazon' : ''}`}
                onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
              >
                {customer || 'Select Customer'}
              </button>
              
              {customerDropdownOpen && (
                <div className="dropdown-menu">
                  {customers.map((item) => (
                    <div 
                      key={item} 
                      className={`dropdown-item ${item === customer ? 'selected' : ''}`}
                      onClick={() => handleCustomerSelect(item)}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <div className="dropdown">
              <button 
                type="button" 
                className="dropdown-toggle"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              >
                {role || 'Select Role'}
              </button>
              
              {roleDropdownOpen && (
                <div className="dropdown-menu">
                  {roles.map((item) => (
                    <div 
                      key={item} 
                      className={`dropdown-item ${item === role ? 'selected' : ''}`}
                      onClick={() => handleRoleSelect(item)}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <div className="dropdown">
              <button 
                type="button" 
                className="dropdown-toggle"
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
              >
                {location || 'Select Location'}
              </button>
              
              {locationDropdownOpen && (
                <div className="dropdown-menu">
                  {locations.map((item) => (
                    <div 
                      key={item} 
                      className={`dropdown-item ${item === location ? 'selected' : ''}`}
                      onClick={() => handleLocationSelect(item)}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Driver'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddDriver; 