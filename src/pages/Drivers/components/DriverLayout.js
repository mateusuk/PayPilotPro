import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import DriverTabs from './DriverTabs';
import { useDrivers } from '../context/DriversContext';
import Loader from '../../../components/ui/Loader';
import Alert from '../../../components/ui/Alert';
import '../styles/drivers.css';
import './DriverLayout.css';

// Armazenamento em cache para os dados do motorista
const driverCache = {};

const DriverLayout = ({ children, activeTab }) => {
  const { id } = useParams();
  const { getDriverById, updateDriverStatus, error } = useDrivers();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmStatusChange, setConfirmStatusChange] = useState(false);
  const [prevChildren, setPrevChildren] = useState(null);
  const location = useLocation();
  const contentRef = useRef(null);

  // Detectar mudanças na localização para prevenir animações desnecessárias
  useEffect(() => {
    // Quando a localização muda, definimos rapidamente o contentLoading como true
    setContentLoading(true);
    
    // Aguardar um pequeno tempo para permitir que o DOM se atualize
    const timer = setTimeout(() => {
      setContentLoading(false);
    }, 50); // Um tempo muito curto para evitar percepção de atraso
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Salva a referência ao children anterior quando ele muda
  useEffect(() => {
    if (!contentLoading && children) {
      setPrevChildren(children);
    }
  }, [children, contentLoading]);

  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        // Verificar se já temos os dados deste motorista em cache
        if (driverCache[id]) {
          setDriver(driverCache[id]);
          setLoading(false);
          return;
        }
        
        setLoading(true);
        const driverData = await getDriverById(id);
        
        // Armazenar em cache
        driverCache[id] = driverData;
        setDriver(driverData);
      } catch (err) {
        console.error('Error fetching driver details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDriverDetails();
  }, [id, getDriverById]);
  
  const handleStatusChange = async (newStatus) => {
    if (!confirmStatusChange) {
      setConfirmStatusChange(true);
      return;
    }
    
    try {
      await updateDriverStatus(id, newStatus);
      const updatedDriver = {
        ...driver,
        status: newStatus
      };
      
      // Atualizar o cache também
      driverCache[id] = updatedDriver;
      setDriver(updatedDriver);
      setSuccessMessage(`Driver ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      setConfirmStatusChange(false);
    } catch (err) {
      console.error('Error updating driver status:', err);
    }
  };
  
  // Apenas mostra o loader quando não há dados iniciais
  if (loading && !driver) {
    return <Loader message="Loading driver details..." />;
  }
  
  if (!driver) {
    return (
      <div className="error-container">
        <h3>Driver not found</h3>
        <p>The driver you're looking for could not be found.</p>
      </div>
    );
  }

  // Rendereiza o conteúdo estável, usando o conteúdo anterior durante o carregamento
  const renderContent = () => {
    if (contentLoading) {
      // Mostra o conteúdo anterior durante a transição para evitar tremulação
      return prevChildren || <div className="content-placeholder"></div>;
    }
    return <div className="content-transition" ref={contentRef}>{children}</div>;
  };

  return (
    <div className="driver-layout-container">
      <div className="dashboard-content">
        <div className="driver-header-fixed">
          <div className="back-navigation">
            <Link to="/drivers" className="back-button">
              <span className="back-icon">←</span> Back to Drivers
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
            <div className="driver-action-buttons">
              <button 
                className={`btn ${confirmStatusChange ? 'btn-danger' : driver.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                onClick={() => handleStatusChange(driver.status === 'active' ? 'inactive' : 'active')}
              >
                {confirmStatusChange 
                  ? `Confirm ${driver.status === 'active' ? 'Deactivate' : 'Activate'}` 
                  : driver.status === 'active' ? 'Deactivate Driver' : 'Activate Driver'}
              </button>
            </div>
          </div>
          
          <DriverTabs driverId={id} activeTab={activeTab} />
          
          {error && <Alert message={error} type="error" />}
          {successMessage && <Alert message={successMessage} type="success" autoClose />}
        </div>
        
        <div className="driver-content-scroll">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DriverLayout; 