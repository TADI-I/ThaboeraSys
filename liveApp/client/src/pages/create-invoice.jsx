import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './create-invoice.css';
import logo from '../components/ThaboEra-Logo.png';
import Sidebar from '../components/Sidebar';

const InvoicePreview = ({ invoice }) => {
  return (
    <div className="border p-4 bg-gray-100 rounded mt-4">
      <h2 className="text-xl font-bold">Invoice Preview</h2>
      <p><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
      <p><strong>Date Issued:</strong> {invoice.dateIssued}</p>
      <p><strong>Status:</strong> {invoice.status}</p>
      <p><strong>Total:</strong> R{parseFloat(invoice.totalAmount).toFixed(2)}</p>
    </div>
  );
};

async function apiCall(url, data = null, method = 'GET') {
  const options = {
    method,
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return response;
    }
  } catch (err) {
    console.error('API call failed:', err);
    throw err;
  }
}

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('id');
  const isEditMode = Boolean(invoiceId);

  const [invoice, setInvoice] = useState({
    clientName: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    address: '',
    regNumber: '',
    salesRep: '',
    fob: '',
    shipVia: '',
    terms: '30 Days',
    taxId: '',
    date: '',
    dueDate: '',
    items: [],
    notes: '',
    status: 'Pending'
  });

  const [totals, setTotals] = useState({ 
    subtotal: 0, 
    vat: 0, 
    total: 0 
  });

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return navigate('/login');

    initializeDates();
    if (isEditMode) loadInvoiceData(invoiceId);
    else generateInvoiceNumber();
  }, []);

  useEffect(() => {
    updateTotals();
  }, [invoice.items]);

  const initializeDates = () => {
    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + 30);
    setInvoice(prev => ({
      ...prev,
      date: today.toISOString().split('T')[0],
      dueDate: due.toISOString().split('T')[0]
    }));
  };

  const generateInvoiceNumber = () => {
    const prefix = 'INV-';
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setInvoice(prev => ({ ...prev, invoiceNumber: `${prefix}${randomNum}` }));
  };

  const loadInvoiceData = async id => {
    try {
      const res = await apiCall(`/api/invoices/${id}`);
      if (res.success) {
        const inv = res.data;
        setInvoice({
          ...inv,
          date: inv.date.split('T')[0],
          dueDate: inv.dueDate ? inv.dueDate.split('T')[0] : '',
          items: inv.items || []
        });
      }
    } catch (err) {
      console.error('Failed to load invoice:', err);
      alert('Failed to load invoice data');
    }
  };

  const updateTotals = () => {
    let subtotal = 0;
    let vat = 0;
    
    invoice.items.forEach(item => {
      const itemTotal = item.quantity * item.price;
      const discountAmount = itemTotal * (item.discount / 100);
      const discountedTotal = itemTotal - discountAmount;
      
      subtotal += discountedTotal;
      
      if (item.taxable === 'yes') {
        vat += discountedTotal * 0.15;
      }
    });
    
    setTotals({ 
      subtotal: parseFloat(subtotal.toFixed(2)),
      vat: parseFloat(vat.toFixed(2)),
      total: parseFloat((subtotal + vat).toFixed(2))
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoice.items];
    newItems[index][field] = field === 'quantity' || field === 'price' || field === 'discount' ? 
      parseFloat(value) || 0 : value;
    setInvoice({ ...invoice, items: newItems });
  };

  const handleAddItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { 
        description: '', 
        quantity: 1, 
        price: 0, 
        discount: 0,
        taxable: 'yes'
      }]
    });
  };

  const handleRemoveItem = index => {
    const newItems = [...invoice.items];
    newItems.splice(index, 1);
    setInvoice({ ...invoice, items: newItems });
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setInvoice({ ...invoice, [name]: value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    handleSave();
  };

  const handleSave = async (preview = false, send = false, download = false) => {
    if (!invoice.clientName || invoice.items.length === 0) {
      alert('Please complete the form and add at least one item.');
      return;
    }

    const payload = {
      ...invoice,
      totalAmount: totals.total,
      dateIssued: invoice.date,
      items: invoice.items.map(item => ({
        ...item,
        taxable: item.taxable === 'yes'
      }))
    };

    try {
      const url = isEditMode ? `/api/invoices/${invoiceId}` : '/api/invoices';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const res = await apiCall(url, payload, method);
      
      if (res.success) {
        const savedId = res.invoice.id;
        
        if (preview) {
          window.open(`/invoice-preview.html?id=${savedId}`, '_blank');
        } else if (send) {
          await apiCall(`/api/invoices/${savedId}/send`, {}, 'POST');
          alert('Invoice sent to client successfully!');
        } else if (download) {
          window.open(`/api/invoices/${savedId}/download`, '_blank');
        } else {
          navigate(`/create-invoice?id=${savedId}`);
        }
      }
    } catch (err) {
      console.error('API error:', err);
      alert('Server error. Check console.');
    }
  };

  return (
    <div className="main-view">
      <Sidebar />
      <div className="document-creation-container invoice-app">
        <div className="header-actions">
          <h1>{isEditMode ? 'Edit Invoice' : 'Create New Invoice'}</h1>
          <button className="btn-secondary" onClick={() => navigate('/invoices')}>
            Back to Invoices
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Company Info Box */}
          <div className="framed-section company-info">
            <div className="company-logo">
              <img src={logo} alt="Company Logo" style={{ maxWidth: '100px', maxHeight: '60px', objectFit: 'contain' }} />
            </div>
            <div className="company-info-text">
              <h2>Thabo<span style={{ color: 'red' }}>era</span> IT Solutions</h2>
              <p><strong className="slogan">Bridge Your IT Gap</strong></p>
              <p>55 Richard's Drive, Halfway House, Midrand | www.thaboera.co.za</p>
              <p>Email: info@thaboera.co.za | Tel: +27(0) 11 051 3906 | wh: +27 61 541 4097</p>
              <p><strong>VAT No.: 482027225 | Reg: 2006/184754/23</strong></p>
              <p><strong>Invoice No: {invoice.invoiceNumber || 'Pending'}</strong></p>
            </div>
          </div>

          {/* Client Information */}
          <section className="client-section">
            <h2>Client Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Client Name</label>
                <input
                  type="text"
                  name="clientName"
                  value={invoice.clientName}
                  onChange={handleChange}
                  required
                  placeholder="Client Name"
                />
              </div>
              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={invoice.contactPerson}
                  onChange={handleChange}
                  placeholder="Contact Person"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={invoice.contactNumber}
                  onChange={handleChange}
                  placeholder="Contact Number"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={invoice.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={invoice.address}
                  onChange={handleChange}
                  placeholder="Address"
                />
              </div>
              <div className="form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  name="regNumber"
                  value={invoice.regNumber}
                  onChange={handleChange}
                  placeholder="Registration Number"
                />
              </div>
            </div>
          </section>

          {/* Invoice Details */}
          <section className="invoice-details-section">
            <h2>Invoice Details</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Sales Rep</label>
                <input
                  type="text"
                  name="salesRep"
                  value={invoice.salesRep}
                  onChange={handleChange}
                  placeholder="Sales Rep"
                />
              </div>
              <div className="form-group">
                <label>FOB</label>
                <input
                  type="text"
                  name="fob"
                  value={invoice.fob}
                  onChange={handleChange}
                  placeholder="FOB"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ship Via</label>
                <input
                  type="text"
                  name="shipVia"
                  value={invoice.shipVia}
                  onChange={handleChange}
                  placeholder="Ship Via"
                />
              </div>
              <div className="form-group">
                <label>Terms</label>
                <input
                  type="text"
                  name="terms"
                  value={invoice.terms}
                  onChange={handleChange}
                  placeholder="Terms"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tax ID</label>
                <input
                  type="text"
                  name="taxId"
                  value={invoice.taxId}
                  onChange={handleChange}
                  placeholder="Tax ID"
                />
              </div>
              <div className="form-group">
                <label>Invoice Date</label>
                <input
                  type="date"
                  name="date"
                  value={invoice.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </section>

          {/* Invoice Items */}
          <div className="invoice-items framed-section">
            <h3>Items</h3>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Discount (%)</th>
                    <th>Taxable</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <input
                          value={item.description}
                          onChange={e => handleItemChange(i, 'description', e.target.value)}
                          placeholder="Item description"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemChange(i, 'quantity', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={e => handleItemChange(i, 'price', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={e => handleItemChange(i, 'discount', e.target.value)}
                        />
                      </td>
                      <td>
                        <select
                          value={item.taxable}
                          onChange={e => handleItemChange(i, 'taxable', e.target.value)}
                        >
                          <option value="yes">Taxable</option>
                          <option value="no">Non-taxable</option>
                        </select>
                      </td>
                      <td>
                        {(item.quantity * item.price * (1 - item.discount / 100)).toFixed(2)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => handleRemoveItem(i)}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="btn-secondary" onClick={handleAddItem}>
              Add Item
            </button>
          </div>

          {/* Totals Section */}
          <div className="totals">
            <div className="totals-row">
              <span>Subtotal:</span>
              <span>R {totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="totals-row">
              <span>VAT (15%):</span>
              <span>R {totals.vat.toFixed(2)}</span>
            </div>
            <div className="totals-row grand-total">
              <span>Total:</span>
              <span>R {totals.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={invoice.notes}
              onChange={handleChange}
              placeholder="Additional notes for the invoice"
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Save Invoice
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleSave(true)}
            >
              Preview
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleSave(false, true)}
            >
              Send to Client
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleSave(false, false, true)}
            >
              Download PDF
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;