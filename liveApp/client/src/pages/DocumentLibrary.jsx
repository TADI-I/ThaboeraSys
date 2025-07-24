// DocumentLibrary.jsx
import React, { useEffect, useState, useRef } from 'react';
import './DocumentLibrary.css'; // Assuming you have a CSS file for styles
import Sidebar from '../components/Sidebar';


const DocumentLibrary = () => {
  const [auth, setAuth] = useState(true);
  const [view, setView] = useState('list');
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', description: '', file: null });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  const fileInputRef = useRef();

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      setAuth(false);
      window.location.href = 'login.html';
      return;
    }
    loadDocuments();
    loadCategories();
  }, []);

  useEffect(() => {
    loadDocuments(search, filter);
  }, [search, filter]);

  useEffect(() => {
    if (search) {
      const filteredDocs = documents.filter(doc => 
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.description.toLowerCase().includes(search.toLowerCase())
      );
      setDocuments(filteredDocs);
    } else {
      loadDocuments();
    }
  }, [search]);

  const loadDocuments = async () => {
    const res = await fetch('/api/documents');
    const data = await res.json();
    if (data) {
      setDocuments(
        data.map(doc => ({
          ...doc,
          title: doc.name,
          category: doc.category,
          fileUrl: doc.path,
          uploadedAt: doc.createdAt,
          uploadedBy: doc.uploadedBy || 'Unknown'
        }))
      );
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const res = await fetch(`/api/documents/${fileId}/download`);
      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Could not download file');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/documents/categories', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const result = await response.json();
      if (result.success) setCategories(result.data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleUpload = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('category', form.category);
    formData.append('description', form.description);
    formData.append('file', form.file);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();
      if (result.success) {
        alert('Upload successful');
        setModalOpen(false);
        setForm({ title: '', category: '', description: '', file: null });
        loadDocuments();
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload error');
    }
  };

  const formatDate = date => new Date(date).toLocaleDateString();
  const formatSize = size => `${(size / 1024 / 1024).toFixed(2)} MB`;

  return auth ? (
    <>
      <div className="main-view">
        <Sidebar />
        <div className="documents-container">
          <h1><i className="fas fa-folder-open"></i> Document Library</h1>
          <div className="document-actions">
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              <i className="fas fa-upload"></i> Upload Document
            </button>
          </div>
          <div className="document-view-options">
          </div>
          <div className="search-bar">
            <input type='text'></input>
            <button className="btn-secondary" onClick={() => setSearch(document.querySelector('.search-bar input').value)}>
              <i className="fas fa-search"></i> Search
            </button>
            </div>

          {view === 'list' ? (
            <div id="documentsList">
              <table>
                <thead>
                  <tr>
                    <th>Title</th><th>Decription</th><th>Uploaded</th><th>Size</th><th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length > 0 ? documents.map(doc => (
                    <tr key={doc.id}>
                      <td><a href={`http://localhost:3000${doc.fileUrl}`} target="_blank" rel="noreferrer">{doc.title}</a></td>
                      <td>{doc.description}</td>
                      <td>{formatDate(doc.uploadedAt)}</td>
                      <td>{formatSize(doc.size)}</td>
                      <td>
                        <button
                          className="btn-small"
                          onClick={() => handleDownload(doc.id, doc.title)}
                        >
                          <i className="fas fa-download"></i> Download
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5">No documents found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {modalOpen && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={() => setModalOpen(false)}>&times;</span>
                <h2>Upload New Document</h2>
                <form onSubmit={handleUpload}>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" required />
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                    <option value="">Select a category</option>
                    <option value="1">Papers</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description"></textarea>
                  <div onClick={() => fileInputRef.current.click()} className="file-upload">Click to upload file</div>
                  <input type="file" ref={fileInputRef} onChange={e => setForm({ ...form, file: e.target.files[0] })} hidden required />
                  {form.file && <p>Selected file: {form.file.name}</p>}
                  <button type="submit" className="btn-primary">Upload</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  ) : null;
};

export default DocumentLibrary;
