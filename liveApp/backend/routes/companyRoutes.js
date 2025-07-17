const express = require('express');
const router = express.Router();
const { Company } = require('../models/Company');

// GET all companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.findAll();
    res.json(companies);
  } catch (err) {
    console.error('Error fetching companies:', err);
    res.status(500).json({ message: 'Failed to fetch companies' });
  }
});

// GET a specific company by ID
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (err) {
    console.error('Error fetching company:', err);
    res.status(500).json({ message: 'Failed to fetch company' });
  }
});

// POST create a new company
router.post('/', async (req, res) => {
  try {
    const { name, address, email, phone } = req.body;
    const newCompany = await Company.create({ name, address, email, phone });
    res.status(201).json(newCompany);
  } catch (err) {
    console.error('Error creating company:', err);
    res.status(500).json({ message: 'Failed to create company' });
  }
});

// PUT update an existing company
router.put('/:id', async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const { name, address, email, phone } = req.body;
    await company.update({ name, address, email, phone });
    res.json(company);
  } catch (err) {
    console.error('Error updating company:', err);
    res.status(500).json({ message: 'Failed to update company' });
  }
});

// DELETE a company
router.delete('/:id', async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    await company.destroy();
    res.json({ message: 'Company deleted successfully' });
  } catch (err) {
    console.error('Error deleting company:', err);
    res.status(500).json({ message: 'Failed to delete company' });
  }
});

module.exports = router;
