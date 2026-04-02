const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const uploadController = require('../controllers/uploadController');

/**
 * File upload routes
 */

// Single file upload
router.post('/single', upload.single('file'), uploadController.uploadFile);

// Multiple file upload
router.post('/multiple', upload.array('files', 5), uploadController.uploadMultipleFiles);

// Delete uploaded file
router.delete('/:filename', uploadController.deleteFile);

module.exports = router;