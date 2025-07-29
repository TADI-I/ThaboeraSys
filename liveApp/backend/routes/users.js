const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'BigDaddyTDevelopedThis';

// Unified profile update endpoint
router.put('/profile', async (req, res) => {
  const { id, full_name, email, phone_number } = req.body;

  if (!id || !full_name || !email) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if email is being changed to one that already exists
    if (email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    user.full_name = full_name;
    user.email = email;
    user.phone_number = phone_number || null;

    await user.save();

    // Return updated user data
    const updatedUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number,
      picture_url: user.picture_url,
      role_id: user.role_id
    };

    res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Password change endpoint remains the same
router.put('/change-password', async (req, res) => {
  const { id, current_password, new_password, confirm_password } = req.body;

  if (!id || !current_password || !new_password || !confirm_password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (new_password !== confirm_password) {
    return res.status(400).json({ message: 'New passwords do not match' });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    user.password_hash = hashedPassword;

    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint remains the same
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({
      id: user.id,
      email: user.email,
      role_id: user.role_id,
      full_name: user.full_name
    }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        picture_url: user.picture_url,
        role_id: user.role_id
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;