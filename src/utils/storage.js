const { supabase } = require("../config/supabase");
const { env } = require("../config/env");
const { HttpError } = require("./httpError");

/**
 * Upload file to Supabase Storage
 * @param {string} bucket - Bucket name (categories, products)
 * @param {Object} file - Multer file object (buffer, mimetype, originalname)
 * @param {string} folder - Optional subfolder inside bucket
 * @returns {string} Public URL of uploaded file
 */
const uploadFile = async (bucket, file, folder = "") => {
  if (!file) return null;

  // Generate unique filename: timestamp-originalname
  const ext = file.originalname.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new HttpError(`File upload failed: ${error.message}`, 400, "BadRequest");
  }

  // Get public URL
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * Upload multiple files to Supabase Storage
 * @param {string} bucket - Bucket name
 * @param {Array} files - Array of multer file objects
 * @param {string} folder - Optional subfolder
 * @returns {Array<string>} Array of public URLs
 */
const uploadMultipleFiles = async (bucket, files, folder = "") => {
  if (!files || files.length === 0) return [];

  const urls = [];
  for (const file of files) {
    const url = await uploadFile(bucket, file, folder);
    urls.push(url);
  }
  return urls;
};

/**
 * Delete file from Supabase Storage
 * @param {string} bucket - Bucket name
 * @param {string} fileUrl - Full public URL of the file
 */
const deleteFile = async (bucket, fileUrl) => {
  if (!fileUrl) return;

  try {
    // Extract file path from URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/bucket/path/file.jpg
    const urlParts = fileUrl.split(`/storage/v1/object/public/${bucket}/`);
    if (urlParts.length < 2) return;

    const filePath = urlParts[1];

    await supabase.storage.from(bucket).remove([filePath]);
  } catch (err) {
    // Don't throw on delete failure - just log
    console.error("File delete error:", err.message);
  }
};

module.exports = { uploadFile, uploadMultipleFiles, deleteFile };
