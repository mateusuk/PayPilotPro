// src/components/drivers/DriverList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDrivers } from '../../contexts/DriverContext';
import AddDriver from './AddDriver';
import '../../styles/drivers.css';

const DriverList = () => {
  const { loading, getDriversByStatus } = useDrivers();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDrivers, setActiveDrivers] = useState([]);
  const [onboardingDrivers, setOnboardingDrivers] = useState([]);
  const [inactiveDrivers, setInactiveDrivers] = useState([]);
  const [filterMissingPayment, setFilterMissingPayment] = useState(false);
  const [customerFilter, setCustomerFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [filteredDrivers, setFilteredDrivers] = useState([]);

  // Load drivers based on active tab
  useEffect(() => {
    const fetchDriversByStatus = async () => {
      try {
        if (activeTab === 'active') {
          const active = await getDriversByStatus('active');
          setActiveDrivers(active);
        } else if (activeTab === 'onboarding') {
          const onboarding = await getDriversByStatus('invited');
          setOnboardingDrivers(onboarding);
        } else if (activeTab === 'inactive') {
          const inactive = await getDriversByStatus('inactive');
          setInactiveDrivers(inactive);
        }
      } catch (err) {
        console.error('Error fetching drivers by status:', err);
      }
    };

    fetchDriversByStatus();
  }, [activeTab, getDriversByStatus]);

  // Apply filters and search to drivers
  useEffect(() => {
    let driversToFilter = [];
    
    // Select appropriate array based on active tab
    if (activeTab === 'active') {
      driversToFilter = [...activeDrivers];
    } else if (activeTab === 'onboarding') {
      driversToFilter = [...onboardingDrivers];
    } else if (activeTab === 'inactive') {
      driversToFilter = [...inactiveDrivers];
    }
    
    // Apply search filter
    if (searchTerm) {
      driversToFilter = driversToFilter.filter(driver => {
        const fullName = `${driver.firstName} ${driver.lastName}`.toLowerCase();
        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (driver.phone && driver.phone.includes(searchTerm))
        );
      });
    }
    
    // Apply missing payment filter
    if (filterMissingPayment) {
      driversToFilter = driversToFilter.filter(driver => 
        !driver.paymentInfoComplete
      );
    }
    
    // Apply customer filter
    if (customerFilter) {
      driversToFilter = driversToFilter.filter(driver => 
        driver.customer === customerFilter
      );
    }
    
    // Apply location filter
    if (locationFilter) {
      driversToFilter = driversToFilter.filter(driver => 
        driver.location === locationFilter
      );
    }
    
    setFilteredDrivers(driversToFilter);
  }, [
    activeTab,
    searchTerm, 
    filterMissingPayment, 
    customerFilter, 
    locationFilter, 
    activeDrivers, 
    onboardingDrivers, 
    inactiveDrivers
  ]);

  const handleDriverAdded = (newDriver) => {
    // Add new driver to onboarding list
    setOnboardingDrivers(prev => [newDriver, ...prev]);
    
    // If we're on the onboarding tab, update filtered drivers
    if (activeTab === 'onboarding') {
      setFilteredDrivers(prev => [newDriver, ...prev]);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterMissingPayment(false);
    setCustomerFilter('');
    setLocationFilter('');
  };

  const renderActiveDriversTable = () => (
    <table className="drivers-table">
      <thead>
        <tr>
          <th>PayPilotPro - ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Contact</th>
          <th>Location</th>
          <th>Customer</th>
          <th>Product</th>
        </tr>
      </thead>
      <tbody>
        {filteredDrivers.length > 0 ? (
          filteredDrivers.map(driver => (
            <tr key={driver.id}>
              <td>{driver.accessNumber || '00000'}</td>
              <td>
                <Link to={`/drivers/${driver.id}`} className="driver-link">
                  {driver.firstName} {driver.lastName}
                </Link>
              </td>
              <td>{driver.email}</td>
              <td>{driver.phone || 'N/A'}</td>
              <td>{driver.location || 'N/A'}</td>
              <td>{driver.customer || 'N/A'}</td>
              <td>PayPilot-Premium</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" className="no-data-message">
              {loading ? 'Loading drivers...' : 'No drivers found matching your filters.'}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  const renderOnboardingDriversTable = () => (
    <table className="drivers-table onboarding-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Invited</th>
          <th>App</th>
          <th>Interview</th>
          <th>Toxicology</th>
          <th>Background</th>
          <th>Induction</th>
          <th>Customer</th>
          <th>Progress</th>
        </tr>
      </thead>
      <tbody>
        {filteredDrivers.length > 0 ? (
          filteredDrivers.map(driver => (
            <tr key={driver.id}>
              <td>
                <Link to={`/drivers/${driver.id}`} className="driver-link">
                  {driver.firstName} {driver.lastName}
                </Link>
              </td>
              <td>{new Date(driver.createdAt).toLocaleDateString()}</td>
              <td>{driver.appDownloaded ? 'yes' : 'no'}</td>
              <td>{driver.interviewStatus || '-'}</td>
              <td className="check-cell">
                {driver.toxicologyStatus === 'pass' ? (
                  <>
                    <span className="check-icon">✓</span>
                    <span className="status-text">pass</span>
                  </>
                ) : (
                  driver.toxicologyStatus || 'pending'
                )}
              </td>
              <td className="check-cell">
                {driver.backgroundStatus === 'pass' ? (
                  <>
                    <span className="check-icon">✓</span>
                    <span className="status-text">pass</span>
                  </>
                ) : (
                  driver.backgroundStatus || 'pending'
                )}
              </td>
              <td>{driver.inductionRequired ? driver.inductionStatus || 'pending' : 'Not required'}</td>
              <td><span className="customer-badge">{driver.customer || 'N/A'}</span></td>
              <td>
                <span className={`status-${driver.onboardingProgress || 'progress'}`}>
                  {driver.onboardingProgress || 'In Progress'}
                </span>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="9" className="no-data-message">
              {loading ? 'Loading drivers...' : 'No drivers found matching your filters.'}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="dashboard-content">
      <div className="tab-container">
        <Link
          to="/drivers?tab=active"
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active
        </Link>
        <Link
          to="/drivers?tab=onboarding"
          className={`tab ${activeTab === 'onboarding' ? 'active' : ''}`}
          onClick={() => setActiveTab('onboarding')}
        >
          Onboarding
        </Link>
        <Link
          to="/drivers?tab=inactive"
          className={`tab ${activeTab === 'inactive' ? 'active' : ''}`}
          onClick={() => setActiveTab('inactive')}
        >
          Inactive
        </Link>
      </div>
      
      <div className="driver-actions">
        <div className="driver-section">
          <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Drivers</h3>
        </div>
        <div className="driver-section">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            Add a new Driver
          </button>
        </div>
      </div>
      
      <div className="filter-section">
        <div className="driver-search">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="driver-search-icon">🔍</span>
        </div>
        
        <div className="filter-options">
          <div className="filter-option">
            <input
              type="checkbox"
              id="missingPayment"
              checked={filterMissingPayment}
              onChange={(e) => setFilterMissingPayment(e.target.checked)}
            />
            <label htmlFor="missingPayment">Missing payment details</label>
          </div>
          
          {customerFilter && (
            <div className="dropdown-filter">
              <span>{customerFilter}</span>
            </div>
          )}
          
          <button className="btn-outline" onClick={clearAllFilters}>
            Clear all
          </button>
        </div>
        
        <div className="filter-tabs">
          <button className="filter-tab">
            {activeTab === 'onboarding' ? 'App download status' : 'All Products'}
          </button>
          <button className="filter-tab">All Locations</button>
        </div>
      </div>
      
      {activeTab === 'active' && renderActiveDriversTable()}
      {activeTab === 'onboarding' && renderOnboardingDriversTable()}
      {activeTab === 'inactive' && renderActiveDriversTable()}
      
      {/* Action toolbar for mobile */}
      <div className="action-toolbar">
        <div className="action-buttons">
          <button className="toolbar-btn">
            <span className="toolbar-icon">✉️</span>
          </button>
          <button className="toolbar-btn">
            <span className="toolbar-icon">📋</span>
          </button>
          <button className="toolbar-btn">
            <span className="toolbar-icon">📁</span>
          </button>
          <button className="toolbar-btn">
            <span className="toolbar-icon">🔄</span>
          </button>
        </div>
      </div>
      
      {/* Add Driver Modal */}
      <AddDriver
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onDriverAdded={handleDriverAdded}
      />
    </div>
  );
};

export default DriverList;