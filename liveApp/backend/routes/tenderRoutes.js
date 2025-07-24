const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const Tender  = require('../models/Tender');


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
    console.log('Fetching tender ID:', req.params.id);
    
    const tender = await Tender.findByPk(req.params.id);
    console.log('Database result:', tender);
    
    if (!tender) {
      console.log('Tender not found');
      return res.status(404).json({ 
        success: false, 
        message: 'Tender not found' 
      });
    }

    res.json({ 
      success: true, 
      data: tender 
    });

  } catch (error) {
    console.error('Error fetching tender:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database error',
      error: error.message 
    });
  }
});



// Create a new tender
// Update the POST route to properly handle FormData
router.post('/', upload.array('files'), async (req, res) => {
  try {
    const { title, description, deadline, status } = req.body;
    
    // Process uploaded files
    const fileRecords = await Promise.all(
      req.files?.map(async (file) => {
        return await File.create({
          name: file.originalname,
          type: file.mimetype,
          size: file.size,
          data: file.buffer
        });
      }) || []
    );

    const newTender = await Tender.create({
      title,
      description,
      deadline,
      status,
      referenceNumber: `TND-${Date.now().toString().slice(-6)}`,
      files: fileRecords.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        size: f.size
      }))
    });

    res.status(201).json({ success: true, data: newTender });
  } catch (err) {
    console.error('Error creating tender:', err);
    res.status(500).json({ success: false, message: 'Failed to create tender' });
  }
});

// Update PUT route
router.put('/:id', upload.array('files'), async (req, res) => {
  try {
    const { id, title, description, deadline, status } = req.body;
    const tender = await Tender.findByPk(req.params.id);
    
    if (!tender) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tender not found' 
      });
    }

    // Process new files if any
    const newFiles = req.files?.map(file => ({
      id: file.filename,
      name: file.originalname,
      type: file.mimetype,
      size: file.size
    })) || [];

    // Combine existing files with new ones (if not replacing)
   // const updatedFiles = [...tender.files, ...newFiles];

    await tender.update({
      title,
      description,
      deadline,
      status,
      
    });

    res.json({ 
      success: true, 
      data: tender 
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update tender',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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
