import React, { useState } from 'react';
import { FaEye, FaDownload, FaPrint } from 'react-icons/fa';
import './payments.css';

const Payments = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');

  // Mock data - replace with actual API call
  const paymentHistory = [
    {
      id: 1,
      date: '2024-04-01',
      amount: 1250.75,
      status: 'completed',
      type: 'direct-deposit',
      reference: 'PAY-2024040101',
      description: 'March 2024 Payment'
    },
    // Add more mock data here
  ];

  const invoices = [
    {
      id: 1,
      date: '2024-04-01',
      amount: 1250.75,
      status: 'paid',
      invoiceNumber: 'INV-2024040101',
      dueDate: '2024-04-15'
    },
    // Add more mock data here
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="payments-container">
      <div className="payments-header">
        <div>
          <h1>Payments</h1>
          <p>Manage your payments and invoices</p>
        </div>
        <button className="new-payment-button">
          Process New Payment
        </button>
      </div>

      <div className="payment-summary">
        <div className="summary-card">
          <h3>Total Earnings</h3>
          <p className="amount">$15,750.50</p>
          <span>This Month</span>
        </div>
        <div className="summary-card">
          <h3>Pending Payments</h3>
          <p className="amount">$2,450.00</p>
          <span>3 payments pending</span>
        </div>
        <div className="summary-card">
          <h3>Last Payment</h3>
          <p className="amount">$1,250.75</p>
          <span>April 1, 2024</span>
        </div>
        <div className="summary-card">
          <h3>Next Payment</h3>
          <p className="amount">$1,350.00</p>
          <span>Expected April 15, 2024</span>
        </div>
      </div>

      <div className="payments-tabs">
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Payment History
        </button>
        <button
          className={`tab-button ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          Invoices
        </button>
      </div>

      <div className="payments-filter">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="this-month">This Month</option>
          <option value="last-month">Last Month</option>
          <option value="last-3-months">Last 3 Months</option>
          <option value="last-6-months">Last 6 Months</option>
          <option value="this-year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {activeTab === 'history' ? (
        <div className="payments-table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.date}</td>
                  <td>{payment.reference}</td>
                  <td>{payment.description}</td>
                  <td>
                    <span className="payment-type">{payment.type}</span>
                  </td>
                  <td className="amount">${payment.amount.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button title="View Details">
                        <FaEye />
                      </button>
                      <button title="Download Receipt">
                        <FaDownload />
                      </button>
                      <button title="Print Receipt">
                        <FaPrint />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="invoices-table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.date}</td>
                  <td>{invoice.dueDate}</td>
                  <td className="amount">${invoice.amount.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button title="View Invoice">
                        <FaEye />
                      </button>
                      <button title="Download Invoice">
                        <FaDownload />
                      </button>
                      <button title="Print Invoice">
                        <FaPrint />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <button disabled>&lt; Previous</button>
        <span>Page 1 of 1</span>
        <button disabled>Next &gt;</button>
      </div>
    </div>
  );
};

export default Payments; 