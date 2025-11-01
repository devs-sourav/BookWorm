const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image, Please upload images only", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const uploadPhotoMiddleware = (multiple = false, maxFiles = 4) => {
  return multiple ? upload.array("photos", maxFiles) : upload.single("photo");
};

// IMAGE PROCESSING USING SHARP
const resizePhotoMiddleware = (directory) => {
  return catchAsync(async (req, res, next) => {
    // Handle both single and multiple files
    const files = req.file ? [req.file] : req.files || [];

    if (files.length === 0) return next();

    // Define unique suffix function
    const uniqueSuffix = () =>
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    const processImage = async (file) => {
      // Get the original file extension
      const originalExtension = path.extname(file.originalname);

      // Set file name with unique suffix and original extension
      file.filename = `${directory}-${uniqueSuffix()}${originalExtension}`;

      const dimensions = {

        products: { width: 700, height: 900, quality: 95 },

        brand: { width: 450, height: 450, quality: 80 },
        reviews: { width: 400, height: 400, quality: 85 },
      }[directory] || { width: 500, height: 500, quality: 95 };

      try {
        const transformer = sharp(file.buffer);

        // Ignore resize() for Banner and Brand
        if (directory !== "banner") {
          transformer.resize(dimensions.width, dimensions.height);
        }

        transformer
          .toFormat(originalExtension.slice(1)) // Set the format to the original extension
          .toFile(`uploads/${directory}/${file.filename}`, {
            quality: dimensions.quality,
          });

        file.fileName = file.filename; // Save the filename for later use
      } catch (err) {
        return next(new AppError("Failed while processing the image", 500));
      }
    };

    // Process all files
    await Promise.all(files.map(processImage));

    next();
  });
};

module.exports = { uploadPhotoMiddleware, resizePhotoMiddleware };
