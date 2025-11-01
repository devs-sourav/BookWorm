const fs = require("fs").promises;
const path = require("path");
const Author = require("../models/authorModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const deleteFile = require("../utils/deleteFile");
const { getAll, getOne } = require("../utils/handleFactory");

// Create Author
exports.createAuthor = catchAsync(async (req, res, next) => {
  const body = { ...req.body }; // Create a copy to avoid mutation
  
  // Handle photo upload
  if (req.file) {
    body.photo = `${req.protocol}://${req.get("host")}/uploads/authors/${req.file.filename}`;
  } else {
    return next(new AppError("Author photo is required", 400));
  }
  
  // Check if name would create a duplicate slug (optional pre-check)
  if (body.name) {
    const isSlugAvailable = await Author.isSlugAvailable(body.name);
    if (!isSlugAvailable) {
      // Clean up uploaded file
      if (req.file) {
        try {
          const filePath = path.join(__dirname, "..", "uploads", "authors", req.file.filename);
          await deleteFile(filePath);
        } catch (deleteError) {
          console.log("Error deleting file after slug check:", deleteError.message);
        }
      }
      return next(new AppError("An author with this name already exists. Please enter a unique name.", 400));
    }
  }
  
  try {
    const author = await Author.create(body);
    
    res.status(201).json({
      status: "success",
      message: "Author created successfully",
      data: { author },
    });
  } catch (error) {
    // Clean up uploaded file if creation fails
    if (req.file) {
      try {
        const filePath = path.join(__dirname, "..", "uploads", "authors", req.file.filename);
        await deleteFile(filePath);
      } catch (deleteError) {
        console.log("Error deleting file after failed creation:", deleteError.message);
      }
    }
    
    // Handle duplicate slug error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      return next(new AppError("An author with this name already exists. Please enter a unique name.", 400));
    }
    
    // Handle other validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return next(new AppError(messages.join('. '), 400));
    }
    
    // Handle any other errors
    return next(error);
  }
});

// Get All Authors
exports.getAllAuthors = getAll(Author);

// Get Single Author - can find by ID or slug
exports.getAuthor = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let author;

  // Check if the parameter is a valid ObjectId or a slug
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    // It's a valid ObjectId
    author = await Author.findById(id);
  } else {
    // It's probably a slug
    author = await Author.findOne({ slug: id });
  }

  if (!author) {
    return next(new AppError("No author found with that ID or slug", 404));
  }

  res.status(200).json({
    status: "success",
    data: { author },
  });
});

// Update Author
exports.updateAuthor = catchAsync(async (req, res, next) => {
  console.log("Update request received");
  console.log("Request body:", req.body);
  console.log("Request file:", req.file);
  
  const author = await Author.findById(req.params.id);
  if (!author) {
    // If no author found and we have a new file, clean it up
    if (req.file) {
      try {
        const newFilePath = path.join(__dirname, "..", "uploads", "authors", req.file.filename);
        await deleteFile(newFilePath);
      } catch (error) {
        console.log("Error deleting new file after failed lookup:", error.message);
      }
    }
    return next(new AppError("Author not found", 404));
  }

  const updateData = { ...req.body };
  let oldPhotoPath = null;

  // Check if name change would create a duplicate slug
  if (updateData.name && updateData.name !== author.name) {
    const isSlugAvailable = await Author.isSlugAvailable(updateData.name, author._id);
    if (!isSlugAvailable) {
      // Clean up uploaded file
      if (req.file) {
        try {
          const newFilePath = path.join(__dirname, "..", "uploads", "authors", req.file.filename);
          await deleteFile(newFilePath);
        } catch (deleteError) {
          console.log("Error deleting file after slug check:", deleteError.message);
        }
      }
      return next(new AppError("An author with this name already exists. Please enter a unique name.", 400));
    }
  }

  // Handle new photo upload
  if (req.file) {
    console.log("New file uploaded:", req.file.filename);
    
    // Store old photo path for deletion AFTER successful update
    if (author.photo) {
      const fileName = author.photo.split("/").pop();
      oldPhotoPath = path.join(__dirname, "..", "uploads", "authors", fileName);
      console.log("Old photo path stored for deletion:", oldPhotoPath);
    }
    
    // Set new photo URL
    updateData.photo = `${req.protocol}://${req.get("host")}/uploads/authors/${req.file.filename}`;
    console.log("New photo URL:", updateData.photo);
  }

  // Update the author properties manually to trigger pre-save middleware
  Object.keys(updateData).forEach((key) => {
    author[key] = updateData[key];
  });

  try {
    // Save the author (this will trigger pre-save middleware for slug generation)
    const updatedAuthor = await author.save({ validateBeforeSave: true });

    // Only delete old photo AFTER successful database update
    if (oldPhotoPath && req.file) {
      try {
        await deleteFile(oldPhotoPath);
        console.log("Old photo deleted successfully");
      } catch (error) {
        console.log("Error deleting old photo:", error.message);
        // Don't fail the request if old photo deletion fails
      }
    }

    console.log("Author updated successfully:", updatedAuthor);

    res.status(200).json({
      status: "success",
      message: "Author updated successfully",
      data: { author: updatedAuthor },
    });
  } catch (error) {
    // Clean up new uploaded file if update fails
    if (req.file) {
      try {
        const newFilePath = path.join(__dirname, "..", "uploads", "authors", req.file.filename);
        await deleteFile(newFilePath);
        console.log("New file deleted after failed update");
      } catch (deleteError) {
        console.log("Error deleting new file after failed update:", deleteError.message);
      }
    }
    
    // Handle duplicate slug error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      return next(new AppError("An author with this name already exists. Please enter a unique name.", 400));
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return next(new AppError(messages.join('. '), 400));
    }
    
    // Handle any other errors
    return next(error);
  }
});

// Delete Author
exports.deleteAuthor = catchAsync(async (req, res, next) => {
  const author = await Author.findById(req.params.id);
  if (!author) {
    return next(new AppError("Author not found", 404));
  }

  // Delete photo file if it exists
  if (author.photo) {
    try {
      const fileName = author.photo.split("/").pop();
      const filePath = path.join(__dirname, "..", "uploads", "authors", fileName);
      await deleteFile(filePath);
      console.log("Author photo deleted successfully");
    } catch (error) {
      console.log("Error deleting author photo:", error.message);
      // Continue with deletion even if photo deletion fails
    }
  }

  await Author.findByIdAndDelete(author._id);

  res.status(204).json({
    status: "success",
    message: "Author deleted successfully",
    data: null,
  });
});

// Get Author by slug (additional endpoint)
exports.getAuthorBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  
  const author = await Author.findOne({ slug });
  
  if (!author) {
    return next(new AppError("No author found with that slug", 404));
  }

  res.status(200).json({
    status: "success",
    data: { author },
  });
});

// Search authors by name
exports.searchAuthors = catchAsync(async (req, res, next) => {
  const { query, limit = 10, page = 1 } = req.query;
  
  if (!query) {
    return next(new AppError("Search query is required", 400));
  }

  const searchRegex = new RegExp(query, "i");
  const skip = (page - 1) * limit;

  const authors = await Author.find({
    $or: [
      { name: searchRegex },
      { bio: searchRegex }
    ]
  })
    .select("name slug photo bio")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ name: 1 });

  const totalResults = await Author.countDocuments({
    $or: [
      { name: searchRegex },
      { bio: searchRegex }
    ]
  });

  res.status(200).json({
    status: "success",
    results: authors.length,
    totalResults,
    data: { authors },
  });
});

// Check if author name is available (useful for frontend validation)
exports.checkNameAvailability = catchAsync(async (req, res, next) => {
  const { name } = req.query;
  const { excludeId } = req.query; // For update operations
  
  if (!name) {
    return next(new AppError("Name parameter is required", 400));
  }

  const isAvailable = await Author.isSlugAvailable(name, excludeId);
  const proposedSlug = await Author.generateAvailableSlug(name, excludeId);
  
  res.status(200).json({
    status: "success",
    data: {
      name,
      proposedSlug,
      isExactSlugAvailable: isAvailable,
      message: isAvailable 
        ? "Name is available" 
        : `An author with this name already exists. Suggested slug: ${proposedSlug}`
    },
  });
});

// Get suggested slug for a name
exports.getSuggestedSlug = catchAsync(async (req, res, next) => {
  const { name } = req.query;
  const { excludeId } = req.query;
  
  if (!name) {
    return next(new AppError("Name parameter is required", 400));
  }

  const suggestedSlug = await Author.generateAvailableSlug(name, excludeId);
  
  res.status(200).json({
    status: "success",
    data: {
      name,
      suggestedSlug
    },
  });
});