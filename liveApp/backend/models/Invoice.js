const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  dateIssued: {
    type: DataTypes.DATE,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Paid', 'Cancelled'),
    defaultValue: 'Pending'
  }
}, {
  tableName: 'invoices',
  timestamps: false
});


module.exports = Invoice;
