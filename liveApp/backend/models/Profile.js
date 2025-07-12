const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Profile = sequelize.define('Profile', {
  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  picture_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users', // table name, not model name
      key: 'id'
    }
  }
}, {
  tableName: 'profiles', // ensure it doesn't clash with 'users'
  timestamps: true
});

// Define relationships
User.hasOne(Profile, { foreignKey: 'userId', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'userId' });

module.exports = Profile;
