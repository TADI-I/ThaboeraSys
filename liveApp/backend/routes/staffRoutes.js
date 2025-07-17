const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');

// GET all staff members
router.get('/', async (req, res) => {
  try {
    const staffList = await Staff.findAll();
    res.json(staffList);
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ message: 'Failed to fetch staff' });
  }
});

// GET a specific staff member by ID
router.get('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    res.json(staff);
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ message: 'Failed to fetch staff' });
  }
});

// GET staff by email (for profile loading)
router.get('/by-email/:email', async (req, res) => {
  try {
    const staff = await Staff.findOne({ where: { email: req.params.email } });
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    res.json(staff);
  } catch (err) {
    console.error('Error fetching staff by email:', err);
    res.status(500).json({ message: 'Failed to fetch staff' });
  }
});

// POST create a new staff member
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, position } = req.body;
    const newStaff = await Staff.create({ firstName, lastName, email, phone, position });
    res.status(201).json(newStaff);
  } catch (err) {
    console.error('Error creating staff:', err);
    res.status(500).json({ message: 'Failed to create staff' });
  }
});

// PUT update a staff member's details
router.put('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    const { firstName, lastName, email, phone, position } = req.body;
    await staff.update({ firstName, lastName, email, phone, position });
    res.json(staff);
  } catch (err) {
    console.error('Error updating staff:', err);
    res.status(500).json({ message: 'Failed to update staff' });
  }
});

// DELETE a staff member
router.delete('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    await staff.destroy();
    res.json({ message: 'Staff member deleted successfully' });
  } catch (err) {
    console.error('Error deleting staff:', err);
    res.status(500).json({ message: 'Failed to delete staff' });
  }
});

module.exports = router;
