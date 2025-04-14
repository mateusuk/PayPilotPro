import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/ui/Modal';
import Alert from '../../../../components/ui/Alert';
import './DeactivateDriverModal.css';

const DeactivateDriverModal = ({ isOpen, onClose, onConfirm, driverName }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setError('');
      setReason('');
    }
  }, [isOpen]);

  // Close modal with escape key
  useEffect(() => {
    function handleEscKey(event) {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Clear error message
  const clearError = () => {
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      clearError();
      
      // Validate form
      if (!reason.trim()) {
        throw new Error('Please provide a reason for deactivation');
      }
      
      // Call the confirm handler with the reason
      await onConfirm(reason);
      
      // Close the modal
      onClose();
    } catch (err) {
      console.error('Error deactivating driver:', err);
      // Show error to user
      setError(err.message || 'Failed to deactivate driver. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deactivate Driver">
      <div className="deactivate-driver-container">
        {error && (
          <Alert type="error" message={error} onClose={clearError} />
        )}
        
        <form onSubmit={handleSubmit} className="deactivate-form">
          <div className="deactivate-warning">
            <div className="warning-icon">!</div>
            <p>
              You are about to deactivate <strong>{driverName}</strong>. 
              This action will move the driver to the inactive list.
            </p>
          </div>
          
          <div className="form-group">
            <label htmlFor="deactivation-reason">Reason for Deactivation</label>
            <textarea
              id="deactivation-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for deactivation..."
              rows={4}
              required
            />
          </div>
          
          <div className="deactivate-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-deactivate"
              disabled={loading}
            >
              {loading ? 'Deactivating...' : 'Deactivate Driver'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default DeactivateDriverModal; 