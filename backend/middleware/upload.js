/**
 * File Upload Middleware
 * Handles file uploads using Multer and Cloudinary
 * @module middleware/upload
 */

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Allowed file types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// File size limits
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Cloudinary storage configuration for profile images
 */
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "bookavibe/profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 500, height: 500, crop: "fill", gravity: "face" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return `profile-${req.staff?.id || "unknown"}-${uniqueSuffix}`;
    },
  },
});

/**
 * Cloudinary storage configuration for general images
 */
const generalImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "bookavibe/images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return `image-${uniqueSuffix}`;
    },
  },
});

/**
 * File filter function
 */
const imageFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, JPG, PNG, and WEBP images are allowed."
      ),
      false
    );
  }
};

/**
 * Multer configuration for profile image uploads
 */
const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: imageFilter,
});

/**
 * Multer configuration for general image uploads
 */
const uploadImage = multer({
  storage: generalImageStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // Allow up to 5 images at once
  },
  fileFilter: imageFilter,
});

/**
 * Local storage (fallback when Cloudinary is not available)
 */
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});

const uploadLocal = multer({
  storage: localStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: imageFilter,
});

/**
 * Error handler for multer
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 5 files.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field.",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload failed",
    });
  }

  next();
};

module.exports = {
  uploadProfileImage,
  uploadImage,
  uploadLocal,
  handleUploadError,
};
