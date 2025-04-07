import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDrivers } from '../../context/DriversContext';
import AddDriver from '../AddDriver/AddDriver';
import '../../styles/drivers.css';
import './DriverList.css';

const DriverList = () => {
  const { getDriversByStatus } = useDrivers();
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
  const [isLoading, setIsLoading] = useState(true);

  // Função melhorada para carregar drivers
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsLoading(true);
  };

  // Load drivers based on active tab com correção para o spinner
  useEffect(() => {
    let isMounted = true;
    let timeoutId;
    
    const fetchDriversByStatus = async () => {
      if (!isMounted) return;
      
      try {
        let result = [];
        
        if (activeTab === 'active') {
          result = await getDriversByStatus('active');
          if (isMounted) setActiveDrivers(result);
        } else if (activeTab === 'onboarding') {
          result = await getDriversByStatus('invited');
          if (isMounted) setOnboardingDrivers(result);
        } else if (activeTab === 'inactive') {
          result = await getDriversByStatus('inactive');
          if (isMounted) setInactiveDrivers(result);
        }
        
        // Garantir que o loading pare após um tempo mínimo para evitar flash
        if (isMounted) {
          timeoutId = setTimeout(() => {
            setIsLoading(false);
          }, 800);
        }
      } catch (err) {
        console.error('Error fetching drivers by status:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDriversByStatus();
    
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [activeTab, getDriversByStatus]);
  
  // Filtrar drivers baseado nos critérios
  useEffect(() => {
    let result = [];
    
    if (activeTab === 'active') {
      result = [...activeDrivers];
    } else if (activeTab === 'onboarding') {
      result = [...onboardingDrivers];
    } else if (activeTab === 'inactive') {
      result = [...inactiveDrivers];
    }
    
    // Aplicar filtro de pesquisa
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(driver => 
        (driver.firstName && driver.firstName.toLowerCase().includes(searchLower)) ||
        (driver.lastName && driver.lastName.toLowerCase().includes(searchLower)) ||
        (driver.email && driver.email.toLowerCase().includes(searchLower)) ||
        (driver.phone && driver.phone.toLowerCase().includes(searchLower))
      );
    }
    
    // Aplicar filtro de pagamento
    if (filterMissingPayment) {
      result = result.filter(driver => driver.paymentInfoComplete === false);
    }
    
    // Aplicar filtro de cliente
    if (customerFilter) {
      result = result.filter(driver => driver.customer === customerFilter);
    }
    
    // Aplicar filtro de localização
    if (locationFilter) {
      result = result.filter(driver => driver.location === locationFilter);
    }
    
    setFilteredDrivers(result);
  }, [
    activeTab, 
    activeDrivers, 
    onboardingDrivers, 
    inactiveDrivers, 
    searchTerm, 
    filterMissingPayment, 
    customerFilter, 
    locationFilter
  ]);

  const handleDriverAdded = (newDriver) => {
    // Add new driver to onboarding list
    setOnboardingDrivers(prev => [newDriver, ...prev]);
    
    // If we're on the onboarding tab, update filtered drivers
    if (activeTab === 'onboarding') {
      setFilteredDrivers(prev => [newDriver, ...prev]);
    }
  };

  // Função para limpar filtros
  const clearAllFilters = useCallback(() => {
    setFilterMissingPayment(false);
    setCustomerFilter('');
    setLocationFilter('');
    setSearchTerm('');
  }, []);

  // Renderização do spinner de loading
  const renderLoadingSpinner = () => (
    <tr>
      <td colSpan={activeTab === 'onboarding' ? 9 : 7} className="loading-cell">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading drivers...</div>
        </div>
      </td>
    </tr>
  );

  const renderActiveDriversTable = () => (
    <table className="drivers-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th className="email-column">Email</th>
          <th className="contact-column">Contact</th>
          <th>Location</th>
          <th>Customer</th>
          <th>Product</th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          renderLoadingSpinner()
        ) : filteredDrivers.length > 0 ? (
          filteredDrivers.map(driver => (
            <tr key={driver.id}>
              <td className="driver-id">{driver.accessNumber || '00000'}</td>
              <td>
                <Link to={`/drivers/${driver.id}`} className="driver-link">
                  {driver.firstName} {driver.lastName}
                </Link>
              </td>
              <td className="driver-email email-column">{driver.email}</td>
              <td className="driver-contact contact-column">
                {driver.phone || <span className="na-value">N/A</span>}
              </td>
              <td className="driver-location">
                {driver.location || <span className="na-value">N/A</span>}
              </td>
              <td className="driver-customer">
                {driver.customer || <span className="na-value">N/A</span>}
              </td>
              <td className="driver-product">PayPilot-Premium</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" className="no-data-message">
              No drivers found matching your filters.
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
        {isLoading ? (
          renderLoadingSpinner()
        ) : filteredDrivers.length > 0 ? (
          filteredDrivers.map(driver => (
            <tr key={driver.id}>
              <td>
                <Link to={`/drivers/${driver.id}`} className="driver-link">
                  {driver.firstName} {driver.lastName}
                </Link>
              </td>
              <td className="driver-date">
                {driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : <span className="na-value">N/A</span>}
              </td>
              <td>{driver.appDownloaded ? 'yes' : 'no'}</td>
              <td>{driver.interviewStatus || <span className="na-value">-</span>}</td>
              <td className="check-cell">
                {driver.toxicologyStatus === 'pass' ? (
                  <>
                    <span className="check-icon">✓</span>
                    <span className="status-text">pass</span>
                  </>
                ) : (
                  driver.toxicologyStatus || <span className="na-value">pending</span>
                )}
              </td>
              <td className="check-cell">
                {driver.backgroundStatus === 'pass' ? (
                  <>
                    <span className="check-icon">✓</span>
                    <span className="status-text">pass</span>
                  </>
                ) : (
                  driver.backgroundStatus || <span className="na-value">pending</span>
                )}
              </td>
              <td className="check-cell">
                {driver.inductionStatus === 'completed' ? (
                  <>
                    <span className="check-icon">✓</span>
                    <span className="status-text">completed</span>
                  </>
                ) : (
                  driver.inductionStatus || <span className="na-value">pending</span>
                )}
              </td>
              <td className="driver-customer">
                {driver.customer || <span className="na-value">N/A</span>}
              </td>
              <td>
                <div className="onboarding-progress">
                  <div 
                    className="onboarding-progress-fill" 
                    style={{ width: `${driver.onboardingProgress || 0}%` }}
                  />
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="9" className="no-data-message">
              No drivers found matching your filters.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="driver-section">
      <div className="driver-actions">
        <div className="driver-actions-header">
          <div className="header-title">
            <h2 className="page-title">Drivers</h2>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              Add Driver
            </button>
          </div>
        </div>
        
        <div className="tab-container">
          <button 
            className={`tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => handleTabChange('active')}
          >
            Active
          </button>
          <button 
            className={`tab ${activeTab === 'onboarding' ? 'active' : ''}`}
            onClick={() => handleTabChange('onboarding')}
          >
            Onboarding
          </button>
          <button 
            className={`tab ${activeTab === 'inactive' ? 'active' : ''}`}
            onClick={() => handleTabChange('inactive')}
          >
            Inactive
          </button>
        </div>
      </div>

      <div className="filter-section">
        <div className="driver-search">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="driver-search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </span>
        </div>

        <div className="filter-options">
          <div className="filter-option">
            <input
              type="checkbox"
              id="missingPayment"
              checked={filterMissingPayment}
              onChange={(e) => setFilterMissingPayment(e.target.checked)}
            />
            <label htmlFor="missingPayment">Missing Payment Info</label>
          </div>

          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="form-select"
            aria-label="Select customer"
          >
            <option value="">All Customers</option>
            <option value="amazon">Amazon</option>
            <option value="dhl">DHL</option>
            <option value="royal-mail">Royal Mail</option>
            <option value="ups">UPS</option>
            <option value="fedex">FedEx</option>
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="form-select"
            aria-label="Select location"
          >
            <option value="">All Locations</option>
            <option value="london">London</option>
            <option value="manchester">Manchester</option>
            <option value="birmingham">Birmingham</option>
            <option value="leeds">Leeds</option>
            <option value="glasgow">Glasgow</option>
          </select>

          {(filterMissingPayment || customerFilter || locationFilter || searchTerm) && (
            <button 
              className="btn btn-outline" 
              onClick={clearAllFilters}
              aria-label="Clear all filters"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="drivers-table-container">
        {activeTab === 'active' && renderActiveDriversTable()}
        {activeTab === 'onboarding' && renderOnboardingDriversTable()}
        {activeTab === 'inactive' && renderActiveDriversTable()}
      </div>

      {showAddModal && (
        <AddDriver 
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onDriverAdded={handleDriverAdded}
        />
      )}
    </div>
  );
};

export default DriverList; 