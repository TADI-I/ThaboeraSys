// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'BigDaddyTDevelopedThis'; // Must match authRoutes.js

// Basic authentication
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user) throw new Error();
    
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};

// Staff-only middleware
const staffOnly = (req, res, next) => {
  if (!req.user.is_staff) {
    return res.status(403).json({ message: 'Staff access required' });
  }
  next();
};

// Role-based middleware
const requireRole = (roleName) => {
  return async (req, res, next) => {
    const role = await Role.findByPk(req.user.role_id);
    if (role.name !== roleName) {
      return res.status(403).json({ message: `Requires ${roleName} role` });
    }
    next();
  };
};

module.exports = { authenticate, staffOnly, requireRole };