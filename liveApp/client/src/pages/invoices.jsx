import React, { useEffect, useState } from 'react';
import { FaFileInvoice, FaPlus, FaFilter, FaEye, FaFilePdf, FaCheckCircle } from 'react-icons/fa';

import './invoices.css'; // Assuming you have a CSS file for styling

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10),
    dateTo: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      // Build query string based on filters
      const query = new URLSearchParams();
      if (filters.status) query.append('status', filters.status);
      if (filters.dateFrom) query.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) query.append('dateTo', filters.dateTo);

      const response = await fetch(`/api/invoices?${query.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([]);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  return (
    <div className="documents-container">
      <h1><FaFileInvoice /> Invoices</h1>
      <div className="document-actions">
        
        <button className="btn-primary" onClick={() => window.location.href = '/invoices/create'}>
          <FaPlus /> Create Invoice
        </button>
        <div className="document-filters">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>
          <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />
          <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />
          <button className="btn-secondary" onClick={loadInvoices}><FaFilter /> Apply</button>
        </div>
      </div>

      <table id="invoicesTable">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Client</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty-state">
                <FaFileInvoice />
                <p>No invoices found matching your criteria</p>
              </td>
            </tr>
          ) : (
            invoices.map(inv => (
              <tr key={inv.id}>
                <td>{inv.invoiceNumber}</td>
                <td>{inv.client?.name || 'N/A'}</td>
                <td>{formatDate(inv.dateIssued)}</td>
                <td>${parseFloat(inv.totalAmount).toFixed(2)}</td>
                <td><span className={`status-${inv.status}`}>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</span></td>
                <td>{formatDate(inv.dueDate)}</td>
                <td className="actions">
                  <button className="btn-view"><FaEye /> View</button>
                  <button className="btn-pdf"><FaFilePdf /> PDF</button>
                  {(inv.status === 'unpaid' || inv.status === 'overdue') && (
                    <button className="btn-mark-paid"><FaCheckCircle /> Paid</button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
