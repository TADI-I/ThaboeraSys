// routes/quotations.js
const express = require('express');
const router = express.Router();
const { Client, Quotation, QuotationItem } = require('../models/Quotation');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/quotations');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Save client information
router.post('/client', async (req, res) => {
  try {
    const { name, contactPerson, contactNumber, email, address, regNumber } = req.body;

    // Check if client already exists
    let client = await Client.findOne({ where: { email } });
    
    if (!client) {
      client = await Client.create({
        name,
        contactPerson,
        contactNumber,
        email,
        address,
        regNumber
      });
    } else {
      // Update existing client
      await client.update({
        name,
        contactPerson,
        contactNumber,
        address,
        regNumber
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Client info saved successfully',
      clientId: client.id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error saving client information' });
  }
});

// Create or update quotation
router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    const {
      clientId,
      quotationNumber,
      dateIssued,
      salesRep,
      fob,
      shipVia,
      terms,
      taxId,
      subtotal,
      vat,
      total,
      items
    } = req.body;

    // Parse the items array
    const parsedItems = JSON.parse(items);

    // Check if quotation already exists
    let quotation = await Quotation.findOne({ where: { quotationNumber } });

    if (!quotation) {
      // Create new quotation
      quotation = await Quotation.create({
        clientId,
        quotationNumber,
        dateIssued,
        salesRep,
        fob,
        shipVia,
        terms,
        taxId,
        subtotal,
        vat,
        total,
        pdfPath: req.file ? req.file.path : null,
        status: 'Draft'
      });
    } else {
      // Update existing quotation
      await quotation.update({
        clientId,
        dateIssued,
        salesRep,
        fob,
        shipVia,
        terms,
        taxId,
        subtotal,
        vat,
        total,
        pdfPath: req.file ? req.file.path : quotation.pdfPath,
        status: 'Draft'
      });

      // Remove old items
      await QuotationItem.destroy({ where: { quotationId: quotation.id } });
    }

    // Add new items
    const createdItems = await Promise.all(
      parsedItems.map(item => {
        return QuotationItem.create({
          quotationId: quotation.id,
          item: item.item,
          description: item.description,
          quantity: item.qty,
          unitPrice: item.unitPrice,
          discount: parseFloat(item.discount) || 0,
          taxable: item.taxable === 'yes',
          total: item.total
        });
      })
    );

    res.status(201).json({ 
      success: true, 
      message: 'Quotation saved successfully',
      quotationId: quotation.id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error saving quotation' });
  }
});

// Get all quotations
router.get('/', async (req, res) => {
  try {
    const quotations = await Quotation.findAll({
      include: [
        { model: Client },
        { model: QuotationItem }
      ],
      order: [['dateIssued', 'DESC']]
    });
    res.json(quotations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single quotation
router.get('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id, {
      include: [
        { model: Client },
        { model: QuotationItem }
      ]
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    res.json(quotation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update quotation status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const quotation = await Quotation.findByPk(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    await quotation.update({ status });
    res.json({ success: true, message: 'Quotation status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;