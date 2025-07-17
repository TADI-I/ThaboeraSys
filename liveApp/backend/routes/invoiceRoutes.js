// routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Company = require('../models/Company'); // If you want to include client info

const nodemailer = require('nodemailer');

router.post('/', async (req, res) => {
  const { invoiceNumber, dateIssued, totalAmount, status } = req.body;

  // ✅ Add this line to check incoming data
  console.log('Received invoice data:', req.body);

  try {
    const newInvoice = await Invoice.create({
      invoiceNumber,
      dateIssued,
      totalAmount,
      status: status || 'Pending'
    });

    res.status(201).json({ success: true, invoice: newInvoice });
  } catch (err) {
    console.error('❌ Error creating invoice:', err);
    res.status(500).json({ success: false, message: 'Server error creating invoice' });
  }
});



const puppeteer = require('puppeteer');

router.get('/:id/download', async (req, res) => {
  const invoice = await Invoice.findByPk(req.params.id);

  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  const html = `
    <html>
      <head><title>Invoice ${invoice.invoiceNumber}</title></head>
      <body>
        <h1>Invoice #${invoice.invoiceNumber}</h1>
        <p>Date Issued: ${new Date(invoice.dateIssued).toLocaleDateString()}</p>
        <p>Total Amount: R${invoice.totalAmount}</p>
        <p>Status: ${invoice.status}</p>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`
  });

  res.send(pdfBuffer);
});


router.post('/', async (req, res) => {
  const { invoiceNumber, dateIssued, totalAmount, status } = req.body;

  try {
    const newInvoice = await Invoice.create({
      invoiceNumber,
      dateIssued,
      totalAmount,
      status: status || 'Pending'
    });

    res.status(201).json({ success: true, invoice: newInvoice });
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(500).json({ success: false, message: 'Server error creating invoice' });
  }
});

router.get('/', async (req, res) => {
  const { status, dateFrom, dateTo } = req.query;

  const where = {};
  if (status) where.status = status;
  if (dateFrom || dateTo) where.dateIssued = {};
  if (dateFrom) where.dateIssued['$gte'] = new Date(dateFrom);
  if (dateTo) where.dateIssued['$lte'] = new Date(dateTo);

  try {
    const invoices = await Invoice.findAll({
      where,
      include: [{ model: Company, as: 'client' }] // if you have associations set
    });
    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching invoices' });
  }
});

module.exports = router;
