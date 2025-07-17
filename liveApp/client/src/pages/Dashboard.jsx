import React, { useState, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import './Dashboard.css';
import Sidebar from '../components/Sidebar'; // <-- Sidebar import

const Dashboard = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [user, setUser] = useState({
    name: 'Admin User',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  });
  const [stats, setStats] = useState({
    totalSales: 12345,
    openTickets: 8,
    newCustomers: 24,
    inventoryItems: 138
  });

  useEffect(() => {
    initializeCharts();
    if (!localStorage.getItem('authToken')) {
      window.location.href = '/login';
    }
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser.name) setUser(storedUser);
    loadStats();
  }, []);

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const initializeCharts = () => {
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
      new Chart(salesCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Monthly Sales (R)',
            data: [12000, 15000, 18000, 14000, 22000, 25000],
            borderColor: '#d32f2f',
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
    }

    const inventoryCtx = document.getElementById('inventoryChart');
    if (inventoryCtx) {
      new Chart(inventoryCtx, {
        type: 'bar',
        data: {
          labels: ['Laptops', 'Desktops', 'Routers', 'Cables', 'Monitors'],
          datasets: [{
            label: 'Items in Stock',
            data: [20, 15, 35, 50, 18],
            backgroundColor: [
              'rgba(211, 47, 47, 0.7)',
              'rgba(233, 30, 99, 0.7)',
              'rgba(156, 39, 176, 0.7)',
              'rgba(63, 81, 181, 0.7)',
              'rgba(3, 169, 244, 0.7)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  };

  const loadStats = async () => {
    try {
      // Simulate API call
      // const response = await fetch('/api/stats');
      // const data = await response.json();
      // setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="main-view">
      <Sidebar />
      <div className="dashboard-main">
        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>

        {/* Overlay for mobile menu */}
        <div
          className={`sidebar-overlay ${sidebarActive ? 'active' : ''}`}
          onClick={toggleSidebar}
        ></div>

        {/* Top Bar */}
        <div className="top-bar">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search..." />
          </div>
          <div className="user-menu">
            <div className="notifications">
              <i className="fas fa-bell"></i>
              <span className="badge">3</span>
            </div>
            <div className="user-profile">
              <img src={user.avatar} alt="User" />
              <span>{user.name}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          <h1>Dashboard Overview</h1>

          {/* Stats Cards */}
          <div className="stats-cards">
            <div className="card">
              <h3>Total Sales</h3>
              <p>${stats.totalSales.toLocaleString()}</p>
              <div className="trend up">
                <i className="fas fa-arrow-up"></i>
                12% from last month
              </div>
            </div>
            <div className="card">
              <h3>Open Tickets</h3>
              <p>{stats.openTickets}</p>
              <div className="trend down">
                <i className="fas fa-arrow-down"></i>
                3% from last week
              </div>
            </div>
            <div className="card">
              <h3>New Customers</h3>
              <p>{stats.newCustomers}</p>
              <div className="trend up">
                <i className="fas fa-arrow-up"></i>
                8% from last month
              </div>
            </div>
            <div className="card">
              <h3>Inventory Items</h3>
              <p>{stats.inventoryItems}</p>
              <div className="trend up">
                <i className="fas fa-arrow-up"></i>
                5 new items
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-container">
              <h3>Monthly Sales</h3>
              <canvas id="salesChart"></canvas>
            </div>
            <div className="chart-container">
              <h3>Inventory Levels</h3>
              <canvas id="inventoryChart"></canvas>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h2>Recent Activity</h2>
            <ul className="activity-list">
              <li className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-file-invoice-dollar"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-title">New invoice #INV-2023-105 created</div>
                  <div className="activity-time">10 minutes ago</div>
                </div>
              </li>
              <li className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-user"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-title">New user registered: John Smith</div>
                  <div className="activity-time">1 hour ago</div>
                </div>
              </li>
              <li className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-truck"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-title">New shipment received from TechSupplies Inc.</div>
                  <div className="activity-time">3 hours ago</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;