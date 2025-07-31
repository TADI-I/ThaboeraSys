// models/Quotation.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactPerson: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  regNumber: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'clients'
});

const Quotation = sequelize.define('Quotation', {
  quotationNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  dateIssued: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  salesRep: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fob: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shipVia: {
    type: DataTypes.STRING,
    allowNull: true
  },
  terms: {
    type: DataTypes.STRING,
    allowNull: true
  },
  taxId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  vat: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  pdfPath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Sent', 'Accepted', 'Rejected'),
    defaultValue: 'Draft'
  }
}, {
  tableName: 'quotations'
});

const QuotationItem = sequelize.define('QuotationItem', {
  item: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  unitPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'unit_price'
  },
  discount: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  taxable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  }
}, {
  tableName: 'quotation_items',
  underscored: true
});

// Define relationships
Client.hasMany(Quotation);
Quotation.belongsTo(Client);

Quotation.hasMany(QuotationItem, { foreignKey: 'quotationId' });
QuotationItem.belongsTo(Quotation, { foreignKey: 'quotationId' });

module.exports = { Client, Quotation, QuotationItem };