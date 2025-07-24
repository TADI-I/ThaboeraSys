import React, { useEffect, useState } from 'react';
import './TenderManagement.css'; // Reuse existing styles
import Sidebar from '../components/Sidebar';

const TenderManagement = () => {
  const [tenders, setTenders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // For filtering tenders
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    id: '',
    title: '',
    description: '',
    deadline: '',
    status: 'open', // Default status for new tenders
    files: []
  });

  // Status options for display and filtering
  function formatStatus(status) {
    switch (status) {
      case 'open':
        return 'Open';
      case 'closed':
        return 'Closed';
      case 'awarded':
        return 'Awarded';
      default:
        return 'Unknown';
    }
  }

  function formatDeadline(deadline) {
    return new Date(deadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
      

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = 'login.html';
    } else {
      loadTenders();
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadTenders();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, status]);

 // Update the simulateAPICall function to handle FormData
async function simulateAPICall(url, data = null, method = "GET", isFormData = false) {
  try {
    const token = localStorage.getItem('authToken');
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}` // Add auth header
      }
    };

    // Handle FormData vs JSON
    if (data) {
      if (isFormData) {
        options.body = data;
        // Don't set Content-Type for FormData - browser will set it automatically
      } else {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
      }
    }

    console.log('Making API call:', { url, options }); // Debug log

    const res = await fetch(url, options);
    
    if (!res.ok) {
      // Try to get error details from response
      let errorDetails;
      try {
        errorDetails = await res.json();
      } catch (e) {
        errorDetails = await res.text();
      }
      
      console.error(`API Error [${method} ${url}]:`, {
        status: res.status,
        statusText: res.statusText,
        errorDetails
      });
      
      return { 
        success: false, 
        message: errorDetails.message || res.statusText,
        status: res.status,
        error: errorDetails
      };
    }

    const result = await res.json();
    return result;
  } catch (err) {
    console.error(`Network Error [${method} ${url}]:`, {
      message: err.message,
      name: err.name,
      stack: err.stack
    });
    
    return { 
      success: false, 
      message: "Network error - failed to reach server",
      error: err 
    };
  }
}

// Update loadTenders function
const loadTenders = async () => {
  const response = await simulateAPICall(
    `/api/tenders?search=${search}&status=${status}`,
    null,
    "GET"
  );
  if (response.success) setTenders(response.data);
};


  const handleInputChange = (e) => {
    const { name, value, type, files, options } = e.target;
    if (type === 'file') {
      setForm({ ...form, files: Array.from(files) });
    } else if (type === 'select-multiple') {
      const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
      setForm({ ...form, [name]: selected });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('deadline', form.deadline);
    formData.append('status', form.status);
    form.files.forEach(file => {
      formData.append('files', file);
    });
    if (form.id) {
      formData.append('id', form.id);
      const response = await simulateAPICall(`/api/tenders/${form.id}`, formData, "PUT", true);
      if (response.success) {
        alert('Tender updated successfully'); 
        setShowModal(false);
        loadTenders();
      } else {
        alert(`Error updating tender: ${response.message || 'Unknown error'}`);
      }
    } else {
      const response = await simulateAPICall('/api/tenders', formData, "POST", true);
      if (response.success) {
        alert('Tender created successfully');
        setShowModal(false);
        setForm({ id: '', title: '', description: '', deadline: '', status: 'open', files: [] });
        loadTenders();
      } else {
        alert(`Error creating tender: ${response.message || 'Unknown error'}`);
      }
    }
  };

  const openCreateModal = () => {
    setForm({ id: '', title: '', description: '', deadline: '', status: 'open', files: [] });
   
    setShowModal(true);
  };

  const handleEdit = async (id) => {
  try {
 
    const response = await simulateAPICall(`/api/tenders/${id}`);
    console.log('Edit response:', response); // Debug log
    
    if (response.success) {
      const t = response.data;
      
      setForm({
        id: t.id,
        title: t.title,
        description: t.description || '', // Handle potential null/undefined
        deadline: t.deadline ? t.deadline.split('T')[0] : '', // Safely handle date
        status: t.status || 'open', // Default to 'open' if undefined
        files: []
      });

      setShowModal(true);
      console.log('Modal should be open now'); // Debug log
    } else {
      console.error('Failed to fetch tender:', response.message);
      alert(`Error: ${response.message || 'Failed to load tender data'}`);
    }
  } catch (error) {
    console.error('Edit error:', {
      message: error.message,
      stack: error.stack
    });
    alert('An error occurred while loading the tender');
  }
};

  const resetForm = () => {
    setForm({ id: '', title: '', description: '', deadline: '', status: 'open', files: [] });
    setShowModal(false);
  };
  

  return (
    <div className="main-view">
      <Sidebar />
      <div className="tenders-container">
        <h1>Tenders</h1>
        <div className="tender-actions">
          <button className="btn-primary" onClick={openCreateModal}>Add Tender</button>
          <div className="tender-filters">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="awarded">Awarded</option>
            </select>
            <input
              type="text"
              placeholder="Search tenders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table id="tendersTable">
          <thead>
            <tr>
              <th>Tender #</th>
              <th>Title</th>
              <th>Status</th>
              <th>Deadline</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
  {tenders.length > 0 ? (
    tenders.map(t => (
      <tr key={t.id}>
        <td>{t.referenceNumber || 'N/A'}</td>
        <td>{t.title}</td>
        <td>
          <span className={`status-${t.status.toLowerCase()}`}>
            {formatStatus(t.status)}
          </span>
        </td>
        <td>{formatDeadline(t.deadline)}</td>
        
        <td className="actions">
          <button 
            className="btn-view"
            onClick={() => window.location.href = `/tender-detail.html?id=${t.id}`}
          >
            View
          </button>
          <button 
            className="btn-edit"
            onClick={async () => {
    console.log('Button clicked for ID:', t.id);
    await handleEdit(t.id);
  }}
          >
            Edit
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5" className="empty-state">
        No tenders found
      </td>
    </tr>
  )}
</tbody>
        </table>

        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setShowModal(false)}>&times;</span>
              <h2>{form.id ? 'Edit Tender' : 'Create New Tender'}</h2>
              <form onSubmit={handleSubmit}>
                <input type="hidden" name="id" value={form.id} />
                <div className="form-group">
                  <input type="text" name="title" placeholder="Tender Title" value={form.title} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <textarea name="description" placeholder="Description" value={form.description} onChange={handleInputChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Deadline</label>
                    <input type="date" name="deadline" value={form.deadline} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleInputChange}>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="awarded">Awarded</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Attachments</label>
                  <input type="file" name="files" multiple onChange={handleInputChange} />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Save Tender</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenderManagement;
