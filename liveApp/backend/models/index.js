const User = require('./User');

// models/index.js
const Supplier = require('./Suppliers');
const Product = require('./Product');
const SupplierProduct = require('./SupplierProduct');

// Define many-to-many relationship
Supplier.belongsToMany(Product, {
  through: 'SupplierProducts', // or your table name
  as: 'suppliedProducts',
  foreignKey: 'supplierId',
});

Product.belongsToMany(Supplier, {
  through: 'SupplierProducts',
  as: 'suppliers',
  foreignKey: 'productId',
});

module.exports = { Supplier, Product, SupplierProduct };

module.exports = {
  User,
};
