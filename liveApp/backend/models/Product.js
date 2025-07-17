const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
 name: {
      type: DataTypes.STRING,
      allowNull: false,       // ✅ required
    },
    description: {
      type: DataTypes.TEXT,
    },
   sku: {
  type: DataTypes.STRING,
  allowNull: true, // Optional
  unique: {
    name: 'unique_sku',
    msg: 'SKU must be unique',
  },
  validate: {
    notEmpty: false // Allows empty strings too (optional)
  }
},
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,       // ✅ required
      validate: {
        min: 0,
      }
    },
    cost: {
      type: DataTypes.FLOAT,
    },
    quantityInStock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    reorderLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    categoryId: {
      type: DataTypes.INTEGER,
    },
    image: {
      type: DataTypes.STRING,
    }
}, {
  tableName: 'products',
  timestamps: true // Adds createdAt and updatedAt
});

Object.defineProperty(Product.prototype, 'stock', {
  get() {
    return this.getDataValue('quantityInStock');
  },
});

module.exports = Product;
