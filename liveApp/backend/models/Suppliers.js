// models/Suppliers.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Supplier = sequelize.define('supplier', {
  name: DataTypes.STRING,
  contactPerson: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  address: DataTypes.STRING,
  products_supplied: DataTypes.TEXT,
  notes: DataTypes.TEXT,
});



module.exports = Supplier;
