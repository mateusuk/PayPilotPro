// src/pages/ReportingPage.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const ReportingPage = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    driverStats: {
      total: 0,
      active: 0,
      inactive: 0,
      onboarding: 0
    },
    documentStats: {
      valid: 0,
      expiring: 0,
      expired: 0,
      missing: 0
    },
    incidentStats: {
      total: 0,
      pending: 0,
      investigating: 0,
      resolved: 0
    },
    complianceRate: 0,
    recentIncidents: []
  });
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        
        // Fetch driver stats
        const driversSnapshot = await getDocs(collection(db, 'drivers'));
        const drivers = [];
        driversSnapshot.forEach(doc => {
          drivers.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        const active = drivers.filter(d => d.status === 'active').length;
        const inactive = drivers.filter(d => d.status === 'inactive').length;
        const onboarding = drivers.filter(d => d.status === 'invited').length;
        
        // Fetch incidents
        const incidentsSnapshot = await getDocs(collection(db, 'incidents'));
        const incidents = [];
        incidentsSnapshot.forEach(doc => {
          incidents.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        const pending = incidents.filter(i => i.status === 'pending').length;
        const investigating = incidents.filter(i => i.status === 'investigating').length;
        const resolved = incidents.filter(i => i.status === 'resolved').length;
        
        // Calculate compliance rate (% of drivers with complete docs and payment info)
        const compliantDrivers = drivers.filter(d => 
          d.status === 'active' && 
          d.paymentInfoComplete === true &&
          d.documents && Object.keys(d.documents).length >= 3
        ).length;
        
        const complianceRate = active > 0 ? Math.round((compliantDrivers / active) * 100) : 0;
        
        // Get count of document statuses
        let validDocs = 0;
        let expiringDocs = 0;
        let expiredDocs = 0;
        let missingDocs = 0;
        
        drivers.forEach(driver => {
          if (!driver.documents) {
            missingDocs += 3; // Assuming 3 required docs per driver
            return;
          }
          
          const requiredDocs = ['drivingLicense', 'idProof', 'insurance'];
          requiredDocs.forEach(docType => {
            if (!driver.documents[docType]) {
              missingDocs++;
              return;
            }
            
            const doc = driver.documents[docType];
            if (doc.status === 'expired') {
              expiredDocs++;
            } else if (doc.expiryDate && new Date(doc.expiryDate) < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)) {
              expiringDocs++;
            } else {
              validDocs++;
            }
          });
        });
        
        // Sort incidents by date (newest first) and take the latest 5
        const recentIncidents = incidents
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        
        setReportData({
          driverStats: {
            total: drivers.length,
            active,
            inactive,
            onboarding
          },
          documentStats: {
            valid: validDocs,
            expiring: expiringDocs,
            expired: expiredDocs,
            missing: missingDocs
          },
          incidentStats: {
            total: incidents.length,
            pending,
            investigating,
            resolved
          },
          complianceRate,
          recentIncidents
        });
        
      } catch (err) {
        console.error('Error fetching report data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, []);
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className="app-container">
      <Header />
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <h2 className="page-title">Reporting Dashboard</h2>
          
          <div className="report-filters">
            <div className="report-type-selector">
              <button 
                className={`report-type-btn ${selectedReport === 'overview' ? 'active' : ''}`}
                onClick={() => setSelectedReport('overview')}
              >
                Overview
              </button>
              <button 
                className={`report-type-btn ${selectedReport === 'drivers' ? 'active' : ''}`}
                onClick={() => setSelectedReport('drivers')}
              >
                Drivers
              </button>
              <button 
                className={`report-type-btn ${selectedReport === 'compliance' ? 'active' : ''}`}
                onClick={() => setSelectedReport('compliance')}
              >
                Compliance
              </button>
              <button 
                className={`report-type-btn ${selectedReport === 'incidents' ? 'active' : ''}`}
                onClick={() => setSelectedReport('incidents')}
              >
                Incidents
              </button>
            </div>
            
            <div className="date-range-selector">
              <div className="date-input-group">
                <label>From:</label>
                <input 
                  type="date" 
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                />
              </div>
              <div className="date-input-group">
                <label>To:</label>
                <input 
                  type="date" 
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                />
              </div>
              <button className="btn btn-primary">Apply Filter</button>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-message">Loading report data...</div>
          ) : (
            <>
              {selectedReport === 'overview' && (
                <div className="report-section">
                  <h3>Overview Dashboard</h3>
                  
                  <div className="dashboard-stats">
                    <div className="card-container">
                      <div className="metric-card green">
                        <div className="metric-title">Active Drivers</div>
                        <div className="metric-value">{reportData.driverStats.active}</div>
                      </div>
                      
                      <div className="metric-card dark">
                        <div className="metric-title">Inactive Drivers</div>
                        <div className="metric-value">{reportData.driverStats.inactive}</div>
                      </div>
                      
                      <div className="metric-card purple">
                        <div className="metric-title">Total Drivers</div>
                        <div className="metric-value">{reportData.driverStats.total}</div>
                      </div>
                      
                      <div className="metric-card yellow">
                        <div className="metric-title">Onboarding Drivers</div>
                        <div className="metric-value">{reportData.driverStats.onboarding}</div>
                      </div>
                    </div>
                    
                    <div className="compliance-section">
                      <h4>Compliance Rate</h4>
                      <div className="compliance-meter">
                        <div 
                          className="compliance-fill"
                          style={{ width: `${reportData.complianceRate}%` }}
                        ></div>
                        <span className="compliance-value">{reportData.complianceRate}%</span>
                      </div>
                      <p className="compliance-desc">
                        Percentage of active drivers with complete documentation and payment information
                      </p>
                    </div>
                    
                    <h4>Recent Incidents</h4>
                    <div className="recent-incidents">
                      {reportData.recentIncidents.length > 0 ? (
                        <table className="incidents-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Driver</th>
                              <th>Title</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.recentIncidents.map(incident => (
                              <tr key={incident.id}>
                                <td>{new Date(incident.date).toLocaleDateString()}</td>
                                <td>{incident.driverName}</td>
                                <td>{incident.title}</td>
                                <td>
                                  <span className={`status-${incident.status}`}>
                                    {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="no-data-message">No recent incidents recorded</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {selectedReport === 'drivers' && (
                <div className="report-section">
                  <h3>Driver Statistics</h3>
                  
                  <div className="stats-grid">
                    <div className="data-section">
                      <h4>Driver Status</h4>
                      <div className="data-chart pie-chart">
                        <div className="chart-container">
                          {/* Placeholder for actual chart */}
                          <div className="chart-placeholder">
                            Driver Status Chart
                          </div>
                        </div>
                        <div className="legend">
                          <div className="legend-item">
                            <div className="legend-color green"></div>
                            <div>Active ({reportData.driverStats.active})</div>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color dark"></div>
                            <div>Inactive ({reportData.driverStats.inactive})</div>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color purple"></div>
                            <div>Onboarding ({reportData.driverStats.onboarding})</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="data-section">
                      <h4>Driver Growth</h4>
                      <div className="data-chart line-chart">
                        <div className="chart-container">
                          {/* Placeholder for actual chart */}
                          <div className="chart-placeholder">
                            Driver Growth Chart
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedReport === 'compliance' && (
                <div className="report-section">
                  <h3>Compliance Statistics</h3>
                  
                  <div className="stats-grid">
                    <div className="data-section">
                      <h4>Document Status</h4>
                      <div className="data-chart pie-chart">
                        <div className="chart-container">
                          {/* Placeholder for actual chart */}
                          <div className="chart-placeholder">
                            Document Status Chart
                          </div>
                        </div>
                        <div className="legend">
                          <div className="legend-item">
                            <div className="legend-color green"></div>
                            <div>Valid ({reportData.documentStats.valid})</div>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color yellow"></div>
                            <div>Expiring Soon ({reportData.documentStats.expiring})</div>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color red"></div>
                            <div>Expired ({reportData.documentStats.expired})</div>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color dark"></div>
                            <div>Missing ({reportData.documentStats.missing})</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="data-section">
                      <h4>Compliance Trend</h4>
                      <div className="data-chart line-chart">
                        <div className="chart-container">
                          {/* Placeholder for actual chart */}
                          <div className="chart-placeholder">
                            Compliance Trend Chart
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedReport === 'incidents' && (
                <div className="report-section">
                  <h3>Incident Statistics</h3>
                  
                  <div className="stats-grid">
                    <div className="data-section">
                      <h4>Incident Status</h4>
                      <div className="data-chart pie-chart">
                        <div className="chart-container">
                          {/* Placeholder for actual chart */}
                          <div className="chart-placeholder">
                            Incident Status Chart
                          </div>
                        </div>
                        <div className="legend">
                          <div className="legend-item">
                            <div className="legend-color yellow"></div>
                            <div>Pending ({reportData.incidentStats.pending})</div>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color blue"></div>
                            <div>Investigating ({reportData.incidentStats.investigating})</div>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color green"></div>
                            <div>Resolved ({reportData.incidentStats.resolved})</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="data-section">
                      <h4>Incident Trend</h4>
                      <div className="data-chart line-chart">
                        <div className="chart-container">
                          {/* Placeholder for actual chart */}
                          <div className="chart-placeholder">
                            Incident Trend Chart
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportingPage;