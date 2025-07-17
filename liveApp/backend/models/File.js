// models/File.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust if your Sequelize instance path is different

const File = sequelize.define('company_docs', {
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    size: DataTypes.INTEGER,
    category: DataTypes.STRING,
    description: DataTypes.TEXT,
    data: DataTypes.BLOB('long')  
  });

module.exports = File;
