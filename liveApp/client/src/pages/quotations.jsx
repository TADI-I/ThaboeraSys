import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, subDays } from 'date-fns';
import Sidebar from '../components/Sidebar';
import './quotations.css';

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'accepted', 'rejected'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/quotations');
        const now = new Date();
        const fourteenDaysAgo = subDays(now, 14);
        
        // Filter out quotations older than 14 days
        const recentQuotations = response.data.filter(q => {
          const quoteDate = new Date(q.dateIssued);
          return quoteDate >= fourteenDaysAgo;
        });

        // Optionally delete old quotations
        const oldQuotations = response.data.filter(q => {
          const quoteDate = new Date(q.dateIssued);
          return quoteDate < fourteenDaysAgo;
        });

        if (oldQuotations.length > 0) {
          await Promise.all(oldQuotations.map(q => 
            axios.delete(`/api/quotations/${q.id}`)
          ));
        }

        setQuotations(recentQuotations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
    
    // Check for expired quotations every hour
    const interval = setInterval(fetchQuotations, 3600000);
    return () => clearInterval(interval);
  }, []);

  const updateQuotationStatus = async (id, status) => {
    try {
      await axios.put(`/api/quotations/${id}/status`, { status });
      setQuotations(quotations.map(q => 
        q.id === id ? { ...q, status } : q
      ));
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
    }
  };

  const filteredQuotations = quotations.filter(q => {
    // Apply status filter
    if (filter !== 'all' && q.status !== filter) return false;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        q.quotationNumber.toLowerCase().includes(term) ||
        (q.Client?.name.toLowerCase().includes(term)) ||
        (q.Client?.contactPerson.toLowerCase().includes(term))
      );
    }
    
    return true;
  });

  if (loading) return <div className="loading">Loading quotations...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="main-view">
      <Sidebar />
      <div className="documents-container">
      <h1>Quotation Management</h1>
      
      <div className="controls">
        <div className="filters">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={filter === 'accepted' ? 'active' : ''}
            onClick={() => setFilter('accepted')}
          >
            Accepted
          </button>
          <button 
            className={filter === 'rejected' ? 'active' : ''}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>
        
        <div className="search">
          <input
            type="text"
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="quotations-list">
        {filteredQuotations.length === 0 ? (
          <div className="no-results">No quotations found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Quotation #</th>
                <th>Client</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Expires In</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.map(quotation => {
                const quoteDate = new Date(quotation.dateIssued);
                const expiryDate = new Date(quoteDate);
                expiryDate.setDate(expiryDate.getDate() + 14);
                const daysRemaining = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
                
                return (
                  <tr key={quotation.id} className={`status-${quotation.status}`}>
                    <td>{quotation.quotationNumber}</td>
                    <td>
                      {quotation.Client?.name || 'N/A'}<br />
                      <small>{quotation.Client?.contactPerson || ''}</small>
                    </td>
                    <td>{format(quoteDate, 'PP')}</td>
                    <td>R {parseFloat(quotation.total).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${quotation.status}`}>
                        {quotation.status}
                      </span>
                    </td>
                    <td className="actions">
                      {quotation.status === 'pending' && (
                        <>
                          <button 
                            className="accept"
                            onClick={() => updateQuotationStatus(quotation.id, 'accepted')}
                          >
                            Accept
                          </button>
                          <button 
                            className="reject"
                            onClick={() => updateQuotationStatus(quotation.id, 'rejected')}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button 
                        className="view"
                        onClick={() => window.open('TIS-Qoute.html?id=${result.quotationId || quotationId}')}
                      >
                        View
                      </button>
                    </td>
                    <td className={daysRemaining <= 3 ? 'expiring' : ''}>
                      {daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      </div>

      <style jsx>{`
        
        
        .controls {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .filters {
          display: flex;
          gap: 10px;
        }
        
        .filters button {
          padding: 8px 15px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          border-radius: 4px;
        }
        
        .filters button.active {
          background: #e74c3c;
          color: white;
          border-color: #e74c3c;
        }
        
        .search input {
          padding: 8px 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          min-width: 250px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        th {
          background-color: #2c3e50;
          color: white;
        }
        
        tr:hover {
          background-color: #f5f5f5;
        }
        
        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          text-transform: capitalize;
        }
        
        .status-badge.pending {
          background-color: #f39c12;
          color: white;
        }
        
        .status-badge.accepted {
          background-color: #2ecc71;
          color: white;
        }
        
        .status-badge.rejected {
          background-color: #e74c3c;
          color: white;
        }
        
        .actions {
          display: flex;
          gap: 8px;
        }
        
        .actions button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9em;
        }
        
        .actions button.view {
          background-color: #3498db;
          color: white;
        }
        
        .actions button.accept {
          background-color: #2ecc71;
          color: white;
        }
        
        .actions button.reject {
          background-color: #e74c3c;
          color: white;
        }
        
        .expiring {
          color: #e74c3c;
          font-weight: bold;
        }
        
        .no-results {
          padding: 20px;
          text-align: center;
          color: #7f8c8d;
        }
        
        .loading, .error {
          padding: 20px;
          text-align: center;
        }
        
        .error {
          color: #e74c3c;
        }
      `}</style>
    </div>
  );
};

export default Quotations;