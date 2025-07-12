// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const upload = require('../middleware/upload'); // ⬅️ multer setup

// Get all products (with optional search & filter)
router.get('/', async (req, res) => {
  const { search = '', category = '' } = req.query;
  try {
    let where = {};
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }
    if (category) {
      where.categoryId = category;
    }
    const products = await Product.findAll({ where });
    res.json({ success: true, data: products });
  } catch (err) {
    console.error('Fetch failed:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ message: 'Fetch error' });
  }
});

// Create product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, cost, category, sku, reorderLevel } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const newProduct = await Product.create({
      name, description, price, cost, sku,
      quantityInStock: stock,
      reorderLevel, categoryId: category, image
    });
    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Create error' });
  }
});

// Update product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });

    const { name, description, price, stock, cost, category, sku, reorderLevel } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : product.image;

    await product.update({
      name, description, price, cost, sku,
      quantityInStock: stock,
      reorderLevel, categoryId: category, image
    });
    res.json({ success: true, data: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update error' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    await product.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Delete error' });
  }
});

module.exports = router;
