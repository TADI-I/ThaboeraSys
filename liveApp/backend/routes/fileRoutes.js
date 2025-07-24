const express = require('express');
const router = express.Router();
const multer = require('multer');
const File = require('../models/File'); // Sequelize model

// Use memory storage for uploading to DB
const upload = multer({ storage: multer.memoryStorage() });

// 📤 Upload file and save to DB
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, category, description } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const newFile = await File.create({
      name: title,
      type: file.mimetype,
      size: file.size,
      category,
      description,
      data: file.buffer // Store binary data
    });

    res.status(201).json({ success: true, data: newFile });
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ success: false, message: 'File upload failed' });
  }
});

// 📥 Download file from DB
// Correct download for BLOB-stored files
router.get('/:id/download', async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file || !file.data) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.set({
      'Content-Type': file.type,
      'Content-Disposition': `attachment; filename="${file.name}"`,
      'Content-Length': file.size
    });

    res.send(file.data);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ message: 'Error downloading file' });
  }
});


// 📄 Get all files (metadata only)
router.get('/', async (req, res) => {
  try {
    const files = await File.findAll({
      attributes: ['id', 'name', 'category', 'size', 'type', 'description', 'createdAt'] // Don't include `data`
    });
    res.json(files);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).json({ message: 'Failed to fetch files' });
  }
});

// 🔍 Get a single file metadata
router.get('/:id', async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id, {
      attributes: { exclude: ['data'] } // Exclude binary data
    });
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json(file);
  } catch (err) {
    console.error('Error fetching file:', err);
    res.status(500).json({ message: 'Failed to fetch file' });
  }
});

// ✏️ Update file metadata
router.put('/:id', async (req, res) => {
  try {
    const { name, type, category, description } = req.body;
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    await file.update({ name, type, category, description });
    res.json(file);
  } catch (err) {
    console.error('Error updating file:', err);
    res.status(500).json({ message: 'Failed to update file' });
  }
});

// ❌ Delete file
router.delete('/:id', async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    await file.destroy();
    res.json({ message: 'File record deleted successfully' });
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).json({ message: 'Failed to delete file' });
  }
});

module.exports = router;
