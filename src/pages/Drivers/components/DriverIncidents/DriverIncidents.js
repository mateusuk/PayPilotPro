import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Modal from '../../../../components/ui/Modal';
import Alert from '../../../../components/ui/Alert';
import Loader from '../../../../components/ui/Loader';
import { useDrivers } from '../../context/DriversContext';
import useFirestore from '../../../../hooks/useFirestore';
import { where } from 'firebase/firestore';
import '../../styles/drivers.css';
import './DriverIncidents.css';

const DriverIncidents = () => {
  const { id } = useParams();
  const { getDriverById } = useDrivers();
  const firestoreIncidents = useFirestore('incidents');
  const firestoreDeductions = useFirestore('deductions');
  const [driver, setDriver] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [incidentData, setIncidentData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'pending',
    createDeduction: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Função para buscar dados do motorista e incidentes
  const fetchData = async () => {
    try {
      console.log('Starting to fetch driver and incidents data...');
      setLoading(true);
      setError(null);
      
      // Buscar dados do motorista
      console.log('Fetching driver with ID:', id);
      const driverData = await getDriverById(id);
      console.log('Driver data received:', driverData);
      
      if (!driverData) {
        console.error('Driver data is null or undefined');
        throw new Error('Driver not found');
      }
      setDriver(driverData);
      
      // Buscar incidentes
      console.log('Fetching incidents for driver:', id);
      try {
        const incidentsData = await firestoreIncidents.getDocuments([where('driverId', '==', id)]);
        console.log('Incidents data loaded:', incidentsData);
        
        // Ordenar por data (mais recentes primeiro)
        const sortedIncidents = [...incidentsData].sort((a, b) => {
          return new Date(b.date || b.requested) - new Date(a.date || a.requested);
        });
        
        setIncidents(sortedIncidents);
      } catch (incidentsErr) {
        console.error('Error fetching incidents:', incidentsErr);
        setIncidents([]);
      }
      
      console.log('Data fetching completed successfully!');
    } catch (err) {
      console.error('Error fetching driver and incidents:', err);
      setError(err.message || 'Failed to load incidents. Please try again.');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  // Efeito para carregar dados quando o componente montar
  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);  // Depender apenas do ID para evitar loops infinitos

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setIncidentData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddIncident = async () => {
    try {
      setError(null);
      // Add incident to Firestore
      const incidentToAdd = {
        ...incidentData,
        driverId: id,
        driverName: driver ? `${driver.firstName} ${driver.lastName}` : 'Unknown Driver',
        requested: new Date().toISOString(),
        accepted: null,
        comment: incidentData.description
      };
      
      const newIncidentId = await firestoreIncidents.addDocument(incidentToAdd);
      
      // If create deduction is checked, create a deduction record
      if (incidentData.createDeduction) {
        await firestoreDeductions.addDocument({
          driverId: id,
          driverName: driver ? `${driver.firstName} ${driver.lastName}` : 'Unknown Driver',
          incidentId: newIncidentId,
          amount: 0,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }
      
      // Reload incidents
      fetchData();
      
      // Show success message
      setSuccessMessage('Incident created successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      
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
      setError(err.message || 'Failed to create incident. Please try again.');
    }
  };

  // Filtrar incidentes com base no termo de pesquisa
  const filteredIncidents = incidents.filter(incident => 
    (incident.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (incident.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (incident.comment || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função auxiliar para formatar datas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return <Loader message="Loading incidents..." />;
  }

  if (error && !driver) {
    return <Alert message={error} type="error" />;
  }

  return (
    <>
      {successMessage && <Alert message={successMessage} type="success" autoClose />}
      {error && <Alert message={error} type="error" />}
      
      <div className="incidents-header">
        <div className="incident-search-container">
          <input 
            type="text" 
            placeholder="Search incidents..." 
            className="incident-search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
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
                  <td>{incident.id ? incident.id.substring(0, 8) : 'N/A'}</td>
                  <td>{formatDate(incident.date)}</td>
                  <td>{incident.title || 'No Title'}</td>
                  <td>{formatDate(incident.requested)}</td>
                  <td>
                    <span className={`status-badge status-${incident.status || 'pending'}`}>
                      {incident.status 
                        ? incident.status.charAt(0).toUpperCase() + incident.status.slice(1) 
                        : 'Pending'}
                    </span>
                  </td>
                  <td>{incident.comment 
                    ? (incident.comment.length > 30 
                      ? `${incident.comment.substring(0, 30)}...` 
                      : incident.comment) 
                    : 'No comment'}
                  </td>
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
      
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title="Create New Incident"
      >
        <form className="incident-form" onSubmit={(e) => { e.preventDefault(); handleAddIncident(); }}>
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
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                name="createDeduction" 
                checked={incidentData.createDeduction}
                onChange={handleChange}
              />
              Create deduction for this incident
            </label>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Incident
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default DriverIncidents; 