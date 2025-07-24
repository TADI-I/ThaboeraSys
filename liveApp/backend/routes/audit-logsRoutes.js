const express = require('express');
const router = express.Router();
const { Audit, User } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

// @desc    Get all audit logs
// @route   GET /api/v1/audit-logs
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { startDate, endDate, userId, action, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Build where conditions
    const where = {};
    
    // Date range filter
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    }
    
    // User filter
    if (userId) {
      where.userId = userId;
    }
    
    // Action filter
    if (action) {
      where.action = { [Op.iLike]: `%${action}%` };
    }
    
    // Execute query with pagination
    const { count, rows: logs } = await Audit.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
          as: 'user'
        }
      ],
      order: [['timestamp', 'DESC']],
      offset,
      limit: parseInt(limit)
    });
    
    res.status(200).json({
      success: true,
      count: logs.length,
      total: count,
      pages: Math.ceil(count / limit),
      data: logs
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Export audit logs
// @route   GET /api/v1/audit-logs/export
// @access  Private (Admin only)
router.get('/export', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { startDate, endDate, userId, action } = req.query;
    
    // Build where conditions
    const where = {};
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    }
    if (userId) where.userId = userId;
    if (action) where.action = { [Op.iLike]: `%${action}%` };
    
    const logs = await Audit.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
          as: 'user'
        }
      ],
      order: [['timestamp', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;