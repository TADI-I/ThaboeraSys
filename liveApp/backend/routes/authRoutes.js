// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'BigDaddyTDevelopedThis'; // Store this securely!

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('User model:', User); // Should not be undefined

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: 'User not found' });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ message: 'Incorrect password' });

  const token = jwt.sign({ id: user.id, role: user.role_id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user });
});
// REGISTER
router.post('/register', async (req, res) => {
  const { full_name, email, password, role_id } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      full_name,
      email,
      password_hash: hashedPassword,
      role_id
    });

    res.status(201).json({ success: true, message: 'User registered', userId: newUser.id });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// AUTH MIDDLEWARE
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// GET AUTHENTICATED USER
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'full_name', 'email', 'role_id']
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
