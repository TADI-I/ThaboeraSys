// models/SupplierProduct.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('supplier_product', {
    supplierId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'suppliers',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'products',
        key: 'id'
      }
    }
  });
};
 