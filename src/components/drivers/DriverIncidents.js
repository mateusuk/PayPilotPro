// Example for src/components/drivers/DriverEngagement.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Modal from '../ui/Modal'; // Import the Modal component
import useFirestore from '../../hooks/useFirestore'; // Correct import path

const DriverIncidents = () => {
  const { id } = useParams();
  const { getDocument } = useFirestore('drivers');
  const firestoreIncidents = useFirestore('incidents');
  const firestoreDeductions = useFirestore('deductions');
  const [driver, setDriver] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [incidentData, setIncidentData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'pending',
    createDeduction: false
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDriverAndIncidents = async () => {
      try {
        setLoading(true);
        
        // Get driver details
        const driverData = await getDocument(id);
        setDriver(driverData);
        
        // Get incidents for this driver
        const incidentsData = await firestoreIncidents.getDocumentsByQuery('driverId', '==', id);
        setIncidents(incidentsData);
      } catch (err) {
        console.error('Error fetching driver and incidents:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDriverAndIncidents();
  }, [id, getDocument, firestoreIncidents]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setIncidentData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddIncident = async () => {
    try {
      // Add incident to Firestore
      const incidentToAdd = {
        ...incidentData,
        driverId: id,
        driverName: `${driver.firstName} ${driver.lastName}`,
        requested: new Date().toISOString(),
        accepted: null,
        comment: incidentData.description
      };
      
      const newIncidentId = await firestoreIncidents.addDocument(incidentToAdd);
      
      // If create deduction is checked, create a deduction record
      if (incidentData.createDeduction) {
        await firestoreDeductions.addDocument({
          driverId: id,
          driverName: `${driver.firstName} ${driver.lastName}`,
          incidentId: newIncidentId,
          amount: 0,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }
      
      // Add to local state
      setIncidents(prev => [
        {
          id: newIncidentId,
          ...incidentToAdd,
        },
        ...prev
      ]);
      
      // Close modal and reset form
      setShowAddModal(false);
      setIncidentData({
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

  const filteredIncidents = incidents.filter(incident => 
    incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!driver) {
    return <div>Driver not found</div>;
  }

  return (
    <div className="incidents-container">
      <div className="incidents-header">
        <div className="incident-search-container">
          <input 
            type="text" 
            placeholder="Search" 
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
              <th>Status</th>
              <th>Comment</th>
              <th>Linked deduction</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((incident) => (
                <tr key={incident.id}>
                  <td>{incident.id.substring(0, 8)}</td>
                  <td>{new Date(incident.date).toLocaleDateString()}</td>
                  <td>{incident.title}</td>
                  <td>{new Date(incident.requested).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-${incident.status}`}>
                      {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                    </span>
                  </td>
                  <td>{incident.comment.length > 30 ? `${incident.comment.substring(0, 30)}...` : incident.comment}</td>
                  <td>{incident.createDeduction ? 'Yes' : 'No'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data-message">
                  No incidents have been recorded for this driver.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {showAddModal && (
        <Modal title="Create New Incident" onClose={() => setShowAddModal(false)}>
          <form className="incident-form">
            <div className="form-group">
              <label htmlFor="incidentTitle">Incident Title</label>
              <input 
                type="text" 
                id="incidentTitle" 
                name="title"
                className="form-control" 
                value={incidentData.title}
                onChange={handleChange}
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
                value={incidentData.date}
                onChange={handleChange}
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
                value={incidentData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="incidentStatus">Status</label>
              <select 
                id="incidentStatus" 
                name="status"
                className="form-control"
                value={incidentData.status}
                onChange={handleChange}
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
                    checked={incidentData.createDeduction}
                    onChange={() => setIncidentData(prev => ({...prev, createDeduction: true}))}
                  /> Yes
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="createDeduction" 
                    checked={!incidentData.createDeduction}
                    onChange={() => setIncidentData(prev => ({...prev, createDeduction: false}))}
                  /> No
                </label>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleAddIncident}
              >
                Create Incident
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DriverIncidents;