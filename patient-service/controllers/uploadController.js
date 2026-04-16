const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

/** Base URL for links to this service’s `/uploads` (browser must reach it; set in .env). */
function publicBaseUrl() {
  const fromEnv = process.env.PATIENT_PUBLIC_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const port = process.env.PORT || 3001;
  return `http://localhost:${port}`;
}

function localFileUrl(reqFile) {
  const filename = path.basename(reqFile.path);
  return `${publicBaseUrl()}/uploads/${encodeURIComponent(filename)}`;
}

function sendLocalSingleSuccess(res, reqFile, message = 'File stored locally') {
  const filename = path.basename(reqFile.path);
  res.status(200).json({
    success: true,
    message,
    data: {
      fileUrl: localFileUrl(reqFile),
      fileName: filename,
      originalName: reqFile.originalname,
      fileSize: reqFile.size,
      mimeType: reqFile.mimetype,
      cloudinaryPublicId: null,
    },
  });
}

const useLocalOnly =
  process.env.USE_LOCAL_UPLOAD === 'true' || process.env.SKIP_CLOUDINARY === 'true';

/**
 * Handle single file upload
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    if (useLocalOnly) {
      return sendLocalSuccessResponse(res, req.file);
    }

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'medilink/patients',
        resource_type: 'auto',
      });

      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting local file:', err);
      });

      return res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          fileUrl: result.secure_url,
          fileName: result.original_filename,
          originalName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          cloudinaryPublicId: result.public_id,
        },
      });
    } catch (cloudErr) {
      console.error('Cloudinary upload failed, using local file:', cloudErr.message || cloudErr);
      return sendLocalSuccessResponse(res, req.file);
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message,
    });
  }
};

function sendLocalSuccessResponse(res, reqFile) {
  return sendLocalSingleSuccess(
    res,
    reqFile,
    'File stored on server (local upload)'
  );
}

/**
 * Handle multiple file upload
 */
exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    if (useLocalOnly) {
      const uploadedFiles = req.files.map((file) => ({
        fileUrl: localFileUrl(file),
        fileName: path.basename(file.path),
        fileSize: file.size,
        mimeType: file.mimetype,
        cloudinaryPublicId: null,
      }));
      return res.status(200).json({
        success: true,
        message: `${uploadedFiles.length} file(s) stored locally`,
        data: uploadedFiles,
      });
    }

    const uploadedFiles = [];
    for (const file of req.files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'medilink/patients',
          resource_type: 'auto',
        });
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting local file:', err);
        });
        uploadedFiles.push({
          fileUrl: result.secure_url,
          fileName: result.original_filename,
          fileSize: result.bytes,
          mimeType: result.resource_type,
          cloudinaryPublicId: result.public_id,
        });
      } catch (e) {
        console.error('Cloudinary failed for one file, keeping local:', e.message || e);
        uploadedFiles.push({
          fileUrl: localFileUrl(file),
          fileName: path.basename(file.path),
          fileSize: file.size,
          mimeType: file.mimetype,
          cloudinaryPublicId: null,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: uploadedFiles,
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message,
    });
  }
};

/**
 * Delete uploaded file
 */
exports.deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (publicId.includes('..') || publicId.includes('/') || publicId.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid publicId format',
      });
    }

    await cloudinary.uploader.destroy(publicId);

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully from Cloudinary',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message,
    });
  }
};
