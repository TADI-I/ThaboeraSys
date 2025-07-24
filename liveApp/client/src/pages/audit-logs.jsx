import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

function formatDateTime(date) {
  return new Date(date).toLocaleString();
}

export default function AuditLogs() {
  // State for filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userId, setUserId] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Fetch users and initial logs
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);

        // Fetch users
        const usersResponse = await axios.get('/api/v1/users');
        setUsers(usersResponse.data.data);

        // Fetch initial logs
        await fetchLogs({
          startDate: sevenDaysAgo.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
          page: 1,
          limit
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch logs from API
  const fetchLogs = async (params) => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/v1/audit-logs', {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          userId: params.userId,
          action: params.action,
          page: params.page,
          limit: params.limit
        }
      });

      setLogs(response.data.data);
      setTotalLogs(response.data.total);
      setTotalPages(Math.ceil(response.data.total / params.limit));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter apply button
  const applyFilters = () => {
    fetchLogs({
      startDate,
      endDate,
      userId,
      action: actionFilter,
      page: 1,
      limit
    });
    setPage(1);
  };

  // Handle pagination
  const prevPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      fetchLogs({
        startDate,
        endDate,
        userId,
        action: actionFilter,
        page: newPage,
        limit
      });
    }
  };

  const nextPage = () => {
    if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      fetchLogs({
        startDate,
        endDate,
        userId,
        action: actionFilter,
        page: newPage,
        limit
      });
    }
  };

  // Handle export logs
  const exportLogs = async () => {
    try {
      const response = await axios.get('/api/v1/audit-logs/export', {
        params: {
          startDate,
          endDate,
          userId,
          action: actionFilter
        },
        responseType: 'blob' // Important for file downloads
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export logs');
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="main-view">
        <Sidebar />
        <div className="audit-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-view">
        <Sidebar />
        <div className="audit-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-view">
      <Sidebar />
      <div className="audit-container">
        <h1>
          <i className="fas fa-clipboard-list" /> Audit Logs
        </h1>

        <div className="audit-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>
                <i className="fas fa-calendar-alt" /> Date Range
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span>to</span>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>
                <i className="fas fa-user" /> User
              </label>
              <select
                id="userFilter"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <i className="fas fa-bolt" /> Action Type
              </label>
              <select
                id="actionFilter"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="">All Actions</option>
                <option value="Login">Login</option>
                <option value="Create">Create</option>
                <option value="Update">Update</option>
                <option value="Delete">Delete</option>
                <option value="System">System</option>
              </select>
            </div>

            <button 
              onClick={applyFilters} 
              className="btn-primary" 
              id="applyFilters" 
              type="button"
              disabled={isLoading}
            >
              <i className="fas fa-filter" /> {isLoading ? 'Loading...' : 'Apply'}
            </button>
            <button 
              onClick={exportLogs} 
              className="btn-secondary" 
              id="exportLogs" 
              type="button"
              disabled={isLoading}
            >
              <i className="fas fa-download" /> Export
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table id="auditLogsTable">
            <thead>
              <tr>
                <th>
                  <i className="fas fa-clock" /> Timestamp
                </th>
                <th>
                  <i className="fas fa-user" /> User
                </th>
                <th>
                  <i className="fas fa-bolt" /> Action
                </th>
                <th>
                  <i className="fas fa-database" /> Entity
                </th>
                <th>
                  <i className="fas fa-info-circle" /> Details
                </th>
                <th>
                  <i className="fas fa-network-wired" /> IP Address
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={idx}>
                    <td>{formatDateTime(log.timestamp)}</td>
                    <td>{log.user?.name || 'System'}</td>
                    <td>
                      <span className={`action-badge ${log.action.toLowerCase()}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.entity}</td>
                    <td>{log.details}</td>
                    <td>{log.ip}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalLogs > 0 && (
          <div className="pagination">
            <button
              id="prevPage"
              className="btn-secondary"
              disabled={page === 1 || isLoading}
              onClick={prevPage}
              type="button"
            >
              <i className="fas fa-chevron-left" /> Previous
            </button>
            <span id="pageInfo">
              Page {page} of {totalPages} ({totalLogs} total logs)
            </span>
            <button
              id="nextPage"
              className="btn-secondary"
              disabled={page === totalPages || isLoading}
              onClick={nextPage}
              type="button"
            >
              Next <i className="fas fa-chevron-right" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}