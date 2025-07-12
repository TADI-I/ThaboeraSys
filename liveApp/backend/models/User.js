// models/User.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust this path if needed

const User = sequelize.define('User', {
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'users',
  timestamps: false,
});

module.exports = User;
