import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Alert from '../../../../components/ui/Alert';
import Loader from '../../../../components/ui/Loader';
import Card from '../../../../components/ui/Card';
import { useDrivers } from '../../context/DriversContext';
import { isValidUTR, isValidVAT } from '../../../../utils/validators';
import '../../styles/drivers.css';
import './DriverFinancial.css';

const DriverFinancial = () => {
  const { id } = useParams();
  const { getDriverById, updateDriver } = useDrivers();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        setError(null);
        const driverData = await getDriverById(id);
        if (!driverData) {
          throw new Error('Driver not found');
        }
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDriverFinancial();
  }, [id, getDriverById]);

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
      setError(null);
      
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
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Update local driver state
      setDriver(prev => ({
        ...prev,
        payroll: updatedPayrollData,
        paymentInfoComplete: true
      }));
    } catch (err) {
      console.error('Error updating payroll details:', err);
      setError(err.message);
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
      setError(null);
      
      // Update driver with new tax data
      await updateDriver(id, { tax: taxData });
      
      setEditTax(false);
      setSuccessMessage('Tax details updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Update local driver state
      setDriver(prev => ({
        ...prev,
        tax: taxData
      }));
    } catch (err) {
      console.error('Error updating tax details:', err);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loader message="Loading driver financial details..." />;
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  if (!driver) {
    return (
      <div className="error-container">
        <Alert message="Driver not found" type="error" />
        <Link to="/drivers" className="btn btn-primary">Back to Drivers</Link>
      </div>
    );
  }

  return (
    <>
      {successMessage && <Alert message={successMessage} type="success" autoClose />}

      <div className="financial-sections">
        <Card className="financial-section">
          <div className="section-header">
            <h3 className="section-title">Payroll Details</h3>
            {!editPayroll && (
              <button 
                className="edit-btn"
                onClick={() => setEditPayroll(true)}
              >
                Edit Payroll
              </button>
            )}
          </div>

          {editPayroll ? (
            <form onSubmit={handleSavePayroll} className="financial-form">
              <div className="form-group">
                <label htmlFor="accountHolder">Account Holder Name</label>
                <input
                  type="text"
                  id="accountHolder"
                  name="accountHolder"
                  className={`form-control ${formErrors.accountHolder ? 'is-invalid' : ''}`}
                  value={payrollData.accountHolder}
                  onChange={handlePayrollChange}
                  placeholder="Enter account holder name"
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
                  placeholder="Enter 8-digit account number"
                  maxLength="8"
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
                  placeholder="Enter sort code (e.g., 12-34-56)"
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
            </form>
          ) : (
            <div className="financial-details-grid">
              <div className="detail-group">
                <span className="detail-label">Account Holder</span>
                <span className="detail-value">
                  {driver.payroll?.accountHolder || 'Not provided'}
                </span>
              </div>
              <div className="detail-group">
                <span className="detail-label">Account Number</span>
                <span className="detail-value">
                  {driver.payroll?.accountNumber ? '••••••' + driver.payroll.accountNumber.slice(-2) : 'Not provided'}
                </span>
              </div>
              <div className="detail-group">
                <span className="detail-label">Sort Code</span>
                <span className="detail-value">
                  {driver.payroll?.sortCode || 'Not provided'}
                </span>
              </div>
            </div>
          )}
        </Card>

        <Card className="financial-section">
          <div className="section-header">
            <h3 className="section-title">Tax Information</h3>
            {!editTax && (
              <button 
                className="edit-btn"
                onClick={() => setEditTax(true)}
              >
                Edit Tax Info
              </button>
            )}
          </div>

          {editTax ? (
            <form onSubmit={handleSaveTax} className="financial-form">
              <div className="form-group">
                <label htmlFor="arNumber">AR Number (Optional)</label>
                <input
                  type="text"
                  id="arNumber"
                  name="arNumber"
                  className="form-control"
                  value={taxData.arNumber}
                  onChange={handleTaxChange}
                  placeholder="Enter AR number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="utrNumber">UTR Number (Optional)</label>
                <input
                  type="text"
                  id="utrNumber"
                  name="utrNumber"
                  className={`form-control ${formErrors.utrNumber ? 'is-invalid' : ''}`}
                  value={taxData.utrNumber}
                  onChange={handleTaxChange}
                  placeholder="Enter UTR number"
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
                  <option value="Pending">Pending registration</option>
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
                    placeholder="Enter VAT number"
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
            </form>
          ) : (
            <div className="financial-details-grid">
              <div className="detail-group">
                <span className="detail-label">AR Number</span>
                <span className="detail-value">
                  {driver.tax?.arNumber || 'Not provided'}
                </span>
              </div>
              <div className="detail-group">
                <span className="detail-label">UTR Number</span>
                <span className="detail-value">
                  {driver.tax?.utrNumber || 'Not provided'}
                </span>
              </div>
              <div className="detail-group">
                <span className="detail-label">VAT Status</span>
                <span className="detail-value">
                  {driver.tax?.vatStatus || 'Not registered'}
                </span>
              </div>
              {driver.tax?.vatStatus === 'Registered' && (
                <div className="detail-group">
                  <span className="detail-label">VAT Number</span>
                  <span className="detail-value">
                    {driver.tax.vatNumber || 'Not provided'}
                  </span>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default DriverFinancial; 