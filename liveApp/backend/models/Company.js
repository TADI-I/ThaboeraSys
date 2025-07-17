const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  registrationNumber: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'companies'
});

module.exports = Company;
