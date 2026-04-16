const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const uploadController = require('../controllers/uploadController');

/**
 * File upload routes
 */

// Accept either field name `file` or `files` (some clients send `files` for a single PDF)
function singleFileFlexible(req, res, next) {
  const mw = upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'files', maxCount: 1 },
  ]);
  mw(req, res, (err) => {
    if (err) return next(err);
    const f =
      (req.files && req.files.file && req.files.file[0]) ||
      (req.files && req.files.files && req.files.files[0]);
    if (!f) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded (use field "file" or "files")',
      });
    }
    req.file = f;
    next();
  });
}

// Single file upload
router.post('/single', singleFileFlexible, uploadController.uploadFile);

// Multiple file upload
router.post('/multiple', upload.array('files', 5), uploadController.uploadMultipleFiles);

// Delete uploaded file
router.delete('/delete/:publicId', uploadController.deleteFile);

module.exports = router;