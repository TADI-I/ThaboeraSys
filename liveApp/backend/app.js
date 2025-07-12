const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');

// Middleware to parse JSON requests

app.use(cors());
app.use(express.json());

// Import models (this ensures associations are loaded if needed)
require('./models/User');
require('./models/Company');
require('./models/Reseller');
require('./models/Product');
require('./models/Invoice');
require('./models/Quotation');
require('./models/Staff');
require('./models/File');
require('./models/Tender');
require('./models/Service');
require('./models/Login');
require('./models/Suppliers');

// Import routes
const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);
const invoiceRoutes = require('./routes/invoiceRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const tenderRoutes = require('./routes/tenderRoutes');
const productRoutes = require('./routes/productRoutes');
const companyRoutes = require('./routes/companyRoutes');
const staffRoutes = require('./routes/staffRoutes');
const fileRoutes = require('./routes/fileRoutes');
const resellerRoutes = require('./routes/resellerRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
app.use('/api/suppliers', supplierRoutes);


// Mount routes
app.use('/api/documents', require('./routes/fileRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', require('./routes/authRoutes'));
// Handles /login, /register, /me inside

app.use('/api/invoices', invoiceRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/resellers', resellerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/documents', fileRoutes);

//const bcrypt = require('bcrypt');
//bcrypt.hash('1396@Tadi', 10).then(hash => console.log(hash));

// Start server and sync DB
sequelize.sync({ alter: true }) // Or { force: true } for dev reset
  .then(() => {
    console.log('✅ All tables synced');
    app.listen(5000, () => console.log('🚀 Server running on port 5000'));
    const bcrypt = require('bcrypt');
bcrypt.hash('1396@Tadi', 10).then(hash => console.log(hash));
  })
  .catch(err => {
    console.error('❌ Sync failed:', err);
  });
