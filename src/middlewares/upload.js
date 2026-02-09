const multer = require("multer");
const { HttpError } = require("../utils/httpError");

/**
 * Multer config - file memory mein store hoti hai (buffer)
 * Phir Supabase Storage mein upload hoti hai
 */
const storage = multer.memoryStorage();

// Allowed image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new HttpError("Only image files are allowed (jpg, png, webp, gif)", 400, "BadRequest"), false);
  }
};

// Single image upload (field name: "image")
const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
}).single("image");

// Multiple images upload (field name: "images", max 10)
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).array("images", 10);

// Wrapper to handle multer errors properly
const handleUpload = (uploadFn) => {
  return (req, res, next) => {
    uploadFn(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new HttpError("File size must be less than 5 MB", 400, "BadRequest"));
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return next(new HttpError("Too many files or wrong field name", 400, "BadRequest"));
        }
        return next(new HttpError(err.message, 400, "BadRequest"));
      }
      if (err) {
        return next(err);
      }
      next();
    });
  };
};

module.exports = {
  uploadSingleImage: handleUpload(uploadSingle),
  uploadMultipleImages: handleUpload(uploadMultiple),
};
