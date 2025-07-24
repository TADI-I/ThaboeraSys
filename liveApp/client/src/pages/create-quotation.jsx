import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './create-quotation.css';
import logo from '../components/ThaboEra-Logo.png';
import Sidebar from '../components/Sidebar';

const QuotationPreview = ({ quotation }) => {
  return (
    <div className="border p-4 bg-gray-100 rounded mt-4">
      <h2 className="text-xl font-bold">Quotation Preview</h2>
      <p><strong>Quotation #:</strong> {quotation.quotationNumber}</p>
      <p><strong>Date Issued:</strong> {quotation.quotationDate}</p>
      <p><strong>Expiry Date:</strong> {quotation.expiryDate}</p>
      <p><strong>Status:</strong> {quotation.status}</p>
      <p><strong>Total:</strong> R{parseFloat(quotation.totalAmount).toFixed(2)}</p>
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

const CreateQuotation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quotationId = searchParams.get('id');
  const isEditMode = Boolean(quotationId);

  const [quotation, setQuotation] = useState({
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
    quotationDate: '',
    expiryDate: '',
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
    if (isEditMode) loadQuotationData(quotationId);
    else generateQuotationNumber();
  }, []);

  useEffect(() => {
    updateTotals();
  }, [quotation.items]);

  const initializeDates = () => {
    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + 30);
    setQuotation(prev => ({
      ...prev,
      quotationDate: today.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0]
    }));
  };

  const generateQuotationNumber = () => {
    const prefix = 'QTE-';
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setQuotation(prev => ({ ...prev, quotationNumber: `${prefix}${randomNum}` }));
  };

  const loadQuotationData = async id => {
    try {
      const res = await apiCall(`/api/quotations/${id}`);
      if (res.success) {
        const qte = res.data;
        setQuotation({
          ...qte,
          quotationDate: qte.quotationDate.split('T')[0],
          expiryDate: qte.expiryDate ? qte.expiryDate.split('T')[0] : '',
          items: qte.items || []
        });
      }
    } catch (err) {
      console.error('Failed to load quotation:', err);
      alert('Failed to load quotation data');
    }
  };

  const updateTotals = () => {
    let subtotal = 0;
    let vat = 0;
    
    quotation.items.forEach(item => {
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
    const newItems = [...quotation.items];
    newItems[index][field] = field === 'quantity' || field === 'price' || field === 'discount' ? 
      parseFloat(value) || 0 : value;
    setQuotation({ ...quotation, items: newItems });
  };

  const handleAddItem = () => {
    setQuotation({
      ...quotation,
      items: [...quotation.items, { 
        description: '', 
        quantity: 1, 
        price: 0, 
        discount: 0,
        taxable: 'yes'
      }]
    });
  };

  const handleRemoveItem = index => {
    const newItems = [...quotation.items];
    newItems.splice(index, 1);
    setQuotation({ ...quotation, items: newItems });
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setQuotation({ ...quotation, [name]: value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    handleSave();
  };

  const handleSave = async (preview = false, send = false, download = false) => {
    if (!quotation.clientName || quotation.items.length === 0) {
      alert('Please complete the form and add at least one item.');
      return;
    }

    const payload = {
      ...quotation,
      totalAmount: totals.total,
      dateIssued: quotation.quotationDate,
      items: quotation.items.map(item => ({
        ...item,
        taxable: item.taxable === 'yes'
      }))
    };

    try {
      const url = isEditMode ? `/api/quotations/${quotationId}` : '/api/quotations';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const res = await apiCall(url, payload, method);
      
      if (res.success) {
        const savedId = res.quotation.id;
        
        if (preview) {
          window.open(`/quotation-preview.html?id=${savedId}`, '_blank');
        } else if (send) {
          await apiCall(`/api/quotations/${savedId}/send`, {}, 'POST');
          alert('Quotation sent to client successfully!');
        } else if (download) {
          window.open(`/api/quotations/${savedId}/download`, '_blank');
        } else {
          navigate(`/create-quotation?id=${savedId}`);
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
          <h1>{isEditMode ? 'Edit Quotation' : 'Create New Quotation'}</h1>
          <button className="btn-secondary" onClick={() => navigate('/quotations')}>
            Back to Quotations
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
              <p>Email: info@thaboera.co.za | Tel: +27(0) 11 051 3906 | WhatsApp: +27 61 541 4097</p>
              <p><strong>VAT No.: 482027225 | Reg: 2006/184754/23</strong></p>
              <p><strong>Quotation No: {quotation.quotationNumber || 'Pending'}</strong></p>
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
                  value={quotation.clientName}
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
                  value={quotation.contactPerson}
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
                  value={quotation.contactNumber}
                  onChange={handleChange}
                  placeholder="Contact Number"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={quotation.email}
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
                  value={quotation.address}
                  onChange={handleChange}
                  placeholder="Address"
                />
              </div>
              <div className="form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  name="regNumber"
                  value={quotation.regNumber}
                  onChange={handleChange}
                  placeholder="Registration Number"
                />
              </div>
            </div>
          </section>

          {/* Quotation Details */}
          <section className="quotation-details-section">
            <h2>Quotation Details</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Sales Rep</label>
                <input
                  type="text"
                  name="salesRep"
                  value={quotation.salesRep}
                  onChange={handleChange}
                  placeholder="Sales Rep"
                />
              </div>
              <div className="form-group">
                <label>FOB</label>
                <input
                  type="text"
                  name="fob"
                  value={quotation.fob}
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
                  value={quotation.shipVia}
                  onChange={handleChange}
                  placeholder="Ship Via"
                />
              </div>
              <div className="form-group">
                <label>Terms</label>
                <input
                  type="text"
                  name="terms"
                  value={quotation.terms}
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
                  value={quotation.taxId}
                  onChange={handleChange}
                  placeholder="Tax ID"
                />
              </div>
              <div className="form-group">
                <label>Quotation Date</label>
                <input
                  type="date"
                  name="quotationDate"
                  value={quotation.quotationDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={quotation.expiryDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </section>

          {/* Quotation Items */}
          <div className="quotation-items framed-section">
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
                  {quotation.items.map((item, i) => (
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
              value={quotation.notes}
              onChange={handleChange}
              placeholder="Additional notes for the quotation"
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Save Quotation
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

export default CreateQuotation;