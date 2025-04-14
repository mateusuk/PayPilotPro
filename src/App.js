// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DriversProvider } from './pages/Drivers/context/DriversContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EmailTest from './components/test/EmailTest';

// Layout components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';

// Auth components
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPassword from './components/auth/ForgotPassword';

// Dashboard and main components
import Dashboard from './components/layout/Dashboard';

// Pages
import Home from './pages/Home/Home';
import DriversPage from './pages/Drivers/Drivers';
import NotFound from './pages/NotFound';
import Compliance from './pages/Compliance/Compliance';
import Payments from './pages/Payments/Payments';
import WorkHistory from './pages/WorkHistory/WorkHistory';
import Settings from './pages/Settings/Settings';
import Reporting from './pages/Reporting/Reporting';

// UI components
import Loader from './components/ui/Loader';

// CSS
import './styles/index.css';
import './styles/dashboard.css';
import './styles/ui.css';

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
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />
          <Route path="/test-email" element={<EmailTest />} />
          
          {/* Protected routes with dashboard layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* Drivers routes */}
          <Route path="/drivers/*" element={
            <ProtectedRoute>
              <DashboardLayout>
                <DriversProvider>
                  <DriversPage />
                </DriversProvider>
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* Add other protected routes here */}
          <Route path="/compliance" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Compliance />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/payments" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Payments />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/work-history" element={
            <ProtectedRoute>
              <DashboardLayout>
                <WorkHistory />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/reporting" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Reporting />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* Test route - should be removed in production */}
          <Route path="/test-email" element={
            <ProtectedRoute>
              <DashboardLayout>
                <EmailTest />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;