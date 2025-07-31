// models/Invoice.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  dateIssued: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    validate: {
      isDate: true
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 15.00,
    validate: {
      min: 0,
      max: 100
    }
  },
  taxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'),
    defaultValue: 'Draft'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'invoices',
  timestamps: true,
  paranoid: true, // Enable soft deletes
  defaultScope: {
    attributes: { exclude: ['deletedAt'] }
  },
  hooks: {
    beforeValidate: (invoice) => {
      // Calculate totals if not provided
      if (invoice.subtotal && !invoice.taxAmount) {
        invoice.taxAmount = invoice.subtotal * (invoice.taxRate / 100);
      }
      if (invoice.subtotal && !invoice.totalAmount) {
        invoice.totalAmount = invoice.subtotal + (invoice.taxAmount || 0);
      }
    }
  }
});

module.exports = Invoice;