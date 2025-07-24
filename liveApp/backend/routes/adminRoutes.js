
const express = require('express');
const router = express.Router();
const { authenticate, staffOnly, requireRole } = require('../middleware/auth');
const { User } = require('../models/User');

// Only staff can access these routes
router.use(authenticate, staffOnly);

// Only admins can create staff users
router.post('/staff', requireRole('admin'), async (req, res) => {
  try {
    const { full_name, email, password, position, department } = req.body;
    
    const staffUser = await User.create({
      full_name,
      email,
      password_hash: await bcrypt.hash(password, 10),
      role_id: 2, // Staff role
      is_staff: true,
      position,
      department
    });
    
    res.status(201).json(staffUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;