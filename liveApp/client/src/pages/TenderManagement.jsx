import React, { useEffect, useState } from 'react';
import './TenderManagement.css'; // Reuse existing styles
import Sidebar from '../components/Sidebar';

const TenderManagement = () => {
  const [tenders, setTenders] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    id: '',
    title: '',
    description: '',
    deadline: '',
    status: 'open',
    files: []
  });
  

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
    const options = {
      method,
      headers: {}
    };

    // Only set Content-Type for JSON, not for FormData
    if (!isFormData) {
      options.headers['Content-Type'] = 'application/json';
    }

    if (data) {
      options.body = isFormData ? data : JSON.stringify(data);
    }

    const res = await fetch(url, options);
    const result = await res.json();

    if (!res.ok) {
      console.error(`API Error [${method} ${url}]:`, result.message || res.statusText);
      return { success: false, message: result.message || "API call failed" };
    }

    return result;
  } catch (err) {
    console.error(`Fetch error [${method} ${url}]:`, err);
    return { success: false, message: "Network error" };
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
  
  if (!form.title || !form.deadline) {
    alert('Title and Deadline are required fields');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description || '');
    formData.append('deadline', form.deadline);
    formData.append('status', form.status);

    // Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const url = form.id ? `/api/tenders/${form.id}` : '/api/tenders';
    const method = form.id ? 'PUT' : 'POST';
    
    const response = await simulateAPICall(url, formData, method, true);
    
    if (response.success) {
      alert(`Tender ${form.id ? 'updated' : 'created'} successfully!`);
      setShowModal(false);
      setForm({ 
        id: '', 
        title: '', 
        description: '', 
        deadline: '', 
        status: 'open', 
        files: [] 
      });
      loadTenders();
    } else {
      alert(response.message || 'Operation failed');
    }
  } catch (error) {
    console.error('Submission error:', error);
    alert('An error occurred while saving the tender');
  }
};
  const openCreateModal = () => {
    setForm({ id: '', title: '', description: '', deadline: '', status: 'open', files: [] });
   
    setShowModal(true);
  };

  const handleEdit = async (id) => {
    const response = await simulateAPICall(`/api/tenders/${id}`);
    if (response.success) {
      const t = response.data;
      setForm({
        id: t.id,
        title: t.title,
        description: t.description,
        deadline: t.deadline.split('T')[0],
        status: t.status,
        files: []
      });
      
      setShowModal(true);
    }
  };

  const formatDate = (str) => new Date(str).toLocaleString();

  return (
    <div className="main-view">
      <Sidebar />
      <div className="tenders-container">
        <h1>Tenders</h1>
        <div className="tender-actions">
          <button className="btn-primary" onClick={openCreateModal}>Create Tender</button>
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
            onClick={() => window.location.href = `tender-detail.html?id=${t.id}`}
          >
            View
          </button>
          <button 
            className="btn-edit"
            onClick={() => handleEdit(t.id)}
          >
            Edit
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6" className="empty-state">
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
