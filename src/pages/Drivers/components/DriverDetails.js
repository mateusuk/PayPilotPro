import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDrivers } from '../context/DriversContext';
import Loader from '../../../components/ui/Loader';
import Alert from '../../../components/ui/Alert';
import '../styles/drivers.css';
import './DriverDetails/DriverDetails.css';

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDriverById } = useDrivers();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch driver details
  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        setLoading(true);
        const driverData = await getDriverById(id);
        setDriver(driverData);
      } catch (err) {
        console.error('Error fetching driver details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchDriverDetails();
    } else {
      console.error('No ID parameter found in URL');
      setLoading(false);
    }
  }, [id, getDriverById]);

  if (loading) {
    return <Loader message="Loading driver details..." />;
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
    <>
      <div className="details-section">
        <div className="section-header">
          <h3 className="section-title">Driver Details</h3>
        </div>
        
        <div className="details-container">
          <div className="details-row">
            <div className="details-column">
              <div className="detail-group">
                <label className="detail-label">Full name</label>
                <div className="detail-value">{driver.firstName} {driver.lastName}</div>
              </div>
              
              <div className="detail-group">
                <label className="detail-label">Email</label>
                <div className="detail-value">{driver.email}</div>
              </div>
              
              <div className="detail-group">
                <label className="detail-label">Phone</label>
                <div className="detail-value">{driver.phone || 'Not provided'}</div>
              </div>
            </div>
            
            <div className="details-column">
              <div className="detail-group">
                <label className="detail-label">Location</label>
                <div className="detail-value">{driver.location || 'Not provided'}</div>
              </div>
              
              <div className="detail-group">
                <label className="detail-label">Customer</label>
                <div className="detail-value">{driver.customer || 'Not provided'}</div>
              </div>
              
              <div className="detail-group">
                <label className="detail-label">Access Number</label>
                <div className="detail-value">{driver.accessNumber || 'Not provided'}</div>
              </div>
            </div>
          </div>
          
          <div className="details-row">
            <div className="details-column">
              <div className="detail-group">
                <label className="detail-label">Status</label>
                <div className="detail-value">
                  <span className={`status-badge status-${driver.status}`}>{driver.status}</span>
                </div>
              </div>
            </div>
            
            <div className="details-column">
              <div className="detail-group">
                <label className="detail-label">Created At</label>
                <div className="detail-value">
                  {driver.createdAt 
                    ? new Date(driver.createdAt).toLocaleString() 
                    : 'Not available'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DriverDetails; 