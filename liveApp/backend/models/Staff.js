const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Staff = sequelize.define('Staff', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'staff'
});

module.exports = Staff;
