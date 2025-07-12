const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Login = sequelize.define('Login', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // table name
      key: 'id'
    }
  },
  loginTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'logins',
  timestamps: false
});

module.exports = Login;
