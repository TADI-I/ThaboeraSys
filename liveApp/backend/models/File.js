// models/File.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust if your Sequelize instance path is different

const File = sequelize.define('file', {
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    size: DataTypes.INTEGER,
    category: DataTypes.STRING,
    description: DataTypes.TEXT,
    data: DataTypes.BLOB('long')  // 👈 actual binary content
  });

module.exports = File;
