const express = require('express');
const router = express.Router();
const { Service } = require('../models/Service');

// GET all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
});

// GET a single service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    console.error('Error fetching service:', err);
    res.status(500).json({ message: 'Failed to fetch service' });
  }
});

// POST create a new service
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const newService = await Service.create({ name, description, price, category });
    res.status(201).json(newService);
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ message: 'Failed to create service' });
  }
});

// PUT update an existing service
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    await service.update({ name, description, price, category });
    res.json(service);
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ message: 'Failed to update service' });
  }
});

// DELETE a service
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    await service.destroy();
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({ message: 'Failed to delete service' });
  }
});

module.exports = router;
