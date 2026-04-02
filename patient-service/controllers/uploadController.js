const path = require('path');
const fs = require('fs');

/**
 * Handle single file upload
 * @route POST /api/upload
 * @param {Object} req - Express request object with file
 * @param {Object} res - Express response object
 */
exports.uploadFile = (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Construct file URL
    const fileUrl = `/uploads/${req.file.filename}`;
    const fileSize = req.file.size;
    const fileName = req.file.filename;
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileUrl: fileUrl,
        fileName: fileName,
        originalName: originalName,
        fileSize: fileSize,
        mimeType: mimeType
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Delete file if there was an error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

/**
 * Handle multiple file upload
 * @route POST /api/upload-multiple
 * @param {Object} req - Express request object with files
 * @param {Object} res - Express response object
 */
exports.uploadMultipleFiles = (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Map files to response format
    const uploadedFiles = req.files.map(file => ({
      fileUrl: `/uploads/${file.filename}`,
      fileName: file.filename,
      originalName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype
    }));

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Error uploading files:', error);

    // Delete all files if there was an error
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
};

/**
 * Delete uploaded file
 * @route DELETE /api/delete-file/:filename
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteFile = (req, res) => {
  try {
    const { filename } = req.params;

    // Validate filename to prevent directory traversal attacks
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename format'
      });
    }

    const filePath = path.join(__dirname, '../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
};