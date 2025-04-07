import React, { useState, useEffect } from 'react';
// Firebase imports - uncomment when implementing Firebase
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../../firebase/config';
import { FaDownload, FaFilter, FaChartLine, FaUsers, FaClipboardCheck } from 'react-icons/fa';
import DriverPerformance from './components/DriverPerformance';
import ComplianceReport from './components/ComplianceReport';
import './reporting.css';

const Reporting = () => {
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeReport, setActiveReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

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

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // TODO: Implement Firebase data fetching
      // Mock data for development
      setTimeout(() => {
        setReportData({
          driverStats: {
            total: 125,
            active: 98,
            inactive: 15,
            onboarding: 12
          },
          documentStats: {
            valid: 285,
            expiring: 12,
            expired: 8,
            missing: 15
          },
          incidentStats: {
            total: 45,
            pending: 8,
            investigating: 12,
            resolved: 25
          },
          complianceRate: 92,
          recentIncidents: []
        });
        setLoading(false);
      }, 1000);

      /* Commented Firebase implementation - uncomment when ready
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
      
      // Calculate compliance rate
      const compliantDrivers = drivers.filter(d => 
        d.status === 'active' && 
        d.paymentInfoComplete === true &&
        d.documents && Object.keys(d.documents).length >= 3
      ).length;
      
      const complianceRate = active > 0 ? Math.round((compliantDrivers / active) * 100) : 0;
      
      // Document stats calculation
      let validDocs = 0;
      let expiringDocs = 0;
      let expiredDocs = 0;
      let missingDocs = 0;
      
      drivers.forEach(driver => {
        if (!driver.documents) {
          missingDocs += 3;
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
        recentIncidents: incidents
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
      });
      */
      
    } catch (err) {
      console.error('Error fetching report data:', err);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderOverviewReport = () => (
    <div className="report-content">
      <div className="report-grid">
        <div className="stat-card driver-stats">
          <div className="stat-card-header">
            <FaUsers className="stat-icon" />
            <h3>Driver Performance</h3>
          </div>
          <div className="stat-card-body">
            <div className="stat-row">
              <span className="stat-label">Active Drivers</span>
              <span className="stat-value highlight">{reportData.driverStats.active}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Total Drivers</span>
              <span className="stat-value">{reportData.driverStats.total}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Compliance Rate</span>
              <span className="stat-value success">{reportData.complianceRate}%</span>
            </div>
          </div>
          <button className="download-button">
            <FaDownload /> Export Report
          </button>
        </div>

        <div className="stat-card document-stats">
          <div className="stat-card-header">
            <FaClipboardCheck className="stat-icon" />
            <h3>Document Status</h3>
          </div>
          <div className="stat-card-body">
            <div className="stat-row">
              <span className="stat-label">Valid Documents</span>
              <span className="stat-value success">{reportData.documentStats.valid}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Expiring Soon</span>
              <span className="stat-value warning">{reportData.documentStats.expiring}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Expired</span>
              <span className="stat-value danger">{reportData.documentStats.expired}</span>
            </div>
          </div>
          <button className="download-button">
            <FaDownload /> Export Report
          </button>
        </div>

        <div className="stat-card incident-stats">
          <div className="stat-card-header">
            <FaChartLine className="stat-icon" />
            <h3>Incident Reports</h3>
          </div>
          <div className="stat-card-body">
            <div className="stat-row">
              <span className="stat-label">Total Incidents</span>
              <span className="stat-value">{reportData.incidentStats.total}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Pending Review</span>
              <span className="stat-value warning">{reportData.incidentStats.pending}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Resolved</span>
              <span className="stat-value success">{reportData.incidentStats.resolved}</span>
            </div>
          </div>
          <button className="download-button">
            <FaDownload /> Export Report
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeReport) {
      case 'drivers':
        return <DriverPerformance data={reportData} />;
      case 'compliance':
        return <ComplianceReport data={reportData} />;
      default:
        return renderOverviewReport();
    }
  };

  return (
    <div className="reporting-container">
      <div className="reporting-header">
        <div className="header-content">
          <h1>Reports & Analytics</h1>
          <p className="header-subtitle">Monitor your business performance</p>
        </div>
        <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
          <FaFilter /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Start Date:</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
            />
          </div>
          <div className="filter-group">
            <label>End Date:</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
            />
          </div>
          <button className="apply-button" onClick={fetchReportData}>
            Apply Filters
          </button>
        </div>
      )}

      <div className="report-tabs">
        <button
          className={`tab-button ${activeReport === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveReport('overview')}
        >
          <FaChartLine /> Overview
        </button>
        <button
          className={`tab-button ${activeReport === 'drivers' ? 'active' : ''}`}
          onClick={() => setActiveReport('drivers')}
        >
          <FaUsers /> Driver Performance
        </button>
        <button
          className={`tab-button ${activeReport === 'compliance' ? 'active' : ''}`}
          onClick={() => setActiveReport('compliance')}
        >
          <FaClipboardCheck /> Compliance Reports
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default Reporting; 