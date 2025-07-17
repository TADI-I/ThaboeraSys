const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tender = sequelize.define('Tender', {
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
    type: DataTypes.ENUM('Open', 'Closed', 'Awarded'),
    defaultValue: 'Open'
  }
}, {
  tableName: 'tenders'
});

module.exports = Tender;
