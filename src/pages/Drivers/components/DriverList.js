import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDrivers } from '../context/DriversContext';
import AddDriver from './AddDriver/AddDriver';
import DeactivateDriverModal from './DeactivateDriverModal/DeactivateDriverModal';
import '../styles/drivers.css';
import './DriverList/DriverList.css';

const DriverList = () => {
  const navigate = useNavigate();
  const { getDriversByStatus, updateDriver } = useDrivers();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
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

  // Função para alterar a aba ativa
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsLoading(true);
  };

  // Carregar motoristas baseado na aba ativa
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
  
  // Filtrar motoristas baseado nos critérios
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

  // Toggle app downloaded status
  const toggleAppDownloaded = async (driverId, currentValue) => {
    try {
      const newValue = !currentValue;
      
      console.log(`Toggling appDownloaded for driver ${driverId} from ${currentValue} to ${newValue}`);
      
      // Create update object
      const updateObj = { appDownloaded: newValue };
      
      // Calculate new progress
      const driver = onboardingDrivers.find(d => d.id === driverId);
      if (driver) {
        // Calculate new progress based on current statuses
        const interviewStatus = driver.interviewStatus === 'yes' ? 'yes' : 'no';
        const toxicologyStatus = driver.toxicologyStatus === 'yes' ? 'yes' : 'no';
        const backgroundStatus = driver.backgroundStatus === 'yes' ? 'yes' : 'no'; 
        const inductionStatus = driver.inductionStatus === 'yes' ? 'yes' : 'no';
        
        // Calculate progress percentage
        let progress = 0;
        if (newValue) progress += 20; // App downloaded
        if (interviewStatus === 'yes') progress += 20;
        if (toxicologyStatus === 'yes') progress += 20;
        if (backgroundStatus === 'yes') progress += 20;
        if (inductionStatus === 'yes') progress += 20;
        
        updateObj.onboardingProgress = progress;
      }
      
      // Update driver in database
      await updateDriver(driverId, updateObj);
      
      // Update local state
      const updatedDrivers = onboardingDrivers.map(driver => {
        if (driver.id === driverId) {
          return { 
            ...driver, 
            appDownloaded: newValue, 
            onboardingProgress: updateObj.onboardingProgress 
          };
        }
        return driver;
      });
      
      setOnboardingDrivers(updatedDrivers);
      
      // Update filtered drivers if needed
      if (activeTab === 'onboarding') {
        setFilteredDrivers(prev => prev.map(driver => {
          if (driver.id === driverId) {
            return { 
              ...driver, 
              appDownloaded: newValue, 
              onboardingProgress: updateObj.onboardingProgress 
            };
          }
          return driver;
        }));
      }
    } catch (error) {
      console.error('Error updating app downloaded status:', error);
    }
  };

  // Toggle onboarding status fields (interview, toxicology, background, induction)
  const toggleOnboardingStatus = async (driverId, field, currentValue) => {
    try {
      // Toggle the current value
      const newValue = currentValue === 'yes' ? 'no' : 'yes';
      
      console.log(`Toggling ${field} for driver ${driverId} from ${currentValue} to ${newValue}`);
      
      // Create update object with just the field to update
      const updateObj = { [field]: newValue };
      
      // Calculate new progress
      const driver = onboardingDrivers.find(d => d.id === driverId);
      if (driver) {
        // Calculate new progress based on current statuses plus the new change
        const appDownloaded = driver.appDownloaded || false;
        const interviewStatus = field === 'interviewStatus' ? newValue : (driver.interviewStatus === 'yes' ? 'yes' : 'no');
        const toxicologyStatus = field === 'toxicologyStatus' ? newValue : (driver.toxicologyStatus === 'yes' ? 'yes' : 'no');
        const backgroundStatus = field === 'backgroundStatus' ? newValue : (driver.backgroundStatus === 'yes' ? 'yes' : 'no');
        const inductionStatus = field === 'inductionStatus' ? newValue : (driver.inductionStatus === 'yes' ? 'yes' : 'no');
        
        // Calculate progress percentage
        let progress = 0;
        if (appDownloaded) progress += 20;
        if (interviewStatus === 'yes') progress += 20;
        if (toxicologyStatus === 'yes') progress += 20;
        if (backgroundStatus === 'yes') progress += 20;
        if (inductionStatus === 'yes') progress += 20;
        
        updateObj.onboardingProgress = progress;
      }
      
      // Update driver in database
      await updateDriver(driverId, updateObj);
      
      // Update local state
      const updatedDrivers = onboardingDrivers.map(driver => {
        if (driver.id === driverId) {
          return { 
            ...driver, 
            [field]: newValue, 
            onboardingProgress: updateObj.onboardingProgress 
          };
        }
        return driver;
      });
      
      setOnboardingDrivers(updatedDrivers);
      
      // Update filtered drivers if needed
      if (activeTab === 'onboarding') {
        setFilteredDrivers(prev => prev.map(driver => {
          if (driver.id === driverId) {
            return { 
              ...driver, 
              [field]: newValue, 
              onboardingProgress: updateObj.onboardingProgress 
            };
          }
          return driver;
        }));
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  // Move driver from onboarding to active status
  const moveToActive = async (driverId) => {
    try {
      // Get the driver from our local state
      const driver = onboardingDrivers.find(d => d.id === driverId);
      
      if (driver) {
        // Verify all requirements are met
        const appDownloaded = driver.appDownloaded || false;
        const interviewStatus = driver.interviewStatus === 'yes' ? 'yes' : 'no';
        const toxicologyStatus = driver.toxicologyStatus === 'yes' ? 'yes' : 'no';
        const backgroundStatus = driver.backgroundStatus === 'yes' ? 'yes' : 'no';
        const inductionStatus = driver.inductionStatus === 'yes' ? 'yes' : 'no';
        
        if (appDownloaded && 
            interviewStatus === 'yes' && 
            toxicologyStatus === 'yes' && 
            backgroundStatus === 'yes' && 
            inductionStatus === 'yes') {
          
          // Update driver status to active
          await updateDriver(driverId, { 
            status: 'active',
            onboardingProgress: 100,
            onboardingCompleted: true,
            onboardingCompletedAt: new Date().toISOString()
          });
          
          // Remove from onboarding list
          setOnboardingDrivers(prev => prev.filter(d => d.id !== driverId));
          
          // Add to active list
          const activeDriver = { 
            ...driver, 
            status: 'active',
            onboardingProgress: 100,
            onboardingCompleted: true,
            onboardingCompletedAt: new Date().toISOString()
          };
          setActiveDrivers(prev => [activeDriver, ...prev]);
          
          // Update filtered drivers if needed
          if (activeTab === 'onboarding') {
            setFilteredDrivers(prev => prev.filter(d => d.id !== driverId));
          }
        } else {
          console.warn("Cannot move to active. All requirements must be met.");
        }
      }
    } catch (error) {
      console.error('Error moving driver to active:', error);
    }
  };

  // Deactivate an active driver and move to inactive
  const initiateDeactivation = (driver) => {
    setSelectedDriver(driver);
    setShowDeactivateModal(true);
  };
  
  const handleDeactivateConfirm = async (reason) => {
    try {
      if (!selectedDriver) return;
      
      // Update driver status to inactive
      await updateDriver(selectedDriver.id, { 
        status: 'inactive',
        offboardedAt: new Date().toISOString(),
        offboardReason: reason || 'Not specified'
      });
      
      // Remove from active list
      setActiveDrivers(prev => prev.filter(d => d.id !== selectedDriver.id));
      
      // Add to inactive list
      const inactiveDriver = { 
        ...selectedDriver, 
        status: 'inactive',
        offboardedAt: new Date().toISOString(),
        offboardReason: reason || 'Not specified'
      };
      setInactiveDrivers(prev => [inactiveDriver, ...prev]);
      
      // Update filtered drivers if needed
      if (activeTab === 'active') {
        setFilteredDrivers(prev => prev.filter(d => d.id !== selectedDriver.id));
      }
      
      // Reset selected driver
      setSelectedDriver(null);
    } catch (error) {
      console.error('Error deactivating driver:', error);
      throw error;
    }
  };

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

  // Add a function to handle direct navigation to driver details
  const handleDriverClick = (e, driverId) => {
    e.preventDefault();
    navigate(`/drivers/${driverId}`);
  };

  return (
    <div className="driver-section">
      <div className="driver-actions">
        <div className="driver-actions-header">
          <div className="header-title">
            <h1 className="page-title">Drivers</h1>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary add-driver-btn"
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
            Active Drivers
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
        <h3 className="filter-heading">Driver Filters</h3>
        
        <div className="driver-search">
          <input 
            type="text" 
            placeholder="Search drivers by name, email or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="search-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div className="filter-options">
          <div className="filter-option">
            <input 
              type="checkbox" 
              id="missingPayment" 
              checked={filterMissingPayment}
              onChange={() => setFilterMissingPayment(!filterMissingPayment)}
            />
            <label htmlFor="missingPayment">Missing Payment Info</label>
          </div>
          
          <select 
            className="form-select"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
          >
            <option value="">All Customers</option>
            <option value="amazon">Amazon</option>
            <option value="dhl">DHL</option>
            <option value="royal-mail">Royal Mail</option>
            <option value="ups">UPS</option>
          </select>
          
          <select 
            className="form-select"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>
            <option value="london">London</option>
            <option value="manchester">Manchester</option>
            <option value="birmingham">Birmingham</option>
            <option value="leeds">Leeds</option>
          </select>
          
          <button 
            className="btn-outline"
            onClick={clearAllFilters}
            disabled={!searchTerm && !filterMissingPayment && !customerFilter && !locationFilter}
          >
            Clear Filters
          </button>
        </div>
      </div>
      
      <div className="drivers-table-container">
        {activeTab === 'active' && (
          <table className="drivers-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th className="email-column">Email</th>
                <th className="contact-column">Contact</th>
                <th>Location</th>
                <th>Customer</th>
                <th>Status</th>
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
                      <Link to={`/drivers/${driver.id}`} className="driver-link" onClick={(e) => handleDriverClick(e, driver.id)}>
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
                    <td className="driver-status">
                      <span className="status-badge active">Active</span>
                      <button 
                        className="deactivate-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          initiateDeactivation(driver);
                        }}
                        title="Deactivate Driver"
                      >
                        Deactivate
                      </button>
                    </td>
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
        )}
        
        {activeTab === 'onboarding' && (
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
                filteredDrivers.map(driver => {
                  // Normalize status values for consistency
                  const appDownloaded = driver.appDownloaded || false;
                  const interviewStatus = driver.interviewStatus === 'yes' ? 'yes' : 'no';
                  const toxicologyStatus = driver.toxicologyStatus === 'yes' || driver.toxicologyStatus === 'pass' ? 'yes' : 'no';
                  const backgroundStatus = driver.backgroundStatus === 'yes' || driver.backgroundStatus === 'pass' ? 'yes' : 'no';
                  const inductionStatus = driver.inductionStatus === 'yes' || driver.inductionStatus === 'completed' ? 'yes' : 'no';
                  
                  // Calculate if all requirements are met
                  const allRequirementsMet = appDownloaded && 
                                           interviewStatus === 'yes' && 
                                           toxicologyStatus === 'yes' && 
                                           backgroundStatus === 'yes' && 
                                           inductionStatus === 'yes';
                  
                  // Calculate progress
                  let progress = 0;
                  if (appDownloaded) progress += 20;
                  if (interviewStatus === 'yes') progress += 20;
                  if (toxicologyStatus === 'yes') progress += 20;
                  if (backgroundStatus === 'yes') progress += 20;
                  if (inductionStatus === 'yes') progress += 20;
                  
                  // Use provided progress or calculated value
                  const progressValue = driver.onboardingProgress || progress;
                  
                  return (
                    <tr key={driver.id} className="onboarding-row">
                      <td>
                        <Link to={`/drivers/${driver.id}`} className="driver-link" onClick={(e) => handleDriverClick(e, driver.id)}>
                          {driver.firstName} {driver.lastName}
                        </Link>
                      </td>
                      <td className="driver-date">
                        {driver.createdAt ? 
                          (() => {
                            try {
                              // Handle different date formats
                              let date;
                              if (typeof driver.createdAt === 'object') {
                                if (driver.createdAt.seconds) {
                                  // Firestore timestamp
                                  date = new Date(driver.createdAt.seconds * 1000);
                                } else if (driver.createdAt instanceof Date) {
                                  // Date object
                                  date = driver.createdAt;
                                } else {
                                  // Invalid object
                                  return <span className="na-value">N/A</span>;
                                }
                              } else if (typeof driver.createdAt === 'string') {
                                // ISO string date
                                date = new Date(driver.createdAt);
                              } else if (typeof driver.createdAt === 'number') {
                                // Unix timestamp
                                date = new Date(driver.createdAt);
                              } else {
                                return <span className="na-value">N/A</span>;
                              }
                              
                              // Check if date is valid
                              if (isNaN(date.getTime())) {
                                return <span className="na-value">N/A</span>;
                              }
                              
                              // Format as dd/mm/yyyy
                              const day = date.getDate().toString().padStart(2, '0');
                              const month = (date.getMonth() + 1).toString().padStart(2, '0');
                              const year = date.getFullYear();
                              
                              return `${day}/${month}/${year}`;
                            } catch (error) {
                              console.error('Error formatting date:', error);
                              return <span className="na-value">N/A</span>;
                            }
                          })() 
                          : <span className="na-value">N/A</span>
                        }
                      </td>
                      <td className="toggle-cell">
                        <button 
                          className={`status-toggle ${appDownloaded ? 'yes' : 'no'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAppDownloaded(driver.id, appDownloaded);
                          }}
                        >
                          {appDownloaded ? 'yes' : 'no'}
                        </button>
                      </td>
                      <td className="toggle-cell">
                        <button 
                          className={`status-toggle ${interviewStatus === 'yes' ? 'yes' : 'no'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOnboardingStatus(driver.id, 'interviewStatus', interviewStatus);
                          }}
                        >
                          {interviewStatus}
                        </button>
                      </td>
                      <td className="toggle-cell">
                        <button 
                          className={`status-toggle ${toxicologyStatus === 'yes' ? 'yes' : 'no'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOnboardingStatus(driver.id, 'toxicologyStatus', toxicologyStatus);
                          }}
                        >
                          {toxicologyStatus}
                        </button>
                      </td>
                      <td className="toggle-cell">
                        <button 
                          className={`status-toggle ${backgroundStatus === 'yes' ? 'yes' : 'no'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOnboardingStatus(driver.id, 'backgroundStatus', backgroundStatus);
                          }}
                        >
                          {backgroundStatus}
                        </button>
                      </td>
                      <td className="toggle-cell">
                        <button 
                          className={`status-toggle ${inductionStatus === 'yes' ? 'yes' : 'no'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOnboardingStatus(driver.id, 'inductionStatus', inductionStatus);
                          }}
                        >
                          {inductionStatus}
                        </button>
                      </td>
                      <td>{driver.customer || <span className="na-value">N/A</span>}</td>
                      <td className="progress-cell">
                        <div className="onboarding-progress">
                          <div 
                            className="onboarding-progress-fill" 
                            style={{ width: `${progressValue}%` }}
                          ></div>
                        </div>
                        {allRequirementsMet && (
                          <button 
                            className="activate-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveToActive(driver.id);
                            }}
                            title="Move to Active Drivers"
                          >
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="no-data-message">
                    No onboarding drivers found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        
        {activeTab === 'inactive' && (
          <table className="drivers-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th className="email-column">Email</th>
                <th className="contact-column">Contact</th>
                <th>Deactivated</th>
                <th>Reason</th>
                <th>Actions</th>
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
                      <Link to={`/drivers/${driver.id}`} className="driver-link" onClick={(e) => handleDriverClick(e, driver.id)}>
                        {driver.firstName} {driver.lastName}
                      </Link>
                    </td>
                    <td className="driver-email email-column">{driver.email}</td>
                    <td className="driver-contact contact-column">
                      {driver.phone || <span className="na-value">N/A</span>}
                    </td>
                    <td className="driver-date">
                      {driver.offboardedAt ? 
                        new Date(driver.offboardedAt).toLocaleDateString() : 
                        <span className="na-value">Unknown</span>
                      }
                    </td>
                    <td>
                      {driver.offboardReason || <span className="na-value">Not specified</span>}
                    </td>
                    <td>
                      <Link to={`/drivers/${driver.id}`} className="btn-view btn-small">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data-message">
                    No inactive drivers found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Modal para adicionar motorista */}
      <AddDriver 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onDriverAdded={handleDriverAdded}
      />
      
      {/* Deactivate Driver Modal */}
      <DeactivateDriverModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleDeactivateConfirm}
        driverName={selectedDriver ? `${selectedDriver.firstName} ${selectedDriver.lastName}` : ''}
      />
    </div>
  );
};

export default DriverList; 