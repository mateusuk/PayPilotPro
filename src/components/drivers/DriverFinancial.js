// src/components/drivers/DriverFinancial.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDrivers } from '../../contexts/DriverContext';
import { isValidUTR, isValidVAT } from '../../utils/validators';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';
import '../../styles/drivers.css';

const DriverFinancial = () => {
  const { id } = useParams();
  const { getDriver, updateDriver, error } = useDrivers();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editPayroll, setEditPayroll] = useState(false);
  const [editTax, setEditTax] = useState(false);
  const [payrollData, setPayrollData] = useState({
    accountHolder: '',
    accountNumber: '',
    sortCode: ''
  });
  const [taxData, setTaxData] = useState({
    arNumber: '',
    utrNumber: '',
    vatStatus: 'Not registered',
    vatNumber: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Fetch driver details
  useEffect(() => {
    const fetchDriverFinancial = async () => {
      try {
        setLoading(true);
        const driverData = await getDriver(id);
        setDriver(driverData);
        
        // Initialize form with existing financial data if available
        if (driverData.payroll) {
          setPayrollData({
            accountHolder: driverData.payroll.accountHolder || '',
            accountNumber: driverData.payroll.accountNumber || '',
            sortCode: driverData.payroll.sortCode || ''
          });
        }
        
        if (driverData.tax) {
          setTaxData({
            arNumber: driverData.tax.arNumber || '',
            utrNumber: driverData.tax.utrNumber || '',
            vatStatus: driverData.tax.vatStatus || 'Not registered',
            vatNumber: driverData.tax.vatNumber || ''
          });
        }
      } catch (err) {
        console.error('Error fetching driver financial details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDriverFinancial();
  }, [id, getDriver]);

  // Handle payroll input changes
  const handlePayrollChange = (e) => {
    const { name, value } = e.target;
    setPayrollData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any errors for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle tax input changes
  const handleTaxChange = (e) => {
    const { name, value } = e.target;
    setTaxData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any errors for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate payroll form
  const validatePayrollForm = () => {
    const errors = {};
    
    if (!payrollData.accountHolder.trim()) {
      errors.accountHolder = 'Account holder name is required';
    }
    
    if (!payrollData.accountNumber.trim()) {
      errors.accountNumber = 'Account number is required';
    } else if (!/^\d{8}$/.test(payrollData.accountNumber.replace(/\s/g, ''))) {
      errors.accountNumber = 'Account number must be 8 digits';
    }
    
    if (!payrollData.sortCode.trim()) {
      errors.sortCode = 'Sort code is required';
    } else {
      // Remove any dashes or spaces
      const cleanedSortCode = payrollData.sortCode.replace(/[-\s]/g, '');
      if (!/^\d{6}$/.test(cleanedSortCode)) {
        errors.sortCode = 'Sort code must be 6 digits (e.g., 12-34-56)';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate tax form
  const validateTaxForm = () => {
    const errors = {};
    
    if (taxData.utrNumber && !isValidUTR(taxData.utrNumber)) {
      errors.utrNumber = 'Please enter a valid UTR number (10 digits)';
    }
    
    if (taxData.vatStatus === 'Registered' && !taxData.vatNumber) {
      errors.vatNumber = 'VAT number is required when registered for VAT';
    } else if (taxData.vatNumber && !isValidVAT(taxData.vatNumber)) {
      errors.vatNumber = 'Please enter a valid VAT number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save payroll details
  const handleSavePayroll = async (e) => {
    e.preventDefault();
    
    if (!validatePayrollForm()) {
      return;
    }
    
    try {
      setUpdating(true);
      
      // Format sort code with dashes if needed
      const cleanedSortCode = payrollData.sortCode.replace(/[-\s]/g, '');
      const formattedSortCode = cleanedSortCode.replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3');
      
      const updatedPayrollData = {
        ...payrollData,
        sortCode: formattedSortCode
      };
      
      // Update driver with new payroll data
      await updateDriver(id, { 
        payroll: updatedPayrollData,
        paymentInfoComplete: true
      });
      
      setEditPayroll(false);
      setSuccessMessage('Payroll details updated successfully');
      
      // Update local driver state
      setDriver(prev => ({
        ...prev,
        payroll: updatedPayrollData,
        paymentInfoComplete: true
      }));
    } catch (err) {
      console.error('Error updating payroll details:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Save tax details
  const handleSaveTax = async (e) => {
    e.preventDefault();
    
    if (!validateTaxForm()) {
      return;
    }
    
    try {
      setUpdating(true);
      
      // Update driver with new tax data
      await updateDriver(id, { tax: taxData });
      
      setEditTax(false);
      setSuccessMessage('Tax details updated successfully');
      
      // Update local driver state
      setDriver(prev => ({
        ...prev,
        tax: taxData
      }));
    } catch (err) {
      console.error('Error updating tax details:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading driver financial details...</div>;
  }

  if (!driver) {
    return (
      <div className="error-container">
        <h3>Driver not found</h3>
        <p>The driver you're looking for could not be found.</p>
        <Link to="/drivers" className="btn btn-primary">Back to Drivers</Link>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="back-navigation">
        <Link to="/drivers" className="back-button">
          <span className="back-icon">←</span> Back to All Drivers
        </Link>
      </div>
      
      <div className="driver-profile-header">
        <div className="driver-avatar">
          <div className="avatar-circle">
            <span className="avatar-icon">👤</span>
          </div>
        </div>
        <div className="driver-info">
          <h2 className="driver-name">{driver.firstName} {driver.lastName}</h2>
          <p className="driver-status">
            Driver status: <span className={`status-${driver.status}`}>{driver.status}</span> - 
            Access number: {driver.accessNumber || '0000000'}
          </p>
        </div>
        <div className="driver-actions">
          <button 
            className="btn btn-danger"
            onClick={() => {}}
          >
            Offboard driver
          </button>
        </div>
      </div>
      
      <div className="driver-tabs">
        <Link to={`/drivers/${id}`} className="driver-tab">Personal Details</Link>
        <Link to={`/drivers/${id}/vehicle`} className="driver-tab">Vehicle</Link>
        <Link to={`/drivers/${id}/financial`} className="driver-tab active">Financial Details</Link>
        <Link to={`/drivers/${id}/incidents`} className="driver-tab">Incidents</Link>
        <Link to={`/drivers/${id}/engagement`} className="driver-tab">Engagement Details</Link>
      </div>
      
      {error && <Alert message={error} type="error" />}
      {successMessage && <Alert message={successMessage} type="success" autoClose />}
      
      <div className="details-section financial-section">
        <div className="section-header">
          <h3 className="section-title">Payroll Details</h3>
          <div className="lock-icon">🔒</div>
          {!editPayroll && (
            <button 
              className="btn btn-primary" 
              onClick={() => setEditPayroll(true)}
            >
              Edit
            </button>
          )}
        </div>
        
        <div className="details-container">
          {editPayroll ? (
            <form onSubmit={handleSavePayroll}>
              <div className="financial-details-form">
                <div className="form-group">
                  <label htmlFor="accountHolder">Name of account holder</label>
                  <input
                    type="text"
                    id="accountHolder"
                    name="accountHolder"
                    className={`form-control ${formErrors.accountHolder ? 'is-invalid' : ''}`}
                    value={payrollData.accountHolder}
                    onChange={handlePayrollChange}
                  />
                  {formErrors.accountHolder && (
                    <div className="invalid-feedback">{formErrors.accountHolder}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="accountNumber">Account Number</label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    className={`form-control ${formErrors.accountNumber ? 'is-invalid' : ''}`}
                    value={payrollData.accountNumber}
                    onChange={handlePayrollChange}
                    placeholder="8 digits"
                  />
                  {formErrors.accountNumber && (
                    <div className="invalid-feedback">{formErrors.accountNumber}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="sortCode">Sort Code</label>
                  <input
                    type="text"
                    id="sortCode"
                    name="sortCode"
                    className={`form-control ${formErrors.sortCode ? 'is-invalid' : ''}`}
                    value={payrollData.sortCode}
                    onChange={handlePayrollChange}
                    placeholder="e.g. 12-34-56"
                  />
                  {formErrors.sortCode && (
                    <div className="invalid-feedback">{formErrors.sortCode}</div>
                  )}
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditPayroll(false)}
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updating}
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="financial-details-table">
              <div className="financial-row">
                <div className="financial-header">Name of account holder</div>
                <div className="financial-data">
                  {driver.payroll?.accountHolder || 'No account holder set'}
                </div>
              </div>
              <div className="financial-row">
                <div className="financial-header">Account Number</div>
                <div className="financial-data">
                  {driver.payroll?.accountNumber || 'No account number set'}
                </div>
              </div>
              <div className="financial-row">
                <div className="financial-header">Sort Code</div>
                <div className="financial-data">
                  {driver.payroll?.sortCode || 'No sort code set'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="details-section financial-section">
        <div className="section-header">
          <h3 className="section-title">Tax Details</h3>
          <div className="lock-icon">🔒</div>
          {!editTax && (
            <button 
              className="btn btn-primary" 
              onClick={() => setEditTax(true)}
            >
              Edit
            </button>
          )}
        </div>
        
        <div className="details-container">
          {editTax ? (
            <form onSubmit={handleSaveTax}>
              <div className="financial-details-form">
                <div className="form-group">
                  <label htmlFor="arNumber">AR Number</label>
                  <input
                    type="text"
                    id="arNumber"
                    name="arNumber"
                    className="form-control"
                    value={taxData.arNumber}
                    onChange={handleTaxChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="utrNumber">UTR Number</label>
                  <input
                    type="text"
                    id="utrNumber"
                    name="utrNumber"
                    className={`form-control ${formErrors.utrNumber ? 'is-invalid' : ''}`}
                    value={taxData.utrNumber}
                    onChange={handleTaxChange}
                    placeholder="10 digits"
                  />
                  {formErrors.utrNumber && (
                    <div className="invalid-feedback">{formErrors.utrNumber}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="vatStatus">VAT Status</label>
                  <select
                    id="vatStatus"
                    name="vatStatus"
                    className="form-control"
                    value={taxData.vatStatus}
                    onChange={handleTaxChange}
                  >
                    <option value="Not registered">Not registered</option>
                    <option value="Registered">Registered</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                
                {taxData.vatStatus === 'Registered' && (
                  <div className="form-group">
                    <label htmlFor="vatNumber">VAT Number</label>
                    <input
                      type="text"
                      id="vatNumber"
                      name="vatNumber"
                      className={`form-control ${formErrors.vatNumber ? 'is-invalid' : ''}`}
                      value={taxData.vatNumber}
                      onChange={handleTaxChange}
                    />
                    {formErrors.vatNumber && (
                      <div className="invalid-feedback">{formErrors.vatNumber}</div>
                    )}
                  </div>
                )}
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditTax(false)}
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updating}
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="financial-details-table">
              <div className="financial-row">
                <div className="financial-header">AR Number</div>
                <div className="financial-data">
                  {driver.tax?.arNumber || 'No AR number provided'}
                </div>
              </div>
              <div className="financial-row">
                <div className="financial-header">UTR Number</div>
                <div className="financial-data">
                  {driver.tax?.utrNumber || 'No UTR number provided'}
                </div>
              </div>
              <div className="financial-row">
                <div className="financial-header">VAT Status</div>
                <div className="financial-data">
                  {driver.tax?.vatStatus || 'Not registered'}
                </div>
              </div>
              {driver.tax?.vatStatus === 'Registered' && (
                <div className="financial-row">
                  <div className="financial-header">VAT Number</div>
                  <div className="financial-data">
                    {driver.tax?.vatNumber || 'No VAT number provided'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="details-section financial-section">
        <h3 className="section-title">Deductions</h3>
        <div className="lock-icon">🔒</div>
        
        <div className="details-container">
          <div className="deduction-circle-container">
            <div className="deduction-circle">
              <div className="circle-value">£0.00</div>
            </div>
            <div className="deduction-info">
              <div className="deduction-item">
                <span className="deduction-color paid"></span>
                <span className="deduction-text">Amount Paid £0.00</span>
              </div>
              <div className="deduction-item">
                <span className="deduction-color remaining"></span>
                <span className="deduction-text">Amount Remaining £0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="details-section financial-section">
        <h3 className="section-title">Invoices</h3>
        
        <div className="details-container">
          <div className="date-range-filters">
            <div className="date-filter">
              <label>From</label>
              <div className="date-input">
                <span className="arrow-icon">▶</span>
              </div>
            </div>
            <div className="date-filter">
              <label>To</label>
              <div className="date-input">
                <span className="arrow-icon">▶</span>
              </div>
            </div>
            <div className="download-invoices">
              <button className="btn btn-primary download-btn">
                <span className="download-icon">📄</span>
                Download invoices
              </button>
            </div>
          </div>
          
          <div className="invoices-table">
            <div className="invoice-header-row">
              <div className="invoice-header">Invoice No</div>
              <div className="invoice-header">Location</div>
              <div className="invoice-header">Date</div>
              <div className="invoice-header">Amount</div>
              <div className="invoice-header">Invoice</div>
              <div className="invoice-header">Payment Summary</div>
            </div>
            <div className="no-invoices-message">
              Looks like there are no invoices
            </div>
          </div>
        </div>
      </div>
      
      <div className="details-section financial-section">
        <div className="deduction-header">
          <h3 className="section-title">Deductions</h3>
          <div className="deduction-search">
            <input type="text" placeholder="Search by ID" className="deduction-search-input" />
            <button className="search-btn">🔍</button>
          </div>
          <button className="btn btn-primary create-deduction-btn">Create deduction</button>
        </div>
      </div>
    </div>
  );
};

export default DriverFinancial;