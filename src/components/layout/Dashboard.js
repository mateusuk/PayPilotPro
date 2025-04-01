// src/components/layout/Dashboard.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    activeDrivers: 0,
    inactiveDrivers: 0,
    totalDrivers: 0,
    incompletePaymentInfo: 0,
    paymentMethodBreakdown: {
      selfBilling: 100,
      invoicing: 0
    },
    utrCoverage: {
      withUtr: 36,
      withoutUtr: 64
    },
    onboardingApplications: {
      total: 15,
      initial: 10,
      additional: 5
    },
    evidenceAudit: {
      requestedEvidence: 1,
      awaitingApproval: 0,
      dueToExpire: 0,
      expiredEvidence: 1
    },
    expiredDocumentsRequested: 0,
    expiredDocumentsNotRequested: 1
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch dashboard data from Firestore
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get active drivers
        const activeDriversQuery = query(
          collection(db, 'drivers'),
          where('status', '==', 'active')
        );
        const activeDriversSnapshot = await getDocs(activeDriversQuery);
        const activeDriversCount = activeDriversSnapshot.size;
        
        // Get inactive drivers
        const inactiveDriversQuery = query(
          collection(db, 'drivers'),
          where('status', '==', 'inactive')
        );
        const inactiveDriversSnapshot = await getDocs(inactiveDriversQuery);
        const inactiveDriversCount = inactiveDriversSnapshot.size;
        
        // Get drivers with incomplete payment info
        const incompletePaymentQuery = query(
          collection(db, 'drivers'),
          where('paymentInfoComplete', '==', false)
        );
        const incompletePaymentSnapshot = await getDocs(incompletePaymentQuery);
        const incompletePaymentCount = incompletePaymentSnapshot.size;
        
        // Update dashboard data
        setDashboardData(prevData => ({
          ...prevData,
          activeDrivers: activeDriversCount,
          inactiveDrivers: inactiveDriversCount,
          totalDrivers: activeDriversCount + inactiveDriversCount,
          incompletePaymentInfo: incompletePaymentCount,
        }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);
  
  if (loading) {
    return <div className="loading-container">Loading dashboard data...</div>;
  }
  
  return (
    <div className="dashboard-content">
      <div className="card-container">
        <div className="metric-card green">
          <div className="metric-title">Active Drivers</div>
          <div className="metric-subtitle">Drivers who are currently available to take on routes</div>
          <div className="metric-value">{dashboardData.activeDrivers}</div>
        </div>
        
        <div className="metric-card dark">
          <div className="metric-title">Inactive Drivers</div>
          <div className="metric-subtitle">Drivers who are currently unavailable to take on routes</div>
          <div className="metric-value">{dashboardData.inactiveDrivers}</div>
        </div>
        
        <div className="metric-card purple">
          <div className="metric-title">Total Drivers</div>
          <div className="metric-subtitle">Total number of drivers registered in the system</div>
          <div className="metric-value">{dashboardData.totalDrivers}</div>
        </div>
        
        <div className="metric-card red">
          <div className="metric-title">Incomplete Driver Payment Information</div>
          <div className="metric-subtitle">Drivers with incomplete payment details</div>
          <div className="metric-value">{dashboardData.incompletePaymentInfo}</div>
        </div>
      </div>
      
      <div className="card-container">
        <div className="data-section">
          <h3>Payment Method</h3>
          <div className="progress-container">
            <div className="progress-circle">{dashboardData.paymentMethodBreakdown.selfBilling}%</div>
            <div className="progress-info">
              <div className="progress-label">Drivers payment method breakdown</div>
              <div className="legend">
                <div className="legend-item">
                  <div className="legend-color dark-green"></div>
                  <div>Self-Billing</div>
                </div>
                <div className="legend-item">
                  <div className="legend-color light-green"></div>
                  <div>Invoicing with PayPilotPro</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="data-section">
          <h3>UTR Coverage</h3>
          <div className="progress-container">
            <div className="progress-circle">{dashboardData.utrCoverage.withUtr}%</div>
            <div className="progress-info">
              <div className="progress-label">It is required to prove self-employment</div>
              <div className="legend">
                <div className="legend-item">
                  <div className="legend-color dark-green"></div>
                  <div>Driver without UTR</div>
                </div>
                <div className="legend-item">
                  <div className="legend-color light-green"></div>
                  <div>Driver With UTR</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="data-section">
          <h3>Onboarding Applications</h3>
          <div className="progress-container">
            <div className="progress-circle">{dashboardData.onboardingApplications.total}</div>
            <div className="progress-info">
              <div className="progress-label">Application in Progress</div>
              <div className="legend">
                <div className="legend-item">
                  <div className="legend-color dark-green"></div>
                  <div>Additional Application</div>
                </div>
                <div className="legend-item">
                  <div className="legend-color light-green"></div>
                  <div>Initial Application</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <h3 className="section-title">Enterprise Logistics - <span>Evidence Audit</span></h3>
      
      <div className="card-container">
        <div className="metric-card green">
          <div className="metric-title">Requested Evidence</div>
          <div className="metric-subtitle">Evidence requested to be re-uploaded</div>
          <div className="metric-value">{dashboardData.evidenceAudit.requestedEvidence}</div>
        </div>
        
        <div className="metric-card purple">
          <div className="metric-title">Awaiting approval</div>
          <div className="metric-subtitle">Re-uploaded evidence that needs to be approved</div>
          <div className="metric-value">{dashboardData.evidenceAudit.awaitingApproval}</div>
        </div>
        
        <div className="metric-card yellow">
          <div className="metric-title">Due to expire</div>
          <div className="metric-subtitle">Driver's evidence that is due to expire within 14 days</div>
          <div className="metric-value">{dashboardData.evidenceAudit.dueToExpire}</div>
        </div>
        
        <div className="metric-card red">
          <div className="metric-title">Expired evidence</div>
          <div className="metric-subtitle">Driver's evidence that has expired</div>
          <div className="metric-value">{dashboardData.evidenceAudit.expiredEvidence}</div>
        </div>
      </div>
      
      <div className="card-container">
        <div className="data-section">
          <h3>Overview due to expire</h3>
          <div className="progress-container">
            <div className="progress-circle">{dashboardData.evidenceAudit.dueToExpire}</div>
            <div className="progress-info">
              <div className="progress-label">Overview of all documents to expire</div>
              <div className="legend">
                <div className="legend-item">
                  <div className="legend-color dark-green"></div>
                  <div>Not yet requested</div>
                </div>
                <div className="legend-item">
                  <div className="legend-color light-green"></div>
                  <div>Re-upload requested</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="data-section">
          <h3>Overview expired</h3>
          <div className="progress-container">
            <div className="progress-circle">{dashboardData.evidenceAudit.expiredEvidence}</div>
            <div className="progress-info">
              <div className="progress-label">Overview of all documents that are expired</div>
              <div className="legend">
                <div className="legend-item">
                  <div className="legend-color dark-green"></div>
                  <div>Not yet requested</div>
                </div>
                <div className="legend-item">
                  <div className="legend-color light-green"></div>
                  <div>Re-upload requested</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;