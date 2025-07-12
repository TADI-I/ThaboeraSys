const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reseller = sequelize.define('Reseller', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'resellers'
});

module.exports = Reseller;
