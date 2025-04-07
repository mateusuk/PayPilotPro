import React, { useState } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaFilter } from 'react-icons/fa';
import './workHistory.css';

const WorkHistory = () => {
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    driverName: '',
    status: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - replace with actual API call
  const workHistoryData = [
    {
      id: 1,
      driverName: 'John Doe',
      date: '2024-04-01',
      startTime: '08:00',
      endTime: '16:00',
      hoursWorked: 8,
      deliveries: 12,
      status: 'completed',
      earnings: 240.50
    },
    // Add more mock data here
  ];

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="work-history-container">
      <div className="work-history-header">
        <h1>Work History</h1>
        <button
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Driver Name</label>
            <input
              type="text"
              name="driverName"
              value={filters.driverName}
              onChange={handleFilterChange}
              placeholder="Search by driver name"
            />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button className="apply-filters">Apply Filters</button>
        </div>
      )}

      <div className="work-history-stats">
        <div className="stat-card">
          <h3>Total Hours</h3>
          <p>160</p>
          <span>This Month</span>
        </div>
        <div className="stat-card">
          <h3>Total Deliveries</h3>
          <p>245</p>
          <span>This Month</span>
        </div>
        <div className="stat-card">
          <h3>Average Hours</h3>
          <p>7.5</p>
          <span>Per Day</span>
        </div>
        <div className="stat-card">
          <h3>Total Earnings</h3>
          <p>$3,450</p>
          <span>This Month</span>
        </div>
      </div>

      <div className="work-history-table-container">
        <table className="work-history-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('date')}>
                Date {getSortIcon('date')}
              </th>
              <th onClick={() => handleSort('driverName')}>
                Driver {getSortIcon('driverName')}
              </th>
              <th>Start Time</th>
              <th>End Time</th>
              <th onClick={() => handleSort('hoursWorked')}>
                Hours {getSortIcon('hoursWorked')}
              </th>
              <th onClick={() => handleSort('deliveries')}>
                Deliveries {getSortIcon('deliveries')}
              </th>
              <th onClick={() => handleSort('earnings')}>
                Earnings {getSortIcon('earnings')}
              </th>
              <th onClick={() => handleSort('status')}>
                Status {getSortIcon('status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {workHistoryData.map(entry => (
              <tr key={entry.id}>
                <td>{entry.date}</td>
                <td>{entry.driverName}</td>
                <td>{entry.startTime}</td>
                <td>{entry.endTime}</td>
                <td>{entry.hoursWorked}</td>
                <td>{entry.deliveries}</td>
                <td>${entry.earnings.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${entry.status}`}>
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button disabled>&lt; Previous</button>
        <span>Page 1 of 1</span>
        <button disabled>Next &gt;</button>
      </div>
    </div>
  );
};

export default WorkHistory; 