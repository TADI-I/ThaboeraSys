const express = require('express');
const router = express.Router();
const { Reseller } = require('../models/Reseller');

// GET all resellers
router.get('/', async (req, res) => {
  try {
    const resellers = await Reseller.findAll();
    res.json(resellers);
  } catch (err) {
    console.error('Error fetching resellers:', err);
    res.status(500).json({ message: 'Failed to fetch resellers' });
  }
});

// GET a single reseller by ID
router.get('/:id', async (req, res) => {
  try {
    const reseller = await Reseller.findByPk(req.params.id);
    if (!reseller) return res.status(404).json({ message: 'Reseller not found' });
    res.json(reseller);
  } catch (err) {
    console.error('Error fetching reseller:', err);
    res.status(500).json({ message: 'Failed to fetch reseller' });
  }
});

// POST create a new reseller
router.post('/', async (req, res) => {
  try {
    const { name, contactInfo, companyId } = req.body;
    const newReseller = await Reseller.create({ name, contactInfo, companyId });
    res.status(201).json(newReseller);
  } catch (err) {
    console.error('Error creating reseller:', err);
    res.status(500).json({ message: 'Failed to create reseller' });
  }
});

// PUT update an existing reseller
router.put('/:id', async (req, res) => {
  try {
    const { name, contactInfo, companyId } = req.body;
    const reseller = await Reseller.findByPk(req.params.id);
    if (!reseller) return res.status(404).json({ message: 'Reseller not found' });

    await reseller.update({ name, contactInfo, companyId });
    res.json(reseller);
  } catch (err) {
    console.error('Error updating reseller:', err);
    res.status(500).json({ message: 'Failed to update reseller' });
  }
});

// DELETE a reseller
router.delete('/:id', async (req, res) => {
  try {
    const reseller = await Reseller.findByPk(req.params.id);
    if (!reseller) return res.status(404).json({ message: 'Reseller not found' });

    await reseller.destroy();
    res.json({ message: 'Reseller deleted successfully' });
  } catch (err) {
    console.error('Error deleting reseller:', err);
    res.status(500).json({ message: 'Failed to delete reseller' });
  }
});

module.exports = router;
