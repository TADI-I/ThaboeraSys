const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { Tender } = require('../models/Tender');


router.use(express.json());
router.use(express.urlencoded({ extended: true }));
// Get all tenders with search and filtering
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { referenceNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    const tenders = await Tender.findAll({ where });
    res.json({ success: true, data: tenders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch tenders' });
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
router.post('/', upload.array('files'), async (req, res) => {
  try {
    console.log('Tender model exists?', !!Tender); // Should log true
    
    const { title, description, deadline, status } = req.body;
    
    if (!title || !deadline) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and Deadline are required' 
      });
    }

    console.log('Creating tender with:', { title, description, deadline, status });
    
    const newTender = await Tender.create({ 
      title, 
      description: description || null, 
      deadline, 
      status: status || 'open',
      referenceNumber: `TND-${Date.now().toString().slice(-6)}`
    });

    console.log('Created tender:', newTender.toJSON());

    res.status(201).json({ 
      success: true, 
      data: newTender
    });
  } catch (err) {
    console.error('Full error object:', err);
    console.error('Error stack:', err.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create tender',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Update PUT route
router.put('/:id', async (req, res) => {
  try {
    const { title, description, deadline, status } = req.body;
    const tender = await Tender.findByPk(req.params.id);
    
    if (!tender) return res.status(404).json({ message: 'Tender not found' });

    await tender.update({ title, description, deadline, status });

    res.json({ 
      success: true, 
      data: tender
    });
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
