const express = require('express');
const router = express.Router();
const { cloudinary, upload } = require('../config/cloudinary');

// POST /api/upload  — accepts a single file field named "image"
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Cloudinary stores the URL in req.file.path
    res.status(200).json({
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// DELETE /api/upload/:public_id  — removes image from Cloudinary
router.delete('/:public_id', async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.public_id);
    await cloudinary.uploader.destroy(publicId);
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Error deleting image from Cloudinary:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
