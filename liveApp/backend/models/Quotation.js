const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quotation = sequelize.define('Quotation', {
  quotationNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  dateIssued: {
    type: DataTypes.DATE,
    allowNull: false
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected'),
    defaultValue: 'Pending'
  }
}, {
  tableName: 'quotations'
});

module.exports = Quotation;
