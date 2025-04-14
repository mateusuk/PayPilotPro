import React, { useState, useEffect } from 'react';
import { useDrivers } from '../../context/DriversContext';
import { sendDriverAccessCode } from '../../../../services/emailService';
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
  const [accessNumber, setAccessNumber] = useState('');
  const [inviteSent, setInviteSent] = useState(false);
  const [error, setError] = useState('');
  
  const { addDriver, loading: contextLoading, error: contextError } = useDrivers();

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setError('');
      setInviteSent(false);
      setAccessNumber('');
    } else {
      resetForm();
    }
  }, [isOpen]);

  // Sync with context error
  useEffect(() => {
    if (contextError) {
      setError(contextError);
    }
  }, [contextError]);

  // Sync with context loading
  useEffect(() => {
    setLoading(contextLoading);
  }, [contextLoading]);

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
    setInviteSent(false);
    setAccessNumber('');
    setError('');
  };

  const clearError = () => {
    setError('');
  };

  const generateAccessNumber = () => {
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    return randomNum.toString().substring(0, 8);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      clearError();
      
      if (!email || !firstName || !lastName || !phone || !customer || !role || !location) {
        throw new Error('Please fill in all fields');
      }
      
      const newAccessNumber = generateAccessNumber();
      setAccessNumber(newAccessNumber);
      
      const driverData = {
        email,
        firstName,
        lastName,
        phone,
        customer,
        role,
        location,
        accessNumber: newAccessNumber,
        status: 'invited',
      };
      
      const newDriver = await addDriver(driverData);
      await sendDriverAccessCode(email, firstName, newAccessNumber);
      setInviteSent(true);
      
      if (onDriverAdded) {
        onDriverAdded(newDriver);
      }
    } catch (err) {
      console.error('Error adding driver:', err);
      setError(err.message || 'Failed to add driver');
    } finally {
      setLoading(false);
    }
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

  if (inviteSent) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Driver Invitation Sent">
        <div className="add-driver-container">
          <div className="invitation-success">
            <div className="success-icon">✓</div>
            <h3>Driver invitation sent successfully!</h3>
            <p>The driver will receive an email with instructions to download the app and register their account.</p>
            
            <div className="access-number-box">
              <p className="access-label">Access Number:</p>
              <p className="access-value">{accessNumber}</p>
              <p className="access-instruction">The driver will need this number to register their account in the mobile app.</p>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => {
                  resetForm();
                  onClose();
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

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
                  {['Amazon', 'DHL', 'Royal Mail', 'UPS', 'FedEx'].map((item) => (
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
                  {['Driver', 'Lead Driver', 'Supervisor'].map((item) => (
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
                  {['London', 'Manchester', 'Birmingham', 'Leeds', 'Crawley'].map((item) => (
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
              {loading ? (
                <>
                  <span className="loading-spinner-small"></span>
                  <span>Sending Invitation...</span>
                </>
              ) : 'Invite Driver'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddDriver; 