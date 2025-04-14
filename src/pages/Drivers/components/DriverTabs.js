import React from 'react';
import { NavLink } from 'react-router-dom';
import './DriverTabs.css'; // Vamos criar um CSS específico para tabs

const DriverTabs = ({ driverId, activeTab }) => {
  // Função para definir estilo da tab ativa
  const getLinkClass = (isActive, tab) => {
    return `driver-tab ${isActive || activeTab === tab ? 'active' : ''}`;
  };

  return (
    <div className="tabs-container">
      <div className="driver-tabs">
        <NavLink 
          to={`/drivers/${driverId}`} 
          className={({isActive}) => getLinkClass(isActive, 'details')}
          end
        >
          Personal Details
        </NavLink>
        <NavLink 
          to={`/drivers/${driverId}/vehicle`} 
          className={({isActive}) => getLinkClass(isActive, 'vehicle')}
        >
          Vehicle
        </NavLink>
        <NavLink 
          to={`/drivers/${driverId}/financial`} 
          className={({isActive}) => getLinkClass(isActive, 'financial')}
        >
          Financial Details
        </NavLink>
        <NavLink 
          to={`/drivers/${driverId}/incidents`} 
          className={({isActive}) => getLinkClass(isActive, 'incidents')}
        >
          Incidents
        </NavLink>
        <NavLink 
          to={`/drivers/${driverId}/engagement`} 
          className={({isActive}) => getLinkClass(isActive, 'engagement')}
        >
          Engagement Details
        </NavLink>
      </div>
    </div>
  );
};

export default DriverTabs; 