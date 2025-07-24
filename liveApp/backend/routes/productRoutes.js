const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const upload = require('../middleware/upload');
const Product = require('../models/Product');

// Helper function for error responses
const errorResponse = (res, status, message, error = null) => {
  console.error(error?.message || message);
  return res.status(status).json({ 
    success: false, 
    message,
    ...(process.env.NODE_ENV === 'development' && { error: error?.message }) 
  });
};

// Get all products with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { 
      search = '', 
      category = '', 
      minPrice, 
      maxPrice,
      page = 1, 
      limit = 10 
    } = req.query;

    // Build query conditions
    const where = {};
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    if (category) where.categoryId = category;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    const offset = (page - 1) * limit;
    
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    // Map quantityInStock to stock for frontend compatibility
    const mappedProducts = products.map(p => ({
      ...p.toJSON(),
      stock: p.quantityInStock
    }));

    return res.json({
      success: true,
      data: mappedProducts,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });

  } catch (err) {
    
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return errorResponse(res, 404, 'Product not found');
    const mapped = { ...product.toJSON(), stock: product.quantityInStock };
    return res.json({ success: true, data: mapped });
  } catch (err) {
    
  }
});

// Create new product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.body.name || !req.body.price) {
      return errorResponse(res, 400, 'Name and price are required');
    }

    const {
      name,
      description,
      price,
      cost,
      sku,
      reorderLevel = 0,
      categoryId,
      stock // <-- from frontend
    } = req.body;

    // Check for duplicate SKU
    if (sku) {
      const existing = await Product.findOne({ where: { sku } });
      if (existing) {
        return errorResponse(res, 400, 'SKU already exists');
      }
    }

    const newProduct = await Product.create({
      name,
      description,
      price: parseFloat(price),
      cost: cost ? parseFloat(cost) : null,
      sku: sku?.trim() ? sku : null,
      quantityInStock: stock !== undefined ? parseInt(stock) : 0, // <-- map stock
      reorderLevel: reorderLevel !== undefined ? parseInt(reorderLevel) : 0,
      categoryId: categoryId ? parseInt(categoryId) : null,
      image: req.file ? `/uploads/${req.file.filename}` : null
    });

    return res.status(201).json({
      success: true,
      data: newProduct
    });
  } catch (err) {
    return errorResponse(res, 500, 'Failed to create product', err);
  }
});

// Update product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return errorResponse(res, 404, 'Product not found');

    const {
      name,
      description,
      price,
      cost,
      sku,
      reorderLevel,
      categoryId,
      stock // <-- from frontend
    } = req.body;

    // Check for duplicate SKU if changed
    if (sku && sku !== product.sku) {
      const existing = await Product.findOne({ where: { sku } });
      if (existing) return errorResponse(res, 400, 'SKU already exists');
    }

    await product.update({
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? parseFloat(price) : product.price,
      cost: cost !== undefined ? parseFloat(cost) : product.cost,
      sku: sku || product.sku,
      quantityInStock: stock !== undefined ? parseInt(stock) : product.quantityInStock, // <-- map stock
      reorderLevel: reorderLevel !== undefined ? parseInt(reorderLevel) : product.reorderLevel,
      categoryId: categoryId !== undefined ? parseInt(categoryId) : product.categoryId,
      image: req.file ? `/uploads/${req.file.filename}` : product.image
    });

    return res.json({
      success: true,
      data: product
    });

  } catch (err) {
    return errorResponse(res, 500, 'Failed to update product', err);
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return errorResponse(res, 404, 'Product not found');
    
    await product.destroy();
    return res.json({ success: true, message: 'Product deleted' });
    
  } catch (err) {
    return errorResponse(res, 500, 'Failed to delete product', err);
  }
});

module.exports = router;