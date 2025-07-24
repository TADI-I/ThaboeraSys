const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Audit = sequelize.define('Audit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  action: {
    type: DataTypes.ENUM('Login', 'Create', 'Update', 'Delete', 'System'),
    allowNull: false
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ip: {
    type: DataTypes.STRING(45), // IPv6 length
    allowNull: false
  }
}, {
  tableName: 'audit_logs',
  timestamps: false,
  underscored: true
});

// Associate with User model
Audit.associate = function(models) {
  Audit.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

// Static method to log an action
Audit.logAction = async function(actionData) {
  try {
    await this.create(actionData);
  } catch (err) {
    console.error('Error logging audit action:', err);
  }
};

module.exports = Audit;