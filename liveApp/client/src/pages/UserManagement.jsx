import React, { useEffect, useState } from 'react';
import './UserManagement.css';
import Sidebar from '../components/Sidebar';

const API_URL = '/api/staff';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: ''
  });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    loadUsers();
  }, []);

  const loadUsers = (term = '') => {
    fetch(`${API_URL}${term ? `?search=${encodeURIComponent(term)}` : ''}`)
      .then(res => res.json())
      .then(data => setUsers(data));
  };

  const handleSearch = e => {
    setSearchTerm(e.target.value);
    debounce(() => loadUsers(e.target.value), 300)();
  };

  const handleEdit = id => {
    fetch(`${API_URL}/${id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({ ...data });
        setModalVisible(true);
      });
  };

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      fetch(`${API_URL}/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
          loadUsers(searchTerm);
          showAlert('Staff member deleted successfully!', 'success');
        });
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `${API_URL}/${formData.id}` : API_URL;
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      position: formData.position
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(res => {
        if (res && !res.message) {
          loadUsers();
          setModalVisible(false);
          showAlert(`Staff member ${formData.id ? 'updated' : 'created'} successfully!`, 'success');
          setFormData({ id: '', firstName: '', lastName: '', email: '', phone: '', position: '' });
        } else {
          showAlert('Operation failed', 'error');
        }
      });
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const debounce = (func, wait) => {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(func, wait);
    };
  };

  return (
    <div className="main-view">
      <Sidebar />
      <div className="management-container">
        <h1>Staff Management</h1>

        {alert && <div className={`alert ${alert.type}`}>{alert.message}</div>}

        <div className="table-actions">
          <button className="btn-primary" onClick={() => {
            setFormData({ id: '', firstName: '', lastName: '', email: '', phone: '', position: '' });
            setModalVisible(true);
          }}>Add New Staff</button>
          <input type="text" value={searchTerm} onChange={handleSearch} placeholder="Search staff..." />
        </div>

        <table id="usersTable">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Position</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.position}</td>
                <td className="actions">
                  <button onClick={() => handleEdit(user.id)}>Edit</button>
                  <button onClick={() => handleDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {modalVisible && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setModalVisible(false)}>&times;</span>
              <h2>{formData.id ? 'Edit Staff' : 'Add New Staff'}</h2>
              <form onSubmit={handleSubmit}>
                <input type="hidden" value={formData.id} />
                <div className="form-group">
                  <input type="text" placeholder="First Name" required
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                </div>
                <div className="form-group">
                  <input type="text" placeholder="Last Name" required
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Email" required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <input type="text" placeholder="Phone"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <input type="text" placeholder="Position"
                    value={formData.position}
                    onChange={e => setFormData({ ...formData, position: e.target.value })} />
                </div>
                <button type="submit" className="btn-primary">Save</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
