// routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const { Invoice, Client } = require('../models'); // Assuming models are exported from models/index.js
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

// Create a new invoice
router.post('/', async (req, res) => {
  const { invoiceNumber, dateIssued, totalAmount, status, clientId, items } = req.body;

  if (!invoiceNumber || !dateIssued || !totalAmount || !clientId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields (invoiceNumber, dateIssued, totalAmount, clientId)' 
    });
  }

  try {
    // Verify client exists
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const newInvoice = await Invoice.create({
      invoiceNumber,
      dateIssued,
      totalAmount,
      status: status || 'Pending',
      clientId
    });

    // If you have invoice items, you would create them here
    // await InvoiceItem.bulkCreate(items.map(item => ({ ...item, invoiceId: newInvoice.id })));

    res.status(201).json({ 
      success: true, 
      invoice: newInvoice,
      message: 'Invoice created successfully'
    });
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating invoice',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get all invoices with filtering
router.get('/', async (req, res) => {
  const { status, dateFrom, dateTo, clientId } = req.query;
  const where = {};
  
  // Build query filters
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;
  
  if (dateFrom || dateTo) {
    where.dateIssued = {};
    if (dateFrom) where.dateIssued[Op.gte] = new Date(dateFrom);
    if (dateTo) where.dateIssued[Op.lte] = new Date(dateTo);
  }

  try {
    const invoices = await Invoice.findAll({
      where,
      include: [
        { 
          model: Client,
          attributes: ['id', 'name', 'email', 'contactPerson'] 
        }
      ],
      order: [['dateIssued', 'DESC']]
    });

    res.json({
      success: true,
      count: invoices.length,
      invoices
    });
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching invoices',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { 
          model: Client,
          attributes: ['id', 'name', 'email', 'contactPerson', 'contactNumber', 'address'] 
        }
        // Add include for InvoiceItems if you have them
      ]
    });

    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }

    res.json({ success: true, invoice });
  } catch (err) {
    console.error('Error fetching invoice:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching invoice',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Download invoice as PDF
router.get('/:id/download', async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { 
          model: Client,
          attributes: ['name', 'email', 'contactPerson', 'address'] 
        }
      ]
    });

    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Generate HTML for the invoice
    const html = generateInvoiceHtml(invoice);
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ 
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating PDF invoice',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Helper function to generate invoice HTML
function generateInvoiceHtml(invoice) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .company-info { text-align: right; }
        .invoice-title { text-align: center; margin: 20px 0; font-size: 24px; }
        .client-info { margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f2f2f2; }
        .totals { text-align: right; margin-top: 20px; }
        .footer { margin-top: 50px; font-size: 12px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h2>Thaboera IT Solutions</h2>
          <p>55 Richard's Drive, Halfway House, Midrand</p>
          <p>VAT No.: 482027225 | Reg: 2006/184754/23</p>
        </div>
        <div class="company-info">
          <h3>Invoice #${invoice.invoiceNumber}</h3>
          <p>Date: ${new Date(invoice.dateIssued).toLocaleDateString()}</p>
          <p>Status: ${invoice.status}</p>
        </div>
      </div>

      <div class="client-info">
        <h3>Bill To:</h3>
        <p>${invoice.Client.name}</p>
        <p>${invoice.Client.address}</p>
        <p>Contact: ${invoice.Client.contactPerson} (${invoice.Client.contactNumber})</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <!-- You would loop through invoice items here -->
          <tr>
            <td>Sample Item</td>
            <td>Sample Description</td>
            <td>1</td>
            <td>R${invoice.totalAmount.toFixed(2)}</td>
            <td>R${invoice.totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div class="totals">
        <p><strong>Subtotal: R${invoice.totalAmount.toFixed(2)}</strong></p>
        <p>VAT (15%): R${(invoice.totalAmount * 0.15).toFixed(2)}</p>
        <p><strong>Total Amount: R${(invoice.totalAmount * 1.15).toFixed(2)}</strong></p>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Payment due within 30 days. Please reference invoice number ${invoice.invoiceNumber} with your payment.</p>
      </div>
    </body>
    </html>
  `;
}

module.exports = router;