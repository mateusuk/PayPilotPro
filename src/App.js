// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DriverProvider } from './contexts/DriverContext';

// Layout components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';

// Auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';

// Dashboard and main components
import Dashboard from './components/layout/Dashboard';

// Driver components
import DriverList from './components/drivers/DriverList';
import DriverDetails from './components/drivers/DriverDetails';
import DriverVehicle from './components/drivers/DriverVehicle';
import DriverFinancial from './components/drivers/DriverFinancial';
import DriverIncidents from './components/drivers/DriverIncidents';
import DriverEngagement from './components/drivers/DriverEngagement';

// UI components
import Loader from './components/ui/Loader';

// Pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';


// CSS
import './styles/index.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/drivers.css';
import './styles/ui.css';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <Loader fullScreen text="Loading..." />;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Public routes wrapper (accessible only when not logged in)
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <Loader fullScreen text="Loading..." />;
  }
  
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

// Dashboard layout wrapper
const DashboardLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Header />
      <div className="dashboard-container">
        <Sidebar />
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <DriverProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />
            
            {/* Protected routes with dashboard layout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Drivers routes */}
            <Route path="/drivers" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DriverList />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/drivers/:id" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DriverDetails />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/drivers/:id/vehicle" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DriverVehicle />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/drivers/:id/financial" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DriverFinancial />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/drivers/:id/incidents" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DriverIncidents />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/drivers/:id/engagement" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DriverEngagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Add other protected routes here */}
            <Route path="/compliance" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div className="dashboard-content">
                    <h2>Compliance Management</h2>
                    <p>Compliance tracking and management features coming soon.</p>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/payments" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div className="dashboard-content">
                    <h2>Payments</h2>
                    <p>Payment processing and tracking features coming soon.</p>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/work-history" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div className="dashboard-content">
                    <h2>Work History</h2>
                    <p>Driver work history tracking features coming soon.</p>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/reporting" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div className="dashboard-content">
                    <h2>Reporting</h2>
                    <p>Advanced reporting and analytics features coming soon.</p>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div className="dashboard-content">
                    <h2>Settings</h2>
                    <p>System and user settings features coming soon.</p>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/comments" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div className="dashboard-content">
                    <h2>Comments</h2>
                    <p>Driver feedback and comment management features coming soon.</p>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/support" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div className="dashboard-content">
                    <h2>Support</h2>
                    <p>Support and help resources coming soon.</p>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DriverProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;