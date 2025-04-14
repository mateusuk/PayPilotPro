import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrivers } from '../../context/DriversContext';
import AddDriver from '../AddDriver/AddDriver';
import { Table } from 'react-bootstrap';
import DriverListItem from './DriverListItem';
import '../../styles/drivers.css';
import './DriverList.css';

const DriverList = () => {
  const { getDriversByStatus, updateDriver } = useDrivers();
  const navigate = useNavigate();
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

  const applyFilters = useCallback((tab) => {
    let driversToFilter = [];
    switch (tab) {
      case 'active':
        driversToFilter = activeDrivers;
        break;
      case 'onboarding':
        driversToFilter = onboardingDrivers;
        break;
      case 'inactive':
        driversToFilter = inactiveDrivers;
        break;
      default:
        driversToFilter = activeDrivers;
    }

    let filtered = [...driversToFilter];

    if (searchTerm) {
      filtered = filtered.filter(driver =>
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (customerFilter) {
      filtered = filtered.filter(driver =>
        driver.customer?.toLowerCase().includes(customerFilter.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(driver =>
        driver.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (filterMissingPayment) {
      filtered = filtered.filter(driver => !driver.paymentCompleted);
    }

    setFilteredDrivers(filtered);
  }, [activeDrivers, onboardingDrivers, inactiveDrivers, searchTerm, customerFilter, locationFilter, filterMissingPayment]);

  const navigateToDriverDetail = (driverId) => {
    navigate(`/drivers/${driverId}`);
  };

  // Função melhorada para carregar drivers
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setCustomerFilter('');
    setLocationFilter('');
    setFilterMissingPayment(false);
    applyFilters(tab);
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

  const renderActiveDriversTable = () => {
    return (
      <table className="drivers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Customer</th>
            <th>Location</th>
            <th>Last Active</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {activeDrivers.map((driver) => {
            let formattedCreatedAt = 'N/A';
            try {
              if (driver.createdAt) {
                const createdDate = driver.createdAt.toDate ? 
                  driver.createdAt.toDate() : 
                  new Date(driver.createdAt);
                formattedCreatedAt = createdDate.toLocaleDateString();
              }
            } catch (error) {
              console.error("Error formatting date:", error);
            }
            
            let formattedLastActive = 'N/A';
            try {
              if (driver.lastActive) {
                const lastActiveDate = driver.lastActive.toDate ? 
                  driver.lastActive.toDate() : 
                  new Date(driver.lastActive);
                formattedLastActive = lastActiveDate.toLocaleDateString();
              }
            } catch (error) {
              console.error("Error formatting last active date:", error);
            }

            return (
              <tr
                key={driver.id}
                onClick={() => navigateToDriverDetail(driver.id)}
                className="clickable-row"
              >
                <td>{driver.name || 'N/A'}</td>
                <td>{driver.email || 'N/A'}</td>
                <td>{driver.phone || 'N/A'}</td>
                <td>{driver.customer?.name || 'Unassigned'}</td>
                <td>{driver.location || 'N/A'}</td>
                <td>{formattedLastActive}</td>
                <td>{formattedCreatedAt}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

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
          filteredDrivers.map(driver => {
            // Calculate if all requirements are met
            const appDownloaded = driver.appDownloaded || false;
            const interviewStatus = driver.interviewStatus === 'yes' ? 'yes' : 'no';
            const toxicologyStatus = driver.toxicologyStatus === 'yes' ? 'yes' : 'no';
            const backgroundStatus = driver.backgroundStatus === 'yes' ? 'yes' : 'no';
            const inductionStatus = driver.inductionStatus === 'yes' ? 'yes' : 'no';
            
            const allRequirementsMet = appDownloaded && 
                                      interviewStatus === 'yes' && 
                                      toxicologyStatus === 'yes' && 
                                      backgroundStatus === 'yes' && 
                                      inductionStatus === 'yes';
            
            // Format the date properly
            let formattedDate = 'N/A';
            try {
              if (driver.createdAt) {
                // Handle Firestore timestamp
                if (typeof driver.createdAt === 'object' && driver.createdAt !== null) {
                  if ('seconds' in driver.createdAt) {
                    // Firestore timestamp
                    formattedDate = new Date(driver.createdAt.seconds * 1000).toLocaleDateString();
                  } else if (driver.createdAt instanceof Date) {
                    // Regular Date object
                    formattedDate = driver.createdAt.toLocaleDateString();
                  }
                } else if (typeof driver.createdAt === 'string') {
                  // ISO date string
                  formattedDate = new Date(driver.createdAt).toLocaleDateString();
                } else if (typeof driver.createdAt === 'number') {
                  // Unix timestamp in milliseconds
                  formattedDate = new Date(driver.createdAt).toLocaleDateString();
                }
              }
            } catch (e) {
              console.error('Error formatting date:', e);
              formattedDate = 'N/A';
            }
            
            // Calculate progress
            let progress = 0;
            if (appDownloaded) progress += 20;
            if (interviewStatus === 'yes') progress += 20;
            if (toxicologyStatus === 'yes') progress += 20;
            if (backgroundStatus === 'yes') progress += 20;
            if (inductionStatus === 'yes') progress += 20;
            
            // If there's no progress value in the driver object, use the calculated one
            const progressValue = driver.onboardingProgress || progress;
            
            return (
              <tr key={driver.id} className="onboarding-row">
                <td className="driver-name">
                  {driver.firstName || ''} {driver.lastName || ''}
                </td>
                <td className="driver-date">{formattedDate}</td>
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
                <td className="driver-customer">
                  {driver.customer || <span className="na-value">N/A</span>}
                </td>
                <td className="progress-cell">
                  <div className="onboarding-progress">
                    <div 
                      className="onboarding-progress-fill" 
                      style={{ width: `${progressValue}%` }}
                    />
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
              No drivers found matching your filters.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  // Handle toggling onboarding status fields
  const toggleOnboardingStatus = async (driverId, field, currentValue) => {
    try {
      // Toggle the current value
      const newValue = currentValue === 'yes' ? 'no' : 'yes';
      
      console.log(`Toggling ${field} for driver ${driverId} from ${currentValue} to ${newValue}`);
      
      // Create update object with just the field to update
      const updateObj = { [field]: newValue };
      
      // Always calculate progress when toggling status
      // Get the driver from our local state
      const driver = onboardingDrivers.find(d => d.id === driverId);
      if (driver) {
        // Calculate new progress based on current statuses plus the new change
        const statuses = {
          interviewStatus: field === 'interviewStatus' ? newValue : (driver.interviewStatus === 'yes' ? 'yes' : 'no'),
          toxicologyStatus: field === 'toxicologyStatus' ? newValue : (driver.toxicologyStatus === 'yes' ? 'yes' : 'no'),
          backgroundStatus: field === 'backgroundStatus' ? newValue : (driver.backgroundStatus === 'yes' ? 'yes' : 'no'), 
          inductionStatus: field === 'inductionStatus' ? newValue : (driver.inductionStatus === 'yes' ? 'yes' : 'no'),
          appDownloaded: driver.appDownloaded || false
        };
        
        // Calculate progress percentage
        let progress = 0;
        if (statuses.appDownloaded) progress += 20;
        if (statuses.interviewStatus === 'yes') progress += 20;
        if (statuses.toxicologyStatus === 'yes') progress += 20;
        if (statuses.backgroundStatus === 'yes') progress += 20;
        if (statuses.inductionStatus === 'yes') progress += 20;
        
        updateObj.onboardingProgress = progress;
        console.log(`New progress for driver ${driverId}: ${progress}%`);
      }
      
      // Call the API to update the driver
      const result = await updateDriver(driverId, updateObj);
      console.log("Update result:", result);
      
      // Update local state
      const updatedDrivers = onboardingDrivers.map(driver => {
        if (driver.id === driverId) {
          const updatedDriver = { 
            ...driver, 
            [field]: newValue, 
            onboardingProgress: updateObj.onboardingProgress || driver.onboardingProgress 
          };
          console.log("Updated driver in state:", updatedDriver);
          return updatedDriver;
        }
        return driver;
      });
      
      setOnboardingDrivers(updatedDrivers);
      
      // If we're on the onboarding tab, also update filtered drivers
      if (activeTab === 'onboarding') {
        const updatedFiltered = filteredDrivers.map(driver => {
          if (driver.id === driverId) {
            return { 
              ...driver, 
              [field]: newValue, 
              onboardingProgress: updateObj.onboardingProgress || driver.onboardingProgress 
            };
          }
          return driver;
        });
        setFilteredDrivers(updatedFiltered);
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      alert(`Failed to update ${field}. Please try again.`);
    }
  };

  // Toggle app downloaded status
  const toggleAppDownloaded = async (driverId, currentValue) => {
    try {
      const newValue = !currentValue;
      
      console.log(`Toggling appDownloaded for driver ${driverId} from ${currentValue} to ${newValue}`);
      
      // Create update object
      const updateObj = { appDownloaded: newValue };
      
      // Always update progress
      // Get the driver from our local state
      const driver = onboardingDrivers.find(d => d.id === driverId);
      if (driver) {
        // Calculate new progress based on current statuses
        const statuses = {
          interviewStatus: driver.interviewStatus === 'yes' ? 'yes' : 'no',
          toxicologyStatus: driver.toxicologyStatus === 'yes' ? 'yes' : 'no',
          backgroundStatus: driver.backgroundStatus === 'yes' ? 'yes' : 'no', 
          inductionStatus: driver.inductionStatus === 'yes' ? 'yes' : 'no',
          appDownloaded: newValue
        };
        
        // Calculate progress percentage
        let progress = 0;
        if (statuses.appDownloaded) progress += 20;
        if (statuses.interviewStatus === 'yes') progress += 20;
        if (statuses.toxicologyStatus === 'yes') progress += 20;
        if (statuses.backgroundStatus === 'yes') progress += 20;
        if (statuses.inductionStatus === 'yes') progress += 20;
        
        updateObj.onboardingProgress = progress;
        console.log(`New progress for driver ${driverId}: ${progress}%`);
      }
      
      // Call the API to update the driver
      const result = await updateDriver(driverId, updateObj);
      console.log("Update result:", result);
      
      // Update local state
      const updatedDrivers = onboardingDrivers.map(driver => {
        if (driver.id === driverId) {
          const updatedDriver = {
            ...driver, 
            appDownloaded: newValue, 
            onboardingProgress: updateObj.onboardingProgress || driver.onboardingProgress
          };
          console.log("Updated driver in state:", updatedDriver);
          return updatedDriver;
        }
        return driver;
      });
      
      setOnboardingDrivers(updatedDrivers);
      
      // If we're on the onboarding tab, also update filtered drivers
      if (activeTab === 'onboarding') {
        const updatedFiltered = filteredDrivers.map(driver => {
          if (driver.id === driverId) {
            return { 
              ...driver, 
              appDownloaded: newValue, 
              onboardingProgress: updateObj.onboardingProgress || driver.onboardingProgress 
            };
          }
          return driver;
        });
        setFilteredDrivers(updatedFiltered);
      }
    } catch (error) {
      console.error('Error updating appDownloaded:', error);
      alert('Failed to update app download status. Please try again.');
    }
  };

  // Move driver from onboarding to active
  const moveToActive = async (driverId) => {
    try {
      console.log(`Moving driver ${driverId} to active status`);
      
      // Get the driver from our local state
      const driver = onboardingDrivers.find(d => d.id === driverId);
      
      if (driver) {
        // Double-check that all required fields are "yes"
        const appDownloaded = driver.appDownloaded || false;
        const interviewStatus = driver.interviewStatus === 'yes' ? 'yes' : 'no';
        const toxicologyStatus = driver.toxicologyStatus === 'yes' ? 'yes' : 'no';
        const backgroundStatus = driver.backgroundStatus === 'yes' ? 'yes' : 'no'; 
        const inductionStatus = driver.inductionStatus === 'yes' ? 'yes' : 'no';
        
        console.log("Driver status check:", {
          appDownloaded,
          interviewStatus,
          toxicologyStatus,
          backgroundStatus,
          inductionStatus
        });
        
        if (appDownloaded && 
            interviewStatus === 'yes' && 
            toxicologyStatus === 'yes' && 
            backgroundStatus === 'yes' && 
            inductionStatus === 'yes') {
          
          // Update driver status to active
          const updateData = { 
            status: 'active',
            onboardingProgress: 100,
            onboardingCompleted: true,
            onboardingCompletedAt: new Date().toISOString()
          };
          
          console.log("Updating driver with:", updateData);
          const result = await updateDriver(driverId, updateData);
          console.log("Update result:", result);
          
          // Remove from onboarding list
          const updatedOnboarding = onboardingDrivers.filter(d => d.id !== driverId);
          setOnboardingDrivers(updatedOnboarding);
          
          // Add to active list
          const activeDriver = { ...driver, ...updateData };
          setActiveDrivers(prev => [activeDriver, ...prev]);
          
          // Update filtered drivers if needed
          if (activeTab === 'onboarding') {
            setFilteredDrivers(prev => prev.filter(d => d.id !== driverId));
          }
          
          alert(`Driver ${driver.firstName} ${driver.lastName} has been moved to active status.`);
        } else {
          alert("Cannot move to active. All requirements must be met: App Downloaded, Interview, Toxicology, Background, and Induction all need to be confirmed as 'yes'.");
        }
      } else {
        console.error("Driver not found in onboarding list:", driverId);
        alert("Driver not found. Please refresh the page and try again.");
      }
    } catch (error) {
      console.error('Error moving driver to active:', error);
      alert('Failed to move driver to active status. Please try again.');
    }
  };

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
        <h3 className="filter-heading">Driver Filters</h3>
        
        <div className="driver-search">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
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