const express = require('express');
const router = express.Router();
const { Tender } = require('../models/Tender');

// Get all tenders
router.get('/', async (req, res) => {
  try {
    const tenders = await Tender.findAll();
    res.json(tenders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch tenders' });
  }
});

// Get tender by ID
router.get('/:id', async (req, res) => {
  try {
    const tender = await Tender.findByPk(req.params.id);
    if (!tender) return res.status(404).json({ message: 'Tender not found' });
    res.json(tender);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch tender' });
  }
});

// Create a new tender
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;
    const newTender = await Tender.create({ title, description, dueDate, status });
    res.status(201).json(newTender);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create tender' });
  }
});

// Update a tender
router.put('/:id', async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;
    const tender = await Tender.findByPk(req.params.id);
    if (!tender) return res.status(404).json({ message: 'Tender not found' });

    await tender.update({ title, description, dueDate, status });
    res.json(tender);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update tender' });
  }
});

// Delete a tender
router.delete('/:id', async (req, res) => {
  try {
    const tender = await Tender.findByPk(req.params.id);
    if (!tender) return res.status(404).json({ message: 'Tender not found' });

    await tender.destroy();
    res.json({ message: 'Tender deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete tender' });
  }
});

module.exports = router;
