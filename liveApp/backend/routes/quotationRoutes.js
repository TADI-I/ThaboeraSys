const express = require('express');
const router = express.Router();
const { Quotation, QuotationItem, Product, Client } = require('../models/Quotation');

// Get all quotations
router.get('/', async (req, res) => {
  try {
    const quotations = await Quotation.findAll({
      include: [{ model: Client }, { model: QuotationItem, include: [Product] }]
    });
    res.json(quotations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single quotation by ID
router.get('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id, {
      include: [{ model: Client }, { model: QuotationItem, include: [Product] }]
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

// Create a new quotation
router.post('/', async (req, res) => {
  try {
    const { clientId, quotationDate, dueDate, taxRate, discount, terms, notes, items } = req.body;

    const quotation = await Quotation.create({
      clientId,
      quotationDate,
      dueDate,
      taxRate,
      discount,
      terms,
      notes
    });

    const createdItems = await Promise.all(
      items.map(item => {
        return QuotationItem.create({
          quotationId: quotation.id,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          price: item.price
        });
      })
    );

    res.status(201).json({ success: true, data: { id: quotation.id, items: createdItems } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error creating quotation' });
  }
});

// Update a quotation
router.put('/:id', async (req, res) => {
  try {
    const { clientId, quotationDate, dueDate, taxRate, discount, terms, notes, items } = req.body;

    const quotation = await Quotation.findByPk(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    await quotation.update({
      clientId,
      quotationDate,
      dueDate,
      taxRate,
      discount,
      terms,
      notes
    });

    // Remove old items
    await QuotationItem.destroy({ where: { quotationId: quotation.id } });

    // Add new items
    const updatedItems = await Promise.all(
      items.map(item => {
        return QuotationItem.create({
          quotationId: quotation.id,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          price: item.price
        });
      })
    );

    res.json({ success: true, data: { id: quotation.id, items: updatedItems } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating quotation' });
  }
});

// Send quotation (mock logic)
router.post('/:id/send', async (req, res) => {
  try {
    // In a real app, you'd email or PDF the quotation here
    res.json({ success: true, message: 'Quotation sent (simulated)' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending quotation' });
  }
});

module.exports = router;
