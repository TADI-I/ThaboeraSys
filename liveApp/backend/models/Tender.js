const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tender = sequelize.define('Tender', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  referenceNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('open', 'closed', 'awarded'),
    defaultValue: 'open'
  }
  
}, {
  tableName: 'tenders',
  hooks: {
    beforeCreate: (tender) => {
      // Generate reference number
      if (!tender.referenceNumber) {
        tender.referenceNumber = `TND-${Date.now()}`;
      }
    }
  }
});

module.exports = Tender;