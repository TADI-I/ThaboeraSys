const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');


// Middleware to parse JSON requests
app.use(cors({
  origin: 'http://localhost:3000', // allow React frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,               // if you use cookies/auth
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import models (this ensures associations are loaded if needed)
require('./models/User');
require('./models/Company');
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
const userRoutes = require('./routes/users');
const invoiceRoutes = require('./routes/invoiceRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const tenderRoutes = require('./routes/tenderRoutes');
const productRoutes = require('./routes/productRoutes');
const companyRoutes = require('./routes/companyRoutes');
const staffRoutes = require('./routes/staffRoutes');
const fileRoutes = require('./routes/fileRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const authRoutes = require('./routes/authRoutes');

// Mount routes
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/documents', fileRoutes); // Choose only one path for fileRoutes if needed
app.use('/api', authRoutes); // Handles /login, /register, /me

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  

// Optional home route to prevent crash on browser refresh
app.get('/', (req, res) => {
  res.send('🚀 Backend API is running');
});

// Start server and sync DB

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ All tables synced');
    app.listen(5000, () => console.log('🚀 Server running on port 5000'));
      const bcrypt = require('bcrypt');
   bcrypt.hash('1396@Tadi', 10).then(hash => console.log(hash));
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
  });

