import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Sidebar.css';
import logo from './ThaboEra-Logo.png';

const Sidebar = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const toggleSidebar = () => setSidebarActive((prev) => !prev);

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  // Helper to check if a menu item is active
  const isActive = (href) => currentPath === href;

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </button>

      
        <nav className={`sidebar${sidebarActive ? ' active' : ''}`}>
          <div className="sidebar-header">
            <button className="sidebar-close" onClick={toggleSidebar}>
          <i className="fas fa-times"></i>
            </button>
            <div className="company-logo">
          <img src={logo} alt="Company Logo" style={{ maxWidth: '100px', maxHeight: '60px', objectFit: 'contain' }} />
            </div>
            <h2>ThaboEra IT Solutions</h2>
          </div>

          <div className="sidebar-menu">
            {/* Dashboard */}
          <div className="menu-section">
            <a href="/dashboard" className={`menu-item${isActive('/dashboard') ? ' active' : ''}`}>
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </a>
          </div>

          {/* Authentication */}
          <div className="menu-section">
            <div className="menu-section-title">Account</div>
            <a href="/profile" className={`menu-item${isActive('/profile') ? ' active' : ''}`}>
              <i className="fas fa-user-circle"></i>
              <span>My Profile</span>
            </a>
            <a href="/" className="menu-item" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </a>
            {/*
            <a href="/notifications" className={`menu-item${isActive('/notifications') ? ' active' : ''}`}>
              <i className="fas fa-bell"></i>
              <span>Notifications</span>
            </a>
            */}
          </div>

          {/* User Management */}
          <div className="menu-section">
            <div className="menu-section-title">Management</div>
            <a href="/user-management" className={`menu-item${isActive('/user-management') ? ' active' : ''}`}>
              <i className="fas fa-users-cog"></i>
              <span>Staff Management</span>
            </a>
          </div>

          {/* Inventory */}
          <div className="menu-section">
            <div className="menu-section-title">Inventory</div>
            <a href="/products" className={`menu-item${isActive('/products') ? ' active' : ''}`}>
              <i className="fas fa-boxes"></i>
              <span>Products</span>
            </a>
            <a href="/suppliers" className={`menu-item${isActive('/suppliers') ? ' active' : ''}`}>
              <i className="fas fa-truck"></i>
              <span>Suppliers</span>
            </a>
            <a href="/documents" className={`menu-item${isActive('/documents') ? ' active' : ''}`}>
              <i className="fas fa-file-alt"></i>
              <span>Documents</span>
            </a>
          </div>

          {/* Sales */}
          <div className="menu-section">
            <div className="menu-section-title">Sales</div>
            <a href="/invoices" className={`menu-item${isActive('/invoices') ? ' active' : ''}`}>
              <i className="fas fa-file-invoice-dollar"></i>
              <span>Invoices</span>
            </a>
            <a href="/invoices/create" className={`menu-item${isActive('/invoices/create') ? ' active' : ''}`}>
              <i className="fas fa-plus-circle"></i>
              <span>Create Invoice</span>
            </a>
            <a href="/quotations" className={`menu-item${isActive('/quotations') ? ' active' : ''}`}>
              <i className="fas fa-file-signature"></i>
              <span>Quotations</span>
            </a>
            <a href="/quotations/create" className={`menu-item${isActive('/quotations/create') ? ' active' : ''}`}>
              <i className="fas fa-plus-circle"></i>
              <span>Create Quotation</span>
            </a>
          </div>

          {/* Reports */}
          <div className="menu-section">
            <div className="menu-section-title">Reports</div>
            <a href="/tenders" className={`menu-item${isActive('/tenders') ? ' active' : ''}`}>
              <i className="fas fa-chart-line"></i>
              <span>Tenders</span>
            </a>
           {/* <a href="/sales-reports" className={`menu-item${isActive('/sales-reports') ? ' active' : ''}`}>
              <i className="fas fa-chart-line"></i>
              <span>Sales Reports</span>
            </a>
            <a href="/stock-reports" className={`menu-item${isActive('/stock-reports') ? ' active' : ''}`}>
              <i className="fas fa-chart-pie"></i>
              <span>Stock Reports</span>
            </a> */}
            <a href="/audit-logs" className={`menu-item${isActive('/audit-logs') ? ' active' : ''}`}>
              <i className="fas fa-clipboard-list"></i>
              <span>System Logs</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      <div
        className={`sidebar-overlay${sidebarActive ? ' active' : ''}`}
        onClick={toggleSidebar}
      ></div>
    </>
  );
};

export default Sidebar;