const fs = require("fs").promises;
const path = require("path");

/**
 * Safely delete a file with proper error handling
 * @param {string} filePath - Path to the file to delete
 * @returns {Promise<boolean>} - Returns true if deleted successfully, false otherwise
 */
const safeDeleteFile = async (filePath) => {
  try {
    // Check if file exists first
    await fs.access(filePath);
    // If file exists, delete it
    await fs.unlink(filePath);
    console.log(`File deleted successfully: ${filePath}`);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`File not found (already deleted?): ${filePath}`);
      return true; // Consider this as success since the file doesn't exist
    } else {
      console.error(`Error deleting file ${filePath}:`, error.message);
      return false;
    }
  }
};

/**
 * Extract filename from URL and create full file path
 * @param {string} photoUrl - The photo URL from database
 * @param {string} uploadDir - Upload directory (e.g., 'authors', 'products')
 * @returns {string} - Full file path
 */
const getFilePathFromUrl = (photoUrl, uploadDir) => {
  if (!photoUrl) return null;
  
  const fileName = photoUrl.split("/").pop();
  return path.join(__dirname, "..", "uploads", uploadDir, fileName);
};

/**
 * Clean up old file and return new photo URL
 * @param {string} oldPhotoUrl - Old photo URL from database
 * @param {object} newFile - New file object from multer
 * @param {object} req - Express request object
 * @param {string} uploadDir - Upload directory name
 * @returns {Promise<string>} - New photo URL
 */
const handlePhotoUpdate = async (oldPhotoUrl, newFile, req, uploadDir) => {
  // Generate new photo URL
  const newPhotoUrl = `${req.protocol}://${req.get("host")}/uploads/${uploadDir}/${newFile.filename}`;
  
  // Delete old photo if it exists
  if (oldPhotoUrl) {
    const oldFilePath = getFilePathFromUrl(oldPhotoUrl, uploadDir);
    if (oldFilePath) {
      await safeDeleteFile(oldFilePath);
    }
  }
  
  return newPhotoUrl;
};

module.exports = {
  safeDeleteFile,
  getFilePathFromUrl,
  handlePhotoUpdate,
};