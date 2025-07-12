import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './create-invoice.css'; // Assuming you have a CSS file for styling

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




// API call utility function
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
    number: '',
    date: '',
    dueDate: '',
    items: [],
    discount: 0,
    notes: '',
    terms: ''
  });
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, grand: 0 });

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return navigate('/login');

    initializeDates();

    if (isEditMode) loadInvoiceData(invoiceId);
    else generateInvoiceNumber();
  }, []);

  useEffect(() => {
    updateTotals();
  }, [invoice.items, invoice.discount]);

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
    setInvoice(prev => ({ ...prev, number: `${prefix}${randomNum}` }));
  };

  const loadInvoiceData = async id => {
    try {
      const res = await apiCall(`/api/invoices/${id}`);
      if (res.success) {
        const inv = res.data;
        setInvoice({
          clientName: inv.clientName,
          number: inv.number,
          date: inv.date.split('T')[0],
          dueDate: inv.dueDate.split('T')[0],
          items: inv.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            taxRate: item.taxRate
          })),
          discount: inv.discount,
          notes: inv.notes,
          terms: inv.terms
        });
      }
    } catch (err) {
      console.error('Failed to load invoice:', err);
      alert('Failed to load invoice data');
    }
  };

  const updateTotals = () => {
    let subtotal = 0;
    let tax = 0;
    invoice.items.forEach(item => {
      const itemTotal = item.quantity * item.price;
      const itemTax = itemTotal * (item.taxRate / 100);
      subtotal += itemTotal;
      tax += itemTax;
    });
    const grand = subtotal + tax - invoice.discount;
    setTotals({ subtotal, tax, grand });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoice.items];
    newItems[index][field] = field === 'quantity' || field === 'price' || field === 'taxRate' ? parseFloat(value) || 0 : value;
    setInvoice({ ...invoice, items: newItems });
  };

  const handleAddItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: '', quantity: 1, price: 0, taxRate: 0 }]
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
  if (!invoice.clientId || invoice.items.length === 0) {
    alert('Please complete the form.');
    return;
  }

  const generatedInvoiceNumber = invoice.invoiceNumber || generateInvoiceNumber();
  const issueDate = invoice.dateIssued || new Date().toISOString();
  const total = calculateTotal(invoice.items);

  const payload = {
    invoiceNumber: generatedInvoiceNumber,
    dateIssued: issueDate,
    totalAmount: total,
    status: invoice.status || 'Pending'
  };

  try {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (json.success) {
      const savedId = json.invoice.id;

      if (preview) {
        window.open(`/invoice-preview.html?id=${savedId}`, '_blank');
      } else if (send) {
        await fetch(`/api/invoices/${savedId}/send`, { method: 'POST' });
      } else if (download) {
        window.open(`/api/invoices/${savedId}/download`, '_blank');
      } else {
        navigate(`/create-invoice?id=${savedId}`);
      }
    } else {
      alert('Error saving invoice: ' + json.message);
    }
  } catch (err) {
    console.error('API error:', err);
    alert('Server error. Check console.');
  }
};





  return (
    <div className="document-creation-container">
      <div className="header-actions">
        <h1>{isEditMode ? 'Edit Invoice' : 'Create New Invoice'}</h1>
        <button className="btn-secondary" onClick={() => navigate('/invoices')}>Back to Invoices</button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Client Name</label>
            <input 
              type="text" 
              name="clientName" 
              value={invoice.clientName} 
              onChange={handleChange} 
              required 
              placeholder="Enter client name"
            />
          </div>
          <div className="form-group">
            <label>Invoice #</label>
            <input type="text" value={invoice.number} readOnly />
          </div>
          <div className="form-group">
            <label>Invoice Date</label>
            <input type="date" name="date" value={invoice.date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" name="dueDate" value={invoice.dueDate} onChange={handleChange} required />
          </div>
        </div>

        <div className="invoice-items">
          <h3>Items</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Tax</th>
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
                      <select 
                        value={item.taxRate} 
                        onChange={e => handleItemChange(i, 'taxRate', e.target.value)}
                      >
                        <option value="0">0%</option>
                        <option value="15">15%</option>
                      </select>
                    </td>
                    <td>{(item.quantity * item.price).toFixed(2)}</td>
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
          <button type="button" className="btn-secondary" onClick={handleAddItem}>Add Item</button>
        </div>

        <div className="invoice-totals">
          <div className="totals-row">
            <span>Subtotal:</span>
            <span>{totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="totals-row">
            <label htmlFor="discount">Discount</label>
            <input 
              type="number" 
              name="discount" 
              value={invoice.discount} 
              onChange={handleChange} 
            />
            <span>{invoice.discount.toFixed(2)}</span>
          </div>
          <div className="totals-row">
            <span>Tax:</span>
            <span>{totals.tax.toFixed(2)}</span>
          </div>
          <div className="totals-row grand-total">
            <span>Total:</span>
            <span>{totals.grand.toFixed(2)}</span>
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea 
            name="notes" 
            value={invoice.notes} 
            onChange={handleChange}
            placeholder="Additional notes for the invoice"
          ></textarea>
        </div>

        <div className="form-group">
          <label>Terms & Conditions</label>
          <textarea 
            name="terms" 
            value={invoice.terms} 
            onChange={handleChange}
            placeholder="Payment terms and conditions"
          ></textarea>
        </div>

        <div className="form-actions">
          <button onClick={() => handleSave()} className="btn-primary">Save Invoice</button>
          <button type="button" className="btn-secondary" onClick={() => handleSave(true)}>Preview</button>
          <button type="button" className="btn-secondary" onClick={() => handleSave(false, true)}>Send to Client</button>
          <button type="button" className="btn-secondary" onClick={() => handleSave(false, false, true)}>Download PDF</button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;