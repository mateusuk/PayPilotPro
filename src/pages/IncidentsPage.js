// src/components/drivers/DriverIncidents.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDrivers } from '../../contexts/DriverContext';
import Modal from '../ui/Modal';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';
import '../../styles/drivers.css';

const DriverIncidents = () => {
  const { id } = useParams();
  const { getDriver, updateDriver, error } = useDrivers();
  const [driver, setDriver] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // New incident form state
  const [newIncident, setNewIncident] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'pending',
    createDeduction: false
  });
  
  // Fetch driver details and incidents
  useEffect(() => {
    const fetchDriverIncidents = async () => {
      try {
        setLoading(true);
        const driverData = await getDriver(id);
        setDriver(driverData);
        
        // Set incidents if they exist
        if (driverData.incidents && Array.isArray(driverData.incidents)) {
          setIncidents(driverData.incidents);
        }
      } catch (err) {
        console.error('Error fetching driver incidents:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDriverIncidents();
  }, [id, getDriver]);
  
  // Handle incident form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewIncident(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Add new incident
  const handleAddIncident = async (e) => {
    e.preventDefault();
    
    try {
      const newIncidentData = {
        ...newIncident,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        requested: true,
        accepted: false,
        comment: '',
        linkedDeduction: newIncident.createDeduction ? 'Pending' : 'None'
      };
      
      // Update driver with new incident
      const updatedIncidents = [...incidents, newIncidentData];
      await updateDriver(id, { incidents: updatedIncidents });
      
      // Update local state
      setIncidents(updatedIncidents);
      setSuccessMessage('Incident created successfully');
      
      // Close modal and reset form
      setShowAddModal(false);
      setNewIncident({
        title: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        status: 'pending',
        createDeduction: false
      });
    } catch (err) {
      console.error('Error adding incident:', err);
    }
  };
  
  // Filter incidents based on search term
  const filteredIncidents = incidents.filter(incident => {
    if (!searchTerm) return true;
    
    return (
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.id.includes(searchTerm)
    );
  });
  
  if (loading) {
    return <div className="loading-container">Loading driver incidents...</div>;
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
        <Link to={`/drivers/${id}/vehicle`} className="driver-tab">Vehicle</Link>
        <Link to={`/drivers/${id}/financial`} className="driver-tab">Financial Details</Link>
        <Link to={`/drivers/${id}/incidents`} className="driver-tab active">Incidents</Link>
        <Link to={`/drivers/${id}/engagement`} className="driver-tab">Engagement Details</Link>
      </div>
      
      {error && <Alert message={error} type="error" />}
      {successMessage && <Alert message={successMessage} type="success" autoClose />}
      
      <div className="incidents-header">
        <div className="incident-search-container">
          <input 
            type="text" 
            placeholder="Search by ID or title" 
            className="incident-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-icon-button">🔍</button>
        </div>
        
        <button 
          className="btn btn-primary create-incident-btn"
          onClick={() => setShowAddModal(true)}
        >
          Create Incident
        </button>
      </div>
      
      <div className="incidents-table-container">
        <table className="incidents-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Incident date</th>
              <th>Title</th>
              <th>Requested</th>
              <th>Accepted</th>
              <th>Status</th>
              <th>Comment</th>
              <th>Linked deduction</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map(incident => (
                <tr key={incident.id}>
                  <td>{incident.id}</td>
                  <td>{new Date(incident.date).toLocaleDateString()}</td>
                  <td>{incident.title}</td>
                  <td>{incident.requested ? 'Yes' : 'No'}</td>
                  <td>{incident.accepted ? 'Yes' : 'No'}</td>
                  <td>
                    <span className={`status-${incident.status}`}>
                      {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                    </span>
                  </td>
                  <td>{incident.comment || '-'}</td>
                  <td>{incident.linkedDeduction || 'None'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data-message">
                  No incidents found for this driver.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Incident Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Incident"
        footer={(
          <>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleAddIncident}
            >
              Create Incident
            </button>
          </>
        )}
      >
        <form className="incident-form">
          <div className="form-group">
            <label htmlFor="incidentTitle">Incident Title</label>
            <input 
              type="text" 
              id="incidentTitle" 
              name="title"
              className="form-control" 
              value={newIncident.title}
              onChange={handleInputChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="incidentDate">Incident Date</label>
            <input 
              type="date" 
              id="incidentDate" 
              name="date"
              className="form-control" 
              value={newIncident.date}
              onChange={handleInputChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="incidentDescription">Description</label>
            <textarea 
              id="incidentDescription" 
              name="description"
              className="form-control textarea" 
              rows="4" 
              value={newIncident.description}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="incidentStatus">Status</label>
            <select 
              id="incidentStatus" 
              name="status"
              className="form-control"
              value={newIncident.status}
              onChange={handleInputChange}
            >
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Create Deduction</label>
            <div className="radio-group">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="createDeduction" 
                  value="yes"
                  checked={newIncident.createDeduction}
                  onChange={() => setNewIncident({...newIncident, createDeduction: true})}
                /> Yes
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="createDeduction" 
                  value="no"
                  checked={!newIncident.createDeduction}
                  onChange={() => setNewIncident({...newIncident, createDeduction: false})}
                /> No
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DriverIncidents;