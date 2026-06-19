const express = require('express');
const router = express.Router();
const { cloudinary, upload } = require('../config/cloudinary');

// POST /api/upload — accepts a single file field named "image"
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Stream the buffer directly to Cloudinary (works on any hosting platform)
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'shayona_pos/items',
      transformation: [
        { width: 400, height: 300, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
      ],
    },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
      }
      res.status(200).json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
  );

  uploadStream.end(req.file.buffer);
});

// DELETE /api/upload/:public_id — removes image from Cloudinary
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
